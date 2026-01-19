# Tasks: [FEATURE NAME]

**Feature**: 003-ai-chatbot
**Branch**: 003-ai-chatbot
**Date**: 2025-12-31
**Status**: Ready for Implementation

---

## Overview

This document contains dependency-ordered implementation tasks for the AI chatbot feature. Tasks are organized by user story to enable independent implementation and testing of each functionality.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [Python] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools for [Python] project
- [ ] T004 [P] Setup database schema and migrations framework
- [ ] T005 [P] Configure error handling and logging infrastructure
- [ ] T006 [P] Setup environment configuration management
- [ ] T007 [P] Initialize [TypeScript] project with [framework] dependencies
- [ ] T008 [P] Configure linting and formatting tools for [TypeScript] project
- [ ] T009 [P] Setup testing framework for [backend]
- [ ] T010 [P] Setup testing framework for [frontend]

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T011 [P] Create User model in src/models/user.py
- [ ] T012 [P] Create Task model in src/models/task.py
- [ ] T013 [P] Implement UserService with CRUD operations
- [ ] T014 [P] Create database session management
- [ ] T015 [P] Implement JWT authentication middleware
- [ ] T016 [P] Setup API routing structure
- [ ] T017 [P] Create base API response models
- [ ] T018 [P] Configure Better Auth integration
- [ ] T019 [P] Set up CORS and security headers
- [ ] T020 [P] Create Conversation model in src/models/conversation.py
- [ ] T021 [P] Create Message model in src/models/message.py
- [ ] T022 [P] Add user_id foreign key constraints
- [ ] T023 [P] Create database indexes for query performance
- [ ] T024 [P] Implement conversation repository pattern
- [ ] T025 [P] Implement message repository pattern
- [ ] T026 [P] Create conversation/message relationships
- [ ] T027 [P] Validate foreign key constraints with CASCADE
- [ ] T028 [P] Create Alembic migration for conversations and messages tables
- [ ] T029 [P] Apply migration and verify tables
- [ ] T030 [P] Write migration rollback procedure
- [ ] T031 [P] Create MCP server structure in backend/src/mcp/
- [ ] T032 [P] Initialize FastMCP server instance
- [ ] T033 [P] Create tool base class with common error handling
- [ ] T034 [P] Implement 5 required MCP tools (add_task, list_tasks, update_task, delete_task, complete_task)
- [ ] T035 [P] Add tool validation and error handling
- [ ] T036 [P] Configure MCP server logging
- [ ] T037 [P] Write MCP tool documentation
- [ ] T038 [P] Create agent orchestration structure in backend/src/agent/
- [ ] T039 [P] Initialize OpenAI Agents SDK
- [ ] T040 [P] Create Agent base class with tool registration
- [ ] T041 [P] Implement agent message processing logic
- [ ] T042 [P] Add conversation history retrieval
- [ ] T043 [P] Add tool invocation tracking
- [ ] T044 [P] Implement streaming response support
- [ ] T045 [P] Create agent service layer in backend/src/services/
- [ ] T046 [P] Implement AgentOrchestrator with retry logic
- [ ] T047 [P] Add error handling for agent failures
- [ ] T048 [P] Create API routing structure in backend/src/api/routes/
- [ ] T049 [P] Create chat endpoint handler
- [ ] T050 [P] Implement JWT extraction from request
- [ ] T051 [P] Integrate AgentOrchestrator
- [ ] T052 [P] Add conversation loading/creation logic
- [ ] T053 [P] Implement message persistence to database
- [ ] T054 [P] Add conversation update timestamp refresh
- [ ] T055 [P] Return ChatKit-compatible response format
- [ ] T056 [P] Create request/response Pydantic schemas
- [ ] T057 [P] Add rate limiting integration
- [ ] T058 [P] Implement rate limit exceeded error handling
- [ ] T059 [P] Configure CORS for frontend
- [ ] T060 [P] Add request/response validation
- [ ] T061 [P] Create conversations list endpoint
- [ ] T062 [P] Implement conversation detail endpoint
- [ ] T063 [P] Add authentication middleware
- [ ] T064 [P] Create rate limiting middleware
- [ ] T065 [P] Implement sliding window rate limiter
- [ ] T066 [P] Configure rate limit headers
- [ ] T067 [P] Add error handling middleware
- [ ] T068 [P] Write API error response schemas

