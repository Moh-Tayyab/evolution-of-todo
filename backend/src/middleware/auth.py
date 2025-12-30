# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/spec.md
# JWT verification middleware

from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from src.config import get_settings

settings = get_settings()


def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token and return decoded payload.

    Args:
        token: JWT token string

    Returns:
        Decoded JWT payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"],
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
