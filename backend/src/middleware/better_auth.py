# @spec: specs/002-fullstack-web-app/plan.md
# Better Auth session verification middleware

from typing import Optional
from fastapi import HTTPException, status, Cookie
from sqlmodel import Session, select
from src.config import get_settings

settings = get_settings()


async def verify_session_token(session_token: str, session: Session) -> str:
    """
    Verify Better Auth session token and return user ID.

    Args:
        session_token: Session token from Better Auth cookie
        session: Database session

    Returns:
        User ID (UUID string)

    Raises:
        HTTPException: If session is invalid or expired
    """
    # Import here to avoid circular imports
    from src.database import get_engine

    # Query the session table (created by Better Auth)
    # Note: The table name is "session" (lowercase) as created by Better Auth
    engine = get_engine()

    # Import the Better Auth session schema
    # We need to query the session table that Better Auth creates
    from src.models.user import User

    # Query session by token
    query = """
        SELECT user_id, expires_at
        FROM "session"
        WHERE token = $1 AND expires_at > NOW()
    """

    result = await session.execute(query, (session_token,))
    session_data = result.first()

    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user_id from the tuple
    user_id = session_data[0]

    return str(user_id)


def extract_session_token(cookies: dict) -> Optional[str]:
    """
    Extract Better Auth session token from cookies.

    Args:
        cookies: Request cookies dictionary

    Returns:
        Session token string or None
    """
    # Better Auth stores session token in a cookie named "todo_app_session_token"
    # The cookie prefix is configured in auth-server.ts
    session_cookie = cookies.get("todo_app_session_token")

    if not session_cookie:
        # Try without prefix
        session_cookie = cookies.get("better-auth.session_token")

    return session_cookie
