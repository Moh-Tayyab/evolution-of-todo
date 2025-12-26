# Data Model: Console Todo Application

**Feature**: Phase I Console Todo Application
**Date**: 2025-12-25

## Entities

### Task

Represents a single todo item in the in-memory task list.

**Purpose**: Store task information for display, modification, and lifecycle management.

**Attributes**:

| Attribute | Type | Constraint | Description |
|-----------|--------|------------|-------------|
| `id` | `int` | Required, unique, auto-incremented | Unique identifier for referencing task in operations |
| `title` | `str` | Required, non-empty | Primary task description (1-200 characters) |
| `description` | `str` | Optional, can be empty | Additional task details (up to 1000 characters) |
| `completed` | `bool` | Required, default `False` | Task completion status for UI display |
| `created_at` | `datetime` | Required, auto-generated | Timestamp for tracking and ordering |

**State Transitions**:
- **Initial**: `completed=False` (task created incomplete)
- **Complete**: `completed=True` (user toggles completion)
- **Incomplete**: `completed=False` (user toggles back to incomplete)

**Validation Rules** (from FR-002, FR-009, FR-012):
- `title`: Cannot be empty string; must raise `ValueError` or return `False`
- `id`: Must be positive integer (≥1); must exist for update/delete/complete operations
- `completed`: Must be boolean; must toggle correctly

**Constraints** (from FR-004):
- No persistence: Data exists only in memory during application runtime
- No serialization: No file I/O, database, or external storage
- Session scoped: All tasks lost when application exits

## Storage Model

**In-Memory Collection**: `List[Task]` managed by `TodoManager` service.

**Characteristics**:
- All tasks stored in single list in memory
- Sequential ID assignment: Counter starts at 1, increments on each task creation
- Index-based access: Task objects retrieved by ID via list comprehension
- No persistence: Data lost on application restart

## Relationships

None. Single-entity model with no foreign keys or relationships (Phase I is single-user, in-memory only).

## Indexes and Performance

No external indexes. In-memory list operations are O(n) for search/delete by ID, which is acceptable for expected task counts (<100 tasks per SC-003).

**Performance Goal**: List operations remain instantaneous (<100ms per user perception) for up to 100 tasks.

## Future Migration Path

**Phase II Transition**:
- Replace `List[Task]` with SQLModel database table
- Add `user_id` foreign key for multi-user isolation
- Replace in-memory ID counter with database auto-increment or UUID
- Add persistence layer (Alembic migrations)
- Keep Task model fields compatible (add only, don't remove)

**Backward Compatibility**:
- Task dataclass can be directly converted to SQLModel schema
- Business logic (TodoManager methods) can be adapted to use ORM instead of list
- CLI interface unchanged; only data layer abstraction changes
