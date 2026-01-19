# Feature Specification: Phase III - AI-Powered Chatbot

**Feature Branch**: `003-ai-chatbot`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Extend Phase II full-stack web application by adding a conversational AI chatbot interface that allows users to manage their personal todo tasks entirely through natural language, using OpenAI ChatKit frontend, OpenAI Agents SDK for agent logic, and Official MCP SDK for tool exposure"

## Overview

Transform the existing todo application into a natural language interface where users can manage all tasks through conversational AI interactions. The chatbot maintains conversation history across sessions, invokes stateless MCP tools for task operations, and provides friendly confirmatory responses for all actions.

### Target Audience

- **Hackathon Judges**: Evaluating mastery of agentic AI integration and MCP architecture
- **Future Maintainers**: Extending to cloud-native phases with established patterns

### In Scope

**Core Functionality**:
- Conversational task management for all 5 Basic Level features via natural language
  1. Add Task - "Add buy milk tomorrow"
  2. View Task List - "Show my tasks", "What's pending?"
  3. Update Task - "Change task 3 to buy groceries"
  4. Delete Task - "Delete meeting task"
  5. Mark as Complete - "Mark task 2 as done", "I finished paying bills"
- OpenAI ChatKit frontend integration for clean, responsive chat UI
- Backend /api/{user_id}/chat endpoint with stateless design
- MCP server exposing 5 required stateless tools (add_task, list_tasks, update_task, delete_task, complete_task)
- Agent orchestration using OpenAI Agents SDK
- Conversation history persistence in PostgreSQL
- Authentication and user isolation preserved from Phase II
- Friendly, confirmatory AI responses
- Graceful error handling (task not found, invalid ID)
- Rate limiting (60 requests/minute per user)

### Out of Scope

- Intermediate features (priorities, tags, search/filter/sort)
- Advanced features (recurring tasks, due dates, reminders, notifications)
- Voice input/output
- Multi-language support
- Real-time streaming beyond ChatKit capabilities
- Deployment to containers or cloud
- Traditional task list UI removal (it can coexist with chatbot)

## Technology Stack

### Frontend
- **OpenAI ChatKit** - Chat widget and message components
  - Reusable ChatWidget component
  - Built-in message history management
  - Typing indicators and loading states
  - Theme support (light/dark)
- **Next.js 16+** - Existing from Phase II
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling from Phase II

### Backend
- **FastAPI** - Existing framework from Phase II
- **OpenAI Agents SDK** - Agent orchestration and tool calling
  - Agent creation with tools binding
  - Conversation state management
  - Streaming response handling
- **Official MCP SDK** - Model Context Protocol server
  - Tool definition and registration
  - Stateless tool execution
  - Request/response handling
- **SQLModel** - ORM from Phase II

### Database
- **Neon PostgreSQL** - Existing database from Phase II
- **New Tables**:
  - `conversations` - Store conversation metadata
  - `messages` - Store conversation messages

### Authentication
- **Better Auth** - Existing from Phase II
- **JWT** - Session management from Phase II

## User Scenarios & Testing

### User Story 1 - Add Task via Natural Language (Priority: P1)

A user speaks to the chatbot in natural language to create a new task.

**Why this priority**: Add Task is primary CRUD operation. This is the entry point for users to populate their task list through conversation.

**Independent Test**: Can be fully tested by sending natural language messages to create tasks and verifying they appear in database. Delivers value by enabling users to quickly add tasks without UI forms.

**Acceptance Scenarios**:

1. **Given** an authenticated user in chat interface, **When** they send "Add buy milk tomorrow", **Then** AI correctly extracts task title and creates task in database
2. **Given** a user adding task with description, **When** they send "Create task Buy groceries with description: eggs, bread, milk", **Then** AI creates task with title and description
3. **Given** a user with existing tasks, **When** they send "Add task Pay bills tomorrow", **Then** AI creates new task and confirms with task count
4. **Given** a user sending invalid input, **When** they send "Add task" without title, **Then** AI responds requesting clarification for task title

### User Story 2 - View Tasks via Natural Language (Priority: P1)

A user requests to see their task list through conversational interface.

**Why this priority**: View Tasks is core read operation. Users need visibility into their tasks to understand what they've captured.

**Independent Test**: Can be fully tested by asking to view tasks and verifying AI returns correct list format. Delivers value by providing quick overview without navigation.

**Acceptance Scenarios**:

