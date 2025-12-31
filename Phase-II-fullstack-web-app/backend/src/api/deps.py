# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/spec.md
# API dependencies (JWT verification)

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from ..database import get_session
from ..middleware.auth import verify_jwt_token

security = HTTPBearer()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Session = Depends(get_session),
) -> str:
    """
    Get current user ID from JWT token.

    Args:
        credentials: HTTP Bearer credentials
        session: Database session

    Returns:
        User ID (UUID string)

    Raises:
        HTTPException: If token is invalid or missing
    """
    if credentials.credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_jwt_token(credentials.credentials)
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
