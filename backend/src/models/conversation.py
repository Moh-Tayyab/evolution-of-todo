# @spec: specs/003-ai-chatbot/spec.md
# @spec: specs/003-ai-chatbot/data-model.md
# Conversation SQLModel entity for chatbot sessions

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, Text, Index


class ConversationBase(SQLModel):
    """Base fields shared by create/update schemas"""
    title: Optional[str] = Field(default=None, max_length=255)


class Conversation(ConversationBase, table=True):
    """Database model for conversations table

    Stores chatbot session metadata for each user.
    Each conversation contains multiple messages exchanged
    between the user and AI agent.
    """
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")


# Indexes defined in SQLModel (PostgreSQL will create these)
# CREATE INDEX idx_conversations_user ON conversations(user_id DESC, updated_at DESC);
# CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
