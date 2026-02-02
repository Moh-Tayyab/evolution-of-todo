# @spec: specs/003-ai-chatbot/spec.md (API Contract section)
# @spec: specs/003-ai-chatbot/contracts/chat-api.yaml
# Pydantic schemas for chat API requests and responses

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Literal
from uuid import UUID


class ChatMessage(BaseModel):
    """Message format compatible with ChatKit."""

    id: str = Field(..., description="Unique message ID")
    role: Literal["user", "assistant", "system"] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    created_at: str = Field(..., description="ISO 8601 timestamp of message creation")


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""

    message: str = Field(..., min_length=1, max_length=5000, description="User's message to the AI")
    conversation_id: Optional[str] = Field(
        default=None,
        description="Conversation ID to continue. 'latest' for most recent, or omit for new conversation",
    )

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        """Sanitize user input to prevent prompt injection.

        Args:
            v: The message content

        Returns:
            Sanitized message
        """
        # Remove potentially dangerous patterns
        dangerous_patterns = [
            "<system>", "<|im_start|>", "<|im_end|>",
            "[INST]", "[/INST]", "<<SYS>>", "<</SYS>>",
        ]
        cleaned = v
        for pattern in dangerous_patterns:
            cleaned = cleaned.replace(pattern, "")
        return cleaned.strip()


class ChatResponse(BaseModel):
    """Response schema for chat endpoint (ChatKit-compatible format)."""

    conversation_id: str = Field(..., description="ID of the conversation")
    message: ChatMessage = Field(..., description="AI assistant's response")
    tool_calls: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="List of tool calls made by the agent",
    )


class ConversationSummary(BaseModel):
    """Summary information for a conversation."""

    id: str = Field(..., description="Conversation UUID")
    title: str = Field(..., description="Conversation title")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")
    updated_at: str = Field(..., description="ISO 8601 last update timestamp")
    message_count: int = Field(..., description="Number of messages in conversation")


class ConversationListResponse(BaseModel):
    """Response schema for conversations list endpoint."""

    conversations: List[ConversationSummary] = Field(
        default_factory=list,
        description="List of user's conversations",
    )


class ConversationDetail(BaseModel):
    """Detailed conversation with messages."""

    id: str = Field(..., description="Conversation UUID")
    title: str = Field(..., description="Conversation title")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")
    updated_at: str = Field(..., description="ISO 8601 last update timestamp")
    messages: List[ChatMessage] = Field(
        default_factory=list,
        description="All messages in the conversation",
    )


class ConversationDetailResponse(BaseModel):
    """Response schema for conversation detail endpoint."""

    conversation: ConversationDetail = Field(..., description="Full conversation details")


class ErrorResponse(BaseModel):
    """Standard error response format."""

    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(default=None, description="Additional error details")
