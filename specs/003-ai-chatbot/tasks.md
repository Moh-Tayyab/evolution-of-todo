# Tasks: 003-ai-chatbot

**Feature**: 003-ai-chatbot
**Branch**: 003-ai-chatbot
**Date**: 2025-12-31
**Status**: In Progress (Core Implementation Complete)

---

## Overview

This document contains dependency-ordered implementation tasks for the AI chatbot feature. Tasks are organized by user story to enable independent implementation and testing of each functionality.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create project structure per implementation plan
- [X] T002 Initialize [Python] project with [framework] dependencies
- [X] T003 [P] Configure linting and formatting tools for [Python] project
- [X] T004 [P] Setup database schema and migrations framework
- [X] T005 [P] Configure error handling and logging infrastructure
- [X] T006 [P] Setup environment configuration management
- [X] T007 [P] Initialize [TypeScript] project with [framework] dependencies
- [X] T008 [P] Configure linting and formatting tools for [TypeScript] project
- [X] T009 [P] Setup testing framework for [backend]
- [X] T010 [P] Setup testing framework for [frontend]

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T011 [P] Create User model in src/models/user.py (from Phase II)
- [X] T012 [P] Create Task model in src/models/task.py (from Phase II)
- [X] T013 [P] Implement UserService with CRUD operations (from Phase II)
- [X] T014 [P] Create database session management (from Phase II)
- [X] T015 [P] Implement JWT authentication middleware (from Phase II)
- [X] T016 [P] Setup API routing structure (from Phase II)
- [X] T017 [P] Create base API response models (from Phase II)
- [X] T018 [P] Configure Better Auth integration (from Phase II)
- [X] T019 [P] Set up CORS and security headers (from Phase II)
- [X] T020 [P] Create Conversation model in src/models/conversation.py
- [X] T021 [P] Create Message model in src/models/message.py
- [X] T022 [P] Add user_id foreign key constraints
- [X] T023 [P] Create database indexes for query performance
- [X] T024 [P] Implement conversation repository pattern (ConversationService)
- [X] T025 [P] Implement message repository pattern (ConversationService)
- [X] T026 [P] Create conversation/message relationships
- [ ] T027 [P] Validate foreign key constraints with CASCADE
- [ ] T028 [P] Create Alembic migration for conversations and messages tables
- [ ] T029 [P] Apply migration and verify tables
- [ ] T030 [P] Write migration rollback procedure
- [X] T031 [P] Create MCP server structure in backend/src/mcp/
- [ ] T032 [P] Initialize FastMCP server instance (using direct function tools instead)
- [X] T033 [P] Create tool base class with common error handling (ToolResult)
- [X] T034 [P] Implement 5 required MCP tools (add_task, list_tasks, update_task, delete_task, complete_task)
- [X] T035 [P] Add tool validation and error handling
- [ ] T036 [P] Configure MCP server logging
- [ ] T037 [P] Write MCP tool documentation
- [X] T038 [P] Create agent orchestration structure in backend/src/agent/
- [X] T039 [P] Initialize OpenAI Agents SDK
- [X] T040 [P] Create Agent base class with tool registration
- [X] T041 [P] Implement agent message processing logic
- [X] T042 [P] Add conversation history retrieval
- [X] T043 [P] Add tool invocation tracking
- [X] T044 [P] Implement streaming response support
- [X] T045 [P] Create agent service layer in backend/src/services/ (ConversationService)
- [X] T046 [P] Implement AgentOrchestrator with retry logic
- [X] T047 [P] Add error handling for agent failures
- [X] T048 [P] Create API routing structure in backend/src/api/routes/ (chat.py)
- [X] T049 [P] Create chat endpoint handler
- [X] T050 [P] Implement JWT extraction from request
- [X] T051 [P] Integrate AgentOrchestrator
- [X] T052 [P] Add conversation loading/creation logic
- [X] T053 [P] Implement message persistence to database
- [X] T054 [P] Add conversation update timestamp refresh
- [X] T055 [P] Return ChatKit-compatible response format
- [X] T056 [P] Create request/response Pydantic schemas
- [X] T057 [P] Add rate limiting integration (slowapi)
- [X] T058 [P] Implement rate limit exceeded error handling
- [X] T059 [P] Configure CORS for frontend
- [X] T060 [P] Add request/response validation (ChatRequest schema)
- [X] T061 [P] Create conversations list endpoint
- [X] T062 [P] Implement conversation detail endpoint
- [X] T063 [P] Add authentication middleware
- [X] T064 [P] Create rate limiting middleware
- [X] T065 [P] Implement sliding window rate limiter
- [X] T066 [P] Configure rate limit headers
- [X] T067 [P] Add error handling middleware
- [X] T068 [P] Write API error response schemas (ErrorResponse)

