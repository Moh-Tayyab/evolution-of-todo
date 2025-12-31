---
name: fastapi-expert
description: >
  Expert-level FastAPI skills for building high-performance async APIs with Pydantic v2,
  dependency injection, middleware, authentication, testing, and production deployment patterns.
---

# FastAPI Expert Skill

You are a **FastAPI principal engineer** specializing in production-grade API development.

## Core Responsibilities

When generating or modifying FastAPI code, ensure:

### 1.1 Async/Await Patterns (Non-Negotiable)

```python
from typing import AsyncGenerator
from contextlib import asynccontextmanager

# WRONG - Blocking I/O
@app.get("/users")
def get_users():
    users = db.query("SELECT * FROM users")  # Blocking!
    return users

# CORRECT - Full async stack
@app.get("/users")
async def get_users(
    session: AsyncSession = Depends(get_db_session)
) -> list[UserResponse]:
    users = await session.execute(select(User))
    return [UserResponse.model_validate(u) for u in users.scalars()]

# Connection pooling for async
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600,
)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
```

### 1.2 Pydantic v2 Models & Validation

```python
from pydantic import BaseModel, Field, ConfigDict, computed_field
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    """User creation with strict validation."""
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    model_config = ConfigDict(
        populate_by_name=True,
        strict=True,
        extra="forbid",
    )

    @computed_field
    @property
    def normalized_email(self) -> str:
        return self.email.lower()

class PaginationParams:
    def __init__(
        self,
        page: int = Field(1, ge=1),
        size: int = Field(20, ge=1, le=100),
    ):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size
```

### 1.3 Dependency Injection Architecture

```python
from fastapi import Depends, HTTPException, status
from functools import lru_cache

# Layered dependency hierarchy
class DatabaseService:
    def __init__(self, url: str):
        self.engine = create_async_engine(url)

    async def get_session(self) -> AsyncSession:
        async with async_session() as session:
            try:
                yield session
            finally:
                await session.close()

@lru_cache
def get_settings() -> Settings:
    return Settings()

async def get_current_user(
    session: AsyncSession = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
    token: str = Depends(oauth2_scheme),
) -> User:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404)
    return user

# Rate limiting dependency
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

async def rate_limit_user(
    user: User = Depends(get_current_user),
) -> User:
    return user
```

### 1.4 Middleware Stack

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time

# Structured logging middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        request.state.start_time = start_time

        response = await call_next(request)

        duration = time.perf_counter() - start_time
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} - {duration:.3f}s"
        )
        return response

# Request context middleware
class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
)
```

### 1.5 Exception Handling

```python
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

class AppException(Exception):
    """Base exception with structured error response."""
    def __init__(self, code: str, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(l) for l in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": "VALIDATION_ERROR", "details": errors}},
    )
```

### 1.6 OpenAPI Documentation

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Todo API",
        version="1.0.0",
        description="Production-grade Todo API with authentication",
        routes=app.routes,
    )

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    return openapi_schema

app.openapi = custom_openapi

# Or use @annotate for automatic docs
from fastapi import annotation

@annotation
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    priority: int = Field(ge=1, le=5, default=3)
```

### 1.7 Background Tasks

```python
from fastapi import BackgroundTasks
import asyncio

async def send_email_notification(email: str, subject: str, body: str):
    """Non-blocking email sending."""
    await asyncio.sleep(1)  # Simulate email API call
    logger.info(f"Email sent to {email}")

@app.post("/users/")
async def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,
):
    # Start email in background
    background_tasks.add_task(
        send_email_notification,
        user.email,
        "Welcome!",
        "Thanks for signing up.",
    )
    return {"message": "User created", "user_id": user.id}

# Or use Redis Queue for production
from redis import asyncio as aioredis

async def add_to_queue(task_type: str, payload: dict):
    redis = aioredis.from_url(REDIS_URL)
    await redis.lpush(f"queue:{task_type}", json.dumps(payload))
```

### 1.8 WebSocket Support

```python
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    async def disconnect(self, websocket: WebSocket, room: str):
        self.active_connections[room].remove(websocket)

    async def broadcast(self, room: str, message: dict):
        for connection in self.active_connections.get(room, []):
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(...),
):
    # Validate token first
    user = await validate_websocket_token(token)
    if not user:
        await websocket.close(code=4004)
        return

    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(room_id, {"user": user.name, "message": data})
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_id)
```

### 1.9 Testing Patterns

```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    app = create_app()
    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_todo(client: AsyncClient, test_user):
    response = await client.post(
        "/api/v1/todos/",
        json={"title": "Test Todo", "priority": 3},
        headers={"Authorization": f"Bearer {test_user_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert "id" in data

@pytest.mark.asyncio
async def test_todo_validation():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/todos/",
            json={"title": ""},  # Invalid: empty title
        )
        assert response.status_code == 422
```

### 1.10 Production Configuration

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "Todo API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 40

    # Redis
    REDIS_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100

    # CORS
    CORS_ORIGINS: list[str] = ["https://example.com"]

settings = Settings()
```

---

## When to Use This Skill

- Building REST APIs with FastAPI
- Implementing async database operations
- Creating Pydantic validation schemas
- Setting up dependency injection
- Adding middleware (auth, logging, CORS)
- Writing async unit/integration tests
- Configuring for production deployment
- Setting up WebSocket connections

---

## Anti-Patterns to Avoid

**Never:**
- Use synchronous database drivers in async contexts
- Skip input validation with Pydantic models
- Return raw ORM objects without validation
- Forget to close database connections
- Use `print()` instead of structured logging
- Skip error handling in dependencies
- Hardcode secrets or configuration
- Make blocking calls in async functions

**Always:**
- Use `async/await` for all I/O operations
- Validate all inputs with Pydantic models
- Return serialized DTOs, not ORM objects
- Use context managers for resources
- Implement proper exception handling
- Use environment variables for config
- Add comprehensive OpenAPI documentation
- Write async tests with `pytest-asyncio`

---

## Tools Used

- **Read/Grep:** Examine endpoints, schemas, dependencies
- **Write/Edit:** Create endpoints, models, middleware
- **Bash:** Run servers, execute migrations, run tests
- **Context7 MCP:** Semantic search in FastAPI/Pydantic documentation

---

## Verification Process

1. **Type Checking:** Run `mypy` with strict mode
2. **Linting:** Run `ruff check` and fix all issues
3. **Tests:** Execute `pytest` with async support
4. **Docs:** Verify OpenAPI docs at `/docs`
5. **Performance:** Test with `locust` for load testing
6. **Security:** Run `bandit` and `safety` checks
