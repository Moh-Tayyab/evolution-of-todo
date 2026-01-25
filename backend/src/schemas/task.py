# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/plan.md
# Pydantic schemas for Task API requests and responses

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import field_serializer
from sqlmodel import SQLModel, Field
from .tag import TagRead
from src.models.task import TaskBase, Priority


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


class TaskRead(SQLModel):
    """Schema for reading a task"""
    id: int
    user_id: UUID
    title: str
    description: Optional[str] = None
    priority: Priority
    completed: bool
    tags: List[TagRead] = []
    created_at: datetime
    updated_at: datetime

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime) -> str:
        return dt.isoformat()


class TaskReadWithTags(TaskRead):
    """Task schema with full tag information"""
    pass
