# Data Model: Phase III - AI Chatbot

**Feature**: 003-ai-chatbot
**Date**: 2025-12-31
**Status**: Draft
**Based on**: research.md (Phase 0) and spec.md

## Overview

This document defines the data model for conversation and message storage in PostgreSQL. It extends the existing Phase II models (User, Task) with new entities for AI chatbot conversation history and tool invocation tracking.

All data models use SQLModel ORM with Pydantic validation, following Phase II patterns.

---

## Entity Definitions

### Conversation

Represents a chat session between a user and the AI assistant.

**Purpose**: Track multiple independent conversations per user, enabling conversation switching and session resumption.

```python
# @spec: specs/003-ai-chatbot/spec.md
# Entity: Conversation
# User Story 6: Conversation History Persistence

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

from src.models.user import User
from src.models.message import Message


class Conversation(SQLModel, table=True):
    """Represents a chat session for a user's conversation history."""

    __tablename__ = "conversations"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique identifier for the conversation",
    )

    user_id: UUID = Field(
        foreign_key="users.id",
        description="ID of the user who owns this conversation",
        index=True,
    )

    # Relationship to User (defined in Phase II)
    user: User = Relationship(
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    title: str = Field(
        max_length=200,
        description="Auto-generated or user-defined title for this conversation",
        default="New Chat",
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when conversation was created",
        index=True,
    )

    updated_at: Optional[datetime] = Field(
        default=None,
        description="Timestamp of last message/activity in conversation",
        index=True,
    )

    # Reverse relationship to Messages
    messages: list["Message"] = Relationship(
        sa_relationship_kwargs={"lazy": "selectin"},
    )


# Indexes
# CREATE INDEX idx_conversations_user ON conversations(user_id DESC, updated_at DESC);
# CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
```

**Validation Rules**:
- `user_id`: Must reference valid user (foreign key)
- `title`: Required, max 200 characters
- `created_at`, `updated_at`: Auto-populated, nullable for `updated_at`

**State Transitions**:
- **Created**: Conversation created when user sends first message in new session
- **Active**: Updated on each message (`updated_at` timestamp refreshes)
- **Archived**: Soft delete flag could be added in future (not in scope now)

---

### Message

Represents a single message (user or AI) within a conversation.

**Purpose**: Store complete conversation history with role attribution and optional tool invocation tracking.

```python
# @spec: specs/003-ai-chatbot/spec.md
# Entity: Message
# User Story 6: Conversation History Persistence

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum
from sqlmodel import Field, Relationship, SQLModel

from src.models.conversation import Conversation


class MessageRole(str, Enum):
    """Role of the message sender."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(SQLModel, table=True):
    """Represents a single message in a conversation."""

    __tablename__ = "messages"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique identifier for the message",
    )

    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        description="ID of the conversation this message belongs to",
        index=True,
    )

    # Relationship to Conversation
    conversation: Conversation = Relationship(
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    role: MessageRole = Field(
        description="Who sent this message (user, assistant, or system)",
        index=True,
    )

    content: str = Field(
        description="Text content of the message",
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when message was created",
        index=True,
    )

    # Optional: Track MCP tool invocations by AI
    tool_calls: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="JSONB field storing tool invocation details (tool name, args, result)",
    )


# Indexes
# CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
# CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
```

**Validation Rules**:
- `conversation_id`: Must reference valid conversation (foreign key)
- `role`: Must be one of `MessageRole` enum values
- `content`: Required, no maximum length (store as TEXT)
- `created_at`: Auto-populated
- `tool_calls`: Optional, stores JSON when AI invokes MCP tools

**Tool Calls Schema** (stored in `tool_calls` JSONB field):
```python
{
    "tool_name": "add_task",
    "tool_args": {
        "user_id": "uuid-of-user",
        "title": "Buy milk",
        "description": None
    },
    "tool_result": {
        "success": True,
        "task_id": "uuid-of-new-task"
    }
}
```

**State Transitions**:
- No state transitions (messages are immutable once created)

---

## Relationships

### User to Conversations (One-to-Many)

```python
# User model (from Phase II, extended)
class User(SQLModel, table=True):
    # ... existing fields ...

    # NEW: Reverse relationship to conversations
    conversations: list["Conversation"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
```