1. **Given** an authenticated user with existing tasks, **When** they send "Show my tasks", **Then** AI responds with formatted list of all tasks including completion status
2. **Given** a user viewing tasks, **When** they ask "What's pending?", **Then** AI returns only incomplete tasks
3. **Given** a user with empty task list, **When** they ask "What tasks do I have?", **Then** AI responds with friendly message that no tasks exist
4. **Given** a user viewing tasks, **When** they ask for specific task details, **Then** AI provides task ID, title, description, and completion status

### User Story 3 - Update Task via Natural Language (Priority: P1)

A user requests to modify an existing task through conversation.

**Why this priority**: Update Task allows users to correct mistakes or refine task descriptions. Essential for task management but depends on having tasks to update.

**Independent Test**: Can be fully tested by updating a task via conversation and verifying changes persist in database. Delivers value by enabling users to quickly modify tasks without forms.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing their tasks, **When** they send "Change task 3 to buy groceries", **Then** AI updates task ID 3 with new title
2. **Given** a user updating task, **When** they send "Update task 1 description to include: eggs and bread", **Then** AI updates task description
3. **Given** a user with non-existent task ID, **When** they send "Update task 999 to new title", **Then** AI responds with helpful error message
4. **Given** a user updating task, **When** changes are saved, **Then** AI confirms update with new task details

### User Story 4 - Delete Task via Natural Language (Priority: P1)

A user requests to remove a task from their list through conversation.

**Why this priority**: Deletion is a destructive operation used less frequently. Users typically complete tasks rather than delete them.

**Independent Test**: Can be fully tested by deleting a task via conversation and verifying it no longer appears in database. Delivers value by enabling users to remove irrelevant tasks.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing their tasks, **When** they send "Delete meeting task", **Then** AI identifies matching task and deletes from database
2. **Given** a user deleting by ID, **When** they send "Delete task 5", **Then** AI removes task with ID 5 and confirms deletion
3. **Given** a user deleting by task name, **When** multiple tasks match, **Then** AI requests clarification "Which task: task A or task B?"
4. **Given** a user deleting task, **When** deletion completes, **Then** AI responds with confirmation and updated task count

### User Story 5 - Mark Task as Complete via Natural Language (Priority: P1)

A user marks a task as completed through conversation.

**Why this priority**: Marking tasks complete is primary user action that indicates progress. Essential for task management but depends on having tasks to mark.

**Independent Test**: Can be fully tested by toggling task completion via conversation and verifying status persists. Delivers value by enabling users to track their progress.

**Acceptance Scenarios**:

1. **Given** an authenticated user with incomplete task, **When** they send "Mark task 2 as done", **Then** AI updates task completion status to true
2. **Given** a user with completed task, **When** they send "I finished paying bills", **Then** AI identifies task and marks as complete
3. **Given** a user toggling completion, **When** they send "Mark task 1 as not done", **Then** AI marks task as incomplete
4. **Given** a user marking complete, **When** operation succeeds, **Then** AI responds with confirmation and updated task list

### User Story 6 - Conversation History Persistence (Priority: P1)

A user returns to the chatbot after closing browser and sees their conversation history restored.

**Why this priority**: Conversation continuity is critical for UX. Users expect their context to be preserved across sessions.

**Independent Test**: Can be fully tested by creating conversation, closing browser, reopening, and verifying messages reload. Delivers value by providing seamless experience.

**Acceptance Scenarios**:

1. **Given** a user with existing conversation, **When** they close and reopen browser, **Then** chatbot displays full conversation history in correct order
2. **Given** a user with multiple conversations, **When** they switch between conversations, **Then** correct conversation loads with all messages
3. **Given** a user returning to chat, **When** no prior conversation exists, **Then** chatbot starts fresh greeting
4. **Given** a user viewing conversation, **When** they send new message, **Then** conversation updates and persists to database

### Edge Cases

- What happens when user provides ambiguous task ID (e.g., "Delete task the one")? AI requests clarification showing available task IDs
- How does system handle concurrent tool invocations from same user? Sequential processing with queuing, no parallel tool calls
- What happens when MCP tool execution fails (database error)? AI responds with helpful error message and suggests retry
- What happens when user exceeds rate limit (60 requests/minute)? System returns 429 Too Many Requests with retry-after header
- How does system handle task not found (invalid UUID)? AI responds with "Task not found. Here are your current tasks:" and lists them
- What happens when conversation exceeds message limit (e.g., 1000 messages)? System creates new conversation archiving old one for reference


## Requirements

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST validate JWT token on every chat API request
- **FR-002**: System MUST extract user_id from JWT and pass to MCP tools
- **FR-003**: System MUST prevent users from accessing other users' conversations or tasks via chat
- **FR-004**: System MUST return 401 Unauthorized for requests with missing or invalid JWT tokens

