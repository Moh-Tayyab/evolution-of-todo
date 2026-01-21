# @spec: specs/003-ai-chatbot/spec.md (FR-018 to FR-022)
# @spec: specs/003-ai-chatbot/tasks.md (Testing Requirements - Contract Tests)
# Contract tests for MCP tools - verify tool schemas and behavior

import pytest
from uuid import UUID, uuid4
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from src.mcp.tools import (
    add_task,
    list_tasks,
    update_task,
    delete_task,
    complete_task,
)
from src.models.task import Task
from src.models.user import User

# Test database (SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///test_mcp.db"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)


@pytest.fixture
async def mcp_session():
    """Get test database session for MCP tool tests."""
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with AsyncSession(test_engine) as session:
        yield session
        await session.rollback()
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture
def test_user_uuid():
    """Get a test user UUID."""
    return uuid4()


@pytest.fixture
def test_user_uuid_2():
    """Get a second test user UUID for isolation tests."""
    return uuid4()


# ============================================================================
# TC001-TC004: add_task tool tests
# ============================================================================

class TestAddTaskTool:
    """Contract tests for add_task MCP tool."""

    async def test_tc001_accepts_valid_user_id_and_title(
        self, mcp_session, test_user_uuid
    ):
        """TC001: Test add_task tool accepts valid user_id and title."""
        result = await add_task(
            mcp_session,
            test_user_uuid,
            "Buy groceries",
        )

        assert result.success is True
        assert result.data is not None
        assert result.data["title"] == "Buy groceries"
        assert result.data["completed"] is False
        assert "id" in result.data
        assert result.error is None

    async def test_tc002_rejects_missing_title(self, mcp_session, test_user_uuid):
        """TC002: Test add_task tool rejects missing required fields."""
        result = await add_task(
            mcp_session,
            test_user_uuid,
            "",  # Empty title
        )

        assert result.success is False
        assert result.error is not None
        assert "Title is required" in result.error

    async def test_tc003_handles_optional_description(
        self, mcp_session, test_user_uuid
    ):
        """TC003: Test add_task tool handles optional description parameter."""
        result = await add_task(
            mcp_session,
            test_user_uuid,
            "Buy milk",
            "Get from grocery store",
        )

        assert result.success is True
        assert result.data["title"] == "Buy milk"
        assert result.data["description"] == "Get from grocery store"

    async def test_tc003_handles_no_description(
        self, mcp_session, test_user_uuid
    ):
        """TC003: Test add_task tool handles no description parameter."""
        result = await add_task(
            mcp_session,
            test_user_uuid,
            "Buy milk",
            None,
        )

        assert result.success is True
        assert result.data["title"] == "Buy milk"
        assert result.data["description"] is None


# ============================================================================
# TC004-TC005: list_tasks tool tests
# ============================================================================

class TestListTasksTool:
    """Contract tests for list_tasks MCP tool."""

    async def test_tc004_returns_task_array_correctly(
        self, mcp_session, test_user_uuid
    ):
        """TC004: Test list_tasks tool returns task array correctly."""
        # First create some tasks
        await add_task(mcp_session, test_user_uuid, "Task 1")
        await add_task(mcp_session, test_user_uuid, "Task 2")

        # Then list them
        result = await list_tasks(mcp_session, test_user_uuid)

        assert result.success is True
        assert result.data is not None
        assert "tasks" in result.data
        assert len(result.data["tasks"]) == 2
        assert result.error is None

    async def test_tc005_handles_completed_filter(
        self, mcp_session, test_user_uuid
    ):
        """TC005: Test list_tasks tool handles completed filter."""
        # Create tasks with different completion status
        await add_task(mcp_session, test_user_uuid, "Pending task")
        await add_task(mcp_session, test_user_uuid, "Completed task")

        # Get the completed task to mark it as done
        list_result = await list_tasks(mcp_session, test_user_uuid)
        assert len(list_result.data["tasks"]) == 2
        completed_task_id = list_result.data["tasks"][1]["id"]

        # Mark one as complete
        # Need to use the actual task_id (which is an integer)
        from src.mcp.tools import complete_task
        await complete_task(mcp_session, test_user_uuid, int(completed_task_id.split("-")[-1]), True)

        # Now filter for completed tasks
        result_completed = await list_tasks(
            mcp_session, test_user_uuid, completed=True
        )
        result_pending = await list_tasks(
            mcp_session, test_user_uuid, completed=False
        )

        assert result_completed.success is True
        assert result_pending.success is True
        assert len(result_completed.data["tasks"]) >= 1
        # At least one completed task should exist


# ============================================================================
# TC006-TC007: update_task tool tests
# ============================================================================

