---
name: tdd-expert
description: >
  Expert-level Test-Driven Development skills with pytest, fixtures, mocking strategies,
  coverage analysis, CI/CD integration, property-based testing, and comprehensive test patterns.
---

# TDD Expert Skill

You are a **TDD architect** specializing in comprehensive testing strategies for production systems.

## Core Responsibilities

When generating or modifying tests, ensure:

### 1.1 The TDD Cycle (Red-Green-Refactor)

```python
# STEP 1: RED - Write failing test first
import pytest
from datetime import datetime, timedelta

class TestTodoCreation:
    """Test that a todo can be created with required fields."""

    def test_create_todo_with_title(self):
        # Arrange
        title = "Buy groceries"

        # Act
        todo = Todo(title=title)

        # Assert
        assert todo.title == title
        assert todo.id is None  # Not persisted yet
        assert todo.completed is False
        assert todo.created_at is not None

    def test_create_todo_with_title_and_description(self):
        # Arrange
        title = "Buy groceries"
        description = "Milk, eggs, bread"

        # Act
        todo = Todo(title=title, description=description)

        # Assert
        assert todo.title == title
        assert todo.description == description

    def test_create_todo_defaults_priority_to_medium(self):
        # Act
        todo = Todo(title="Test")

        # Assert
        assert todo.priority == 3  # Medium priority

    def test_create_todo_with_custom_priority(self):
        # Act
        todo = Todo(title="Urgent task", priority=5)

        # Assert
        assert todo.priority == 5
```

### 1.2 Pytest Fixtures Architecture

```python
import pytest
from typing import Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient, ASGITransport

# Database fixtures
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    import asyncio
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all, bind=conn)
    yield engine
    await engine.dispose()

@pytest.fixture
async def db_session(test_engine) -> AsyncSession:
    """Provide clean database session for each test."""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        # Start transaction
        yield session
        # Rollback any uncommitted changes
        await session.rollback()

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def auth_token(test_user) -> str:
    """Generate JWT token for test user."""
    return create_access_token({"sub": str(test_user.id)})

@pytest.fixture
async def auth_client(
    test_engine,
    test_user,
    auth_token,
) -> AsyncClient:
    """Provide async HTTP client with authentication."""
    app = create_app()
    app.dependency_overrides[get_current_user] = lambda: test_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

# Factory fixtures
@pytest.fixture
def todo_factory(db_session: AsyncSession):
    """Factory for creating todos in tests."""
    async def _create_todo(
        title: str = "Test Todo",
        description: str = None,
        priority: int = 3,
        completed: bool = False,
        user_id: int = None,
    ) -> Todo:
        todo = Todo(
            title=title,
            description=description,
            priority=priority,
            completed=completed,
            user_id=user_id or (await db_session.execute(select(User.id))).scalar(),
        )
        db_session.add(todo)
        await db_session.commit()
        await db_session.refresh(todo)
        return todo
    return _create_todo
```

### 1.3 Mocking Strategies

```python
from unittest.mock import AsyncMock, Mock, patch, MagicMock
from pytest import raises

# Mocking external services
class TestExternalAPI:
    @pytest.fixture
    def mock_openai_client(self):
        """Mock OpenAI client for testing."""
        with patch("app.services.llm.OpenAI") as mock:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.choices = [MagicMock(message=MagicMock(content="Test response"))]
            mock_client.chat.completions.create.return_value = mock_response
            mock.return_value = mock_client
            return mock_client

    @pytest.mark.asyncio
    async def test_generate_response(self, mock_openai_client):
        # Arrange
        service = LLMService()

        # Act
        response = await service.generate("Hello")

        # Assert
        assert response == "Test response"
        mock_openai_client.chat.completions.create.assert_called_once()

# Mocking database operations
class TestUserRepository:
    async def test_get_user_by_id(self, db_session, test_user):
        # Arrange
        repo = UserRepository(db_session)

        # Act
        user = await repo.get_by_id(test_user.id)

        # Assert
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    async def test_get_user_by_email_not_found(self, db_session):
        # Arrange
        repo = UserRepository(db_session)

        # Act
        user = await repo.get_by_email("nonexistent@example.com")

        # Assert
        assert user is None

# Mocking time-dependent tests
from freezegun import freeze_time

class TestTimeSensitiveOperations:
    @freeze_time("2024-01-15 12:00:00")
    def test_task_due_date_calculation(self):
        # Act
        task = Task(due_days=7)
        expected_date = datetime(2024, 1, 22, 12, 0, 0)

        # Assert
        assert task.due_date == expected_date
```

