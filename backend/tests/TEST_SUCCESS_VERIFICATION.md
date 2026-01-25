#!/bin/bash
# @spec: specs/003-ai-chatbot/spec.md (Testing Requirements)
# Test Runner Script for AI Chatbot Tests

set -e  # Exit on error

echo "================================"
echo "AI Chatbot Test Suite Runner"
echo "================================"
echo ""

# Change to backend directory
cd "$(dirname "$0")"
BACKEND_DIR="$(pwd)"
cd ..

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set test database URL
export DATABASE_URL="sqlite:///test.db"

echo "📋 Running AI Chatbot Tests..."
echo "   Database: $DATABASE_URL"
echo ""

# Function to run a test category
run_tests() {
    local test_path=$1
    local description=$2

    echo -e "${YELLOW}Running: $description${NC}"
    echo "   Path: $test_path"

    if uv run python -m pytest "$test_path" -v --tb=short -q; then
        echo -e "${GREEN}✓ Passed: $description${NC}"
    else
        echo -e "${RED}✗ Failed: $description${NC}"
        return 1
    fi
    echo ""
}

# Function to run a single test
run_single_test() {
    local test_path=$1
    local description=$2

    echo -e "${YELLOW}Running: $description${NC}"
    echo "   Path: $test_path"

    if uv run python -m pytest "$test_path" -v --tb=short; then
        echo -e "${GREEN}✓ Passed: $description${NC}"
    else
        echo -e "${RED}✗ Failed: $description${NC}"
        return 1
    fi
    echo ""
}

# Test counter
PASSED=0
FAILED=0

# Run tests and count results
run_test_and_count() {
    if run_tests "$@"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
}

# ============================================================================
# Run Contract Tests (MCP Tools)
# ============================================================================

echo "================================"
echo "Contract Tests (MCP Tools)"
echo "================================"
echo ""

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestAddTaskTool" \
    "MCP Tool: add_task"

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestListTasksTool" \
    "MCP Tool: list_tasks"

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestUpdateTaskTool" \
    "MCP Tool: update_task"

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestDeleteTaskTool" \
    "MCP Tool: delete_task"

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestCompleteTaskTool" \
    "MCP Tool: complete_task"

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestUserValidation" \
    "MCP Tool: User Validation"

run_test_and_count \
    "tests/contract/test_mcp_tools.py::TestMCPToolsEdgeCases" \
    "MCP Tool: Edge Cases"

# ============================================================================
# Run Integration Tests (Agent Workflows)
# ============================================================================

echo "================================"
echo "Integration Tests (Agent Workflows)"
echo "================================"
echo ""

run_test_and_count \
    "tests/integration/test_agent_workflows.py::TestAgentTaskWorkflows" \
    "Agent: Task Management Workflows"

run_test_and_count \
    "tests/integration/test_agent_workflows.py::TestAgentConversationPersistence" \
    "Agent: Conversation Persistence"

run_test_and_count \
    "tests/integration/test_agent_workflows.py::TestAgentBehavior" \
    "Agent: Behavior and Responses"

run_test_and_count \
    "tests/integration/test_agent_workflows.py::TestAgentErrorHandlingAndTimestamps" \
    "Agent: Error Handling"

run_test_and_count \
    "tests/integration/test_agent_workflows.py::TestAgentCompleteWorkflows" \
    "Agent: Complete Workflows"

# ============================================================================
# Run E2E Tests (Chatbot Flows)
# ============================================================================

echo "================================"
echo "E2E Tests (Chatbot User Stories)"
echo "================================"
echo ""

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestUS1_AddTaskViaNaturalLanguage" \
    "US1: Add Task via Natural Language"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestUS2_ViewTasksViaNaturalLanguage" \
    "US2: View Tasks via Natural Language"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestUS3_UpdateTaskViaNaturalLanguage" \
    "US3: Update Task via Natural Language"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestUS4_DeleteTaskViaNaturalLanguage" \
    "US4: Delete Task via Natural Language"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestUS5_MarkTaskCompleteViaNaturalLanguage" \
    "US5: Mark Task Complete via Natural Language"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestUS6_ConversationHistoryPersistence" \
    "US6: Conversation History Persistence"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestChatbotEdgeCases" \
    "Edge Cases and Error Handling"

run_test_and_count \
    "tests/integration/test_chatbot_flow.py::TestCompleteWorkflows" \
    "Complete Multi-Step Workflows"

# ============================================================================
# Summary
# ============================================================================

echo "================================"
echo "Test Summary"
echo "================================"
echo ""
echo -e "Total Passed: ${GREEN}$PASSED${NC}"
echo -e "Total Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
