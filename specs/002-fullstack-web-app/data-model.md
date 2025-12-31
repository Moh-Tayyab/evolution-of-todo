# Data Model: Phase II - Todo Full-Stack Web Application

**Feature**: 002-fullstack-web-app
**Date**: 2025-12-29
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                         users                            │
│  (Managed by Better Auth - shown for reference)         │
├─────────────────────────────────────────────────────────┤
│  id          : UUID [PK]                                │
│  email       : VARCHAR(255) [UNIQUE, NOT NULL]          │
│  password    : VARCHAR(255) [NOT NULL] (hashed)         │
│  name        : VARCHAR(255) [NULLABLE]                  │
│  created_at  : TIMESTAMP [NOT NULL, DEFAULT NOW()]      │
│  updated_at  : TIMESTAMP [NOT NULL, DEFAULT NOW()]      │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │ 1:N                   │ 1:N
                ▼                       ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│            tasks                 │  │             tags                 │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│  id          : UUID [PK]        │  │  id          : UUID [PK]        │
│  user_id     : UUID [FK, INDEX] │  │  user_id     : UUID [FK, INDEX] │
│  title       : VARCHAR(200)     │  │  name        : VARCHAR(50)      │
│  description : TEXT [NULLABLE]  │  │  color       : VARCHAR(7)       │
│  priority    : VARCHAR(10)      │  │  created_at  : TIMESTAMP        │
│  completed   : BOOLEAN          │  └─────────────────────────────────┘
│  created_at  : TIMESTAMP        │                │
│  updated_at  : TIMESTAMP        │                │
└─────────────────────────────────┘                │
                │                                  │
                │ N:M                              │
                └──────────┬───────────────────────┘
                           ▼
              ┌─────────────────────────────┐
              │         task_tags            │
              ├─────────────────────────────┤
              │  task_id : UUID [FK, PK]    │
              │  tag_id  : UUID [FK, PK]    │
              └─────────────────────────────┘
```

## Entity Definitions

### User (Managed by Better Auth)

Better Auth manages the `users` table automatically. We document it here for reference but do not create or modify it directly.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| `name` | VARCHAR(255) | NULLABLE | Display name (optional) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last profile update |

**Better Auth Session Table** (also managed automatically):
- `session` table stores active sessions
- `account` table for OAuth providers (not used in Phase II)

### Task

The primary entity for this feature. Represents a todo item belonging to a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique task identifier |
| `user_id` | UUID | FK → users.id, NOT NULL, INDEX | Owner reference |
| `title` | VARCHAR(200) | NOT NULL | Task title (max 200 chars) |
| `description` | TEXT | NULLABLE | Optional detailed description (max 2000 chars in validation) |
| `priority` | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | Priority level (high, medium, low) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT false | Completion status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification time |

### Tag

Represents a user-defined label for categorizing tasks.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique tag identifier |
| `user_id` | UUID | FK → users.id, NOT NULL, INDEX | Owner reference |
| `name` | VARCHAR(50) | NOT NULL | Tag name (max 50 chars) |
| `color` | VARCHAR(7) | NULLABLE | Optional hex color code (#RRGGBB) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Tag creation time |

**Unique Constraint**: `(user_id, name)` - Tag names must be unique per user.

### TaskTag (Junction Table)

Many-to-many relationship between tasks and tags.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `task_id` | UUID | FK → tasks.id, NOT NULL | Task reference |
| `tag_id` | UUID | FK → tags.id, NOT NULL | Tag reference |

**Primary Key**: `(task_id, tag_id)` - Composite key prevents duplicate associations.

## Validation Rules

### Task Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `title` | Required, 1-200 characters | "Title is required" / "Title must be 200 characters or less" |
| `description` | Optional, max 2000 characters | "Description must be 2000 characters or less" |
| `priority` | One of: high, medium, low | "Priority must be high, medium, or low" |
| `completed` | Boolean only | "Completed must be true or false" |

### Tag Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required, 1-50 characters | "Tag name is required" / "Tag name must be 50 characters or less" |
| `color` | Optional, hex format (#RRGGBB) | "Color must be a valid hex color code" |

### Business Rules

| Rule | Enforcement | Description |
|------|-------------|-------------|
| Max 100 tasks per user | Backend API | Returns 400 when limit reached |
| User can only access own tasks | JWT + path validation | Returns 403 for mismatch |
| Task belongs to exactly one user | FK constraint | Cascade delete on user removal |
| Tag names unique per user | Unique constraint | Returns 400 for duplicate name |
| User can only access own tags | JWT + path validation | Returns 403 for mismatch |
| Deleting tag removes associations | FK cascade | task_tags entries removed |

## Indexes

```sql
-- Primary keys (automatic)
CREATE INDEX idx_tasks_pk ON tasks(id);
CREATE INDEX idx_tags_pk ON tags(id);

-- Foreign key + query optimization
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- For filtering by priority and status
CREATE INDEX idx_tasks_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_completed ON tasks(user_id, completed);

-- Tag name uniqueness per user
CREATE UNIQUE INDEX idx_tags_user_name ON tags(user_id, name);

-- Junction table indexes
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
```

## SQLModel Implementation

```python
# @spec: specs/002-fullstack-web-app/data-model.md
# Entity: Task, Tag, TaskTag

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

