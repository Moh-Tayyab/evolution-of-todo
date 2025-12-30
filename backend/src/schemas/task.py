# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/plan.md
# Pydantic schemas for Task API requests and responses

from typing import Optional, List
from uuid import UUID
from sqlmodel import SQLModel
from .tag import TagRead
from ..models.task import TaskBase, Priority


class TaskCreate(SQLModel):
    """Schema for creating a task"""
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Priority = Field(default=Priority.MEDIUM)
    tag_ids: Optional[List[UUID]] = None


class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Optional[Priority] = None
    completed: Optional[bool] = None
    tag_ids: Optional[List[UUID]] = None


class TaskRead(TaskBase):
    """Schema for reading a task"""
    id: UUID
    user_id: UUID
    completed: bool
    tags: List[TagRead] = []
    created_at: str
    updated_at: str


class TaskReadWithTags(TaskRead):
    """Task schema with full tag information"""
    pass
