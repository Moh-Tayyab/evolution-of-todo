# Database Schema: AI Chatbot - Conversations and Messages

**Feature**: AI-Powered Chatbot
**Phase**: Phase III - AI Chatbot
**Related**: [spec.md](../spec.md), [api/mcp-tools.md](../api/mcp-tools.md)

## Overview

Defines database schema extensions for conversation and message persistence. All chat data is persisted to PostgreSQL, enabling conversation history across browser sessions and supporting stateless MCP tool execution.

## Schema Design Principles

1. **Stateless Design**: No in-memory conversation storage; all state in PostgreSQL
2. **User Isolation**: All conversation and message data scoped to user_id
3. **Conversation Bounding**: Maximum 100 messages per conversation to prevent excessive storage
4. **Auto-Archive**: Old conversations automatically archived when new one created (>100 messages)
5. **Foreign Key Integrity**: Cascading deletes for cleanup (user deleted → all conversations/messages removed)

## Existing Tables (Phase II)

The following tables from Phase II remain unchanged:

### Users Table
Managed by Better Auth with at minimum:
- `id` - Unique identifier (UUID)
- `email` - User email (unique)
- `password_hash` - Hashed password
- Standard auth metadata (created_at, updated_at, etc.)

### Tasks Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique task identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL, INDEXED | Owner reference |
| `title` | VARCHAR(200) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Optional description |
| `priority` | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | Priority level (high, medium, low) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT false | Completion status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Tags Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique tag identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL, INDEXED | Owner reference |
| `name` | VARCHAR(50) | NOT NULL | Tag name |
| `color` | VARCHAR(7) | NULLABLE | Optional hex color code |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

### Task_Tags Junction Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `task_id` | UUID | FOREIGN KEY → tasks.id, NOT NULL | Task reference |
| `tag_id` | UUID | FOREIGN KEY → tags.id, NOT NULL | Tag reference |
| PRIMARY KEY | (task_id, tag_id) | | Composite primary key |

## New Tables (Phase III)

### Conversations Table

Stores chat session metadata for each user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique conversation identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL, INDEXED | Owner reference |
| `title` | VARCHAR(100) | NULLABLE | Auto-generated conversation title from first few messages (null for untitled) |
| `message_count` | INTEGER | NOT NULL, DEFAULT 0 | Total messages in conversation (for queries, not constraint) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last message timestamp (for sorting) |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` for efficient user conversation queries
- INDEX on `updated_at` for conversation list sorting
- UNIQUE constraint on `(user_id, id)` - implicit via PK

**Relationships**:
- `conversations.user_id` → `users.id` (Many-to-One)
- ON DELETE CASCADE: When user deleted, all conversations are deleted

**SQLModel Definition**:
```python
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from uuid import uuid4

from . import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(100), nullable=True)
    message_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Messages Table

Stores individual messages (user and AI) within conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique message identifier |
| `conversation_id` | UUID | FOREIGN KEY → conversations.id, NOT NULL, INDEXED | Conversation reference |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL, INDEXED | Owner reference (redundant for query optimization) |
| `role` | VARCHAR(10) | NOT NULL | Message role: 'user', 'assistant', 'system' |
| `content` | TEXT | NOT NULL | Message content |
| `tool_calls` | JSONB | NULLABLE | Optional field for AI tool invocations (stored as JSON) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `conversation_id` for message list queries
- INDEX on `user_id` for user message queries
- INDEX on `created_at` for sorting

**Relationships**:
- `messages.conversation_id` → `conversations.id` (Many-to-One)
- `messages.user_id` → `users.id` (Many-to-One, redundant)
- ON DELETE CASCADE: When conversation deleted, all messages are deleted

**SQLModel Definition**:
```python
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from uuid import uuid4

from . import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON, nullable=True)  # Stores tool invocation details as JSON
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
```

**tool_calls Field Schema** (JSONB content example):
```json
{
  "tool_name": "add_task",
  "tool_args": {
    "user_id": "user-uuid",
    "title": "Buy groceries"
  },
  "tool_result": {
    "success": true,
    "message_id": "msg-uuid"
  }
}
```

