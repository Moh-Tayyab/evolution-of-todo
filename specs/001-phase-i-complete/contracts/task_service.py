"""
TaskList Service Contract

Defines the interface for task CRUD operations, search, filter, sort, and recurring task management.

@spec: specs/001-phase-i-complete/spec.md
User Stories 1-5: Task management, organization, search/filter, sort, recurring tasks
"""

from typing import Protocol, Optional
from datetime import date
from models.task import Task
from models.priority import Priority

class TaskService(Protocol):
    """Contract for task management operations."""

    def create_task(
        self,
        title: str,
        description: str = "",
        priority: Optional[Priority] = None,
        tags: Optional[list[str]] = None,
        due_date: Optional[date] = None,
        recurrence: Optional[str] = None,
        recurrence_interval: Optional[int] = None
    ) -> Task:
        """
        Create a new task with specified attributes.

        Requirements: FR-001, FR-002, FR-021, FR-024, FR-060
        Returns: Task with auto-generated ID
        Raises: ValueError if title is empty
        """
        ...

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by ID.

        Requirements: FR-003
        Returns: Task if found, None otherwise
        """
        ...

    def get_all_tasks(self) -> list[Task]:
        """
        Retrieve all tasks.

        Requirements: FR-003
        Returns: List of all tasks (may be empty)
        """
        ...

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[Priority] = None,
        tags: Optional[list[str]] = None,
        due_date: Optional[date] = None
    ) -> Task:
        """
        Update task attributes.

        Requirements: FR-008, FR-009, FR-011, FR-021, FR-024
        Returns: Updated task
        Raises: KeyError if task_id not found
        """
        ...

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task permanently.

        Requirements: FR-007, FR-010
        Returns: True if deleted, False if not found
        """
        ...

    def toggle_complete(self, task_id: int) -> Task:
        """
        Toggle task completion status.

        Requirements: FR-005, FR-006
        Returns: Updated task with toggled status
        Raises: KeyError if task_id not found
        """
        ...

    def search_tasks(self, keyword: str) -> list[Task]:
        """
        Search tasks by keyword in title or description (case-insensitive).

        Requirements: FR-030
        Returns: List of matching tasks (may be empty)
        """
        ...

    def filter_tasks(
        self,
        status: Optional[str] = None,  # "complete", "incomplete", "all"
        priority: Optional[Priority] = None,
        date_range: Optional[tuple[date, date]] = None
    ) -> list[Task]:
        """
        Filter tasks by status, priority, and/or date range.

        Requirements: FR-032, FR-033, FR-034
        Returns: List of tasks matching all criteria (AND logic)
        """
        ...

    def sort_tasks(
        self,
        tasks: list[Task],
        sort_by: str  # "due_date", "priority", "title"
    ) -> list[Task]:
        """
        Sort tasks by specified criteria.

        Requirements: FR-040, FR-041, FR-042
        Returns: Sorted list of tasks
        Raises: ValueError if sort_by is invalid
        """
        ...

    def create_recurring_instance(self, task: Task) -> Task:
        """
        Create next instance of a recurring task.

        Requirements: FR-051, FR-052, FR-053
        Returns: New task with updated due date, uncompleted status
        Raises: ValueError if task is not recurring
        """
        ...
