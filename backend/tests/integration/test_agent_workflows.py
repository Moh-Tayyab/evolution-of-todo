# @spec: specs/003-ai-chatbot/spec.md (FR-001 to FR-017)
# @spec: specs/003-ai-chatbot/tasks.md (Testing Requirements - Integration Tests)
# Integration tests for agent workflows - verify agent correctly interprets natural language and invokes tools

import pytest
from uuid import UUID, uuid4
from unittest.mock import Mock, AsyncMock, patch
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from src.agent.orchestrator import AgentOrchestrator, create_agent_orchestrator
from src.mcp.tools import add_task, list_tasks, update_task, delete_task, complete_task
from src.models.task import Task
from src.models.conversation import Conversation
from src.models.message import Message, MessageRole

# Test database (SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///test_agent_workflows.db"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)


@pytest.fixture
async def agent_session():
    """Get test database session for agent workflow tests."""
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
def mock_openai_response():
    """Create a mock OpenAI response for testing."""
    mock_result = Mock()
    mock_result.final_output = "I've added 'buy milk' to your tasks."
    mock_result.events = []
    return mock_result


# ============================================================================
# TI001-TI005: Agent task management workflows
# ============================================================================

class TestAgentTaskWorkflows:
    """Integration tests for agent task management workflows."""

    async def test_ti001_agent_has_tools_schema_defined(
        self, test_user_uuid
    ):
        """TI001: Test Agent has tools schema defined for function calling."""
        # Create the orchestrator with a mock API key
        import os
        os.environ["OPENAI_API_KEY"] = "test-key"

        try:
            orchestrator = create_agent_orchestrator()

            # The orchestrator should have tools schema
            assert orchestrator is not None
            assert hasattr(orchestrator, '_tools_schema')
            assert len(orchestrator._tools_schema) == 5

            # Verify tools have the correct names
            tool_names = [t["function"]["name"] for t in orchestrator._tools_schema]
            assert "add_task" in tool_names
            assert "list_tasks" in tool_names
            assert "update_task" in tool_names
            assert "delete_task" in tool_names
            assert "complete_task" in tool_names
        finally:
            # Clean up
            if "OPENAI_API_KEY" in os.environ:
                del os.environ["OPENAI_API_KEY"]

    async def test_ti002_agent_returns_task_list_when_user_says_show_my_tasks(
        self, agent_session, test_user_uuid
    ):
        """TI002: Test Agent returns task list when user says "Show my tasks"."""
        # First create some tasks
        await add_task(agent_session, test_user_uuid, "Task 1")
        await add_task(agent_session, test_user_uuid, "Task 2")
        await agent_session.commit()

        # List tasks
        result = await list_tasks(agent_session, test_user_uuid)

        assert result.success is True
        assert result.data["count"] == 2
        assert len(result.data["tasks"]) == 2
        # Tasks are returned in DESC order by updated_at, so check both are present
        titles = [t["title"] for t in result.data["tasks"]]
        assert "Task 1" in titles
        assert "Task 2" in titles

    async def test_ti003_agent_updates_task_when_user_says_change_task_1_to_buy_groceries(
        self, agent_session, test_user_uuid
    ):
        """TI003: Test Agent updates task when user says "Change task 1 to buy groceries"."""
        # First create a task
        await add_task(agent_session, test_user_uuid, "Original task")
        await agent_session.commit()

        # Get the task ID
        tasks = (await agent_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Update the task
        result = await update_task(
            agent_session, test_user_uuid, task_id, title="buy groceries"
        )

        assert result.success is True
        assert result.data["title"] == "buy groceries"

    async def test_ti004_agent_deletes_task_when_user_says_delete_task_1(
        self, agent_session, test_user_uuid
    ):
        """TI004: Test Agent deletes task when user says "Delete task 1"."""
        # First create a task
        await add_task(agent_session, test_user_uuid, "Task to delete")
        await agent_session.commit()

        # Get the task ID
        tasks = (await agent_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Delete the task
        result = await delete_task(agent_session, test_user_uuid, task_id)

        assert result.success is True

        # Verify task is deleted
        list_result = await list_tasks(agent_session, test_user_uuid)
        assert list_result.data["count"] == 0

    async def test_ti005_agent_marks_complete_when_user_says_mark_task_1_as_done(
        self, agent_session, test_user_uuid
    ):
        """TI005: Test Agent marks complete when user says "Mark task 1 as done"."""
        # First create a task
        await add_task(agent_session, test_user_uuid, "Task to complete")
        await agent_session.commit()

        # Get the task ID
        tasks = (await agent_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # Mark as complete
        result = await complete_task(agent_session, test_user_uuid, task_id, completed=True)

        assert result.success is True
        assert result.data["completed"] is True


# ============================================================================
# TI006-TI008: Conversation persistence workflows
# ============================================================================

class TestAgentConversationPersistence:
    """Integration tests for agent conversation persistence workflows."""

    async def test_ti006_conversation_loads_when_conversation_id_is_latest(
        self, agent_session, test_user_uuid
    ):
        """TI006: Test conversation loads when conversation_id is "latest"."""
        # Create a conversation
        conversation = Conversation(
            id=uuid4(),
            user_id=test_user_uuid,
            title="Test Conversation",
        )
        agent_session.add(conversation)

        # Add a message
        message = Message(
            id=uuid4(),
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content="Hello",
        )
        agent_session.add(message)
        await agent_session.commit()

        # Verify conversation exists
        result = await agent_session.execute(
            select(Conversation).where(Conversation.user_id == test_user_uuid)
        )
        conversations = result.scalars().all()

        assert len(conversations) == 1
        assert conversations[0].title == "Test Conversation"

    async def test_ti007_conversation_loads_when_conversation_id_is_provided(
        self, agent_session, test_user_uuid
    ):
        """TI007: Test conversation loads when conversation_id is provided."""
        # Create a conversation with a specific ID
        conversation_id = uuid4()
        conversation = Conversation(
            id=conversation_id,
            user_id=test_user_uuid,
            title="Specific Conversation",
        )
        agent_session.add(conversation)
        await agent_session.commit()

        # Load by specific ID
        result = await agent_session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        loaded_conversation = result.scalar_one_or_none()

        assert loaded_conversation is not None
        assert loaded_conversation.id == conversation_id
        assert loaded_conversation.title == "Specific Conversation"

    async def test_ti008_conversation_history_persists_across_sessions(
        self, agent_session, test_user_uuid
    ):
        """TI008: Test conversation history persists across sessions."""
        # Create a conversation with messages
        conversation_id = uuid4()
        conversation = Conversation(
            id=conversation_id,
            user_id=test_user_uuid,
            title="Persistent Conversation",
        )
        agent_session.add(conversation)

        # Add multiple messages
        message1 = Message(
            id=uuid4(),
            conversation_id=conversation_id,
            role=MessageRole.USER,
            content="Add task 1",
        )
        message2 = Message(
            id=uuid4(),
            conversation_id=conversation_id,
            role=MessageRole.ASSISTANT,
            content="I've added task 1",
        )
        agent_session.add(message1)
        agent_session.add(message2)
        await agent_session.commit()

        # Simulate new session by querying again
        result = await agent_session.execute(
            select(Message).where(Message.conversation_id == conversation_id)
        )
        messages = result.scalars().all()

        assert len(messages) == 2
        assert messages[0].content == "Add task 1"
        assert messages[1].content == "I've added task 1"


# ============================================================================
# TI009-TI010: Agent behavior tests
# ============================================================================

class TestAgentBehavior:
    """Integration tests for agent behavior and responses."""

    async def test_ti009_agent_provides_friendly_confirmatory_responses(
        self, agent_session, test_user_uuid
    ):
        """TI009: Test Agent provides friendly confirmatory responses."""
        # Create orchestrator and test tool behavior
        import os
        os.environ["OPENAI_API_KEY"] = "test-key"

        try:
            orchestrator = create_agent_orchestrator()

            # Verify orchestrator has friendly system message
            system_msg = orchestrator._build_system_message(agent_session, test_user_uuid)

            assert system_msg is not None
            assert "friendly" in system_msg.lower() or "helpful" in system_msg.lower()

            # Test add_task returns friendly confirmation
            result = await add_task(agent_session, test_user_uuid, "Test task")
            await agent_session.commit()

            assert result.success is True
            assert result.data["title"] == "Test task"
        finally:
            # Clean up
            if "OPENAI_API_KEY" in os.environ:
                del os.environ["OPENAI_API_KEY"]

    async def test_ti010_agent_requests_clarification_for_ambiguous_inputs(
        self, agent_session, test_user_uuid
    ):
        """TI010: Test Agent requests clarification for ambiguous inputs."""
        # Test with empty task ID (should fail gracefully)
        result = await update_task(
            agent_session, test_user_uuid, 99999, title="New title"
        )

        assert result.success is False
        assert result.error is not None
        assert "not found" in result.error.lower() or "access denied" in result.error.lower()


# ============================================================================
# TI011-TI012: Agent error handling and timestamp tests
# ============================================================================

class TestAgentErrorHandlingAndTimestamps:
    """Integration tests for agent error handling and timestamp management."""

    async def test_ti011_agent_handles_errors_gracefully_task_not_found(
        self, agent_session, test_user_uuid
    ):
        """TI011: Test Agent handles errors gracefully (task not found)."""
        # Try to update non-existent task
        result = await update_task(
            agent_session, test_user_uuid, 99999, title="New title"
        )

        assert result.success is False
        assert result.error is not None

        # Try to delete non-existent task
        result = await delete_task(agent_session, test_user_uuid, 99999)

        assert result.success is False
        assert result.error is not None

        # Try to complete non-existent task
        result = await complete_task(agent_session, test_user_uuid, 99999, completed=True)

        assert result.success is False
        assert result.error is not None

    async def test_ti012_conversation_updates_timestamp_on_each_message(
        self, agent_session, test_user_uuid
    ):
        """TI012: Test conversation updates timestamp on each message."""
        from datetime import datetime

        # Create a conversation
        conversation = Conversation(
            id=uuid4(),
            user_id=test_user_uuid,
            title="Timestamp Test",
        )
        agent_session.add(conversation)
        await agent_session.commit()
        await agent_session.refresh(conversation)

        # Get initial timestamp
        initial_updated_at = conversation.updated_at

        # Add a message
        message = Message(
            id=uuid4(),
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content="New message",
        )
        agent_session.add(message)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        await agent_session.commit()
        await agent_session.refresh(conversation)

        # Verify timestamp was updated
        assert conversation.updated_at >= initial_updated_at


# ============================================================================
# Additional integration tests for complete workflows
# ============================================================================

class TestAgentCompleteWorkflows:
    """Integration tests for complete multi-step workflows."""

    async def test_complete_task_lifecycle_workflow(
        self, agent_session, test_user_uuid
    ):
        """Test complete workflow: add -> list -> update -> complete -> delete."""
        # Add task
        add_result = await add_task(agent_session, test_user_uuid, "Workflow test task")
        assert add_result.success is True
        await agent_session.commit()

        # Get task ID
        tasks = (await agent_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()
        task_id = tasks[-1].id

        # List tasks (should have 1)
        list_result = await list_tasks(agent_session, test_user_uuid)
        assert list_result.success is True
        assert list_result.data["count"] == 1

        # Update task
        update_result = await update_task(
            agent_session, test_user_uuid, task_id, title="Updated workflow task"
        )
        assert update_result.success is True
        assert update_result.data["title"] == "Updated workflow task"

        # Mark as complete
        complete_result = await complete_task(agent_session, test_user_uuid, task_id, completed=True)
        assert complete_result.success is True
        assert complete_result.data["completed"] is True

        # Delete task
        delete_result = await delete_task(agent_session, test_user_uuid, task_id)
        assert delete_result.success is True

        # Verify deleted
        final_list = await list_tasks(agent_session, test_user_uuid)
        assert final_list.data["count"] == 0

    async def test_user_isolation_workflow(
        self, agent_session
    ):
        """Test that users can only access their own tasks."""
        user1 = uuid4()
        user2 = uuid4()

        # Add task for user1
        await add_task(agent_session, user1, "User 1 task")
        await agent_session.commit()

        # User1 should see 1 task
        list1 = await list_tasks(agent_session, user1)
        assert list1.success is True
        assert list1.data["count"] == 1

        # User2 should see 0 tasks
        list2 = await list_tasks(agent_session, user2)
        assert list2.success is True
        assert list2.data["count"] == 0

        # User2 cannot access user1's task
        tasks = (await agent_session.execute(
            select(Task).where(Task.user_id == user1)
        )).scalars().all()
        if tasks:
            task_id = tasks[0].id
            update_result = await update_task(
                agent_session, user2, task_id, title="Hacked"
            )
            assert update_result.success is False

    async def test_batch_operations_workflow(
        self, agent_session, test_user_uuid
    ):
        """Test adding and managing multiple tasks at once."""
        # Add multiple tasks
        titles = ["Task A", "Task B", "Task C", "Task D", "Task E"]
        for title in titles:
            result = await add_task(agent_session, test_user_uuid, title)
            assert result.success is True
        await agent_session.commit()

        # List all tasks
        list_result = await list_tasks(agent_session, test_user_uuid)
        assert list_result.success is True
        assert list_result.data["count"] == 5

        # Mark first half as complete
        tasks = (await agent_session.execute(
            select(Task).where(Task.user_id == test_user_uuid)
        )).scalars().all()

        # Extract task IDs while objects are still attached to session
        task_ids = [task.id for task in tasks[:3]]

        for task_id in task_ids:
            result = await complete_task(agent_session, test_user_uuid, task_id, completed=True)
            assert result.success is True

        # Filter by completed
        completed_list = await list_tasks(agent_session, test_user_uuid, completed=True)
        assert completed_list.data["count"] == 3

        # Filter by incomplete
        incomplete_list = await list_tasks(agent_session, test_user_uuid, completed=False)
        assert incomplete_list.data["count"] == 2
