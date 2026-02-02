# @spec: specs/003-ai-chatbot/spec.md (FR-001 to FR-032)
# @spec: specs/003-ai-chatbot/ui/chatkit.md
# OpenAI ChatKit Protocol API endpoint with streaming support
# Enhanced with dashboard context awareness - chatbot knows everything!

import json
import asyncio
import base64
from typing import AsyncGenerator
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..deps import get_current_user_id
from ...database import get_session, engine
from ...services.conversation_service import ConversationService
from ...services.user_service import UserService
from ...agent.orchestrator import create_agent_orchestrator
from ...models.message import MessageRole

router = APIRouter()
conversation_service = ConversationService()


def extract_dashboard_context(request: Request) -> dict | None:
    """
    Extract dashboard context from request headers.

    The frontend sends dashboard state via custom headers:
    - X-Dashboard-Context: Base64-encoded JSON with full dashboard state
    - X-Dashboard-Timestamp: ISO timestamp of when context was captured
    - X-Dashboard-Task-Count: Total number of tasks (quick access)

    Returns:
        Dictionary with dashboard context or None if not available
    """
    try:
        context_header = request.headers.get("X-Dashboard-Context")
        if not context_header:
            return None

        # Decode base64 context
        decoded_context = base64.b64decode(context_header).decode("utf-8")

        # Parse JSON
        dashboard_context = {
            "raw_context": decoded_context,
            "timestamp": request.headers.get("X-Dashboard-Timestamp"),
            "task_count": request.headers.get("X-Dashboard-Task-Count", "0"),
        }

        return dashboard_context

    except Exception as e:
        # Log error but don't fail the request
        import logging
        logging.getLogger(__name__).warning(f"Failed to extract dashboard context: {e}")
        return None


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
    with the OpenAI agent orchestrator for AI responses with tool calling.

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

        # Extract conversation_id BEFORE tool execution (object may expire)
        conversation_id_str = str(conversation.id)

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
            UUID(conversation_id_str),
            MessageRole.USER,
            user_message,
        )

        # Commit the user message before AI processing
        await session.commit()

        # Extract dashboard context from headers
        dashboard_context = extract_dashboard_context(request)

        # Process through AI agent orchestrator
        orchestrator = create_agent_orchestrator()

        # Get AI response with tool calling support
        agent_result = await orchestrator.process_message(
            user_message,
            conversation_history,
            UUID(current_user_id),
            session,  # Pass session for DB operations within tools
            dashboard_context=dashboard_context,
        )

        ai_response_text = agent_result.get("response", "")
        tool_calls = agent_result.get("tool_calls", [])
        tool_results = agent_result.get("tool_results", [])

        # Persist AI assistant message
        tool_calls_data = None
        if tool_calls:
            # Format tool calls for storage
            tool_calls_data = {
                "calls": [
                    {
                        "id": tc.get("id", ""),
                        "name": tc.get("name", ""),
                        "arguments": tc.get("arguments", {})
                    }
                    for tc in tool_calls
                ],
                "results": tool_results
            }

        ai_msg_obj = await conversation_service.add_message(
            session,
            UUID(conversation_id_str),
            MessageRole.ASSISTANT,
            ai_response_text,
            tool_calls=tool_calls_data,
        )

        # Commit the AI message
        await session.commit()
        await session.refresh(ai_msg_obj)

        # Create async generator for streaming response
        async def stream_response() -> AsyncGenerator[str, None]:
            """Stream ChatKit protocol events."""
            try:
                # Stream ChatKit protocol events
                # Event format: "event: <type>\ndata: <json>\n\n"

                # Send message.start event
                start_event = {
                    "type": "message.start",
                    "message": {
                        "id": str(ai_msg_obj.id),
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
                        "id": str(ai_msg_obj.id),
                        "role": "assistant",
                        "content": [{"type": "text", "text": {"value": ai_response_text}}],
                    },
                    "conversation_id": conversation_id_str,
                }
                yield f"event: message.stop\ndata: {json.dumps(stop_event)}\n\n"

                # Send done event
                done_event = {"type": "done", "conversation_id": conversation_id_str}
                yield f"event: done\ndata: {json.dumps(done_event)}\n\n"

            except Exception as e:
                # Send error event
                import logging
                logging.getLogger(__name__).error(f"Streaming error: {e}")
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
        import logging
        logging.getLogger(__name__).error(f"ChatKit endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ChatKit endpoint error: {str(e)}",
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for ChatKit API."""
    return {"status": "healthy"}
