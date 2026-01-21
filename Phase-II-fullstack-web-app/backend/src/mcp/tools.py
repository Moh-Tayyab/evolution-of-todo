# @spec: specs/003-ai-chatbot/api/mcp-tools.md
# @spec: specs/003-ai-chatbot/spec.md (FR-018 to FR-022)
# MCP tools for task management - stateless tool implementations

from typing import Optional, Dict, Any
from uuid import UUID
from sqlmodel import Session, select

from ..models.task import Task, Priority
from ..models.message import MessageRole


class ToolResult:
    """Standardized tool response format"""

    def __init__(
        self,
        success: bool,
        data: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ):
        self.success = success
        self.data = data or {}
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON response"""
        result = {"success": self.success}
        if self.data:
            result["data"] = self.data
        if self.error:
            result["error"] = self.error
        return result


async def add_task(
    session: Session,
    user_id: UUID,
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
) -> ToolResult:
    """Create a new task for the user.

    Args:
        session: Database session
        user_id: User UUID (required for stateless operation)
        title: Task title (max 200 chars)
        description: Optional task description
        priority: Task priority (high/medium/low)

    Returns:
        ToolResult with created task data or error
    """
    try:
        # Validate inputs
        if not title or not title.strip():
            return ToolResult(success=False, error="Title is required")

        if len(title) > 200:
            return ToolResult(success=False, error="Title must be 200 characters or less")

        if description and len(description) > 2000:
            return ToolResult(success=False, error="Description must be 2000 characters or less")

        # Validate priority
        try:
            task_priority = Priority(priority.lower())
        except ValueError:
            task_priority = Priority.MEDIUM

        # Create task
        task = Task(
            user_id=user_id,
            title=title.strip(),
            description=description.strip() if description else None,
            priority=task_priority,
            completed=False,
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)

        return ToolResult(
            success=True,
            data={
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "completed": task.completed,
                "created_at": task.created_at.isoformat(),
            },
        )
    except Exception as e:
        await session.rollback()
        return ToolResult(success=False, error=f"Failed to create task: {str(e)}")


async def list_tasks(
    session: Session,
    user_id: UUID,
    completed: Optional[bool] = None,
) -> ToolResult:
    """List all tasks for the user, optionally filtered by completion status.

    Args:
        session: Database session
        user_id: User UUID (required for stateless operation)
        completed: Optional filter for completion status

    Returns:
        ToolResult with list of tasks or error
    """
    try:
        # Build query
        query = select(Task).where(Task.user_id == user_id)

        # Apply completion filter if specified
        if completed is not None:
            query = query.where(Task.completed == completed)

        # Order by updated_at DESC (most recent first)
        query = query.order_by(Task.updated_at.desc())

        # Execute query
        results = await session.execute(query)
        tasks = results.scalars().all()

        return ToolResult(
            success=True,
            data={
                "tasks": [
                    {
                        "id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "priority": task.priority,
                        "completed": task.completed,
                        "created_at": task.created_at.isoformat(),
                        "updated_at": task.updated_at.isoformat(),
                    }
                    for task in tasks
                ],
                "count": len(tasks),
            },
        )
    except Exception as e:
        return ToolResult(success=False, error=f"Failed to list tasks: {str(e)}")


async def update_task(
    session: Session,
    user_id: UUID,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
) -> ToolResult:
    """Update an existing task.

    Args:
        session: Database session
        user_id: User UUID (required for authorization)
        task_id: Task integer ID
        title: New title (optional)
        description: New description (optional)
        priority: New priority (optional)

    Returns:
        ToolResult with updated task data or error
    """
    try:
        # Get task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.execute(query)
        task = results.scalar_one_or_none()

        if not task:
            return ToolResult(
                success=False, error=f"Task {task_id} not found or access denied"
            )

        # Update fields if provided
        if title is not None:
            if not title.strip():
                return ToolResult(success=False, error="Title cannot be empty")
            if len(title) > 200:
                return ToolResult(success=False, error="Title must be 200 characters or less")
            task.title = title.strip()

        if description is not None:
            if description and len(description) > 2000:
                return ToolResult(
                    success=False, error="Description must be 2000 characters or less"
                )
            task.description = description.strip() if description else None

        if priority is not None:
            try:
                task.priority = Priority(priority.lower())
            except ValueError:
                return ToolResult(
                    success=False, error=f"Invalid priority: {priority}. Use high, medium, or low"
                )

        # Update timestamp
        from datetime import datetime
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return ToolResult(
            success=True,
            data={
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "completed": task.completed,
                "updated_at": task.updated_at.isoformat(),
            },
        )
    except Exception as e:
        await session.rollback()
        return ToolResult(success=False, error=f"Failed to update task: {str(e)}")


async def delete_task(
    session: Session,
    user_id: UUID,
    task_id: int,
) -> ToolResult:
    """Delete a task.

    Args:
        session: Database session
        user_id: User UUID (required for authorization)
        task_id: Task integer ID

    Returns:
        ToolResult with deletion confirmation or error
    """
    try:
        # Get task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.execute(query)
        task = results.scalar_one_or_none()

        if not task:
            return ToolResult(
                success=False, error=f"Task {task_id} not found or access denied"
            )

        # Delete task
        await session.delete(task)
        await session.commit()

        return ToolResult(
            success=True,
            data={
                "id": str(task_id),
                "message": f"Task '{task.title}' has been deleted",
            },
        )
    except Exception as e:
        await session.rollback()
        return ToolResult(success=False, error=f"Failed to delete task: {str(e)}")


async def complete_task(
    session: Session,
    user_id: UUID,
    task_id: int,
    completed: bool = True,
) -> ToolResult:
    """Mark a task as complete or incomplete.

    Args:
        session: Database session
        user_id: User UUID (required for authorization)
        task_id: Task integer ID
        completed: Desired completion status (default: True)

    Returns:
        ToolResult with updated task data or error
    """
    try:
        # Get task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.execute(query)
        task = results.scalar_one_or_none()

        if not task:
            return ToolResult(
                success=False, error=f"Task {task_id} not found or access denied"
            )

        # Update completion status
        task.completed = completed

        # Update timestamp
        from datetime import datetime
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        status = "completed" if completed else "uncompleted"

        return ToolResult(
            success=True,
            data={
                "id": str(task.id),
                "title": task.title,
                "completed": task.completed,
                "updated_at": task.updated_at.isoformat(),
                "message": f"Task '{task.title}' marked as {status}",
            },
        )
    except Exception as e:
        await session.rollback()
        return ToolResult(success=False, error=f"Failed to update task status: {str(e)}")
