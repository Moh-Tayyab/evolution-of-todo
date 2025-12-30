from typing import List, Optional, Union
from datetime import datetime, date
from src.models.task import Task
from src.models.priority import Priority
from src.models.recurrence import Recurrence

class _NoValue:
    pass

NO_VALUE = _NoValue()

class TaskList:
    def __init__(self):
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def create_task(self, title: str, description: str = "", priority: Optional[Priority] = None, 
                   tags: Optional[List[str]] = None, due_date: Optional[date] = None,
                   recurrence: Optional[Recurrence] = None, recurrence_interval: Optional[int] = None) -> Task:
        """
        Create a new task with the given title and description.
        Raises ValueError if title is empty.
        """
        # Task dataclass __post_init__ will validate title
        new_task = Task(
            id=self._next_id, 
            title=title, 
            description=description,
            priority=priority,
            tags=tags or [],
            due_date=due_date,
            recurrence=recurrence,
            recurrence_interval=recurrence_interval
        )
        self._tasks.append(new_task)
        self._next_id += 1
        return new_task

    def get_all_tasks(self) -> List[Task]:
        """Return all tasks."""
        return self._tasks

    def get_task(self, task_id: int) -> Optional[Task]:
        """Return a task by ID, or None if not found."""
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(self, task_id: int, title: str | _NoValue = NO_VALUE, 
                   description: str | None | _NoValue = NO_VALUE,
                   priority: Priority | None | _NoValue = NO_VALUE, 
                   tags: List[str] | _NoValue = NO_VALUE,
                   due_date: date | None | _NoValue = NO_VALUE,
                   recurrence: Recurrence | None | _NoValue = NO_VALUE,
                   recurrence_interval: int | None | _NoValue = NO_VALUE) -> Optional[Task]:
        """
        Update a task's attributes.
        Returns the updated task, or None if not found.
        Raises ValueError if new title is empty.
        """
        task = self.get_task(task_id)
        if not task:
            return None
        
        if not isinstance(title, _NoValue):
            if not title or not title.strip():
                raise ValueError("Task title cannot be empty")
            task.title = title
            
        if not isinstance(description, _NoValue):
            task.description = description

        if not isinstance(priority, _NoValue):
            task.priority = priority
            
        if not isinstance(tags, _NoValue):
            task.tags = tags

        if not isinstance(due_date, _NoValue):
            task.due_date = due_date

        if not isinstance(recurrence, _NoValue):
            task.recurrence = recurrence

        if not isinstance(recurrence_interval, _NoValue):
            task.recurrence_interval = recurrence_interval
            
        return task

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by ID.
        Returns True if deleted, False if not found.
        """
        task = self.get_task(task_id)
        if task:
            self._tasks.remove(task)
            return True
        return False

    def toggle_complete(self, task_id: int) -> Optional[Task]:
        """
        Toggle a task's completion status.
        Updates completed_at timestamp.
        If a recurring task is completed, creates a new instance.
        Returns the updated task, or None if not found.
        """
        task = self.get_task(task_id)
        if not task:
            return None
        
        was_incomplete = not task.is_completed
        task.is_completed = not task.is_completed
        
        if task.is_completed:
            task.completed_at = datetime.now()
            # Handle recurrence
            if was_incomplete and task.recurrence:
                self._handle_recurrence(task)
        else:
            task.completed_at = None
            
        return task

    def _handle_recurrence(self, task: Task):
        """Create a new instance of a recurring task."""
        if not task.due_date:
            # If no due date, we use today as base? 
            # Spec says "calculates next due date based on recurrence pattern"
            base_date = date.today()
        else:
            base_date = task.due_date

        next_due_date = self._calculate_next_due_date(base_date, task.recurrence, task.recurrence_interval)
        
        self.create_task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            tags=task.tags,
            due_date=next_due_date,
            recurrence=task.recurrence,
            recurrence_interval=task.recurrence_interval
        )

    def _calculate_next_due_date(self, base_date: date, recurrence: Recurrence, interval: Optional[int]) -> date:
        from dateutil.relativedelta import relativedelta
        
        if recurrence == Recurrence.DAILY:
            return base_date + relativedelta(days=1)
        elif recurrence == Recurrence.WEEKLY:
            return base_date + relativedelta(weeks=1)
        elif recurrence == Recurrence.MONTHLY:
            return base_date + relativedelta(months=1)
        elif recurrence == Recurrence.CUSTOM and interval:
            # Assuming interval is in days for now, or we could support weeks/months?
            # Spec says "N days/weeks/months"
            # For simplicity let's assume days if not specified otherwise, 
            # but let's just use days for now.
            return base_date + relativedelta(days=interval)
        
        return base_date

    def search_tasks(self, query: str) -> List[Task]:
        """
        Search tasks by keyword in title or description (case-insensitive).
        """
        query = query.lower()
        return [
            task for task in self._tasks
            if query in task.title.lower() or query in task.description.lower()
        ]

    def filter_tasks(self, is_completed: Optional[bool] = None, 
                     priority: Optional[Priority] = None,
                     start_date: Optional[date] = None,
                     end_date: Optional[date] = None) -> List[Task]:
        """
        Filter tasks by completion status, priority, and date range.
        Multiple filters are combined with AND logic.
        """
        filtered = self._tasks
        
        if is_completed is not None:
            filtered = [t for t in filtered if t.is_completed == is_completed]
            
        if priority is not None:
            filtered = [t for t in filtered if t.priority == priority]
            
        if start_date:
            filtered = [t for t in filtered if t.due_date and t.due_date >= start_date]
            
        if end_date:
            filtered = [t for t in filtered if t.due_date and t.due_date <= end_date]
            
        return filtered

    def get_sorted_tasks(self, sort_by: str, tasks: Optional[List[Task]] = None) -> List[Task]:
        """
        Sort tasks by due_date, priority, or title.
        """
        target_tasks = tasks if tasks is not None else self._tasks
        
        if sort_by == "due_date":
            # Ascending, tasks without due dates last
            return sorted(target_tasks, key=lambda t: (t.due_date is None, t.due_date))
        elif sort_by == "priority":
            # High -> Medium -> Low -> None
            priority_map = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2, None: 3}
            return sorted(target_tasks, key=lambda t: priority_map.get(t.priority, 3))
        elif sort_by == "alphabetical":
            return sorted(target_tasks, key=lambda t: t.title.lower())
        
        return target_tasks