class Priority(str, Enum):
    """Task priority levels"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

# Junction table for many-to-many relationship
class TaskTag(SQLModel, table=True):
    """Junction table for Task-Tag relationship"""
    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True, ondelete="CASCADE")
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True, ondelete="CASCADE")

class TagBase(SQLModel):
    """Base fields for Tag"""
    name: str = Field(max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)  # #RRGGBB

class Tag(TagBase, table=True):
    """Database model for tags table"""
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTag)

class TagCreate(TagBase):
    """Schema for creating a tag"""
    pass

class TagUpdate(SQLModel):
    """Schema for updating a tag"""
    name: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)

class TagRead(TagBase):
    """Schema for reading a tag"""
    id: UUID
    user_id: UUID
    created_at: datetime

class TagReadWithCount(TagRead):
    """Tag with task count"""
    task_count: int = 0

class TaskBase(SQLModel):
    """Base fields shared by create/update schemas"""
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Priority = Field(default=Priority.MEDIUM)

class Task(TaskBase, table=True):
    """Database model for tasks table"""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True, nullable=False)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tags: List[Tag] = Relationship(back_populates="tasks", link_model=TaskTag)

class TaskCreate(SQLModel):
    """Schema for creating a task"""
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Priority = Field(default=Priority.MEDIUM)
    tag_ids: Optional[List[UUID]] = None

class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Optional[Priority] = None
    completed: Optional[bool] = None
    tag_ids: Optional[List[UUID]] = None

class TaskRead(TaskBase):
    """Schema for reading a task"""
    id: UUID
    user_id: UUID
    completed: bool
    tags: List[TagRead] = []
    created_at: datetime
    updated_at: datetime
```

## TypeScript Types (Frontend)

```typescript
// @spec: specs/002-fullstack-web-app/data-model.md
// Entity: Task, Tag

export type Priority = 'high' | 'medium' | 'low';

export interface Tag {
  id: string;           // UUID
  user_id: string;      // UUID
  name: string;         // max 50 chars
  color: string | null; // hex color #RRGGBB
  created_at: string;   // ISO 8601
}

export interface TagWithCount extends Tag {
  task_count: number;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string | null;
}

export interface TagListResponse {
  tags: TagWithCount[];
  count: number;
}

export interface Task {
  id: string;           // UUID
  user_id: string;      // UUID
  title: string;        // max 200 chars
  description: string | null;  // max 2000 chars
  priority: Priority;
  completed: boolean;
  tags: Tag[];
  created_at: string;   // ISO 8601
  updated_at: string;   // ISO 8601
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: Priority;
  tag_ids?: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: Priority;
  completed?: boolean;
  tag_ids?: string[];
}

export interface TaskListResponse {
  tasks: Task[];
  count: number;
}

// Query parameters for task list
export interface TaskListParams {
  search?: string;
  status?: 'all' | 'completed' | 'incomplete';
  priority?: Priority;
  tags?: string[];  // tag IDs
  sort?: 'created_at' | 'priority' | 'title';
  order?: 'asc' | 'desc';
}
```

## Zod Validation Schemas (Frontend)

```typescript
// @spec: specs/002-fullstack-web-app/data-model.md
// Validation: Task, Tag

import { z } from 'zod';

export const prioritySchema = z.enum(['high', 'medium', 'low']);

export const tagCreateSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less"),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
    .optional(),
});

export const tagUpdateSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less")
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
    .nullable()
    .optional(),
});

export const taskCreateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z.string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: prioritySchema.optional().default('medium'),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .optional(),
  description: z.string()
    .max(2000, "Description must be 2000 characters or less")
    .nullable()
    .optional(),
  priority: prioritySchema.optional(),
  completed: z.boolean().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export const taskListParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'completed', 'incomplete']).optional(),
  priority: prioritySchema.optional(),
  tags: z.array(z.string().uuid()).optional(),
  sort: z.enum(['created_at', 'priority', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskListParamsInput = z.infer<typeof taskListParamsSchema>;
```

## State Transitions

```
Task Lifecycle:

  [Created] ──────────────────────────────────────┐
      │                                           │
      ▼                                           │
  ┌───────────────┐                               │
  │  Incomplete   │ ◄────────────────────┐        │
  │  (completed   │                      │        │
  │   = false)    │                      │        │
  └───────────────┘                      │        │
      │                                  │        │
      │ toggle (PATCH completed=true)    │        │
      ▼                                  │        │
  ┌───────────────┐                      │        │
  │   Complete    │                      │        │
  │  (completed   │──────────────────────┘        │
  │   = true)     │  toggle (PATCH completed=false)
  └───────────────┘                               │
      │                                           │
      │ DELETE                                    │
      ▼                                           │
  [Deleted] ◄─────────────────────────────────────┘
```

**Allowed Transitions**:
- Created → Incomplete (default)
- Incomplete → Complete (toggle)
- Complete → Incomplete (toggle)
- Any → Deleted (DELETE request)

**Update Operations** (PUT/PATCH):
- Title and description can be updated at any time
- Completed status toggled via PATCH

## Migration Strategy

```sql
-- Migration: 001_create_tasks_table.sql
-- @spec: specs/002-fullstack-web-app/data-model.md

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_completed ON tasks(user_id, completed);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Task-Tag junction table
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Data Volume Assumptions

| Metric | Value | Notes |
|--------|-------|-------|
| Max users | Unlimited | Neon free tier limits apply |
| Max tasks per user | 100 | Enforced in application |
| Avg task title length | 50 chars | Estimate for storage |
| Avg task description length | 200 chars | Estimate for storage |
| Task row size | ~500 bytes | Approximate |

## Relationships Summary

| From | To | Cardinality | On Delete |
|------|----|-------------|-----------|
| Task | User | Many-to-One | CASCADE |
| Tag | User | Many-to-One | CASCADE |
| Task | Tag | Many-to-Many (via task_tags) | CASCADE (junction entries) |
