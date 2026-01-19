# Implementation Plan: 003-ai-chatbot

**Branch**: `003-ai-chatbot` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ai-chatbot/spec.md`

## Summary

Extend the Phase II full-stack web application with a conversational AI chatbot interface using OpenAI ChatKit for frontend, OpenAI Agents SDK for agent orchestration, and Official MCP SDK for exposing stateless task management tools. The system maintains conversation history in PostgreSQL, provides natural language access to all 5 Basic Level features (Add, View, Update, Delete, Complete), and enforces security through JWT authentication, rate limiting, and user data isolation.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.6+ (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, Official MCP SDK, OpenAI ChatKit, Next.js 16+, SQLModel, Better Auth
**Storage**: Neon PostgreSQL (conversations, messages, tasks tables)
**Testing**: pytest (backend), Vitest (frontend), AI quality tests (natural language response validation)
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: web (frontend + backend)
**Performance Goals**: 5 seconds p95 latency for chat endpoint, 60 requests/minute rate limit per user
**Constraints**: Stateless design - no in-memory sessions, all state in PostgreSQL; rate limiting enforced; JWT authentication required on all chat API calls
**Scale/Scope**: Single MCP server with 5 stateless tools; conversation history limited to 100 per user; support for 20+ natural language phrasings per operation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance with Phase III Requirements

- **Tech Stack Compliance**: ✅ OpenAI ChatKit, OpenAI Agents SDK, Official MCP SDK - all specified in Phase III requirements
- **Security Standards**:
  - Rate limiting: 60 req/minute per user (FR-029) ✅
  - Input sanitization for natural language (FR-030) ✅
  - MCP tools validate user_id before DB operations (FR-020) ✅
  - All state persisted to PostgreSQL, no in-memory sessions (FR-032) ✅
- **Testing Requirements**:
  - Contract tests for MCP tool schemas ✅
  - Integration tests for agent workflows ✅
  - AI quality tests (≥90% accuracy on 20+ sample queries) ✅
  - Coverage: ≥80% MCP server, ≥70% agent code ✅
- **Stateless Design**: ✅ MCP tools are stateless, conversation state in PostgreSQL
- **Spec-Driven Development**: ✅ All code will include @spec references

### Constitution Principles

- **I. Spec-Driven Development**: ✅ Following SDD lifecycle (Spec → Plan → Tasks → Implement)
- **II. AI-Native Architecture**: ✅ Using OpenAI Agents SDK for orchestration
- **III. Progressive Evolution**: ✅ Building on Phase II foundation
- **IV. Cloud-Native and Event-Driven**: ✅ Stateless MCP server design
- **VI. Security and User Isolation**: ✅ JWT auth + user_id validation on all operations
- **VII. Automated Compliance Verification**: ✅ CI checks planned for spec traceability and coverage

### Gates

All gates pass. Proceeding with Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chatbot/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Data model (conversations, messages)
├── quickstart.md        # Phase 1: Quickstart guide
└── contracts/           # Phase 1: API contracts
    ├── chat-api.yaml    # Chat endpoint OpenAPI spec
    ├── mcp-tools.yaml   # MCP tool schemas
    └── events.yaml      # Conversation event schemas
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
Phase-II-fullstack-web-app/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── chat.py              # NEW: Chat endpoint
│   │   ├── mcp/                         # NEW: MCP server
│   │   │   ├── server.py                # MCP server setup
│   │   │   ├── tools.py                 # MCP tool implementations
│   │   │   └── __init__.py
│   │   ├── agent/                       # NEW: Agent orchestration
│   │   │   ├── orchestrator.py          # OpenAI Agents SDK integration
│   │   │   └── __init__.py
│   │   ├── models/
│   │   │   ├── task.py                  # EXISTING: Task model
│   │   │   ├── user.py                  # EXISTING: User model
│   │   │   ├── conversation.py          # NEW: Conversation model
│   │   │   └── message.py               # NEW: Message model
│   │   ├── middleware/
│   │   │   ├── auth.py                  # EXISTING: JWT auth middleware
│   │   │   └── rate_limiter.py          # NEW: Rate limiting middleware
│   │   └── schemas/
│   │       ├── task.py                  # EXISTING: Task schemas
│   │       └── chat.py                  # NEW: Chat request/response schemas
│   ├── tests/
│   │   ├── mcp/                         # NEW: MCP tool tests
│   │   ├── agent/                       # NEW: Agent orchestration tests
│   │   └── api/
│   │       └── test_chat.py             # NEW: Chat endpoint tests
│   └── requirements.txt                 # EXTENDED: New dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── chat/                    # NEW: Chat page
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   └── chat/                    # NEW: Chat components
│   │   │       ├── ChatWidget.tsx       # ChatKit wrapper
│   │   │       ├── MessageList.tsx      # Message display
│   │   │       └── TypingIndicator.tsx  # Loading states
│   │   ├── lib/
│   │   │   ├── api.ts                   # EXTENDED: Chat API client
│   │   │   └── types.ts                 # EXTENDED: Chat types
│   │   └── services/
│   │       └── conversation.ts          # NEW: Conversation management
│   └── package.json                     # EXTENDED: New dependencies
│
└── README.md                             # EXTENDED: Chatbot setup instructions
```

