# @spec: specs/002-fullstack-web-app/plan.md
# Pydantic schemas for User authentication

from uuid import UUID
from sqlmodel import SQLModel, Field
from datetime import datetime


class UserBase(SQLModel):
    """Base user schema with common fields"""
    email: str = Field(index=True, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)  # API input field


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(min_length=8, max_length=100)


class UserRead(SQLModel):
    """Schema for reading user data"""
    id: str  # Better Auth uses string IDs
    email: str
    name: str | None  # Better Auth uses 'name' field
    email_verified: bool
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class UserLogin(SQLModel):
    """Schema for user login"""
    email: str
    password: str
