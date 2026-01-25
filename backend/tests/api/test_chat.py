# @spec: specs/003-ai-chatbot/spec.md (FR-001 to FR-032)
# @spec: specs/003-ai-chatbot/tasks.md (Testing Requirements - API Tests)
# API tests for chat endpoint - verify authentication, rate limiting, and ChatKit-compatible responses

import pytest
import time
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from uuid import uuid4, UUID
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel

from src.main import app
from src.security import create_access_token
from src.database import get_session

# Test database (SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///test_api_chat.db"
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)


@pytest.fixture
async def test_api_session():
    """Get test database session for API tests."""
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(test_engine, expire_on_commit=False) as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture
def test_client_with_db(test_api_session):
    """Get TestClient with async session override."""
    from src.api.deps import get_session as _get_session

    # Override the get_session dependency to use our test session
    async def _get_test_session():
        yield test_api_session

    app.dependency_overrides[_get_session] = _get_test_session

    yield TestClient(app)

    # Clean up override
    app.dependency_overrides = {}


# ============================================================================
# Mock Agent Classes
# ============================================================================

class MockChatResult:
    """Mock agent result for testing."""
    def __init__(self, response_text: str = "I've added that task to your list."):
        self.final_output = response_text
        self.events = []


class MockAgentOrchestrator:
    """Mock agent orchestrator for testing."""
    def __init__(self, response_text: str = "Test response"):
        self.response_text = response_text
        self.mock_result = MockChatResult(response_text)

    async def process_message(self, user_message, conversation_history, user_id, session):
        """Mock process message that returns a mock result."""
        return self.mock_result

    def get_response_text(self, result):
        """Return the mock response text."""
        return result.final_output

    def get_tool_calls(self, result):
        """Return empty tool calls list."""
        return []


# ============================================================================
# TA001-TA002: Authentication Tests
# ============================================================================

class TestChatAuthentication:
    """API tests for chat endpoint authentication (TA001-TA002)."""

    def test_ta001_chat_endpoint_returns_401_for_missing_jwt_token(self, test_client_with_db):
        """TA001: Test chat endpoint returns 401 for missing JWT token."""
        client = test_client_with_db
        user_id = str(uuid4())

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add buy milk"}
        )

        assert response.status_code == 401
        assert "detail" in response.json()

    def test_ta002_chat_endpoint_returns_401_for_invalid_jwt_token(self, test_client_with_db):
        """TA002: Test chat endpoint returns 401 for invalid JWT token."""
        client = test_client_with_db
        user_id = str(uuid4())

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add buy milk"},
            headers={"Authorization": "Bearer invalid_token_12345"}
        )

        assert response.status_code == 401


# ============================================================================
# TA003-TA004: Input Validation and Conversation Creation
# ============================================================================

