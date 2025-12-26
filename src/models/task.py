"""
Task dataclass model representing a single todo item.

@spec FR-002: System MUST allow users to create tasks with required title (non-empty)
and optional description.
@spec data-model.md: Task entity with id, title, description, completed, created_at
"""


from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """
    Represents a single todo item.

    Attributes:
        id: Unique integer identifier (auto-generated, starting from 1)
        title: Required non-empty string describing the task
        description: Optional string providing additional task details (can be empty)
        completed: Boolean indicating completion status (incomplete by default)
        created_at: Timestamp for tracking and ordering

    @spec FR-002: Title is required and cannot be empty
    @spec FR-008: System MUST allow users to toggle completion status
    """

    id: int
    title: str
    description: str
    completed: bool = False
    created_at: datetime = None

    def __post_init__(self):
        """Validate task data after initialization."""
        if self.created_at is None:
            self.created_at = datetime.now()

        # @spec FR-009: Title cannot be empty
        if not self.title or not self.title.strip():
            raise ValueError("Title cannot be empty")

        # Trim whitespace from title and description
        self.title = self.title.strip()
        self.description = self.description.strip() if self.description else ""
