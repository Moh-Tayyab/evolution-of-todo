# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/003-ai-chatbot/data-model.md
# Database connection module for SQLModel

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel
from urllib.parse import urlparse, urlunparse
from .config import get_settings

# Create async engine
settings = get_settings()

# Convert database URL to async format if needed
database_url = settings.database_url
if database_url.startswith("postgresql://"):
    # Parse the URL to handle query parameters
    parsed = urlparse(database_url)

    # Convert to asyncpg driver
    # Note: Remove query parameters for asyncpg and handle SSL separately
    database_url = f"postgresql+asyncpg://{parsed.netloc}{parsed.path}"

    # Set SSL context for the connection
    connect_args = {}
    if 'sslmode=require' in parsed.query or 'sslmode=verify-ca' in parsed.query or 'sslmode=verify-full' in parsed.query:
        connect_args['ssl'] = True
    elif 'sslmode=disable' in parsed.query:
        connect_args['ssl'] = False
    elif 'sslmode=prefer' in parsed.query or 'sslmode=allow' in parsed.query:
        connect_args['ssl'] = 'prefer'

    engine = create_async_engine(
        database_url,
        echo=False,
        connect_args=connect_args if connect_args else None
    )

elif database_url.startswith("sqlite://"):
    database_url = database_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    engine = create_async_engine(database_url, echo=False)

else:
    # Fallback for other database URLs
    engine = create_async_engine(database_url, echo=False)


async def get_session() -> AsyncSession:
    """Get async database session dependency for FastAPI routes."""
    async with AsyncSession(engine) as session:
        yield session
