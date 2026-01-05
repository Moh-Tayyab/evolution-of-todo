# Backend AI Instructions - FastAPI Todo Application

## Context

This file contains backend-specific AI instructions for the FastAPI Todo application.

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.13+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Auth**: JWT verification (python-jose)
- **Testing**: pytest, httpx

## Project Structure

```
backend/
├── src/
│   ├── models/          # SQLModel entities (Task, Tag, TaskTag)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── api/
│   │   ├── deps.py      # Dependencies (JWT verification)
│   │   └── routes/     # API route handlers (tasks.py, tags.py)
│   ├── middleware/
│   │   └── auth.py     # JWT verification middleware
│   ├── config.py        # Settings from environment variables
│   ├── database.py      # SQLModel async engine
│   └── main.py         # FastAPI app entry point
└── tests/
    ├── conftest.py      # Pytest fixtures
    ├── unit/           # Unit tests
    ├── contract/        # Contract tests (API specification)
    └── integration/    # Integration tests
```

## Key Patterns

### Request Handling

1. **Authentication**: All protected routes use `get_current_user_id` dependency
2. **User Isolation**: Verify `user_id` from JWT matches path parameter
3. **Validation**: Use Pydantic schemas for request/response
4. **Error Handling**: Return appropriate HTTP status codes with JSON responses

### Database Operations

1. Use async sessions with `async with Session(engine) as session:`
2. Always query with user_id filter for data isolation
3. Use `select().where()` for queries with proper joins
4. Handle foreign key relationships with `Relationship()` in models

### API Routes Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..deps import get_current_user_id
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskRead

router = APIRouter()

@router.get("/{user_id}/tasks", response_model=list[TaskRead])
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    if current_user_id != user_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied")
    # ... implementation
```

## Code Standards

1. **@spec comments**: Every source file must include `@spec:` comments
2. **Type hints**: All functions must have type hints
3. **Docstrings**: All public functions need PEP 257 docstrings
4. **Error messages**: Clear, user-friendly error messages
5. **Status codes**: Use `status.HTTP_*` constants

## Data Model

### Task Entity
- id (UUID, PK)
- user_id (UUID, FK to user, indexed)
- title (VARCHAR 200, NOT NULL)
- description (TEXT, NULLABLE)
- priority (VARCHAR 10: high/medium/low, DEFAULT medium)
- completed (BOOLEAN, DEFAULT false)
- created_at (TIMESTAMP, DEFAULT NOW())
- updated_at (TIMESTAMP, DEFAULT NOW())

### Tag Entity
- id (UUID, PK)
- user_id (UUID, FK to user, indexed)
- name (VARCHAR 50, NOT NULL)
- color (VARCHAR 7, NULLABLE)
- created_at (TIMESTAMP, DEFAULT NOW())

### TaskTag Junction
- task_id (UUID, FK to tasks, PK)
- tag_id (UUID, FK to tags, PK)

## API Endpoints

### Tasks
- `GET /api/{user_id}/tasks` - List tasks with optional search/filter/sort
- `POST /api/{user_id}/tasks` - Create task (100 task limit)
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}` - Partial update (toggle complete)
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

### Tags
- `GET /api/{user_id}/tags` - List tags with task counts
- `POST /api/{user_id}/tags` - Create tag
- `PUT /api/{user_id}/tags/{tag_id}` - Update tag
- `DELETE /api/{user_id}/tags/{tag_id}` - Delete tag

## Testing

### Test Structure
- Unit tests: Test individual functions (models, schemas, utilities)
- Contract tests: Verify API matches OpenAPI specification
- Integration tests: Test full API flows with database

### Coverage
- Target: ≥80% coverage
- Use `pytest --cov=src --cov-report=html`

### Fixtures
```python
@pytest.fixture
async def session():
    async with Session(engine) as session:
        yield session
        await session.rollback()
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `BETTER_AUTH_URL`: URL to Better Auth service

## Performance

- Query optimization: Use indexes on user_id fields
- Pagination: Consider for large datasets (not needed for 100 task limit)
- Response time: API calls should complete within 200ms for CRUD ops

## Security

1. Never log sensitive data (passwords, tokens)
2. Validate all input via Pydantic schemas
3. Use parameterized queries (SQLModel handles this)
4. Validate JWT on every protected route
5. Enforce user isolation in all queries
