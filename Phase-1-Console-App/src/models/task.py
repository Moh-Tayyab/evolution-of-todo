from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional
from src.models.priority import Priority
from src.models.recurrence import Recurrence

@dataclass
class Task:
    """
    Represents a todo task with organizational and scheduling attributes.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 1-5: Task management with priorities, tags, and recurrence
    """
    id: int
    title: str
    description: str = ""
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    priority: Optional[Priority] = None
    tags: list[str] = field(default_factory=list)
    due_date: Optional[date] = None
    recurrence: Optional[Recurrence] = None
    recurrence_interval: Optional[int] = None

    def __post_init__(self):
        """Validate task data after initialization."""
        if not self.title or not self.title.strip():
            raise ValueError("Task title cannot be empty")
        if self.id <= 0:
            raise ValueError("Task ID must be positive")
        if self.recurrence == Recurrence.CUSTOM and not self.recurrence_interval:
            raise ValueError("Custom recurrence requires interval")