---

## Phase 3: User Story 1 - Add Task via Natural Language

**Goal**: Users can add a task through conversational AI interface with natural language commands like "Add buy milk tomorrow"

**Independent Test**: Send natural language messages to create tasks and verify they appear in database

- [ ] T100 [P] [US1] Create add_task MCP tool in backend/src/mcp/tools.py
- [ ] T101 [P] [US1] Add user_id parameter validation to add_task tool
- [ ] T102 [P] [US1] Implement add_task database logic in TaskService
- [ ] T103 [P] [US1] Return structured JSON response with task details
- [ ] T104 [P] [US1] Add error handling for invalid user_id or missing title
- [ ] T105 [P] [US1] Register add_task tool with Agent in agent/orchestrator.py
- [ ] T106 [P] [US1] Test tool invocation and parameter passing
- [ ] T107 [P] [US1] Verify Agent interprets "Add task" natural language correctly
- [ ] T108 [P] [US1] Create ConversationService in backend/src/services/conversation_service.py
- [ ] T109 [P] [US1] Implement create_conversation method
- [ ] T110 [P] [US1] Implement append_message method for user messages
- [ ] T111 [P] [US1] Add conversation update timestamp logic
- [ ] T112 [P] [US1] Create chat endpoint in backend/src/api/routes/chat.py
- [ ] T113 [P] [US1] Add JWT authentication to chat endpoint
- [ ] T114 [P] [US1] Implement message processing pipeline with Agent
- [ ] T115 [P] [US1] Persist user and AI messages to database
- [ ] T116 [P] [US1] Load or create latest conversation on first message
- [ ] T117 [P] [US1] Return ChatKit-compatible response format
- [ ] T118 [P] [US1] Add response streaming support for ChatKit
- [ ] T119 [P] [US1] Implement typing indicator states
- [ ] T120 [P] [US1] Add error handling for agent failures
- [ ] T121 [P] [US1] Create Pydantic schemas for chat request/response

---

## Phase 4: User Story 2 - View Tasks via Natural Language

**Goal**: Users can request to view their task list through conversation, and AI responds with formatted task list

**Independent Test**: Send "Show my tasks" or "What's pending?" and verify AI returns correct list

- [ ] T200 [P] [US2] Create list_tasks MCP tool in backend/src/mcp/tools.py
- [ ] T201 [P] [US2] Add optional completed parameter filtering
- [ ] T202 [P] [US2] Implement list_tasks database logic in TaskService
- [ ] T203 [P] [US2] Return array of task objects with completion status
- [ ] T204 [P] [US2] Add error handling for invalid user_id
- [ ] T205 [P] [US2] Register list_tasks tool with Agent in agent/orchestrator.py
- [ ] T206 [P] [US2] Test tool invocation with multiple task returns
- [ ] T207 [P] [US2] Verify Agent interprets "Show tasks" correctly
- [ ] T208 [P] [US2] Implement get_tasks method in TaskService
- [ ] T209 [P] [US2] Add pagination support (limit 100 tasks)
- [ ] T210 [P] [US2] Create Pydantic schemas for task list response

---

## Phase 5: User Story 3 - Update Task via Natural Language

**Goal**: Users can modify existing task titles and descriptions through conversation

**Independent Test**: Update a task via conversation and verify changes persist in database

- [ ] T300 [P] [US3] Create update_task MCP tool in backend/src/mcp/tools.py
- [ ] T301 [P] [US3] Add user_id and task_id required parameters
- [ ] T302 [P] [US3] Add optional title and description parameters
- [ ] T303 [P] [US3] Implement update_task database logic in TaskService
- [ ] T304 [P] [US3] Return updated task object with new values
- [ ] T305 [P] [US3] Add error handling for task not found or unauthorized
- [ ] T306 [P] [US3] Register update_task tool with Agent in agent/orchestrator.py
- [ ] T307 [P] [US3] Test partial updates (title only or description only)
- [ ] T308 [P] [US3] Verify Agent interprets "Change task" or "Update task" commands
- [ ] T309 [P] [US3] Implement update_task method in TaskService
- [ ] T310 [P] [US3] Add task exists validation before update
- [ ] T311 [P] [US3] Update task modified_at timestamp on successful updates

