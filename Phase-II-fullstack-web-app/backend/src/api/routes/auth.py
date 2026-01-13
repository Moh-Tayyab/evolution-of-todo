from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

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
    session: Session = Depends(get_session)
):
    """Register a new user."""
    # Check if email exists
    statement = select(User).where(User.email == user_in.email)
    existing_user = session.exec(statement).first()
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
    session.commit()
    session.refresh(user_data)

    return {
        "id": str(user_data.id),
        "email": user_data.email,
        "name": user_data.name,
        "email_verified": user_data.email_verified,
        "is_active": user_data.is_active,
        "created_at": user_data.created_at.isoformat(),
        "updated_at": user_data.updated_at.isoformat(),
    }

@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
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
    session: Session = Depends(get_session)
):
    user = session.get(User, current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
