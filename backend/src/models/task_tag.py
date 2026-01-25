from uuid import UUID
from sqlmodel import SQLModel, Field
from typing import Optional

class TaskTag(SQLModel, table=True):
    """Junction table for Task-Tag relationship"""
    __tablename__ = "task_tags"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True, ondelete="CASCADE")
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True, ondelete="CASCADE")