### 1.4 Parameterized Testing

```python
import pytest
from hypothesis import given, strategies as st

# Parameterized tests for boundary conditions
class TestTodoValidation:
    @pytest.mark.parametrize("title,is_valid", [
        ("", False),
        ("a", False),
        ("ab", False),
        ("abc", True),
        ("x" * 200, True),
        ("x" * 201, False),
        ("Valid Title", True),
        ("Title with numbers 123", True),
        ("Title with special chars!@#", True),
    ])
    def test_title_length_validation(self, title: str, is_valid: bool):
        # Act & Assert
        if is_valid:
            todo = Todo(title=title)
            assert todo.title == title
        else:
            with raises(ValidationError):
                Todo(title=title)

    @pytest.mark.parametrize("priority,expected_priority", [
        (1, 1),
        (3, 3),
        (5, 5),
    ])
    def test_priority_values(self, priority: int, expected_priority: int):
        # Act
        todo = Todo(title="Test", priority=priority)

        # Assert
        assert todo.priority == expected_priority

# Property-based testing with Hypothesis
@given(
    title=st.text(min_size=1, max_size=200),
    priority=st.integers(min_value=1, max_value=5),
    completed=st.booleans(),
)
def test_todo_properties(title: str, priority: int, completed: bool):
    """Property-based test for Todo creation."""
    # Act
    todo = Todo(title=title, priority=priority, completed=completed)

    # Assert
    assert todo.title == title
    assert todo.priority == priority
    assert todo.completed == completed
    assert todo.created_at is not None
```

### 1.5 Test Coverage & Analysis

```python
# pytest.ini configuration
# [pytest]
# testpaths = tests
# python_files = test_*.py
# python_classes = Test*
# python_functions = test_*
# addopts =
#     -v
#     --tb=short
#     --cov=app
#     --cov-report=term-missing
#     --cov-report=html
#     --cov-fail-under=80
# asyncio_mode = auto
# filterwarnings =
#     ignore::DeprecationWarning
#     ignore::pytest.PytestUnraisableExceptionWarning

# conftest.py - coverage configuration
import pytest

def pytest_configure(config):
    """Configure pytest coverage plugin."""
    config.option.cov = True
    config.option.cov_fail_under = 80
    config.option.cov_report = {
        "term": "term-missing",
        "html": "html",
    }
```

### 1.6 Integration Testing Patterns

```python
class TestAPIIntegration:
    """End-to-end API integration tests."""

    @pytest.mark.asyncio
    async def test_full_todo_workflow(self, auth_client: AsyncClient):
        # 1. Create todo
        create_response = await auth_client.post(
            "/api/v1/todos/",
            json={"title": "Integration test todo", "priority": 4},
        )
        assert create_response.status_code == 201
        todo_id = create_response.json()["id"]

        # 2. List todos
        list_response = await auth_client.get("/api/v1/todos/")
        assert list_response.status_code == 200
        todos = list_response.json()
        assert any(t["id"] == todo_id for t in todos)

        # 3. Update todo
        update_response = await auth_client.patch(
            f"/api/v1/todos/{todo_id}",
            json={"title": "Updated todo", "completed": True},
        )
        assert update_response.status_code == 200
        assert update_response.json()["completed"] is True

        # 4. Delete todo
        delete_response = await auth_client.delete(f"/api/v1/todos/{todo_id}")
        assert delete_response.status_code == 204

        # 5. Verify deletion
        get_response = await auth_client.get(f"/api/v1/todos/{todo_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_concurrent_todo_creation(self, db_session):
        """Test handling of concurrent todo creation."""
        import asyncio

        user_id = (await db_session.execute(select(User.id))).scalar()

        async def create_todo(i: int) -> Todo:
            async with async_session() as session:
                todo = Todo(title=f"Concurrent todo {i}", user_id=user_id)
                session.add(todo)
                await session.commit()
                await session.refresh(todo)
                return todo

        # Create 10 todos concurrently
        tasks = [create_todo(i) for i in range(10)]
        todos = await asyncio.gather(*tasks)

        # Verify all were created
        assert len(todos) == 10
        assert len({todo.id for todo in todos}) == 10  # Unique IDs
```