---

## Phase 6: User Story 4 - Delete Task via Natural Language

**Goal**: Users can remove tasks from their list through conversational commands

**Independent Test**: Delete a task via conversation and verify it no longer appears in database

- [ ] T400 [P] [US4] Create delete_task MCP tool in backend/src/mcp/tools.py
- [ ] T401 [P] [US4] Add user_id and task_id required parameters
- [ ] T402 [P] [US4] Implement delete_task database logic in TaskService
- [ ] T403 [P] [US4] Return success confirmation with task_id
- [ ] T404 [P] [US4] Add error handling for task not found or unauthorized
- [ ] T405 [P] [US4] Register delete_task tool with Agent in agent/orchestrator.py
- [ ] T406 [P] [US4] Test delete operation with cascade (if tasks have messages)
- [ ] T407 [P] [US4] Verify Agent interprets "Delete task" or "Remove task" commands
- [ ] T408 [P] [US4] Implement delete_task method in TaskService
- [ ] T409 [P] [US4] Add transaction support for delete operation
- [ ] T410 [P] [US4] Update conversation timestamp on successful deletion

---

## Phase 7: User Story 5 - Mark Task as Complete via Natural Language

**Goal**: Users can toggle task completion status through conversation

**Independent Test**: Mark a task complete via conversation and verify status persists correctly

- [ ] T500 [P] [US5] Create complete_task MCP tool in backend/src/mcp/tools.py
- [ ] T501 [P] [US5] Add user_id, task_id, and completed required parameters
- [ ] T502 [P] [US5] Implement complete_task database logic in TaskService
- [ ] T503 [P] [US5] Return updated task object with completion status
- [ ] T504 [P] [US5] Add error handling for task not found or unauthorized
- [ ] T505 [P] [US5] Register complete_task tool with Agent in agent/orchestrator.py
- [ ] T506 [P] [US5] Test toggle operation (complete to incomplete and vice versa)
- [ ] T507 [P] [US5] Verify Agent interprets "Mark done", "Complete task", "I finished" commands
- [ ] T508 [P] [US5] Implement complete_task method in TaskService
- [ ] T509 [P] [US5] Update task modified_at timestamp on status change

---

## Phase 8: User Story 6 - Conversation History Persistence

**Goal**: Users return to the chatbot after closing browser and see their conversation history restored

**Independent Test**: Create a conversation, close browser, reopen, verify history loads correctly

