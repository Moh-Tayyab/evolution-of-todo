# @spec: specs/002-fullstack-web-app/plan.md
# Pytest fixtures for backend tests

from uuid import uuid4
import pytest
from sqlmodel import Session, SQLModel
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

# Import from src package
from src.main import app
from src.models.task import Task, Priority
from src.models.tag import Tag
from src.schemas.task import TaskCreate
from src.schemas.tag import TagCreate

# Test database (SQLite for tests)
TEST_DATABASE_URL = "sqlite:///test.db"
test_engine = create_engine(TEST_DATABASE_URL, echo=False)


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
    """Get FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def test_user_id():
    """Get a test user ID."""
    return str(uuid4())


@pytest.fixture
def sample_task(test_user_id):
    """Create a sample task."""
    task = Task(
        id=uuid4(),
        user_id=test_user_id,
        title="Test Task",
        description="Test Description",
        priority=Priority.MEDIUM,
    )
    return task


@pytest.fixture
def sample_tag(test_user_id):
    """Create a sample tag."""
    tag = Tag(
        id=uuid4(),
        user_id=test_user_id,
        name="Work",
        color="#FF0000",
    )
    return tag
