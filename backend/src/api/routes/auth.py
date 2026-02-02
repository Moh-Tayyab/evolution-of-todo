# @spec: specs/002-fullstack-web-app/spec.md
# @spec: specs/002-fullstack-web-app/plan.md
# Authentication routes - signup, login, get current user

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.database import get_session
from src.models.user import User
from src.security import create_access_token, get_password_hash, verify_password
from src.api.deps import get_current_user_id
from src.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.get("/test")
async def test_endpoint():
    """Test endpoint without database"""
    return {"message": "Auth router is working", "status": "ok"}


@router.post("/signup")
async def signup(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    """Register a new user and return JWT token."""
    # Check if email exists
    statement = select(User).where(User.email == user_in.email)
    result = await session.execute(statement)
    existing_user = result.first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_pwd = get_password_hash(user_in.password)

    user_data = User(
        email=user_in.email,
        name=user_in.full_name,
        hashed_password=hashed_pwd,
        is_active=True
    )

    session.add(user_data)
    await session.commit()
    await session.refresh(user_data)

    # Generate JWT token for the new user
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user_data.id)}, expires_delta=access_token_expires
    )

    return {
        "id": str(user_data.id),
        "email": user_data.email,
        "name": user_data.name,
        "email_verified": user_data.email_verified,
        "is_active": user_data.is_active,
        "created_at": user_data.created_at.isoformat(),
        "updated_at": user_data.updated_at.isoformat(),
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: AsyncSession = Depends(get_session)
):
    """Login with email/password and return JWT token."""
    statement = select(User).where(User.email == form_data.username)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
async def read_users_me(
    current_user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get current user profile."""
    statement = select(User).where(User.id == current_user_id)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