**Structure Decision**: Extending existing Phase II monorepo with new chatbot artifacts. The frontend/backend structure is already established. New modules (mcp/, agent/, chat/) follow existing patterns without disrupting Phase II functionality. This ensures minimal refactoring while maintaining clean separation of concerns.

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           Chat Page with OpenAI ChatKit Widget            │ │
│  │  • Message bubbles (user/AI)                               │ │
│  │  • Typing indicators                                       │ │
│  │  • localStorage for conversation_id                       │ │
│  │  • Multi-line input support                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│                    HTTP POST /api/{user_id}/chat                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              JWT Auth + Rate Limiting Middleware           │ │
│  │  • Validate token, extract user_id                         │ │
│  │  • Enforce 60 req/minute per user                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Chat Endpoint (/api/chat)                 │ │
│  │  1. Load/create conversation from PostgreSQL              │ │
│  │  2. Append user message to conversation                    │ │
│  │  3. Create OpenAI Agent with MCP tools                    │ │
│  │  4. Invoke agent with message + conversation history      │ │
│  │  5. Append AI response to conversation                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            Agent Orchestrator (OpenAI Agents SDK)          │ │
│  │  • Interpret natural language intent                      │ │
│  │  • Route to appropriate MCP tool                          │ │
│  │  • Generate friendly, confirmatory responses               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  MCP Server (Official SDK)                 │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │  add_task(user_id, title, description?)             │  │ │
│  │  │  list_tasks(user_id)                                 │  │ │
│  │  │  update_task(user_id, task_id, title?, description?) │  │ │
│  │  │  delete_task(user_id, task_id)                        │  │ │
│  │  │  complete_task(user_id, task_id, completed)          │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL (Neon Serverless)                   │ │
│  │  • tasks table (from Phase II)                             │ │
│  │  • users table (from Phase II)                             │ │
│  │  • conversations table (NEW)                               │ │
│  │  • messages table (NEW)                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Stateless MCP Tools**: All 5 tools accept `user_id` as required parameter and perform no in-memory state operations. This enables horizontal scaling of backend.

2. **OpenAI Agents SDK Integration**: The SDK provides natural language interpretation, tool invocation routing, and response generation. This reduces custom NLP logic while maintaining flexibility.

3. **Conversation History in PostgreSQL**: Messages are stored with `conversation_id` foreign key. This allows session resumption, multi-device support, and conversation switching.

4. **Rate Limiting per User**: Using a sliding window counter (60 requests/minute) keyed by `user_id` ensures fair usage without blocking legitimate users.

5. **JWT Authentication Reuse**: Extending Phase II's Better Auth JWT infrastructure ensures consistency across all API endpoints.

## Complexity Tracking

> No constitution violations requiring justification. All choices align with Phase III requirements and existing Phase II architecture.

## Phase 0: Research Questions

1. **OpenAI ChatKit Integration**: What is exact npm package name and installation process for ChatKit? How does ChatKit handle message history persistence vs. manual storage?

2. **OpenAI Agents SDK MCP Tool Binding**: How to bind custom MCP tools to an OpenAI Agent? What is the Python API for tool registration?

3. **Official MCP SDK for FastAPI**: What is the Python package for MCP SDK? How to create an MCP server within FastAPI? What is the tool definition format?

4. **Rate Limiting Implementation**: Should we use slowapi, built-in FastAPI middleware, or a custom implementation? How to handle distributed rate limiting across multiple backend instances?

5. **Conversation History Query Performance**: With 100 conversations max per user and potentially 1000 messages per conversation, what indexing strategy ensures optimal query performance for loading conversation history?

## Phase 1: Deliverables

1. **research.md**: Answers to all Phase 0 research questions with technology decisions and rationale.

2. **data-model.md**:
   - Entity definitions: Conversation, Message (extending existing Task, User models)
   - Relationships: User → Conversations → Messages, User → Tasks
   - Validation rules and constraints
   - State transitions (conversation lifecycle)

3. **contracts/**:
   - `chat-api.yaml`: OpenAPI spec for `/api/{user_id}/chat` endpoint
   - `mcp-tools.yaml`: JSON Schema definitions for 5 MCP tools
   - `events.yaml`: Event schemas for conversation events (message_sent, tool_invoked)

4. **quickstart.md**:
   - Step-by-step setup instructions (install dependencies, configure env vars)
   - Running MCP server locally
   - Testing with sample natural language queries
   - Troubleshooting common issues

5. **Agent Context Update**: Update `.claude/agents/*` with new technology information (ChatKit, Agents SDK, MCP SDK).

## Phase 2: Transition to Tasks

After Phase 1 completes, `/sp.tasks` command will generate `tasks.md` with dependency-ordered implementation tasks covering:
- Database migrations (conversations, messages tables)
- MCP server implementation (5 tools)
- Agent orchestration with OpenAI Agents SDK
- Chat API endpoint with streaming support
- Frontend ChatKit integration
- Rate limiting middleware
- Testing (contract, integration, AI quality)

## Next Steps

1. Execute Phase 0 research to resolve all "NEEDS CLARIFICATION" items.
2. Consolidate findings in `research.md`.
3. Generate `data-model.md`, `contracts/`, and `quickstart.md` in Phase 1.
4. Update agent context with new technology information.
5. Re-evaluate Constitution Check post-design.
6. Transition to `/sp.tasks` for implementation task breakdown.

---

**Plan Status**: Draft - Ready for Phase 0 Research
