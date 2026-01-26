# @spec: specs/003-ai-chatbot/spec.md (FR-001 to FR-032)
# @spec: specs/003-ai-chatbot/ui/chatkit.md
# OpenAI ChatKit Protocol API endpoint with streaming support

import json
import asyncio
from typing import AsyncGenerator
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..deps import get_current_user_id
from ...database import get_session
from ...services.conversation_service import ConversationService
from ...services.user_service import UserService
from ...agent.orchestrator import create_agent_orchestrator
from ...models.message import MessageRole

router = APIRouter()
conversation_service = ConversationService()


class SessionRequest(BaseModel):
    """Request model for creating a ChatKit session."""
    conversation_id: str | None = None


class SessionResponse(BaseModel):
    """Response model for ChatKit session."""
    client_secret: str
    conversation_id: str | None = None


@router.post("/session")
async def create_chatkit_session(
    session_request: SessionRequest,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Create a ChatKit session with client secret.

    This endpoint generates a session token that ChatKit frontend uses
    to authenticate subsequent requests. The client_secret is a simple
    JWT that encodes the user_id and optional conversation_id.

    Args:
        session_request: Optional conversation_id to resume existing chat
        session: Async database session
        current_user_id: Authenticated user ID from JWT

    Returns:
        SessionResponse with client_secret for ChatKit frontend
    """
    try:
        # Auto-provision user from Better Auth JWT if not exists in Neon DB
        await UserService.get_or_create_user_from_jwt(
            session,
            current_user_id,
        )

        # If conversation_id provided, verify it belongs to user
        if session_request.conversation_id:
            from sqlmodel import select
            from ...models.conversation import Conversation

            result = await session.execute(
                select(Conversation).where(
                    Conversation.id == UUID(session_request.conversation_id),
                    Conversation.user_id == UUID(current_user_id),
                )
            )
            conv = result.scalar_one_or_none()
            if not conv:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found",
                )

        # Generate client_secret (simple JWT encoding user_id)
        # In production, use proper JWT signing with expiration
        import hashlib
        import time

        # Create a simple token that encodes user_id and timestamp
        token_payload = f"{current_user_id}:{int(time.time())}"
        client_secret = hashlib.sha256(token_payload.encode()).hexdigest()

        return SessionResponse(
            client_secret=client_secret,
            conversation_id=session_request.conversation_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}",
        )


@router.post("/chatkit")
async def chatkit_endpoint(
    request: Request,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    OpenAI ChatKit protocol endpoint with streaming support.

    This endpoint implements the ChatKit protocol, accepting requests
    from the ChatKit frontend and streaming responses back. It integrates
    with the existing OpenAI Agents SDK for AI orchestration.

    The request body is a JSON with:
    - messages: Array of message objects with role and content
    - conversation_id: Optional conversation ID for context

    Returns:
        StreamingResponse with SSE-formatted events
    """
    try:
        # Parse request body
        body = await request.json()
        messages = body.get("messages", [])
        conversation_id = body.get("conversation_id")

        # Get the latest user message
        if not messages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No messages provided",
            )

        # Find the last user message (the one to process)
        user_message = None
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content")
                break

        if not user_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user message found",
            )

        # Auto-provision user from Better Auth JWT if not exists in Neon DB
        await UserService.get_or_create_user_from_jwt(
            session,
            current_user_id,
        )

        # Get or create conversation
        conversation = await conversation_service.get_or_create_conversation(
            session,
            UUID(current_user_id),
            conversation_id,
        )

        # Build conversation history from previous messages (excluding the current one)
        conversation_history = []
        for msg in messages[:-1]:  # Exclude the last message we're processing
            conversation_history.append({
                "role": msg.get("role"),
                "content": msg.get("content"),
            })

        # Persist user message
        user_msg_obj = await conversation_service.add_message(
            session,
            conversation.id,
            MessageRole.USER,
            user_message,
        )

        # Commit the user message before starting the stream
        await session.commit()

        # Create async generator for streaming response
        async def stream_response() -> AsyncGenerator[str, None]:
            """Stream ChatKit protocol events."""
            try:
                # Process through AI agent
                orchestrator = create_agent_orchestrator()

                # Get AI response (non-streaming for now, can be enhanced later)
                result = await orchestrator.process_message(
                    user_message,
                    conversation_history,
                    UUID(current_user_id),
                    session,
                )

                # Extract AI response
                ai_response_text = orchestrator.get_response_text(result)

                # Persist AI message
                await conversation_service.add_message(
                    session,
                    conversation.id,
                    MessageRole.ASSISTANT,
                    ai_response_text,
                )

                # Update conversation title based on first exchange
                if conversation.title == "New Chat":
                    title_words = user_message.split()[:5]
                    new_title = " ".join(title_words)
                    if len(user_message.split()) > 5:
                        new_title += "..."
                    await conversation_service.update_conversation_title(
                        session, conversation.id, new_title
                    )

                # Commit AI message and title update
                await session.commit()

                # Stream ChatKit protocol events
                # Event format: "event: <type>\ndata: <json>\n\n"

                # Send message.start event
                start_event = {
                    "type": "message.start",
                    "message": {
                        "id": str(user_msg_obj.id),
                        "role": "assistant",
                        "content": [{"type": "text", "text": {"value": ""}}],
                    }
                }
                yield f"event: message.start\ndata: {json.dumps(start_event)}\n\n"

                # Send message.delta event with content
                delta_event = {
                    "type": "message.delta",
                    "delta": {
                        "type": "text",
                        "text": {"value": ai_response_text},
                    },
                }
                yield f"event: message.delta\ndata: {json.dumps(delta_event)}\n\n"

                # Send message.stop event
                stop_event = {
                    "type": "message.stop",
                    "message": {
                        "id": str(user_msg_obj.id),
                        "role": "assistant",
                        "content": [{"type": "text", "text": {"value": ai_response_text}}],
                    },
                    "conversation_id": str(conversation.id),
                }
                yield f"event: message.stop\ndata: {json.dumps(stop_event)}\n\n"

                # Send done event
                done_event = {"type": "done", "conversation_id": str(conversation.id)}
                yield f"event: done\ndata: {json.dumps(done_event)}\n\n"

            except Exception as e:
                # Send error event
                error_event = {
                    "type": "error",
                    "error": {
                        "type": "internal_error",
                        "message": str(e),
                    }
                }
                yield f"event: error\ndata: {json.dumps(error_event)}\n\n"

        # Return SSE streaming response
        return StreamingResponse(
            stream_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ChatKit endpoint error: {str(e)}",
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for ChatKit API."""
    return {"status": "healthy"}
