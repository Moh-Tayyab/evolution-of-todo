# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/data-model.md
# Database connection module for SQLModel

from sqlmodel import create_engine, Session
from .config import get_settings

# Create async engine
settings = get_settings()
engine = create_engine(settings.database_url, echo=True)


def get_session():
    """Get database session dependency for FastAPI routes."""
    with Session(engine) as session:
        yield session