- [ ] T600 [P] [US6] Implement get_user_conversations method in ConversationService
- [ ] T601 [P] [US6] Add limit 100 conversations per user (FR-028)
- [ ] T602 [P] [US6] Return conversations ordered by updated_at DESC
- [ ] T603 [P] [US6] Add conversation title auto-generation
- [ ] T604 [P] [US6] Implement get_conversation_messages method
- [ ] T605 [P] [US6] Add limit 1000 messages per conversation (edge case handling)
- [ ] T606 [P] [US6] Return messages ordered by created_at ASC
- [ ] T607 [P] [US6] Add message pagination support
- [ ] T608 [P] [US6] Implement conversation archival for old conversations
- [ ] T609 [P] [US6] Add conversation title extraction from first messages
- [ ] T610 [P] [US6] Create conversations list API endpoint
- [ ] T611 [P] [US6] Add conversation detail API endpoint
- [ ] T612 [P] [US6] Test conversation loading from latest conversation ID
- [ ] T613 [P] [US6] Test conversation loading from specific conversation ID
- [ ] T614 [P] [US6] Verify conversation history persists across browser sessions
- [ ] T615 [P] [US6] Add conversation switching support (load by ID)
- [ ] T616 [P] [US6] Implement "latest" conversation ID handling
- [ ] T617 [P] [US6] Return 404 Not Found for invalid conversation_id
- [ ] T618 [P] [US6] Create Pydantic schemas for conversation list and detail responses

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T700 [P] Review and optimize database indexes for query performance
- [ ] T701 [P] Add connection pooling to database session management
- [ ] T702 [P] Optimize AgentOrchestrator for sub-5s response time
- [ ] T703 [P] Implement exponential backoff for OpenAI API rate limit errors
- [ ] T704 [P] Add retry logic for transient MCP tool failures
- [ ] T705 [P] Ensure all MCP tools validate user_id before DB operations
- [ ] T706 [P] Add request validation for natural language input sanitization
- [ ] T707 [P] Implement graceful error handling for tool invocation failures
- [ ] T708 [P] Add comprehensive logging for debugging chat and tool operations
- [ ] T709 [P] Review and optimize rate limiting configuration
- [ ] T710 [P] Ensure no hardcoded secrets in code
- [ ] T711 [P] Add @spec references to all source files
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
- [ ] TC001 [P] Test add_task tool accepts valid user_id and title
- [ ] TC002 [P] Test add_task tool rejects missing required fields
- [ ] TC003 [P] Test add_task tool handles optional description parameter
- [ ] TC004 [P] Test list_tasks tool returns task array correctly
- [ ] TC005 [P] Test list_tasks tool handles completed filter
- [ ] TC006 [P] Test update_task tool accepts partial updates
- [ ] TC007 [P] Test update_task tool returns error for invalid task_id
- [ ] TC008 [P] Test delete_task tool returns success confirmation
- [ ] TC009 [P] Test delete_task tool returns error for invalid task_id
- [ ] TC010 [P] Test complete_task tool accepts completed boolean
- [ ] TC011 [P] Test complete_task tool returns error for invalid task_id
- [ ] TC012 [P] Test all tools validate user_id before DB operations
- [ ] TC013 [P] Test all tools return structured JSON with success/error fields

### Integration Tests (Agent Workflows)
- [ ] TI001 [P] [US1] Test Agent adds task when user says "Add buy milk"
- [ ] TI002 [P] [US2] Test Agent returns task list when user says "Show my tasks"
- [ ] TI003 [P] [US3] Test Agent updates task when user says "Change task 1 to buy groceries"
- [ ] TI004 [P] [US4] Test Agent deletes task when user says "Delete task 1"
- [ ] TI005 [P] [US5] Test Agent marks complete when user says "Mark task 1 as done"
- [ ] TI006 [P] [US6] Test conversation loads when conversation_id is "latest"
- [ ] TI007 [P] [US6] Test conversation loads when conversation_id is provided
- [ ] TI008 [P] [US6] Test conversation history persists across sessions
- [ ] TI009 [P] [US6] Test Agent provides friendly confirmatory responses
- [ ] TI010 [P] [US6] Test Agent requests clarification for ambiguous inputs
- [ ] TI011 [P] Test Agent handles errors gracefully (task not found)
- [ ] TI012 [P] Test conversation updates timestamp on each message

### API Tests (Chat Endpoint)
- [ ] TA001 [P] Test chat endpoint returns 401 for missing JWT token
- [ ] TA002 [P] Test chat endpoint returns 401 for invalid JWT token
- [ ] TA003 [P] Test chat endpoint rejects requests without message content
- [ ] TA004 [P] Test chat endpoint creates conversation for first message
- [ ] TA005 [P] Test chat endpoint loads latest conversation when conversation_id is "latest"
- [ ] TA006 [P] Test chat endpoint loads specific conversation when conversation_id provided
- [ ] TA007 [P] Test chat endpoint returns 404 for invalid conversation_id
- [ ] TA008 [P] Test chat endpoint persists user and AI messages
- [ ] TA009 [P] Test chat endpoint updates conversation timestamp on each message
- [ ] TA010 [P] Test chat endpoint returns conversation_id for new conversations
- [ ] TA011 [P] Test chat endpoint enforces 60 req/minute rate limit
- [ ] TA012 [P] Test chat endpoint returns 429 when rate limit exceeded
- [ ] TA013 [P] Test rate limit response includes correct headers
- [ ] TA014 [P] Test chat endpoint validates input schema
- [ ] TA015 [P] Test chat endpoint returns ChatKit-compatible response format

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