#### Chat Interface Requirements
- **FR-005**: Frontend MUST integrate OpenAI ChatKit widget for conversational UI
- **FR-006**: Frontend MUST display message bubbles for user (right, blue) and AI (left, gray)
- **FR-007**: Frontend MUST show typing indicators during AI processing
- **FR-008**: Frontend MUST display loading states for network requests
- **FR-009**: Frontend MUST persist conversation_id across browser sessions using localStorage
- **FR-010**: Frontend MUST support message input with multi-line text capability

#### AI Agent Requirements
- **FR-011**: Agent MUST correctly interpret natural language intent for 5 Basic Level features (Add, View, Update, Delete, Complete)
- **FR-012**: Agent MUST invoke appropriate MCP tool based on user intent with correct parameters
- **FR-013**: Agent MUST provide friendly, confirmatory responses for successful operations (e.g., "I've added 'Buy milk' to your tasks")
- **FR-014**: Agent MUST handle errors gracefully with helpful messages
- **FR-015**: Agent MUST request clarification for ambiguous user inputs
- **FR-016**: Agent MUST support multiple phrasings per operation (e.g., "Add task", "Create task", "New task")
- **FR-017**: Agent MUST return task details when user views specific task

#### MCP Tool Requirements
- **FR-018**: MCP server MUST expose exactly 5 required tools: add_task, list_tasks, update_task, delete_task, complete_task
- **FR-019**: All MCP tools MUST be stateless and accept user_id as required parameter
- **FR-020**: MCP tools MUST validate user_id before database operations
- **FR-021**: MCP tools MUST return structured JSON responses with success/error fields
- **FR-022**: MCP tools MUST NOT store any state in memory (all state in PostgreSQL)

#### Conversation Management Requirements
- **FR-023**: System MUST create new conversation when user sends first message or explicitly starts fresh chat
- **FR-024**: System MUST retrieve latest conversation when conversation_id is "latest" or not provided
- **FR-025**: System MUST store all messages (user and AI) in messages table with conversation_id
- **FR-026**: System MUST support conversation titling with auto-generated summaries from first few messages
- **FR-027**: System MUST allow switching between conversations (list conversations + load specific one)
- **FR-028**: System MUST limit conversations to 100 per user to prevent excessive storage

#### Performance & Security Requirements
- **FR-029**: System MUST implement rate limiting of 60 requests per minute per user
- **FR-030**: System MUST validate and sanitize natural language inputs to prevent prompt injection
- **FR-031**: Chat endpoint MUST respond within 5 seconds (p95 latency)
- **FR-032**: System MUST be stateless - no in-memory session storage, all state in PostgreSQL

### Key Entities

- **User**: Managed by Better Auth from Phase II. Contains unique identifier, email, password hash.
- **Conversation**: Represents a chat session for a user. Contains unique identifier, user reference, auto-generated title, created_at timestamp, and optional updated_at.
- **Message**: Represents a single message in a conversation. Contains unique identifier, conversation reference, role (user/assistant/system), content, created_at timestamp, and optional tool_calls field for AI tool invocations.
- **Task**: Managed from Phase II. Contains identifier, user reference, title, description, completion status, created_at/updated_at timestamps.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add a task via natural language in under 10 seconds (AI response time included)
- **SC-002**: Chatbot achieves 90%+ accuracy on 20+ test natural language queries
- **SC-003**: All 5 Basic features functional via natural language with confirmatory responses
- **SC-004**: Conversation history persists correctly across browser sessions (close/reopen test)
- **SC-005**: MCP tools correctly invoked for 100% of test queries
- **SC-006**: Rate limiting prevents abuse - 429 responses when limit exceeded
- **SC-007**: Stateless design verified - multiple backend instances handle same user correctly
- **SC-008**: Each user sees only their own conversations and tasks (user isolation test)
- **SC-009**: AI provides friendly, confirmatory responses for successful operations
- **SC-010**: AI handles errors gracefully (task not found, invalid ID) without crashes

## Assumptions

- Users have modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Users have stable internet connectivity for chat API operations
- OpenAI API key is available and has sufficient quota for agent operations
- Better Auth JWT tokens are 24-hour expiration from Phase II
- Neon PostgreSQL provides reliable serverless database connectivity
- OpenAI ChatKit provides message history management and typing indicators
- OpenAI Agents SDK supports MCP tool binding and streaming responses
- Official MCP SDK allows custom tool registration in FastAPI

## Dependencies

- Phase II full-stack web application (completed) - provides authentication, database, API infrastructure
- OpenAI ChatKit frontend SDK (new)
- OpenAI Agents SDK (new)
- Official MCP SDK for Python (new)
- OpenAI API key for agent intelligence (new)


