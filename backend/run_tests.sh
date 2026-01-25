#!/bin/bash
# Quick test runner for AI chatbot tests

set -e

cd "$(dirname "$0")"

# Set test database URL
export DATABASE_URL="sqlite:///test.db"

echo "🧪 Running AI Chatbot Tests..."
echo ""

# Test 1: Single contract test
echo "Test 1: MCP Tool - add_task"
uv run python -m pytest tests/contract/test_mcp_tools.py::TestAddTaskTool::test_tc001_accepts_valid_user_id_and_title -v --tb=short || exit 1
echo "✓ Passed"
echo ""

# Test 2: All add_task tests
echo "Test 2: MCP Tool - add_task (all tests)"
uv run python -m pytest tests/contract/test_mcp_tools.py::TestAddTaskTool -v --tb=short -q || exit 1
echo "✓ Passed"
echo ""

# Test 3: All MCP tools
echo "Test 3: All MCP Tools Contract Tests"
uv run python -m pytest tests/contract/test_mcp_tools.py -v --tb=short -q || exit 1
echo "✓ Passed"
echo ""

# Test 4: Agent workflows
echo "Test 4: Agent Workflow Integration Tests"
uv run python -m pytest tests/integration/test_agent_workflows.py -v --tb=short -q || exit 1
echo "✓ Passed"
echo ""

echo "✅ All tests passed!"
