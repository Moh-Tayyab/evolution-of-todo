# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/plan.md
# Tag SQLModel entity with relationships

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .task import Task


class TagBase(SQLModel):
    """Base fields for Tag"""
    name: str = Field(max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)  # #RRGGBB


from .task_tag import TaskTag

class Tag(TagBase, table=True):
    """Database model for tags table"""
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTag)
