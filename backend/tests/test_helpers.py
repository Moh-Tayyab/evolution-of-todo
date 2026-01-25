# @spec: specs/002-fullstack-web-app/plan.md
# Test helper utilities

from uuid import UUID, uuid4
from sqlmodel import Session
from src.models.user import User
from src.models.task import Task, Priority
from src.models.tag import Tag
from src.security import get_password_hash, create_access_token


def create_test_user(session: Session, email: str = None) -> User:
    """Create a test user in the database."""
    user_id = uuid4()
    user = User(
        id=user_id,
        email=email or f"test_{user_id}@test.com",
        name="Test User",
        hashed_password=get_password_hash("test123"),
        is_active=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def create_test_task(session: Session, user_id: str = None, title: str = "Test Task") -> Task:
    """Create a test task in the database."""
    # Convert string to UUID if needed
    user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id if user_id else uuid4()

    task = Task(
        id=1,  # Integer ID
        user_id=user_uuid,
        title=title,
        description="Test Description",
        priority=Priority.MEDIUM,
        completed=False
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_test_token(user_id: str = None) -> str:
    """Get a JWT token for testing."""
    test_id = user_id or str(uuid4())
    return create_access_token(data={"sub": test_id})


def get_auth_headers(user_id: str = None) -> dict:
    """Get auth headers for testing."""
    token = get_test_token(user_id)
    return {"Authorization": f"Bearer {token}"}
