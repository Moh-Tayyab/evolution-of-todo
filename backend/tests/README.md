# AI Chatbot Feature - Test Suite

## Overview

This directory contains comprehensive tests for the AI Chatbot feature (003-ai-chatbot). The test suite follows TDD principles and includes unit, integration, contract, and API tests.

## Test Structure

```
tests/
├── conftest.py                          # Shared pytest fixtures
├── api/
│   └── test_chat.py                     # API endpoint tests (TA001-TA015)
├── contract/
│   └── test_mcp_tools.py                # MCP tool contract tests (TC001-TC013)
├── integration/
│   ├── test_agent_workflows.py          # Agent workflow integration tests (TI001-TI012)
│   └── test_chatbot_flow.py             # End-to-end chatbot flow tests (US1-US6)
└── README.md                            # This file
```

## Test Coverage

### API Tests (`test_chat.py`)

Tests for the chat API endpoint covering:

- **Authentication** (TA001-TA002): JWT validation
- **Input Validation** (TA003): Schema validation, sanitization
- **Conversation Creation** (TA004): New conversation creation
- **Conversation Loading** (TA005-TA007): Latest, specific, invalid IDs
- **Message Persistence** (TA008, TA010): User/AI message storage
- **Timestamp Updates** (TA009): Conversation updated_at refresh
- **Rate Limiting** (TA011-TA013): 60 req/minute enforcement
- **Response Format** (TA014-TA015): ChatKit-compatible structure

### Contract Tests (`test_mcp_tools.py`)

Tests for MCP tool contracts covering:

- **add_task** (TC001-TC003): Title validation, description handling
- **list_tasks** (TC004-TC005): Task array, completed filter
- **update_task** (TC006-TC007): Partial updates, error handling
- **delete_task** (TC008-TC009): Success confirmation, not found
- **complete_task** (TC010-TC011): Boolean toggle, error handling
- **User Validation** (TC012-TC013): Authorization, structured JSON

### Integration Tests (`test_agent_workflows.py`)

Tests for agent workflow integration covering:

- **Task Management** (TI001-TI005): Add, view, update, delete, complete
- **Conversation Persistence** (TI006-TI008): Latest, specific, cross-session
- **Agent Behavior** (TI009-TI010): Friendly responses, clarification
- **Error Handling** (TI011-TI012): Graceful failures, timestamps

### End-to-End Tests (`test_chatbot_flow.py`)

Tests for complete user story flows covering:

- **US1**: Add Task via Natural Language (4 scenarios)
- **US2**: View Tasks via Natural Language (4 scenarios)
- **US3**: Update Task via Natural Language (4 scenarios)
- **US4**: Delete Task via Natural Language (4 scenarios)
- **US5**: Mark Task Complete via Natural Language (4 scenarios)
- **US6**: Conversation History Persistence (4 scenarios)

## Running Tests

### Prerequisites

```bash
# Install test dependencies
cd Phase-II-fullstack-web-app/backend
pip install pytest pytest-asyncio pytest-cov aiosqlite
```

### Run All Tests

```bash
# Run all tests with coverage
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=src --cov-report=html
```

### Run Specific Test Categories

```bash
# Run only API tests
pytest tests/api/

# Run only contract tests
pytest tests/contract/

# Run only integration tests
pytest tests/integration/

# Run only unit tests
pytest -m unit

# Run only slow tests
pytest -m slow

# Run only AI tests
pytest -m ai
```

### Run Specific Test Files

```bash
# Run chat API tests
pytest tests/api/test_chat.py

# Run MCP tool tests
pytest tests/contract/test_mcp_tools.py

# Run agent workflow tests
pytest tests/integration/test_agent_workflows.py

# Run chatbot flow tests
pytest tests/integration/test_chatbot_flow.py
```

### Run Specific Test Cases

```bash
# Run specific test class
pytest tests/api/test_chat.py::TestChatAuthentication

# Run specific test method
pytest tests/api/test_chat.py::TestChatAuthentication::test_ta001_chat_endpoint_returns_401_for_missing_jwt_token

# Run tests matching pattern
pytest -k "test_us1"  # All US1 tests
pytest -k "add_task"  # All add_task tests
```

### Run Tests in Parallel

```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel (auto-detect CPU count)
pytest -n auto

# Run with specific number of workers
pytest -n 4
```

## Test Fixtures

The `conftest.py` file provides shared fixtures:

### Basic Fixtures

- `session`: Synchronous database session
- `client`: FastAPI test client
- `test_user_id`: Test user ID (string)
- `test_user_uuid`: Test user ID (UUID object)
- `auth_headers`: Authenticated request headers