## Database Operations

### Common Query Patterns

#### User's Active Conversation

Retrieves or creates active conversation for a user:

```sql
SELECT c.id, c.title, c.message_count, c.updated_at
FROM conversations c
WHERE c.user_id = $1
ORDER BY c.updated_at DESC
LIMIT 1;
```

#### Conversation Messages

Retrieves all messages for a conversation in chronological order:

```sql
SELECT m.id, m.role, m.content, m.tool_calls, m.created_at
FROM messages m
WHERE m.conversation_id = $1
ORDER BY m.created_at ASC;
```

#### User's All Conversations

Retrieves all conversations for a user with message preview:

```sql
SELECT c.id, c.title, c.message_count, c.updated_at,
       (SELECT content FROM messages WHERE conversation_id = c.id AND role = 'assistant' ORDER BY created_at DESC LIMIT 1) as last_ai_message
FROM conversations c
WHERE c.user_id = $1
ORDER BY c.updated_at DESC;
```

### Message Count Updates

Updates conversation message count on new message:

```sql
UPDATE conversations
SET message_count = message_count + 1,
    updated_at = NOW()
WHERE id = $1;
```

## Migration Strategy

### Migration File

```python
# Alembic migration: create_chatbot_tables
from alembic import op
import sqlalchemy as sa
from datetime import datetime

def upgrade():
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('title', sa.String(100), nullable=True),
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now())
    )

    op.create_index('ix_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('ix_conversations_updated_at', 'conversations', ['updated_at'])

    op.create_table(
        'messages',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('conversation_id', sa.String(), sa.ForeignKey('conversations.id'), nullable=False, index=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('role', sa.String(10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('ix_messages_user_id', 'messages', ['user_id'])
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])

def downgrade():
    op.drop_index('ix_messages_created_at', 'messages')
    op.drop_index('ix_messages_user_id', 'messages')
    op.drop_index('ix_messages_conversation_id', 'messages')
    op.drop_table('messages')
    op.drop_index('ix_conversations_updated_at', 'conversations')
    op.drop_index('ix_conversations_user_id', 'conversations')
    op.drop_table('conversations')
```

### Rollback Plan

1. Drop indexes on new tables
2. Drop messages table
3. Drop conversations table
4. Verify Phase II tables still intact

## Data Retention Policy

### Conversation Archival

When a conversation exceeds 100 messages:
1. Create new conversation with title "Archived [Old Date]"
2. Auto-archive old conversation title
3. Keep all messages for history reference

### Cleanup Job

Periodic cleanup job (to be added in Phase IV):
- Delete conversations with no activity for 30 days
- Limit total messages per user to 10,000 across all conversations
- Archive old conversations to cold storage (future enhancement)

## Performance Considerations

### Query Optimization

1. **Foreign Key Indexing**: All user_id fields indexed for fast user-scoped queries
2. **Composite Indexing**: (user_id, id) indexes for direct lookups
3. **Message Ordering**: created_at indexed for chronological message retrieval
4. **Conversation Sorting**: updated_at indexed for conversation list ordering

### Connection Pooling

SQLModel's connection pool configuration:
```python
# database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=20,  # Connection pool size
    max_overflow=10,  # Overflow pool size
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=False
)
```

## Security Considerations

### Input Validation

1. **UUID Validation**: All UUID parameters validated before database operations
2. **Role Validation**: Message role constrained to ENUM ('user', 'assistant', 'system')
3. **Content Sanitization**: Message content sanitized to prevent SQL injection
4. **User ID Enforcement**: All queries filtered by authenticated user_id

### Access Control

1. **Row-Level Security**: Every query includes WHERE user_id = authenticated_user
2. **No Data Leakage**: Users cannot see other users' conversations or messages
3. **Prevent Privilege Escalation**: MCP tools validate user_id matches authenticated user

---

*End of Database Schema*
