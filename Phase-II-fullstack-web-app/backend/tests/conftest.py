# @spec: specs/002-fullstack-web-app/plan.md
# Pytest fixtures for backend tests

from uuid import UUID, uuid4
import pytest
from sqlmodel import Session, SQLModel
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

# Import from src package
try:
    from src.main import app
    from src.models.task import Task, Priority
    from src.models.tag import Tag
    from src.models.user import User
    from src.schemas.task import TaskCreate
    from src.schemas.tag import TagCreate
    from src.security import get_password_hash
except ImportError:
    # Fallback for different import paths
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from src.main import app
    from src.models.task import Task, Priority
    from src.models.tag import Tag
    from src.models.user import User
    from src.schemas.task import TaskCreate
    from src.schemas.tag import TagCreate
    from src.security import get_password_hash

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

