---
id: "0002"
title: "MCP tools contract tests written"
stage: misc
date: 2026-01-19
surface: agent
model: glm-4.7
feature: 003-ai-chatbot
branch: 003-ai-chatbot
user: evolution-of-todo
command: write tests for mcp tools
labels: ["testing", "mcp-tools", "contract-tests"]
links:
  spec: specs/003-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - Phase-II-fullstack-web-app/backend/tests/contract/test_mcp_tools.py
  - Phase-II-fullstack-web-app/backend/src/schemas/chat.py
tests:
  - tests/contract/test_mcp_tools.py (22 tests: TC001-TC013 + edge cases)
---

## Prompt

write tests for mcp tools

## Response snapshot

MCP tool contract tests completed successfully. All 22 tests pass:
- TC001-TC003: add_task tool tests (valid inputs, missing title, optional description)
- TC004-TC005: list_tasks tool tests (returns array, completed filter)
- TC006-TC007: update_task tool tests (partial updates, invalid task_id)
- TC008-TC009: delete_task tool tests (success confirmation, invalid task_id)
- TC010-TC011: complete_task tool tests (boolean accepts, invalid task_id)
- TC012-TC013: User validation and structured JSON responses
- Additional edge cases (max lengths, empty results, toggles)

Fixed issues during implementation:
1. OpenAI Agents SDK not installed - installed from GitHub (openai-agents==0.6.8)
2. Schema import order - reordered ChatMessage, ConversationSummary, ConversationDetail before their usage
3. Async session mismatch - updated test fixture to use AsyncSession with aiosqlite
4. Session.exec() vs execute() - fixed all database query calls to use async pattern

## Outcome

- ✅ Impact: 22/22 MCP tool contract tests passing - validates all 5 tools (add_task, list_tasks, update_task, delete_task, complete_task) with proper error handling, user isolation, and input validation
- 🧪 Tests: 22 contract tests covering TC001-TC013 plus edge cases (max lengths, empty results, toggles)
- 📁 Files: 2 files modified/created - test_mcp_tools.py (523 lines), chat.py (fixed import order)
- 🔁 Next prompts: Write integration tests for agent workflows (TI001-TI012), write API tests for chat endpoint (TA001-TA015); verify OPENAI_API_KEY is configured in .env before running integration tests
- 🧠 Reflection: Async session handling with SQLite requires aiosqlite driver; test fixture must use AsyncSession with run_sync for DDL operations; all database operations in async context must use execute() not exec()

## Evaluation notes (flywheel)

- Failure modes observed: (1) OpenAI Agents SDK missing - resolved via `uv pip install git+https://github.com/openai/openai-agents-python.git`; (2) Schema classes referenced before definition - resolved by reordering; (3) Sync Session used with async MCP tools - resolved by switching to AsyncSession with aiosqlite
- Graders run and results (PASS/FAIL): pytest tests/contract/test_mcp_tools.py - 22 passed, 42 warnings in 9.50s (PASS)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Write integration tests for agent workflows (TI001-TI012) to verify agent can correctly interpret natural language and invoke appropriate tools