### Async Fixtures

- `async_session`: Async database session
- `sample_conversation`: Sample conversation object
- `sample_task_with_conversation`: Sample task object

### Mock Fixtures

- `mock_agent_orchestrator`: Mock agent without OpenAI API
- `mock_agent_with_tool_calls`: Mock agent with tool calls
- `mock_openai_api_response`: Mock OpenAI response

### Factory Fixtures

- `task_factory`: Create tasks in tests
- `conversation_factory`: Create conversations in tests
- `message_factory`: Create messages in tests

## Coverage

### Current Coverage Targets

- **Overall**: ≥80% (QG004)
- **MCP Server**: ≥80% (QG004)
- **Agent Orchestration**: ≥70% (QG005)

### Generate Coverage Report

```bash
# Generate terminal coverage report
pytest --cov=src --cov-report=term-missing

# Generate HTML coverage report
pytest --cov=src --cov-report=html
open htmlcov/index.html

# Generate JSON coverage report
pytest --cov=src --cov-report=json
```

## Test Markers

Tests are marked for easy filtering:

- `@pytest.mark.unit`: Fast, isolated unit tests
- `@pytest.mark.integration`: Slower integration tests with database
- `@pytest.mark.contract`: API specification compliance tests
- `@pytest.mark.e2e`: End-to-end system tests
- `@pytest.mark.slow`: Slow-running tests
- `@pytest.mark.ai`: Tests requiring OpenAI API or mocks
- `@pytest.mark.tdd`: Test-Driven Development tests

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov aiosqlite
      - name: Run tests
        run: pytest --cov=src --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

## Writing Tests

### Test Structure

```python
class TestFeature:
    """Description of what is being tested."""

    async def test_scenario_description(self, fixture):
        """
        Test: Description of what is being tested
        Given: Preconditions
        When: Action being tested
        Then: Expected outcome
        """
        # Arrange
        # Set up test data

        # Act
        # Execute the code being tested

        # Assert
        # Verify expected outcome
        assert result == expected
```

### Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: `test_user_can_add_task_via_natural_language`
3. **Test One Thing**: Each test should verify one behavior
4. **Use Fixtures**: Share setup code via fixtures
5. **Mock External Dependencies**: Don't call real OpenAI API
6. **Test Edge Cases**: Empty inputs, invalid data, boundary conditions
7. **Test Error Paths**: Verify error handling works correctly
8. **Keep Tests Independent**: Tests should not depend on each other
9. **Use Type Hints**: Add type hints to test functions
10. **Add Docstrings**: Document what each test verifies

### Example Test

```python
class TestUS1_AddTaskViaNaturalLanguage:
    """Integration tests for US1: Add Task via Natural Language."""

    @pytest.mark.asyncio
    async def test_us1_scenario_1_add_task_with_title(
        self, chatbot_session, test_user_uuid
    ):
        """
        Scenario 1: Given authenticated user,
        When they send 'Add buy milk tomorrow',
        Then AI correctly extracts task title and creates task in database.
        """
        # Arrange
        expected_title = "Buy milk"

        # Act
        result = await add_task(chatbot_session, test_user_uuid, expected_title)
        await chatbot_session.commit()

        # Assert
        assert result.success is True
        assert result.data["title"] == expected_title
        assert result.data["completed"] is False
```

## Troubleshooting

### Tests Fail with Import Errors

```bash
# Ensure you're in the backend directory
cd Phase-II-fullstack-web-app/backend

# Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Async Tests Hang

```bash
# Ensure pytest-asyncio is installed
pip install pytest-asyncio

# Use asyncio mode
pytest --asyncio-mode=auto
```

### Database Lock Errors

```bash
# Clean up test databases
rm -f test*.db

# Run tests sequentially
pytest -n 0
```

### Coverage Not Accurate

```bash
# Remove coverage cache
rm -rf .coverage htmlcov/

# Regenerate coverage
pytest --cov=src --cov-report=html
```

## Test Quality Gates

The following quality gates must pass:

- [x] All contract tests pass (13/13) - QG001
- [x] All integration tests pass (12/12) - QG002
- [x] All API tests pass (15/15) - QG003
- [ ] Test coverage ≥80% for MCP server code - QG004
- [ ] Test coverage ≥70% for agent orchestration code - QG005
- [ ] All code has @spec references (100%) - QG006
- [ ] No hardcoded secrets (API keys in .env only) - QG007
- [ ] All functional requirements have corresponding tests - QG008

## References

- [Spec](../../../specs/003-ai-chatbot/spec.md) - Feature specification
- [Tasks](../../../specs/003-ai-chatbot/tasks.md) - Implementation tasks
- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