**Query Example**: Get user's conversations
```python
# @spec: specs/003-ai-chatbot/spec.md
# FR-027: System MUST allow switching between conversations

def get_user_conversations(user_id: UUID, limit: int = 100) -> list[Conversation]:
    """Retrieve user's conversations ordered by most recent activity."""
    with Session(engine) as session:
        return session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        ).all()
```

### Conversation to Messages (One-to-Many)

```python
# Conversation model (defined above)
class Conversation(SQLModel, table=True):
    # ... existing fields ...

    # Reverse relationship to messages
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
```

**Query Example**: Load conversation messages
```python
# @spec: specs/003-ai-chatbot/spec.md
# FR-024: System MUST retrieve latest conversation when conversation_id is "latest" or not provided
# FR-025: System MUST store all messages (user and AI) in messages table with conversation_id

def get_conversation_messages(conversation_id: UUID, limit: int = 1000) -> list[Message]:
    """Retrieve all messages for a conversation in chronological order."""
    with Session(engine) as session:
        return session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        ).all()
```

---

## Database Schema (SQL)

### Complete DDL

```sql
-- Users table (from Phase II, referenced here for context)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table (from Phase II, referenced here for context)
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Conversations table (NEW for Phase III)
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages table (NEW for Phase III)
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    tool_calls JSONB,
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Indexes for performance
CREATE INDEX idx_conversations_user ON conversations(user_id DESC, updated_at DESC);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_role ON messages(role, created_at DESC);
```

### Indexing Rationale

**`idx_conversations_user`**: `(user_id DESC, updated_at DESC)`
- Supports: Get user's conversation list, sorted by most recent activity
- Query pattern: `WHERE user_id = ? ORDER BY updated_at DESC`
- Multi-column index efficiently filters by user and sorts by updated_at

**`idx_conversations_created`**: `(created_at DESC)`
- Supports: Get all conversations (admin queries)
- Query pattern: `ORDER BY created_at DESC`
- Optimizes pagination for large datasets

**`idx_messages_conversation`**: `(conversation_id, created_at DESC)`
- Supports: Load conversation messages in chronological order
- Query pattern: `WHERE conversation_id = ? ORDER BY created_at ASC`
- Multi-column index efficiently filters by conversation and sorts by created_at

**`idx_messages_role`**: `(role, created_at DESC)`
- Supports: Filter messages by role (e.g., show only user messages)
- Query pattern: `WHERE conversation_id = ? AND role = ?`
- Additional optimization for role-based queries

---

## Constraints and Business Rules

### Conversation Limits

**FR-028**: System MUST limit conversations to 100 per user to prevent excessive storage.

```python
# @spec: specs/003-ai-chatbot/spec.md
# FR-028: Limit to 100 conversations per user

def create_conversation(user_id: UUID, title: str) -> Conversation:
    """Create a new conversation with user limit enforcement."""
    with Session(engine) as session:
        # Check user's current conversation count
        count = session.exec(
            select(func.count())
            .select_from(Conversation)
            .where(Conversation.user_id == user_id)
        ).one()

        if count >= 100:
            raise ValueError("Maximum 100 conversations per user exceeded. Archive old conversations first.")

        # If limit exceeded, delete oldest conversation
        if count >= 100:
            oldest = session.exec(
                select(Conversation)
                .where(Conversation.user_id == user_id)
                .order_by(Conversation.updated_at.asc())
                .limit(1)
            ).one()
            session.delete(oldest)

        conversation = Conversation(user_id=user_id, title=title)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        return conversation
```

### Message Limits

**Edge Case**: What happens when conversation exceeds message limit (e.g., 1000 messages)?

```python
# @spec: specs/003-ai-chatbot/spec.md
# Edge Case: Conversation message limit

MAX_MESSAGES_PER_CONVERSATION = 1000

def add_message(conversation_id: UUID, role: MessageRole, content: str, tool_calls: dict | None = None) -> Message:
    """Add message to conversation with archival support."""
    with Session(engine) as session:
        # Check current message count
        count = session.exec(
            select(func.count())
            .select_from(Message)
            .where(Message.conversation_id == conversation_id)
        ).one()

        # Archive conversation if exceeds limit
        if count >= MAX_MESSAGES_PER_CONVERSATION:
            archive_conversation(conversation_id)
            return None  # Indicate archival to UI

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
        )
        session.add(message)

        # Update conversation's updated_at timestamp
        session.exec(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(updated_at=datetime.utcnow())
        )

        session.commit()
        session.refresh(message)
        return message
```

