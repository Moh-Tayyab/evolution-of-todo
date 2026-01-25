# @spec: specs/003-ai-chatbot/spec.md (FR-001 to FR-032)
# @spec: specs/003-ai-chatbot/contracts/chat-api.yaml
# Chat API endpoint with rate limiting

from datetime import datetime
from typing import List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, status, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.ext.asyncio import AsyncSession

from ..deps import get_current_user_id
from ...database import get_session
from ...schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    ConversationListResponse,
    ConversationSummary,
    ConversationDetailResponse,
    ConversationDetail,
    ErrorResponse,
)
from ...services.conversation_service import ConversationService
from ...services.user_service import UserService
from ...agent.orchestrator import create_agent_orchestrator

router = APIRouter()
conversation_service = ConversationService()

# Initialize rate limiter (60 requests per minute per user as per FR-029)
limiter = Limiter(key_func=lambda r: r.headers.get("authorization", ""))


def get_user_key(request: Request) -> str:
    """Extract user_id from JWT for rate limiting key.

    Args:
        request: FastAPI Request object

    Returns:
        User ID string for rate limiting
    """
    # Extract from authorization header
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        # Use the token as key (simpler than decoding JWT twice)
        return auth
    return get_remote_address(request)


@router.post(
    "/{user_id}/chat",
    response_model=ChatResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
@limiter.limit("60/minute", key_func=get_user_key)
async def chat_endpoint(
    user_id: str,
    chat_request: ChatRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Process a chat message through the AI agent.

    This endpoint:
    - Validates JWT token and user authorization
    - Loads or creates a conversation
    - Processes the message through the AI agent
    - Persists user and AI messages to the database
    - Returns the AI response in ChatKit-compatible format

    Args:
        user_id: User UUID from URL path
        chat_request: Chat request with message and optional conversation_id
        request: FastAPI Request object for rate limiting
        session: Async database session
        current_user_id: Authenticated user ID from JWT

    Returns:
        ChatResponse with conversation_id, AI message, and optional tool_calls

    Raises:
        HTTPException: For authentication, authorization, or processing errors
    """
    try:
        # Verify user_id from JWT matches path parameter (FR-003)
        if current_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: user ID mismatch",
            )

        # Auto-provision user from Better Auth JWT if not exists in Neon DB
        # This fixes the user synchronization issue between Better Auth and our database
        user = await UserService.get_or_create_user_from_jwt(
            session,
            current_user_id,
        )

        # Get or create conversation
        conversation = await conversation_service.get_or_create_conversation(
            session,
            UUID(current_user_id),
            chat_request.conversation_id,
        )

        # Get conversation history for context
        messages = await conversation_service.get_conversation_messages(
            session, conversation.id
        )

        # Convert to Agent SDK format (exclude the newest system message we're about to add)
        conversation_history = [
            {
                "role": msg.role,
                "content": msg.content,
            }
            for msg in messages
        ]

        # Persist user message
        from ...models.message import MessageRole
        user_message = await conversation_service.add_message(
            session,
            conversation.id,
            MessageRole.USER,
            chat_request.message,
        )

        # Process through AI agent
        try:
            orchestrator = create_agent_orchestrator()
        except ValueError as e:
            # OpenAI API key not configured
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(e),
            )

        result = await orchestrator.process_message(
            chat_request.message,
            conversation_history,
            UUID(current_user_id),
            session,
        )

        # Extract AI response
        ai_response_text = orchestrator.get_response_text(result)
        tool_calls = orchestrator.get_tool_calls(result)

        # Persist AI message
        ai_message = await conversation_service.add_message(
            session,
            conversation.id,
            MessageRole.ASSISTANT,
            ai_response_text,
            {"tool_calls": tool_calls} if tool_calls else None,
        )

        # Update conversation title based on first exchange if still "New Chat"
        if conversation.title == "New Chat":
            # Generate title from first few words of user message
            title_words = chat_request.message.split()[:5]
            new_title = " ".join(title_words)
            if len(chat_request.message.split()) > 5:
                new_title += "..."
            await conversation_service.update_conversation_title(
                session, conversation.id, new_title
            )

        return ChatResponse(
            conversation_id=str(conversation.id),
            message=ChatMessage(
                id=str(ai_message.id),
                role="assistant",
                content=ai_response_text,
                created_at=ai_message.created_at.isoformat(),
            ),
            tool_calls=tool_calls if tool_calls else None,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except HTTPException:
        # Re-raise HTTPException (like 403 Forbidden) without wrapping
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}",
        )


@router.get(
    "/{user_id}/conversations",
    response_model=ConversationListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    },
)
async def list_conversations(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    List all conversations for the authenticated user.

    Returns conversations ordered by updated_at DESC (most recent first).
    Limited to 100 conversations per user (FR-028).

    Args:
        user_id: User UUID from URL path
        session: Async database session
        current_user_id: Authenticated user ID from JWT

    Returns:
        ConversationListResponse with user's conversations

    Raises:
        HTTPException: For authentication or authorization errors
    """
    # Verify user_id from JWT matches path parameter
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Auto-provision user from Better Auth JWT if not exists in Neon DB
    await UserService.get_or_create_user_from_jwt(
        session,
        current_user_id,
    )

    from sqlmodel import select

    conversations = await conversation_service.get_user_conversations(
        session, UUID(user_id)
    )

    # Get message counts for each conversation
    conversation_summaries = []
    for conv in conversations:
        # Count messages
        from ...models.message import Message
        result = await session.execute(
            select(Message.id)
            .where(Message.conversation_id == conv.id)
        )
        message_count = len(result.all())

        conversation_summaries.append(
            ConversationSummary(
                id=str(conv.id),
                title=conv.title or "New Chat",
                created_at=conv.created_at.isoformat(),
                updated_at=conv.updated_at.isoformat(),
                message_count=message_count,
            )
        )

    return ConversationListResponse(conversations=conversation_summaries)


@router.get(
    "/{user_id}/conversations/{conversation_id}",
    response_model=ConversationDetailResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Conversation not found"},
    },
)
async def get_conversation(
    user_id: str,
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Get a specific conversation with all messages.

    Args:
        user_id: User UUID from URL path
        conversation_id: Conversation UUID
        session: Async database session
        current_user_id: Authenticated user ID from JWT

    Returns:
        ConversationDetailResponse with full conversation and messages

    Raises:
        HTTPException: For authentication, authorization, or not found errors
    """
    # Verify user_id from JWT matches path parameter
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Auto-provision user from Better Auth JWT if not exists in Neon DB
    await UserService.get_or_create_user_from_jwt(
        session,
        current_user_id,
    )

    from sqlmodel import select

    # Get conversation
    from ...models.conversation import Conversation
    result = await session.execute(
        select(Conversation).where(
            Conversation.id == UUID(conversation_id),
            Conversation.user_id == UUID(user_id),
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Get messages
    messages = await conversation_service.get_conversation_messages(
        session, conversation.id
    )

    chat_messages = [
        ChatMessage(
            id=str(msg.id),
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at.isoformat(),
        )
        for msg in messages
    ]

    return ConversationDetailResponse(
        conversation=ConversationDetail(
            id=str(conversation.id),
            title=conversation.title or "New Chat",
            created_at=conversation.created_at.isoformat(),
            updated_at=conversation.updated_at.isoformat(),
            messages=chat_messages,
        )
    )
