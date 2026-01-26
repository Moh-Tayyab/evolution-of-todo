# @spec: specs/003-ai-chatbot/api/mcp-tools.md
# @spec: specs/003-ai-chatbot/spec.md (FR-018 to FR-022)
# MCP Server using FastMCP for todo task management

"""
MCP Server using FastMCP for Todo Task Management

This module implements an official MCP (Model Context Protocol) server using FastMCP
for exposing todo task management tools to AI agents. The MCP protocol defines a
standard way for AI agents to discover and call tools.

FastMCP provides:
- Automatic tool schema generation
- Type-safe tool definitions
- MCP protocol compliance
- Easy integration with OpenAI Agents SDK

Usage:
    server = create_mcp_server()
    # Expose tools to agents
"""

from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from fastmcp import FastMCP

from ..models.task import Task, Priority
from ..models.message import MessageRole


def create_mcp_server(name: str = "todo-tools") -> FastMCP:
    """
    Create an MCP server using FastMCP for todo task management.

    This server exposes the following tools:
    - add_task: Create a new task
    - list_tasks: List all tasks (optionally filtered by completion status)
    - update_task: Update an existing task
    - delete_task: Delete a task
    - complete_task: Mark a task as complete/incomplete

    Args:
        name: Server name for MCP protocol identification

    Returns:
        FastMCP server instance with registered tools
    """

    # Create FastMCP server
    mcp = FastMCP(name)

    # Session storage for user context (set per-request)
    # This is a simplified approach - in production, use proper context management
    _session_context = {}

    def set_session_context(session: AsyncSession, user_id: UUID):
        """Set the database session and user ID for the current request."""
        _session_context["session"] = session
        _session_context["user_id"] = user_id

    def get_session() -> AsyncSession:
        """Get the database session for the current request."""
        return _session_context.get("session")

    def get_user_id() -> UUID:
        """Get the user ID for the current request."""
        return _session_context.get("user_id")

    # ========================================================================
    # MCP Tool: add_task
    # ========================================================================

    @mcp.tool()
    async def add_task(
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
    ) -> str:
        """Add a new task to the user's todo list.

        Args:
            title: The task title (what needs to be done). Max 200 characters.
            description: Optional additional details about the task. Max 2000 characters.
            priority: Task priority level: "high", "medium", or "low". Default is "medium".

        Returns:
            Confirmation message with task details including the task ID.

        Raises:
            ValueError: If title is empty or exceeds character limit.
        """
        session = get_session()
        user_id = get_user_id()

        # Validate inputs
        if not title or not title.strip():
            return "Error: Title is required and cannot be empty."

        if len(title) > 200:
            return "Error: Title must be 200 characters or less."

        if description and len(description) > 2000:
            return "Error: Description must be 2000 characters or less."

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
        await session.flush()
        await session.refresh(task)

        return (
            f"Task added successfully!\n"
            f"ID: {task.id}\n"
            f"Title: {task.title}\n"
            f"Priority: {task.priority.value}\n"
            f"Description: {task.description or 'No description'}"
        )

    # ========================================================================
    # MCP Tool: list_tasks
    # ========================================================================

    @mcp.tool()
    async def list_tasks(
        completed: Optional[bool] = None,
    ) -> str:
        """List all tasks for the user, optionally filtered by completion status.

        Args:
            completed: Optional filter for completion status.
                      True for completed tasks only, False for incomplete tasks only.
                      None (default) shows all tasks.

        Returns:
            Formatted list of tasks with IDs, titles, completion status, and priority.
        """
        session = get_session()
        user_id = get_user_id()

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

        if not tasks:
            if completed is True:
                return "You don't have any completed tasks yet."
            elif completed is False:
                return "You don't have any incomplete tasks."
            else:
                return "You don't have any tasks yet. Would you like to add one?"

        # Format output
        status_filter = ""
        if completed is True:
            status_filter = "completed "
        elif completed is False:
            status_filter = "incomplete "

        output = [f"You have {len(tasks)} {status_filter}task(s):\n"]

        for task in tasks:
            status = "✓ DONE" if task.completed else "TODO"
            priority_emoji = {
                Priority.HIGH: "🔴",
                Priority.MEDIUM: "🟡",
                Priority.LOW: "🟢",
            }.get(task.priority, "⚪")

            output.append(
                f"  {task.id}. [{status}] {priority_emoji} {task.title}"
                f" (Priority: {task.priority.value})"
            )
            if task.description:
                output.append(f"      Description: {task.description}")

        return "\n".join(output)

    # ========================================================================
    # MCP Tool: update_task
    # ========================================================================

    @mcp.tool()
    async def update_task(
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> str:
        """Update an existing task's title, description, or priority.

        Args:
            task_id: The ID of the task to update (numeric).
            title: New title for the task. Leave empty to keep current title.
            description: New description for the task. Leave empty to keep current.
            priority: New priority: "high", "medium", or "low". Leave empty to keep current.

        Returns:
            Confirmation message with updated task details.

        Raises:
            ValueError: If task_id is not found or doesn't belong to user.
        """
        session = get_session()
        user_id = get_user_id()

        # Get task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.execute(query)
        task = results.scalar_one_or_none()

        if not task:
            return f"Error: Task {task_id} not found or access denied."

        # Update fields if provided
        if title is not None:
            if not title.strip():
                return "Error: Title cannot be empty."
            if len(title) > 200:
                return "Error: Title must be 200 characters or less."
            task.title = title.strip()

        if description is not None:
            if description and len(description) > 2000:
                return "Error: Description must be 2000 characters or less."
            task.description = description.strip() if description else None

        if priority is not None:
            try:
                task.priority = Priority(priority.lower())
            except ValueError:
                return f"Error: Invalid priority '{priority}'. Use: high, medium, or low."

        # Update timestamp
        from datetime import datetime
        task.updated_at = datetime.utcnow()

        await session.flush()
        await session.refresh(task)

        return (
            f"Task {task_id} updated successfully!\n"
            f"Title: {task.title}\n"
            f"Priority: {task.priority.value}\n"
            f"Description: {task.description or 'No description'}\n"
            f"Completed: {task.completed}"
        )

    # ========================================================================
    # MCP Tool: delete_task
    # ========================================================================

    @mcp.tool()
    async def delete_task(
        task_id: int,
    ) -> str:
        """Delete a task permanently.

        Args:
            task_id: The ID of the task to delete (numeric).

        Returns:
            Confirmation message with deleted task title.

        Raises:
            ValueError: If task_id is not found or doesn't belong to user.
        """
        session = get_session()
        user_id = get_user_id()

        # Get task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.execute(query)
        task = results.scalar_one_or_none()

        if not task:
            return f"Error: Task {task_id} not found or access denied."

        # Store title for confirmation
        task_title = task.title

        # Delete task
        await session.delete(task)
        await session.flush()

        return f"Task '{task_title}' (ID: {task_id}) has been deleted."

    # ========================================================================
    # MCP Tool: complete_task
    # ========================================================================

    @mcp.tool()
    async def complete_task(
        task_id: int,
        completed: bool = True,
    ) -> str:
        """Mark a task as complete or incomplete.

        Args:
            task_id: The ID of the task to update (numeric).
            completed: True to mark as complete, False to mark as incomplete. Default is True.

        Returns:
            Confirmation message with new status.

        Raises:
            ValueError: If task_id is not found or doesn't belong to user.
        """
        session = get_session()
        user_id = get_user_id()

        # Get task
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.execute(query)
        task = results.scalar_one_or_none()

        if not task:
            return f"Error: Task {task_id} not found or access denied."

        # Update completion status
        task.completed = completed

        # Update timestamp
        from datetime import datetime
        task.updated_at = datetime.utcnow()

        await session.flush()
        await session.refresh(task)

        status = "completed" if completed else "marked as incomplete"
        return f"Task '{task.title}' (ID: {task_id}) has been {status}."

    # Attach context helpers to the server for external use
    mcp.set_session_context = set_session_context
    mcp.get_session = get_session
    mcp.get_user_id = get_user_id

    return mcp


# Singleton instance for the application
_mcp_server_instance = None


def get_mcp_server() -> FastMCP:
    """Get or create the singleton MCP server instance."""
    global _mcp_server_instance
    if _mcp_server_instance is None:
        _mcp_server_instance = create_mcp_server()
    return _mcp_server_instance


# Export for direct use
__all__ = ["create_mcp_server", "get_mcp_server"]