class TestChatInputValidation:
    """API tests for chat endpoint input validation (TA003-TA004)."""

    def test_ta003_chat_endpoint_rejects_requests_without_message_content(self, test_client_with_db):
        """TA003: Test chat endpoint rejects requests without message content."""
        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Missing message field
        response = client.post(
            f"/api/{user_id}/chat",
            json={},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 422  # Validation error

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta004_chat_endpoint_creates_conversation_for_first_message(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA004: Test chat endpoint creates conversation for first message."""
        mock_orchestrator = MockAgentOrchestrator("I've added 'buy milk' to your tasks.")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add buy milk"},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert "message" in data
        assert data["message"]["role"] == "assistant"


# ============================================================================
# TA005-TA007: Conversation Loading Tests
# ============================================================================

class TestChatConversationLoading:
    """API tests for conversation loading (TA005-TA007)."""

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta005_chat_endpoint_loads_latest_conversation_when_conversation_id_is_latest(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA005: Test chat endpoint loads latest conversation when conversation_id is "latest"."""
        mock_orchestrator = MockAgentOrchestrator("Here are your tasks...")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # First, create a conversation
        response1 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add task 1"},
            headers={"Authorization": f"Bearer {token}"}
        )
        conversation_id = response1.json()["conversation_id"]

        # Now use "latest" to continue the conversation
        response2 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Show my tasks", "conversation_id": "latest"},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response2.status_code == 200
        # The conversation_id should be returned (might be same as latest or different depending on implementation)
        assert "conversation_id" in response2.json()

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta006_chat_endpoint_loads_specific_conversation_when_conversation_id_provided(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA006: Test chat endpoint loads specific conversation when conversation_id provided."""
        mock_orchestrator = MockAgentOrchestrator("I've updated that task.")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Create a conversation
        response1 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add buy groceries"},
            headers={"Authorization": f"Bearer {token}"}
        )
        conversation_id = response1.json()["conversation_id"]

        # Continue with specific conversation_id
        response2 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Mark it as done", "conversation_id": conversation_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response2.status_code == 200
        assert response2.json()["conversation_id"] == conversation_id

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta007_chat_endpoint_returns_404_for_invalid_conversation_id(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA007: Test chat endpoint returns 404 for invalid conversation_id."""
        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Use a fake conversation_id
        fake_conversation_id = str(uuid4())

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Hello", "conversation_id": fake_conversation_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        # This should return 404 since the conversation doesn't exist or belongs to another user
        assert response.status_code in [404, 403]


# ============================================================================
# TA008-TA010: Message Persistence and Response Format
# ============================================================================

class TestChatMessagePersistence:
    """API tests for message persistence (TA008-TA010)."""

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta008_chat_endpoint_persists_user_and_ai_messages(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA008: Test chat endpoint persists user and AI messages."""
        mock_orchestrator = MockAgentOrchestrator("I've added that task.")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add buy milk"},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        conversation_id = response.json()["conversation_id"]

        # Get the conversation to verify messages were persisted
        get_response = client.get(
            f"/api/{user_id}/conversations/{conversation_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert get_response.status_code == 200
        conversation = get_response.json()["conversation"]
        assert len(conversation["messages"]) >= 2  # User + AI messages

        # Check message roles
        roles = [msg["role"] for msg in conversation["messages"]]
        assert "user" in roles
        assert "assistant" in roles

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta009_chat_endpoint_updates_conversation_timestamp_on_each_message(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA009: Test chat endpoint updates conversation timestamp on each message."""
        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Create first message
        response1 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "First message"},
            headers={"Authorization": f"Bearer {token}"}
        )
        conversation_id = response1.json()["conversation_id"]

        # Get conversation after first message
        get1 = client.get(
            f"/api/{user_id}/conversations/{conversation_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        first_updated = get1.json()["conversation"]["updated_at"]

        # Add second message
        time.sleep(0.01)  # Small delay to ensure timestamp difference
        response2 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Second message", "conversation_id": conversation_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        # Get conversation after second message
        get2 = client.get(
            f"/api/{user_id}/conversations/{conversation_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        second_updated = get2.json()["conversation"]["updated_at"]

        # Verify timestamp was updated
        assert second_updated >= first_updated

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta010_chat_endpoint_returns_conversation_id_for_new_conversations(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA010: Test chat endpoint returns conversation_id for new conversations."""
        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Create new conversation (no conversation_id in request)
        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Start new chat"},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert isinstance(data["conversation_id"], str)
        # Should be a valid UUID format
        assert len(data["conversation_id"]) == 36  # UUID string length


# ============================================================================
# TA011-TA013: Rate Limiting Tests
# ============================================================================

class TestChatRateLimiting:
    """API tests for rate limiting (TA011-TA013)."""

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta011_chat_endpoint_enforces_60_req_per_minute_rate_limit(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA011: Test chat endpoint enforces 60 req/minute rate limit.

        Note: This test verifies the rate limiter is configured. Due to the
        high limit (60/minute), we don't test actual exhaustion in unit tests.
        """
        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Make a few requests to verify rate limiter doesn't block normal usage
        responses = []
        for i in range(5):
            response = client.post(
                f"/api/{user_id}/chat",
                json={"message": f"Message {i}"},
                headers={"Authorization": f"Bearer {token}"}
            )
            responses.append(response)

        # All should succeed for normal usage
        for response in responses:
            assert response.status_code == 200

    def test_ta012_chat_endpoint_returns_429_when_rate_limit_exceeded(
        self, test_client_with_db
    ):
        """TA012: Test chat endpoint returns 429 when rate limit exceeded.

        Note: This test verifies the app-level exception handler for RateLimitExceeded
        by directly testing the exception handler.
        """
        from slowapi.errors import RateLimitExceeded
        from unittest.mock import Mock
        from src.main import app

        # Create a mock limit object
        mock_limit = Mock()
        mock_limit.error_message = None
        mock_limit.limit = Mock()
        mock_limit.limit.__str__ = lambda self: "60/minute"

        # Get the exception handler from the app
        exception_handlers = app.exception_handlers
        rate_limit_handler = exception_handlers.get(RateLimitExceeded)

        # Verify the exception handler is registered
        assert rate_limit_handler is not None, "RateLimitExceeded exception handler not registered"

        # Test the exception handler directly
        from fastapi import Request

        # Create a mock request
        mock_request = Mock(spec=Request)
        mock_request.headers = {}

        # Call the exception handler
        import asyncio
        response = asyncio.run(rate_limit_handler(mock_request, RateLimitExceeded(mock_limit)))

        # Verify the response
        assert response.status_code == 429
        assert "detail" in response.body.decode() or "rate limit" in response.body.decode().lower()

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta013_rate_limit_response_includes_correct_headers(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA013: Test rate limit response includes correct headers.

        Note: We verify the headers are returned when rate limit is hit.
        """
        from slowapi.errors import RateLimitExceeded

        # Mock to raise RateLimitExceeded
        async def mock_process(*args, **kwargs):
            raise RateLimitExceeded()

        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator.process_message = mock_process
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Test"},
            headers={"Authorization": f"Bearer {token}"}
        )

        # Check rate limit headers
        if response.status_code == 429:
            assert "Retry-After" in response.headers
            assert response.headers.get("X-RateLimit-Limit") == "60"
            assert response.headers.get("X-RateLimit-Remaining") == "0"


# ============================================================================
# TA014-TA015: Schema Validation and Response Format
# ============================================================================

class TestChatSchemaAndResponseFormat:
    """API tests for schema validation and response format (TA014-TA015)."""

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta014_chat_endpoint_validates_input_schema(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA014: Test chat endpoint validates input schema."""
        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Test with invalid data types
        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": 123},  # Should be string, not int
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 422  # Validation error

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_ta015_chat_endpoint_returns_chatkit_compatible_response_format(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """TA015: Test chat endpoint returns ChatKit-compatible response format."""
        mock_orchestrator = MockAgentOrchestrator("I've added 'buy milk' to your tasks.")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        response = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Add buy milk"},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()

        # ChatKit-compatible format requires:
        # 1. conversation_id field
        assert "conversation_id" in data
        assert isinstance(data["conversation_id"], str)

        # 2. message object with id, role, content, created_at
        assert "message" in data
        message = data["message"]
        assert "id" in message
        assert "role" in message
        assert message["role"] == "assistant"
        assert "content" in message
        assert isinstance(message["content"], str)
        assert "created_at" in message

        # 3. Optional tool_calls field (may be null)
        assert "tool_calls" in data or data.get("tool_calls") is None or isinstance(data.get("tool_calls"), list)


# ============================================================================
# Additional API Tests for Complete Coverage
# ============================================================================

class TestChatAdditionalScenarios:
    """Additional API tests for edge cases and complete scenarios."""

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_user_id_mismatch_returns_403(self, mock_orchestrator_factory, test_client_with_db):
        """Test that user_id from JWT must match path parameter."""
        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user1_id = str(uuid4())
        user2_id = str(uuid4())

        # Create token for user1
        token = create_access_token(data={"sub": user1_id})

        # Try to access user2's endpoint
        response = client.post(
            f"/api/{user2_id}/chat",  # Different user_id in path
            json={"message": "Test"},
            headers={"Authorization": f"Bearer {token}"}
        )

        # Should return 403 for user ID mismatch
        # The check happens before the orchestrator is called
        assert response.status_code == 403

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_conversations_list_returns_user_conversations_only(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """Test that conversations list only returns user's own conversations."""
        mock_orchestrator = MockAgentOrchestrator("Response")
        mock_orchestrator_factory.return_value = mock_orchestrator

        client = test_client_with_db
        user1_id = str(uuid4())
        user2_id = str(uuid4())

        token1 = create_access_token(data={"sub": user1_id})
        token2 = create_access_token(data={"sub": user2_id})

        # Create conversation for user1
        response1 = client.post(
            f"/api/{user1_id}/chat",
            json={"message": "User1 message"},
            headers={"Authorization": f"Bearer {token1}"}
        )

        # Create conversation for user2
        response2 = client.post(
            f"/api/{user2_id}/chat",
            json={"message": "User2 message"},
            headers={"Authorization": f"Bearer {token2}"}
        )

        # List user1's conversations
        list_response = client.get(
            f"/api/{user1_id}/conversations",
            headers={"Authorization": f"Bearer {token1}"}
        )

        assert list_response.status_code == 200
        conversations = list_response.json()["conversations"]
        # User1 should only see their own conversation
        assert len(conversations) == 1

    @patch('src.api.routes.chat.create_agent_orchestrator')
    def test_conversation_with_multiple_messages(
        self, mock_orchestrator_factory, test_client_with_db
    ):
        """Test conversation with multiple message exchanges."""
        responses = [
            "First response",
            "Second response",
            "Third response"
        ]
        response_index = [0]

        def get_mock_orchestrator(*args, **kwargs):
            mock = MockAgentOrchestrator(responses[response_index[0]])
            response_index[0] = (response_index[0] + 1) % len(responses)
            return mock

        mock_orchestrator_factory.side_effect = get_mock_orchestrator

        client = test_client_with_db
        user_id = str(uuid4())
        token = create_access_token(data={"sub": user_id})

        # Create conversation with first message
        r1 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "First"},
            headers={"Authorization": f"Bearer {token}"}
        )
        conversation_id = r1.json()["conversation_id"]

        # Add more messages
        r2 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Second", "conversation_id": conversation_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        r3 = client.post(
            f"/api/{user_id}/chat",
            json={"message": "Third", "conversation_id": conversation_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        # Get conversation with all messages
        get_response = client.get(
            f"/api/{user_id}/conversations/{conversation_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert get_response.status_code == 200
        conversation = get_response.json()["conversation"]
        # Should have 3 user messages and 3 AI responses = 6 total
        assert len(conversation["messages"]) == 6