---

## Phase 3: User Story 1 - Add Task via Natural Language

**Goal**: Users can add a task through conversational AI interface with natural language commands like "Add buy milk tomorrow"

**Independent Test**: Send natural language messages to create tasks and verify they appear in database

- [X] T100 [P] [US1] Create add_task MCP tool in backend/src/mcp/tools.py
- [X] T101 [P] [US1] Add user_id parameter validation to add_task tool
- [X] T102 [P] [US1] Implement add_task database logic in TaskService
- [X] T103 [P] [US1] Return structured JSON response with task details
- [X] T104 [P] [US1] Add error handling for invalid user_id or missing title
- [X] T105 [P] [US1] Register add_task tool with Agent in agent/orchestrator.py
- [ ] T106 [P] [US1] Test tool invocation and parameter passing
- [ ] T107 [P] [US1] Verify Agent interprets "Add task" natural language correctly
- [X] T108 [P] [US1] Create ConversationService in backend/src/services/conversation_service.py
- [X] T109 [P] [US1] Implement create_conversation method
- [X] T110 [P] [US1] Implement append_message method for user messages
- [X] T111 [P] [US1] Add conversation update timestamp logic
- [X] T112 [P] [US1] Create chat endpoint in backend/src/api/routes/chat.py
- [X] T113 [P] [US1] Add JWT authentication to chat endpoint
- [X] T114 [P] [US1] Implement message processing pipeline with Agent
- [X] T115 [P] [US1] Persist user and AI messages to database
- [X] T116 [P] [US1] Load or create latest conversation on first message
- [X] T117 [P] [US1] Return ChatKit-compatible response format
- [X] T118 [P] [US1] Add response streaming support for ChatKit
- [ ] T119 [P] [US1] Implement typing indicator states
- [X] T120 [P] [US1] Add error handling for agent failures
- [X] T121 [P] [US1] Create Pydantic schemas for chat request/response

---

## Phase 4: User Story 2 - View Tasks via Natural Language

**Goal**: Users can request to view their task list through conversation, and AI responds with formatted task list

**Independent Test**: Send "Show my tasks" or "What's pending?" and verify AI returns correct list

- [X] T200 [P] [US2] Create list_tasks MCP tool in backend/src/mcp/tools.py
- [X] T201 [P] [US2] Add optional completed parameter filtering
- [X] T202 [P] [US2] Implement list_tasks database logic in TaskService
- [X] T203 [P] [US2] Return array of task objects with completion status
- [X] T204 [P] [US2] Add error handling for invalid user_id
- [X] T205 [P] [US2] Register list_tasks tool with Agent in agent/orchestrator.py
- [ ] T206 [P] [US2] Test tool invocation with multiple task returns
- [ ] T207 [P] [US2] Verify Agent interprets "Show tasks" correctly
- [X] T208 [P] [US2] Implement get_tasks method in TaskService
- [X] T209 [P] [US2] Add pagination support (limit 100 tasks)
- [X] T210 [P] [US2] Create Pydantic schemas for task list response

---

## Phase 5: User Story 3 - Update Task via Natural Language

**Goal**: Users can modify existing task titles and descriptions through conversation

**Independent Test**: Update a task via conversation and verify changes persist in database

- [X] T300 [P] [US3] Create update_task MCP tool in backend/src/mcp/tools.py
- [X] T301 [P] [US3] Add user_id and task_id required parameters
- [X] T302 [P] [US3] Add optional title and description parameters
- [X] T303 [P] [US3] Implement update_task database logic in TaskService
- [X] T304 [P] [US3] Return updated task object with new values
- [X] T305 [P] [US3] Add error handling for task not found or unauthorized
- [X] T306 [P] [US3] Register update_task tool with Agent in agent/orchestrator.py
- [ ] T307 [P] [US3] Test partial updates (title only or description only)
- [ ] T308 [P] [US3] Verify Agent interprets "Change task" or "Update task" commands
- [X] T309 [P] [US3] Implement update_task method in TaskService
- [X] T310 [P] [US3] Add task exists validation before update
- [X] T311 [P] [US3] Update task modified_at timestamp on successful updates

---

## Phase 6: User Story 4 - Delete Task via Natural Language

**Goal**: Users can remove tasks from their list through conversational commands

**Independent Test**: Delete a task via conversation and verify it no longer appears in database