## Repository Structure Requirements

### Phase III Extensions to Existing Structure

The project extends the existing Phase II monorepo with new chatbot artifacts:

```
/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── chat/         # NEW: Chat page with ChatKit
│   │   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── chat/          # NEW: Chat widgets and wrappers
│   │   │   │   ├── ChatWidget.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   ├── lib/
│   │   │   ├── api.ts         # EXTENDED: Chat endpoint
│   │   │   └── types.ts       # EXTENDED: Chat types
├── backend/                     # FastAPI application
│   ├── src/
│   │   ├── api/routes/
│   │   │   └── chat.py          # NEW: Chat endpoint
│   │   ├── mcp/                 # NEW: MCP server
│   │   │   ├── server.py        # MCP server setup
│   │   │   ├── tools.py         # MCP tool implementations
│   │   │   └── __init__.py
│   │   ├── agent/                # NEW: Agent orchestration
│   │   │   ├── orchestrator.py  # OpenAI Agents SDK integration
│   │   │   └── __init__.py
│   │   └── models/
│   │       ├── conversation.py  # NEW: Conversation SQLModel
│   │       └── message.py       # NEW: Message SQLModel
├── specs/                       # Organized specification files
│   └── 003-ai-chatbot/
│       ├── spec.md              # This file
│       ├── features/
│       │   └── chatbot.md     # User stories and agent behavior
│       ├── api/
│       │   └── mcp-tools.md     # MCP tool schemas
│       ├── database/
│       │   └── schema.md        # Database schema
│       └── ui/
│           └── chatkit.md        # ChatKit integration
├── .spec-kit/                    # SpecKit Plus configuration
│   └── config.yaml             # Updated with phase3-chatbot
└── CLAUDE.md                    # Root AI instructions
```

## Deliverables Checklist

### Required Files in GitHub Repository

#### Configuration
- [ ] `.spec-kit/config.yaml` - Updated with `phase3-chatbot`
- [ ] `CLAUDE.md` (root) - Project-wide AI instructions

#### Specifications
- [ ] `specs/003-ai-chatbot/spec.md` - This specification
- [ ] `specs/003-ai-chatbot/features/chatbot.md` - User stories and agent behavior
- [ ] `specs/003-ai-chatbot/api/mcp-tools.md` - MCP tool schemas and examples
- [ ] `specs/003-ai-chatbot/database/schema.md` - Database schema for conversations/messages
- [ ] `specs/003-ai-chatbot/ui/chatkit.md` - ChatKit integration patterns

#### Frontend Application
- [ ] `/frontend/src/app/chat/page.tsx` - Chat page with ChatKit integration
- [ ] `/frontend/src/components/chat/ChatWidget.tsx` - Chat widget wrapper
- [ ] `/frontend/src/components/chat/MessageList.tsx` - Message list component
- [ ] `/frontend/src/components/chat/TypingIndicator.tsx` - Typing indicator
- [ ] `/frontend/src/lib/api.ts` - Extended API client with chat endpoint
- [ ] `/frontend/src/lib/types.ts` - TypeScript types for chat

#### Backend Application
- [ ] `/backend/src/api/routes/chat.py` - Chat endpoint with agent runner
- [ ] `/backend/src/mcp/server.py` - MCP server with 5 required tools
- [ ] `/backend/src/mcp/tools.py` - MCP tool implementations
- [ ] `/backend/src/mcp/__init__.py` - MCP module init
- [ ] `/backend/src/agent/orchestrator.py` - Agent orchestration with OpenAI Agents SDK
- [ ] `/backend/src/agent/__init__.py` - Agent module init
- [ ] `/backend/src/models/conversation.py` - Conversation SQLModel
- [ ] `/backend/src/models/message.py` - Message SQLModel

#### Infrastructure
- [ ] `README.md` - Updated with chatbot setup instructions
- [ ] `.env.example` - Added OPENAI_API_KEY configuration

#### Evidence
- [ ] Spec versions showing iterative refinement (if applicable)
- [ ] All code generated by Claude Code (no manual coding)
- [ ] Demo flows showing natural language end-to-end functionality

---

## Implementation Plan

See `plan.md` for detailed implementation steps and architecture decisions.

---

## References

- [OpenAI ChatKit Documentation](https://platform.openai.com/docs/chatkit)
- [OpenAI Agents SDK Documentation](https://platform.openai.com/docs/agents)
- [MCP SDK Documentation](https://modelcontextprotocol.io)
- [Better Auth Documentation](https://www.better-auth.com)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)