### 1.7 Error Handling Tests

```python
class TestErrorHandling:
    """Test error scenarios and edge cases."""

    @pytest.mark.asyncio
    async def test_auth_required(self, client: AsyncClient):
        """Test that protected endpoints require authentication."""
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_invalid_token(self, client: AsyncClient):
        """Test that invalid tokens are rejected."""
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_expired_token(self, client: AsyncClient):
        """Test that expired tokens are rejected."""
        expired_token = create_expired_token({"sub": "1"})
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_rate_limiting(self, client: AsyncClient):
        """Test rate limiting behavior."""
        # Make many requests quickly
        responses = []
        for _ in range(101):
            response = await client.get("/api/v1/public/data")
            responses.append(response.status_code)

        # Last request should be rate limited
        assert 429 in responses

    def test_validation_errors(self):
        """Test Pydantic validation errors."""
        with raises(ValidationError) as exc_info:
            Todo(title="", priority=6)  # Invalid: empty title, priority > 5

        errors = exc_info.value.errors()
        assert len(errors) == 2

        error_fields = {e["loc"][0] for e in errors}
        assert error_fields == {"title", "priority"}
```

### 1.8 Test Organization Patterns

```
tests/
├── conftest.py                    # Shared fixtures
├── unit/
│   ├── test_models.py            # Model tests
│   ├── test_schemas.py           # Pydantic schema tests
│   └── test_services.py          # Service unit tests
├── integration/
│   ├── test_api/
│   │   ├── test_auth.py
│   │   ├── test_todos.py
│   │   └── test_users.py
│   └── test_database.py          # Database integration
├── e2e/
│   └── test_workflows.py         # End-to-end workflows
├── fixtures/
│   ├── users.json                # Test data
│   └── todos.json
└── utils/
    └── helpers.py                # Test utilities
```

### 1.9 CI/CD Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install -e ".[test]"

      - name: Run linter
        run: ruff check .

      - name: Run type checker
        run: mypy .

      - name: Run tests
        run: pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
```

---

## When to Use This Skill

- Writing unit tests for Python/TypeScript code
- Setting up pytest with fixtures and parametrization
- Creating integration tests for APIs
- Implementing property-based testing with Hypothesis
- Configuring CI/CD testing pipelines
- Analyzing test coverage
- Mocking external dependencies
- Testing async code patterns

---

## Anti-Patterns to Avoid

**Never:**
- Write tests after implementation (violates TDD)
- Test implementation details instead of behavior
- Use `time.sleep()` for async tests
- Make tests order-dependent
- Skip edge case testing
- Use `print()` for assertions
- Mock too much (test the real thing when possible)
- Leave tests in broken state

**Always:**
- Follow Red-Green-Refactor cycle
- Use descriptive test names (test_*)
- Follow AAA pattern (Arrange-Act-Assert)
- Use fixtures for setup/teardown
- Parameterize for boundary conditions
- Mock external services, not your own code
- Aim for 80%+ coverage on critical paths
- Keep tests fast (< 100ms for unit tests)

---

## Tools Used

- **Read/Grep:** Examine test files, find patterns
- **Write/Edit:** Create test files, fixtures
- **Bash:** Run pytest, coverage reports
- **Context7 MCP:** Semantic search in pytest documentation

---

## Verification Process

1. **Coverage Check:** `pytest --cov --cov-fail-under=80`
2. **Linting:** `ruff check tests/`
3. **Type Check:** `mypy tests/`
4. **Parallel Run:** `pytest -n auto` for speed
5. **Mutation Testing:** `pytest-mutate` for test quality
