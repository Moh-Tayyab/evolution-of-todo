# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/003-ai-chatbot/spec.md
# Pytest fixtures for backend tests - including AI chatbot fixtures

from uuid import UUID, uuid4
import pytest
from sqlmodel import Session, SQLModel, select
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from unittest.mock import Mock, AsyncMock
from typing import Optional
import asyncio

# Import from src package
try:
    from src.main import app
    from src.models.task import Task, Priority
    from src.models.tag import Tag
    from src.models.user import User
    from src.models.conversation import Conversation
    from src.models.message import Message, MessageRole
    from src.schemas.task import TaskCreate
    from src.schemas.tag import TagCreate
    from src.security import get_password_hash, create_access_token
except ImportError:
    # Fallback for different import paths
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from src.main import app
    from src.models.task import Task, Priority
    from src.models.tag import Tag
    from src.models.user import User
    from src.models.conversation import Conversation
    from src.models.message import Message, MessageRole
    from src.schemas.task import TaskCreate
    from src.schemas.tag import TagCreate
    from src.security import get_password_hash, create_access_token

# Test database (SQLite for tests)
TEST_DATABASE_URL = "sqlite:///test.db"
test_engine = create_engine(TEST_DATABASE_URL, echo=False)

# Async test database
TEST_DATABASE_URL_ASYNC = "sqlite+aiosqlite:///test_async.db"
test_engine_async = create_async_engine(TEST_DATABASE_URL_ASYNC, echo=False)


@pytest.fixture
def session():
    """Get test database session."""
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
        session.rollback()
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture
def client():
    """Get FastAPI test client for sync routes."""
    return TestClient(app)


@pytest.fixture
async def async_session():
    """Get async test database session."""
    async with test_engine_async.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with AsyncSession(test_engine_async) as session:
        yield session
        await session.rollback()
    async with test_engine_async.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture
def async_client(async_session: AsyncSession):
    """Get FastAPI test client with async session override."""
    from src.api.deps import get_session
    from src.database import get_session as _get_session

    # Override the get_session dependency to use our test async_session
    async def _get_test_session():
        yield async_session

    app.dependency_overrides[get_session] = _get_test_session

    yield TestClient(app)

    # Clean up override
    app.dependency_overrides = {}


@pytest.fixture
def test_user_id():
    """Get a test user ID as UUID string."""
    return str(uuid4())


@pytest.fixture
def test_user_id_uuid():
    """Get a test user ID as UUID object."""
    return uuid4()


@pytest.fixture
def sample_task(test_user_id):
    """Create a sample task with string user_id."""
    task = Task(
        id=1,  # Integer ID
        user_id=UUID(test_user_id),  # Convert to UUID for database
        title="Test Task",
        description="Test Description",
        priority=Priority.MEDIUM,
    )
    return task


@pytest.fixture
def sample_tag(test_user_id):
    """Create a sample tag with string user_id."""
    tag = Tag(
        id=uuid4(),
        user_id=UUID(test_user_id),  # Convert to UUID for database
        name="Work",
        color="#FF0000",
    )
    return tag


@pytest.fixture
def auth_headers(client: TestClient):
    """Get authenticated headers for test requests."""
    # Create a test user and get token
    from src.security import create_access_token

    test_id = str(uuid4())
    token = create_access_token(data={"sub": test_id})

    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def authenticated_user_id():
    """Get an authenticated user ID."""
    return str(uuid4())


# ============================================================================
# Async fixtures for AI chatbot tests
# ============================================================================

@pytest.fixture
def test_user_uuid() -> UUID:
    """Get a test user UUID object."""
    return uuid4()


@pytest.fixture
def test_user_id_str() -> str:
    """Get a test user ID as string."""
    return str(uuid4())


@pytest.fixture
async def sample_conversation(async_session: AsyncSession, test_user_uuid: UUID) -> Conversation:
    """Create a sample conversation for testing."""
    conversation = Conversation(
        user_id=test_user_uuid,
        title="Test Conversation"
    )
    async_session.add(conversation)
    await async_session.commit()
    await async_session.refresh(conversation)
    return conversation


@pytest.fixture
async def sample_task_with_conversation(async_session: AsyncSession, test_user_uuid: UUID) -> Task:
    """Create a sample task with user."""
    task = Task(
        user_id=test_user_uuid,
        title="Test Task",
        description="Test Description",
        priority=Priority.MEDIUM,
        completed=False
    )
    async_session.add(task)
    await async_session.commit()
    await async_session.refresh(task)
    return task


# ============================================================================
# Mock fixtures for OpenAI API
# ============================================================================

