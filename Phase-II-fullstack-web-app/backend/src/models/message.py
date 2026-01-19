# @spec: specs/003-ai-chatbot/spec.md
# @spec: specs/003-ai-chatbot/data-model.md
# Message SQLModel entity for chat messages

from datetime import datetime
from typing import Optional, List, Any, Dict
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from enum import Enum


class MessageRole(str, Enum):
    """Message role enumeration"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageBase(SQLModel):
    """Base fields shared by create/update schemas"""
    content: str = Field(max_length=10000)
    role: MessageRole


class Message(MessageBase, table=True):
    """Database model for messages table

    Stores individual messages within a conversation.
    Each message has a role (user/assistant/system) and
    optional tool_calls for AI agent tool invocations.
    """
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True, nullable=False)
    tool_calls: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
