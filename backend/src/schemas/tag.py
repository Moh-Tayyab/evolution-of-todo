# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/plan.md
# Pydantic schemas for Tag API requests and responses

from typing import List
from uuid import UUID
from sqlmodel import SQLModel


class TagCreate(SQLModel):
    """Schema for creating a tag"""
    name: str = Field(max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)


class TagUpdate(SQLModel):
    """Schema for updating a tag"""
    name: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)


class TagRead(SQLModel):
    """Schema for reading a tag"""
    id: UUID
    user_id: UUID
    name: str
    color: Optional[str]
    created_at: str


class TagReadWithCount(TagRead):
    """Tag with task count"""
    task_count: int = 0