class MockChatResult:
    """Mock agent result for testing."""
    def __init__(self, response_text: str = "Test response", tool_calls: list = None):
        self.final_output = response_text
        self.events = []
        self.tool_calls_data = tool_calls or []


class MockAgentOrchestrator:
    """Mock agent orchestrator for testing without OpenAI API."""
    def __init__(self, response_text: str = "Test response", tool_calls: list = None):
        self.response_text = response_text
        self.tool_calls_data = tool_calls or []
        self.mock_result = MockChatResult(response_text, tool_calls)

    async def process_message(self, user_message, conversation_history, user_id, session):
        """Mock process message that returns a mock result."""
        return self.mock_result

    def get_response_text(self, result):
        """Return the mock response text."""
        return result.final_output

    def get_tool_calls(self, result):
        """Return mock tool calls if any."""
        return self.tool_calls_data


@pytest.fixture
def mock_agent_orchestrator():
    """Get a mock agent orchestrator for testing."""
    return MockAgentOrchestrator("I can help with that!")


@pytest.fixture
def mock_agent_with_tool_calls():
    """Get a mock agent orchestrator with tool calls."""
    return MockAgentOrchestrator(
        response_text="I've added the task to your list.",
        tool_calls=[{
            "tool": "add_task",
            "parameters": {"title": "Test task"}
        }]
    )


@pytest.fixture
def auth_headers_dict(test_user_id_str: str) -> dict:
    """Get authenticated headers for test requests."""
    token = create_access_token(data={"sub": test_user_id_str})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_openai_api_response():
    """Mock OpenAI API response for testing agent logic."""
    mock_response = Mock()
    mock_response.final_output = "I've added 'Buy milk' to your tasks."
    mock_response.events = []
    return mock_response


# ============================================================================
# Parameterized test fixtures
# ============================================================================

@pytest.fixture
def various_task_titles():
    """Provide various task titles for parameterized testing."""
    return [
        "Simple task",
        "Task with numbers 123",
        "Task with special chars !@#",
        "A" * 200,  # Max length
        "Multi\nline\ntask",  # With newline
        "Task with emojis 🎉",
    ]


@pytest.fixture
def invalid_task_titles():
    """Provide invalid task titles for negative testing."""
    return [
        "",  # Empty
        "   ",  # Whitespace only
        "A" * 201,  # Too long
    ]


@pytest.fixture
def natural_language_commands():
    """Provide various natural language commands for testing."""
    return {
        "add": [
            "Add buy milk",
            "Create task Pay bills",
            "New task: Call mom",
            "I need to buy groceries",
            "Remind me to walk the dog",
        ],
        "view": [
            "Show my tasks",
            "What's pending?",
            "List all tasks",
            "What do I need to do?",
            "Display my todo list",
        ],
        "update": [
            "Change task 1 to buy groceries",
            "Update task 2 title to Pay bills",
            "Modify task 3",
            "Edit task 1 description",
        ],
        "delete": [
            "Delete task 1",
            "Remove task 2",
            "Get rid of task 3",
            "Delete the meeting task",
        ],
        "complete": [
            "Mark task 1 as done",
            "Complete task 2",
            "I finished task 3",
            "Mark task 1 as complete",
            "Task 2 is finished",
        ],
    }


# ============================================================================
# Test data factories
# ============================================================================

@pytest.fixture
def task_factory(async_session: AsyncSession):
    """Factory for creating tasks in tests."""
    async def _create_task(user_id: UUID, title: str, description: str = None, completed: bool = False) -> Task:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=Priority.MEDIUM,
            completed=completed
        )
        async_session.add(task)
        await async_session.commit()
        await async_session.refresh(task)
        return task
    return _create_task


@pytest.fixture
def conversation_factory(async_session: AsyncSession):
    """Factory for creating conversations in tests."""
    async def _create_conversation(user_id: UUID, title: str = "New Chat") -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        async_session.add(conversation)
        await async_session.commit()
        await async_session.refresh(conversation)
        return conversation
    return _create_conversation


@pytest.fixture
def message_factory(async_session: AsyncSession):
    """Factory for creating messages in tests."""
    async def _create_message(conversation_id: UUID, role: MessageRole, content: str) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        async_session.add(message)
        await async_session.commit()
        await async_session.refresh(message)
        return message
    return _create_message


# ============================================================================
# pytest configuration
# ============================================================================

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "unit: Unit tests"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests"
    )
    config.addinivalue_line(
        "markers", "contract: Contract tests"
    )
    config.addinivalue_line(
        "markers", "e2e: End-to-end tests"
    )
    config.addinivalue_line(
        "markers", "slow: Slow-running tests"
    )
    config.addinivalue_line(
        "markers", "ai: Tests requiring OpenAI API or mocks"
    )