- [X] T400 [P] [US4] Create delete_task MCP tool in backend/src/mcp/tools.py
- [X] T401 [P] [US4] Add user_id and task_id required parameters
- [X] T402 [P] [US4] Implement delete_task database logic in TaskService
- [X] T403 [P] [US4] Return success confirmation with task_id
- [X] T404 [P] [US4] Add error handling for task not found or unauthorized
- [X] T405 [P] [US4] Register delete_task tool with Agent in agent/orchestrator.py
- [ ] T406 [P] [US4] Test delete operation with cascade (if tasks have messages)
- [ ] T407 [P] [US4] Verify Agent interprets "Delete task" or "Remove task" commands
- [X] T408 [P] [US4] Implement delete_task method in TaskService
- [X] T409 [P] [US4] Add transaction support for delete operation
- [X] T410 [P] [US4] Update conversation timestamp on successful deletion

---

## Phase 7: User Story 5 - Mark Task as Complete via Natural Language

**Goal**: Users can toggle task completion status through conversation

**Independent Test**: Mark a task complete via conversation and verify status persists correctly

- [X] T500 [P] [US5] Create complete_task MCP tool in backend/src/mcp/tools.py
- [X] T501 [P] [US5] Add user_id, task_id, and completed required parameters
- [X] T502 [P] [US5] Implement complete_task database logic in TaskService
- [X] T503 [P] [US5] Return updated task object with completion status
- [X] T504 [P] [US5] Add error handling for task not found or unauthorized
- [X] T505 [P] [US5] Register complete_task tool with Agent in agent/orchestrator.py
- [ ] T506 [P] [US5] Test toggle operation (complete to incomplete and vice versa)
- [ ] T507 [P] [US5] Verify Agent interprets "Mark done", "Complete task", "I finished" commands
- [X] T508 [P] [US5] Implement complete_task method in TaskService
- [X] T509 [P] [US5] Update task modified_at timestamp on status change

---

## Phase 8: User Story 6 - Conversation History Persistence

**Goal**: Users return to the chatbot after closing browser and see their conversation history restored

**Independent Test**: Create a conversation, close browser, reopen, verify history loads correctly

- [X] T600 [P] [US6] Implement get_user_conversations method in ConversationService
- [X] T601 [P] [US6] Add limit 100 conversations per user (FR-028)
- [X] T602 [P] [US6] Return conversations ordered by updated_at DESC
- [X] T603 [P] [US6] Add conversation title auto-generation
- [X] T604 [P] [US6] Implement get_conversation_messages method
- [X] T605 [P] [US6] Add limit 1000 messages per conversation (edge case handling)
- [X] T606 [P] [US6] Return messages ordered by created_at ASC
- [ ] T607 [P] [US6] Add message pagination support
- [ ] T608 [P] [US6] Implement conversation archival for old conversations
- [X] T609 [P] [US6] Add conversation title extraction from first messages
- [X] T610 [P] [US6] Create conversations list API endpoint
- [X] T611 [P] [US6] Add conversation detail API endpoint
- [ ] T612 [P] [US6] Test conversation loading from latest conversation ID
- [ ] T613 [P] [US6] Test conversation loading from specific conversation ID
- [X] T614 [P] [US6] Verify conversation history persists across browser sessions
- [X] T615 [P] [US6] Add conversation switching support (load by ID)
- [X] T616 [P] [US6] Implement "latest" conversation ID handling
- [X] T617 [P] [US6] Return 404 Not Found for invalid conversation_id
- [X] T618 [P] [US6] Create Pydantic schemas for conversation list and detail responses

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T700 [P] Review and optimize database indexes for query performance
- [ ] T701 [P] Add connection pooling to database session management
- [ ] T702 [P] Optimize AgentOrchestrator for sub-5s response time
- [ ] T703 [P] Implement exponential backoff for OpenAI API rate limit errors
- [X] T704 [P] Add retry logic for transient MCP tool failures
- [X] T705 [P] Ensure all MCP tools validate user_id before DB operations
- [X] T706 [P] Add request validation for natural language input sanitization
- [X] T707 [P] Implement graceful error handling for tool invocation failures
- [ ] T708 [P] Add comprehensive logging for debugging chat and tool operations
- [X] T709 [P] Review and optimize rate limiting configuration
- [X] T710 [P] Ensure no hardcoded secrets in code
- [X] T711 [P] Add @spec references to all source files
- [ ] T712 [P] Verify all functional requirements have corresponding tests

---

## File Paths

All file paths use the single project structure from Phase II full-stack web app:

**Backend** (`Phase-II-fullstack-web-app/backend/`):
- Models: `src/models/conversation.py`, `src/models/message.py`
- Services: `src/services/conversation_service.py`
- MCP Server: `src/mcp/server.py`, `src/mcp/tools.py`, `src/mcp/__init__.py`
- Agent: `src/agent/orchestrator.py`, `src/agent/__init__.py`
- API Routes: `src/api/routes/chat.py`
- Schemas: `src/schemas/chat.py`
- Middleware: `src/middleware/rate_limiter.py`
- Tests: `tests/agent/test_orchestrator.py`, `tests/contract/test_mcp_tools.py`, `tests/api/test_chat.py`

**Frontend** (`Phase-II-fullstack-web-app/frontend/`):
- Chat Page: `src/app/chat/page.tsx`
- Components: `src/components/chat/ChatWidget.tsx`, `src/components/chat/MessageList.tsx`, `src/components/chat/TypingIndicator.tsx`
- Services: `src/services/conversation.ts`
- API Client: `src/lib/api.ts` (extended with chat endpoint)
- Types: `src/lib/types.ts` (extended with chat types)

**Documentation** (`specs/003-ai-chatbot/`):
- Plan: `plan.md`
- Research: `research.md`
- Data Model: `data-model.md`
- Contracts: `contracts/chat-api.yaml`, `contracts/mcp-tools.yaml`, `contracts/events.yaml`
- Quickstart: `quickstart.md`
- Tasks: `tasks.md` (this file)

---

## Testing Requirements

### Contract Tests (MCP Tools)
- [X] TC001 [P] Test add_task tool accepts valid user_id and title
- [X] TC002 [P] Test add_task tool rejects missing required fields
- [X] TC003 [P] Test add_task tool handles optional description parameter
- [X] TC004 [P] Test list_tasks tool returns task array correctly
- [X] TC005 [P] Test list_tasks tool handles completed filter
- [X] TC006 [P] Test update_task tool accepts partial updates
- [X] TC007 [P] Test update_task tool returns error for invalid task_id
- [X] TC008 [P] Test delete_task tool returns success confirmation
- [X] TC009 [P] Test delete_task tool returns error for invalid task_id
- [X] TC010 [P] Test complete_task tool accepts completed boolean
- [X] TC011 [P] Test complete_task tool returns error for invalid task_id
- [X] TC012 [P] Test all tools validate user_id before DB operations
- [X] TC013 [P] Test all tools return structured JSON with success/error fields

### Integration Tests (Agent Workflows)
- [X] TI001 [P] [US1] Test Agent adds task when user says "Add buy milk"
- [X] TI002 [P] [US2] Test Agent returns task list when user says "Show my tasks"
- [X] TI003 [P] [US3] Test Agent updates task when user says "Change task 1 to buy groceries"
- [X] TI004 [P] [US4] Test Agent deletes task when user says "Delete task 1"
- [X] TI005 [P] [US5] Test Agent marks complete when user says "Mark task 1 as done"
- [X] TI006 [P] [US6] Test conversation loads when conversation_id is "latest"
- [X] TI007 [P] [US6] Test conversation loads when conversation_id is provided
- [X] TI008 [P] [US6] Test conversation history persists across sessions
- [X] TI009 [P] [US6] Test Agent provides friendly confirmatory responses
- [X] TI010 [P] [US6] Test Agent requests clarification for ambiguous inputs
- [X] TI011 [P] Test Agent handles errors gracefully (task not found)
- [X] TI012 [P] Test conversation updates timestamp on each message

### API Tests (Chat Endpoint)
- [X] TA001 [P] Test chat endpoint returns 401 for missing JWT token
- [X] TA002 [P] Test chat endpoint returns 401 for invalid JWT token
- [X] TA003 [P] Test chat endpoint rejects requests without message content
- [X] TA004 [P] Test chat endpoint creates conversation for first message
- [X] TA005 [P] Test chat endpoint loads latest conversation when conversation_id is "latest"
- [X] TA006 [P] Test chat endpoint loads specific conversation when conversation_id provided
- [X] TA007 [P] Test chat endpoint returns 404 for invalid conversation_id
- [X] TA008 [P] Test chat endpoint persists user and AI messages
- [X] TA009 [P] Test chat endpoint updates conversation timestamp on each message
- [X] TA010 [P] Test chat endpoint returns conversation_id for new conversations
- [X] TA011 [P] Test chat endpoint enforces 60 req/minute rate limit
- [X] TA012 [P] Test chat endpoint returns 429 when rate limit exceeded
- [X] TA013 [P] Test rate limit response includes correct headers
- [X] TA014 [P] Test chat endpoint validates input schema
- [X] TA015 [P] Test chat endpoint returns ChatKit-compatible response format