---

## Data Access Patterns

### Load or Create Latest Conversation

```python
# @spec: specs/003-ai-chatbot/spec.md
# FR-024: Retrieve latest conversation when conversation_id is "latest" or not provided
# FR-023: Create new conversation when user sends first message

def get_or_create_latest_conversation(user_id: UUID) -> Conversation:
    """Get user's most recently updated conversation or create new one."""
    with Session(engine) as session:
        # Try to find most recent conversation
        conversation = session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .first()
        )

        if conversation:
            return conversation

        # Create new conversation if none exists
        new_conversation = Conversation(
            user_id=user_id,
            title="New Chat",
        )
        session.add(new_conversation)
        session.commit()
        session.refresh(new_conversation)
        return new_conversation
```

### Append Message to Conversation

```python
# @spec: specs/003-ai-chatbot/spec.md
# User Story 6: Send message and persist to database

def append_message(
    conversation_id: UUID,
    role: MessageRole,
    content: str,
    tool_calls: dict | None = None,
) -> Message:
    """Append message to conversation and update timestamp."""
    with Session(engine) as session:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
        )
        session.add(message)

        # Update conversation's updated_at
        session.exec(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(updated_at=datetime.utcnow())
        )

        session.commit()
        session.refresh(message)
        return message
```

---

## Migration Strategy

### Alembic Migration

```python
# File: alembic/versions/004_add_conversations_and_messages.py

# @spec: specs/003-ai-chatbot/spec.md
# Database schema changes for Phase III

from alembic import op
import sqlalchemy as sa
from uuid import uuid4


def upgrade() -> None:
    """Add conversations and messages tables."""
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column(
            'id',
            sa.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
        ),
        sa.Column('user_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )

    # Create messages table
    op.create_table(
        'messages',
        sa.Column(
            'id',
            sa.UUID(as_uuid=True),
            primary_key=True,
            default=uuid4,
        ),
        sa.Column('conversation_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('tool_calls', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
    )

    # Create indexes
    op.create_index('idx_conversations_user', 'conversations', ['user_id', 'updated_at'])
    op.create_index('idx_conversations_created', 'conversations', ['created_at'])
    op.create_index('idx_messages_conversation', 'messages', ['conversation_id', 'created_at'])
    op.create_index('idx_messages_role', 'messages', ['role', 'created_at'])


def downgrade() -> None:
    """Remove conversations and messages tables."""
    op.drop_index('idx_messages_role', 'messages')
    op.drop_index('idx_messages_conversation', 'messages')
    op.drop_index('idx_conversations_created', 'conversations')
    op.drop_index('idx_conversations_user', 'conversations')
    op.drop_table('messages')
    op.drop_table('conversations')
```

---

## Validation Rules Summary

| Entity | Field | Rule | Enforcement |
|---------|--------|-------|--------------|
| Conversation | `user_id` | Foreign key to users table |
| Conversation | `title` | Required, max 200 characters |
| Conversation | `created_at` | Auto-generated, not nullable |
| Conversation | `updated_at` | Nullable, refreshed on each message |
| Conversation | User limit | Maximum 100 conversations per user (FR-028) |
| Message | `conversation_id` | Foreign key to conversations table |
| Message | `role` | Enum: user, assistant, system |
| Message | `content` | Required, unlimited length |
| Message | `created_at` | Auto-generated, not nullable |
| Message | `tool_calls` | Optional, JSONB format |
| Message | Conversation limit | Maximum 1000 messages per conversation (edge case) |

---

## Acceptance Criteria

All data model requirements from spec.md addressed:
- [x] Conversation entity defined with user relationship (FR-023, FR-028)
- [x] Message entity defined with conversation relationship (FR-025)
- [x] Message role tracking (user/assistant/system) (FR-025)
- [x] Tool calls JSONB field for AI tool invocation tracking (FR-017)
- [x] Foreign key constraints with CASCADE delete (data integrity)
- [x] Composite indexes for query optimization (research.md Q5)
- [x] User isolation via user_id foreign keys (FR-003)
- [x] Conversation title field for auto-generated summaries (FR-026)
- [x] Update timestamp on messages for conversation sorting (FR-024)

**Status**: ✅ Data Model Complete - Ready for Implementation
