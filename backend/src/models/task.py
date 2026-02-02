# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/plan.md
# Task SQLModel entity with relationships

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, Integer
from sqlalchemy import Sequence


class Priority(str, Enum):
    """Task priority levels"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


from .task_tag import TaskTag


class TaskBase(SQLModel):
    """Base fields shared by create/update schemas"""
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Priority = Field(default=Priority.MEDIUM)


class Task(TaskBase, table=True):
    """Database model for tasks table"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(index=True, nullable=False)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model=TaskTag)