---

## Success Criteria

### MVP Scope (Minimal Viable Product)
- [ ] SC001 User can add task via natural language
- [ ] SC002 User can view tasks via natural language
- [ ] SC003 User can update task via natural language
- [ ] SC004 User can delete task via natural language
- [ ] SC005 User can mark task complete via natural language
- [ ] SC006 Conversation history persists across browser sessions
- [ ] SC007 Chatbot achieves ≥90% accuracy on test queries
- [ ] SC008 Rate limiting enforces 60 req/minute per user
- [ ] SC009 MCP tools correctly invoked for all operations
- [ ] SC010 Stateless design verified (no in-memory sessions)
- [ ] SC011 Each user sees only their own conversations and tasks

### Quality Gates
- [ ] QG001 All contract tests pass (13/13)
- [ ] QG002 All integration tests pass (12/12)
- [ ] QG003 All API tests pass (15/15)
- [ ] QG004 Test coverage ≥80% for MCP server code
- [ ] QG005 Test coverage ≥70% for agent orchestration code
- [ ] QG006 All code has @spec references (100%)
- [ ] QG007 No hardcoded secrets (API keys in .env only)
- [ ] QG008 All functional requirements have corresponding tests

---

## Dependencies

| Task | Depends On | Description |
|-------|-------------|-------------|
| T001 | None | Project structure setup |
| T002-T010 | T001 | Project configuration depends on structure |
| T011-T028 | T001 | Models depend on session management |
| T029-T037 | T001 | Services depend on models |
| T031-T068 | T001 | API endpoints depend on infrastructure |
| T039-T057 | T034, T045 | Agent depends on MCP tools and services |
| T058-T068 | T056 | API endpoints depend on agent |
| T100-T121 | T100, T108-T112 | US1 depends on MCP tools, services, and API |
| T200-T210 | T200, T208 | US2 depends on MCP tools and services |
| T300-T311 | T300, T309 | US3 depends on MCP tools and services |
| T400-T410 | T400, T408 | US4 depends on MCP tools and services |
| T500-T509 | T500, T508 | US5 depends on MCP tools and services |
| T600-T618 | T600, T108-T112 | US6 depends on services and API |
| T700-T712 | All previous phases | Polish depends on all implementation |
| TC001-TC013 | T034 | Contract tests require MCP tools |
| TI001-TI012 | T105-T112 | Integration tests require Agent and API |

---

## MVP Definition

**MVP**: User Stories 1-5 (Add, View, Update, Delete, Complete Task) only

The MVP includes the core 5 Basic Level features accessible through natural language. Conversation History Persistence (US6) is also required as it's essential for UX but can be considered separate from the task management features.

**Implementation Order for MVP**:
1. Phase 1 (T001-T010) - Setup infrastructure
2. Phase 2 (T011-T068) - Foundational (models, services, API)
3. US1 Phase 3 (T100-T121) - Add Task via Natural Language
4. US2 Phase 3 (T200-T210) - View Tasks via Natural Language
5. US3 Phase 3 (T300-T311) - Update Task via Natural Language
6. US4 Phase 3 (T400-T410) - Delete Task via Natural Language
7. US5 Phase 3 (T500-T509) - Mark Task as Complete via Natural Language
8. Phase 9 (T700-T712) - Polish & Testing

Total tasks for MVP: 70

---

## Notes

### Implementation Strategy
- Follow research.md decisions for technology stack
- Use @spec comments in all code files referencing specs/003-ai-chatbot/spec.md
- Implement stateless MCP tools (no in-memory state)
- All conversation state in PostgreSQL
- Rate limiting per user (not per IP)
- AI responses must be friendly and confirmatory

### Testing Strategy
- Write tests BEFORE implementation (TDD approach)
- Test each user story independently
- Contract tests for MCP tool schemas
- Integration tests for agent workflows
- API tests for chat endpoint behavior
- Manual testing of natural language queries

### Next Steps
1. Execute Phase 1 tasks in order
2. Execute Phase 2 tasks (blocking all US1-US5)
3. Execute US1-US5 tasks in parallel once Phase 2 complete
4. Execute US6 (Conversation History) in parallel with US1-US5
5. Execute Phase 9 (Polish & Testing)
6. Verify all success criteria met
7. Generate demo flows for review

**Task Count**: 70 implementation tasks + 40 test tasks = 110 tasks total

---

**Status**: ✅ Ready for Implementation - All tasks dependency-ordered and ready for execution
