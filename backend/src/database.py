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
        connect_args=connect_args if connect_args else None,
        # Connection pool configuration for Neon serverless
        # pool_pre_ping verifies connection health before using it
        # pool_recycle recycles connections before Neon's 5-minute timeout
        pool_size=2,  # Small pool for serverless
        max_overflow=2,  # Allow some overflow
        pool_recycle=240,  # 4 minutes (Neon timeout is 5 min)
        pool_pre_ping=True,  # Verify connection before use
        pool_timeout=30,  # Wait 30s for connection
    )

elif database_url.startswith("sqlite://"):
    database_url = database_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    engine = create_async_engine(database_url, echo=False)

else:
    # Fallback for other database URLs
    engine = create_async_engine(database_url, echo=False)


async def get_session() -> AsyncSession:
    """Get async database session dependency for FastAPI routes.

    Includes retry logic for Neon serverless auto-suspend and connection errors.
    """
    import asyncio
    from sqlalchemy import exc, text
    import logging

    logger = logging.getLogger(__name__)
    max_retries = 5
    base_delay = 0.5  # seconds

    for attempt in range(max_retries):
        try:
            async with AsyncSession(engine) as session:
                # Test connection with a simple query
                try:
                    # Quick connection health check
                    await session.execute(text("SELECT 1"))
                except Exception as conn_error:
                    if attempt < max_retries - 1:
                        logger.warning(f"Connection health check failed (attempt {attempt + 1}/{max_retries}): {conn_error}")
                        await asyncio.sleep(base_delay * (attempt + 1))  # Exponential backoff
                        continue
                    raise

                yield session
                return

        except exc.InterfaceError as e:
            if attempt < max_retries - 1:
                logger.warning(f"Database connection error (attempt {attempt + 1}/{max_retries}): {e}")
                await asyncio.sleep(base_delay * (attempt + 1))
                continue
            logger.error(f"Database connection failed after {max_retries} attempts: {e}")
            raise

        except exc.OperationalError as e:
            if "connection" in str(e).lower() and attempt < max_retries - 1:
                logger.warning(f"Database operational error (attempt {attempt + 1}/{max_retries}): {e}")
                await asyncio.sleep(base_delay * (attempt + 1))
                continue
            raise

        except Exception as e:
            logger.error(f"Unexpected database error: {e}")
            raise