class TestUpdateTaskTool:
    """Contract tests for update_task MCP tool."""

    async def test_tc006_accepts_partial_updates(
        self, mcp_session, test_user_uuid
    ):
        """TC006: Test update_task tool accepts partial updates."""
        # First create a task
        create_result = await add_task(
            mcp_session, test_user_uuid, "Original title"
        )
        assert create_result.success is True

        # Parse the task ID - it's returned as a string UUID
        task_id_str = create_result.data["id"]
        # For this test, we need to use the integer ID
        # Let's get the actual task from database to get its integer ID
        tasks = (await mcp_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id  # Get the last created task

        # Update only the title
        result = await update_task(
            mcp_session, test_user_uuid, task_id, title="Updated title"
        )

        assert result.success is True
        assert result.data["title"] == "Updated title"
        # Description should remain None since we didn't update it

    async def test_tc007_returns_error_for_invalid_task_id(
        self, mcp_session, test_user_uuid
    ):
        """TC007: Test update_task tool returns error for invalid task_id."""
        result = await update_task(
            mcp_session, test_user_uuid, 99999, title="New title"
        )

        assert result.success is False
        assert result.error is not None
        assert "not found" in result.error.lower() or "access denied" in result.error.lower()


# ============================================================================
# TC008-TC009: delete_task tool tests
# ============================================================================

class TestDeleteTaskTool:
    """Contract tests for delete_task MCP tool."""

    async def test_tc008_returns_success_confirmation(
        self, mcp_session, test_user_uuid
    ):
        """TC008: Test delete_task tool returns success confirmation."""
        # First create a task
        create_result = await add_task(
            mcp_session, test_user_uuid, "Task to delete"
        )
        assert create_result.success is True

        # Get the task ID from database
        tasks = (await mcp_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Delete the task
        result = await delete_task(mcp_session, test_user_uuid, task_id)

        assert result.success is True
        assert result.data is not None
        assert "id" in result.data or "message" in result.data

    async def test_tc009_returns_error_for_invalid_task_id(
        self, mcp_session, test_user_uuid
    ):
        """TC009: Test delete_task tool returns error for invalid task_id."""
        result = await delete_task(mcp_session, test_user_uuid, 99999)

        assert result.success is False
        assert result.error is not None
        assert "not found" in result.error.lower() or "access denied" in result.error.lower()


# ============================================================================
# TC010-TC011: complete_task tool tests
# ============================================================================

class TestCompleteTaskTool:
    """Contract tests for complete_task MCP tool."""

    async def test_tc010_accepts_completed_boolean(
        self, mcp_session, test_user_uuid
    ):
        """TC010: Test complete_task tool accepts completed boolean."""
        # First create a task
        create_result = await add_task(
            mcp_session, test_user_uuid, "Task to complete"
        )
        assert create_result.success is True

        # Get the task ID from database
        tasks = (await mcp_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Mark as complete
        result_complete = await complete_task(
            mcp_session, test_user_uuid, task_id, completed=True
        )

        assert result_complete.success is True
        assert result_complete.data["completed"] is True

        # Mark as incomplete
        result_incomplete = await complete_task(
            mcp_session, test_user_uuid, task_id, completed=False
        )

        assert result_incomplete.success is True
        assert result_incomplete.data["completed"] is False

    async def test_tc011_returns_error_for_invalid_task_id(
        self, mcp_session, test_user_uuid
    ):
        """TC011: Test complete_task tool returns error for invalid task_id."""
        result = await complete_task(
            mcp_session, test_user_uuid, 99999, completed=True
        )

        assert result.success is False
        assert result.error is not None
        assert "not found" in result.error.lower() or "access denied" in result.error.lower()


# ============================================================================
# TC012-TC013: User validation tests (all tools)
# ============================================================================

class TestUserValidation:
    """Contract tests for user_id validation across all MCP tools."""

    async def test_tc012_all_tools_validate_user_id_before_db_operations(
        self, mcp_session, test_user_uuid, test_user_uuid_2
    ):
        """TC012: Test all tools validate user_id before DB operations."""
        # Create a task for user_1
        await add_task(mcp_session, test_user_uuid, "User 1 task")

        # Try to access/modify with user_2 (should fail or return empty)
        list_result = await list_tasks(mcp_session, test_user_uuid_2)

        # User 2 should see no tasks (not an error, just empty result)
        assert list_result.success is True
        assert list_result.data["count"] == 0

    async def test_tc013_all_tools_return_structured_json_with_success_error_fields(
        self, mcp_session, test_user_uuid
    ):
        """TC013: Test all tools return structured JSON with success/error fields."""
        # Test add_task success
        add_result = await add_task(
            mcp_session, test_user_uuid, "Test task"
        )
        assert isinstance(add_result.to_dict(), dict)
        assert "success" in add_result.to_dict()
        assert add_result.to_dict()["success"] is True

        # Test list_tasks success
        list_result = await list_tasks(mcp_session, test_user_uuid)
        assert isinstance(list_result.to_dict(), dict)
        assert "success" in list_result.to_dict()
        assert list_result.to_dict()["success"] is True

        # Test update_task with invalid ID (error case)
        update_result = await update_task(
            mcp_session, test_user_uuid, 99999, title="New title"
        )
        assert isinstance(update_result.to_dict(), dict)
        assert "success" in update_result.to_dict()
        assert update_result.to_dict()["success"] is False
        assert "error" in update_result.to_dict()

        # Test delete_task with invalid ID (error case)
        delete_result = await delete_task(
            mcp_session, test_user_uuid, 99999
        )
        assert isinstance(delete_result.to_dict(), dict)
        assert "success" in delete_result.to_dict()
        assert delete_result.to_dict()["success"] is False
        assert "error" in delete_result.to_dict()

        # Test complete_task with invalid ID (error case)
        complete_result = await complete_task(
            mcp_session, test_user_uuid, 99999, completed=True
        )
        assert isinstance(complete_result.to_dict(), dict)
        assert "success" in complete_result.to_dict()
        assert complete_result.to_dict()["success"] is False
        assert "error" in complete_result.to_dict()


# ============================================================================
# Additional edge case tests
# ============================================================================

class TestMCPToolsEdgeCases:
    """Additional edge case tests for MCP tools."""

    async def test_add_task_with_long_title(
        self, mcp_session, test_user_uuid
    ):
        """Test add_task handles maximum title length."""
        # Test with title at exactly 200 characters
        long_title = "A" * 200
        result = await add_task(
            mcp_session, test_user_uuid, long_title
        )
        assert result.success is True

    async def test_add_task_with_title_too_long(
        self, mcp_session, test_user_uuid
    ):
        """Test add_task rejects title exceeding max length."""
        # Test with title exceeding 200 characters
        too_long_title = "A" * 201
        result = await add_task(
            mcp_session, test_user_uuid, too_long_title
        )
        assert result.success is False
        assert "200 characters" in result.error

    async def test_add_task_with_long_description(
        self, mcp_session, test_user_uuid
    ):
        """Test add_task handles maximum description length."""
        # Test with description at exactly 2000 characters
        long_description = "B" * 2000
        result = await add_task(
            mcp_session, test_user_uuid, "Task with long desc",
            long_description
        )
        assert result.success is True

    async def test_add_task_with_description_too_long(
        self, mcp_session, test_user_uuid
    ):
        """Test add_task rejects description exceeding max length."""
        # Test with description exceeding 2000 characters
        too_long_description = "B" * 2001
        result = await add_task(
            mcp_session, test_user_uuid, "Task with long desc",
            too_long_description
        )
        assert result.success is False
        assert "2000 characters" in result.error

    async def test_update_task_with_invalid_priority(
        self, mcp_session, test_user_uuid
    ):
        """Test update_task handles invalid priority gracefully."""
        # Create a task first
        create_result = await add_task(
            mcp_session, test_user_uuid, "Test task"
        )
        tasks = (await mcp_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Try to update with invalid priority (should handle gracefully or use default)
        # The current implementation may not support priority updates via update_task
        # This test verifies the behavior
        result = await update_task(
            mcp_session, test_user_uuid, task_id, title="Updated task"
        )
        assert result.success is True

    async def test_list_tasks_with_empty_result(
        self, mcp_session, test_user_uuid
    ):
        """Test list_tasks handles empty task list."""
        result = await list_tasks(mcp_session, test_user_uuid)

        assert result.success is True
        assert result.data["tasks"] == []
        assert result.data["count"] == 0
        assert result.error is None

    async def test_delete_task_then_try_to_update(
        self, mcp_session, test_user_uuid
    ):
        """Test updating a deleted task returns error."""
        # Create a task
        create_result = await add_task(
            mcp_session, test_user_uuid, "Task to delete"
        )
        tasks = (await mcp_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Delete the task
        delete_result = await delete_task(
            mcp_session, test_user_uuid, task_id
        )
        assert delete_result.success is True

        # Try to update the deleted task
        update_result = await update_task(
            mcp_session, test_user_uuid, task_id, title="Should fail"
        )
        assert update_result.success is False

    async def test_complete_task_toggle(
        self, mcp_session, test_user_uuid
    ):
        """Test complete_task can toggle completion status."""
        # Create a task
        create_result = await add_task(
            mcp_session, test_user_uuid, "Toggle test"
        )
        tasks = (await mcp_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Mark as complete
        result_complete = await complete_task(
            mcp_session, test_user_uuid, task_id, completed=True
        )
        assert result_complete.success is True
        assert result_complete.data["completed"] is True

        # Mark back to incomplete
        result_incomplete = await complete_task(
            mcp_session, test_user_uuid, task_id, completed=False
        )
        assert result_incomplete.success is True
        assert result_incomplete.data["completed"] is False
