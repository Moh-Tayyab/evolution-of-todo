"""
TodoManager service class for CRUD operations and state management.

@spec FR-004: System MUST store tasks in memory with persistence lasting
only for the current session.
@spec research.md: In-memory storage using List[Task] with sequential ID counter.
"""

from datetime import datetime
from typing import List, Optional
from ..models.task import Task


class TodoManager:
    """
    Manages task storage and CRUD operations using in-memory list.

    Attributes:
        _tasks: List[Task] storing all tasks
        _next_id: Integer counter for auto-incrementing task IDs

    @spec FR-003: System MUST assign unique integer ID to each task automatically
    @spec FR-004: Storage is in-memory only, lost on application restart
    """

    def __init__(self):
        """Initialize empty task list and ID counter starting at 1."""
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Create and add a new task with auto-incremented ID.

        Args:
            title: Required non-empty string describing the task
            description: Optional string with additional task details

        Returns:
            The newly created Task object

        Raises:
            ValueError: If title is empty

        @spec FR-002: Title is required and non-empty
        @spec FR-003: ID is auto-generated and sequential
        """
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")

        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description.strip() if description else "",
            completed=False,
            created_at=datetime.now()
        )
        self._tasks.append(task)
        self._next_id += 1
        return task

    def view_tasks(self) -> List[Task]:
        """
        Retrieve all tasks.

        Returns:
            List of all Task objects in storage order

        @spec FR-005: System MUST display all tasks with format [ID] [Status] Title
        """
        return self._tasks.copy()

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Find a task by its ID.

        Args:
            task_id: Integer ID to search for

        Returns:
            Task if found, None otherwise
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(self, task_id: int, new_title: Optional[str] = None,
                  new_description: Optional[str] = None) -> Task:
        """
        Update task title and/or description by ID.

        Args:
            task_id: Integer ID of task to update
            new_title: New title (optional, keeps current if None)
            new_description: New description (optional, keeps current if None)

        Returns:
            The updated Task object

        Raises:
            ValueError: If task ID not found or new_title is empty

        @spec FR-006: System MUST allow users to update title and/or description
        @spec FR-009: Display error for non-existent task IDs
        """
        task = self.get_task_by_id(task_id)
        if not task:
            raise ValueError(f"Task ID {task_id} not found")

        # Validate new title if provided
        if new_title is not None:
            if not new_title or not new_title.strip():
                raise ValueError("Title cannot be empty")
            task.title = new_title.strip()

        # Update description if provided
        if new_description is not None:
            task.description = new_description.strip() if new_description else ""

        return task

    def delete_task(self, task_id: int) -> None:
        """
        Remove a task by ID.

        Args:
            task_id: Integer ID of task to delete

        Raises:
            ValueError: If task ID not found

        @spec FR-007: System MUST allow users to delete a task by ID
        @spec FR-009: Display error for non-existent task IDs
        """
        task = self.get_task_by_id(task_id)
        if not task:
            raise ValueError(f"Task ID {task_id} not found")

        self._tasks.remove(task)

    def toggle_complete(self, task_id: int) -> Task:
        """
        Toggle the completion status of a task.

        Args:
            task_id: Integer ID of task to toggle

        Returns:
            The updated Task object

        Raises:
            ValueError: If task ID not found

        @spec FR-008: System MUST allow users to toggle completion status
        @spec FR-009: Display error for non-existent task IDs
        """
        task = self.get_task_by_id(task_id)
        if not task:
            raise ValueError(f"Task ID {task_id} not found")

        task.completed = not task.completed
        return task
