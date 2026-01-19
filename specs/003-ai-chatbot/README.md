# Phase III - AI-Powered Chatbot Specification Summary

**Feature Branch**: `003-ai-chatbot`
**Created**: 2025-12-31
**Status**: Draft - Complete

## Quick Reference

This document provides an overview of all Phase III specifications for quick reference during implementation.

## Specification Files

| File | Purpose | Key Sections |
|-------|----------|--------------|
| [spec.md](spec.md) | Main specification with all requirements, success criteria, constraints |
| [features/chatbot.md](features/chatbot.md) | User stories and agent behavior patterns |
| [api/mcp-tools.md](api/mcp-tools.md) | MCP tool schemas and implementation contracts |
| [database/schema.md](database/schema.md) | Database schema for conversations and messages |
| [ui/chatkit.md](ui/chatkit.md) | ChatKit integration patterns and components |

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ (from Phase II)
- **Chat Widget**: OpenAI ChatKit
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS (from Phase II)

### Backend
- **API Framework**: FastAPI (from Phase II)
- **Agent SDK**: OpenAI Agents SDK
- **MCP Server**: Official MCP SDK for Python
- **Database**: Neon PostgreSQL (from Phase II)
- **ORM**: SQLModel (from Phase II)

### Authentication
- **Auth Provider**: Better Auth (from Phase II)
- **Token Strategy**: JWT (24-hour expiration from Phase II)

## Feature Summary

### 5 Basic Level Features (via Natural Language)

| Feature | Description | User Story |
|----------|-------------|-------------|
| Add Task | "Add buy milk tomorrow" | US-001 |
| View Tasks | "Show my tasks" | US-002 |
| Update Task | "Change task 3 to buy groceries" | US-003 |
| Delete Task | "Delete meeting task" | US-004 |
| Mark as Complete | "Mark task 2 as done" | US-005 |

### 5 Required MCP Tools

| Tool | Purpose | Input | File |
|------|---------|-------|------|
| add_task | Create new task | user_id, title, description (optional) | See api/mcp-tools.md |
| list_tasks | List all tasks | user_id, status (optional) | See api/mcp-tools.md |
| update_task | Update task | user_id, task_id, title (optional), description (optional) | See api/mcp-tools.md |
| delete_task | Delete task | user_id, task_id | See api/mcp-tools.md |
| complete_task | Mark task complete/incomplete | user_id, task_id, completed | See api/mcp-tools.md |

## Database Schema (New Tables)

### Conversations Table
| Column | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Unique conversation identifier |
| user_id | UUID (FK) | Owner reference |
| title | VARCHAR(100) | Auto-generated title |
| message_count | INTEGER | Total messages |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last message timestamp |

### Messages Table
| Column | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | Unique message identifier |
| conversation_id | UUID (FK) | Conversation reference |
| user_id | UUID (FK) | Owner reference |
| role | VARCHAR(10) | user/assistant/system |
| content | TEXT | Message content |
| tool_calls | JSON | Optional tool invocation details |
| created_at | TIMESTAMP | Creation timestamp |

## Key Design Decisions

### 1. Stateless Architecture
**Decision**: All conversation and message state stored in PostgreSQL, no in-memory sessions
**Rationale**: Supports multiple backend instances, better scalability, data persistence across sessions

### 2. Conversation History Persistence
**Decision**: Conversations persisted with auto-generated titles and message preview
**Rationale**: Users can switch between conversations, context preserved across browser sessions

### 3. MCP Tool Statelessness
**Decision**: All MCP tools are stateless, require user_id as parameter
**Rationale**: Security and user isolation enforced at tool level, no state management complexity

### 4. Rate Limiting
**Decision**: 60 requests per minute per user_id
**Rationale**: Prevents abuse while allowing legitimate usage, aligns with API best practices

### 5. Conversation Message Limit
**Decision**: Maximum 100 messages per conversation, auto-archive when exceeded
**Rationale**: Prevents excessive storage, maintains performance

## API Endpoints

### New Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/{user_id}/chat | Chat endpoint with agent runner |
| GET | /api/{user_id}/conversations | List all conversations for user |
| GET | /api/{user_id}/conversations/{conversation_id}/messages | Get messages for a conversation |

### Existing Endpoints (Phase II)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /api/{user_id}/tasks | List tasks (used by list_tasks tool) |
| POST | /api/{user_id}/tasks | Create task (used by add_task tool) |
| PUT | /api/{user_id}/tasks/{task_id} | Update task (used by update_task tool) |
| PATCH | /api/{user_id}/tasks/{task_id} | Partial update (used by complete_task tool) |
| DELETE | /api/{user_id}/tasks/{task_id} | Delete task (used by delete_task tool) |

## Success Criteria

### Functional
- [ ] All 5 Basic features functional via natural language
- [ ] AI accurately invokes correct MCP tool (95%+ accuracy)
- [ ] Conversation history persists across browser sessions
- [ ] Each user sees only their own conversations and tasks

### Performance
- [ ] Chat response time < 5 seconds (p95)
- [ ] Rate limiting functional (60 requests/minute)
- [ ] Stateless design verified (multi-instance test)

### Security
- [ ] MCP tools validate user_id before DB operations
- [ ] All state persisted to PostgreSQL (no in-memory sessions)
- [ ] Input sanitization prevents prompt injection

### User Experience
- [ ] Chat UI responsive (320px - 1920px)
- [ ] Typing indicators shown during AI processing
- [ ] Loading states displayed for network requests
- [ ] Error messages user-friendly and actionable

## Implementation Checklist

### Specifications
- [x] spec.md - Main specification created
- [x] features/chatbot.md - User stories and agent behavior
- [x] api/mcp-tools.md - MCP tool schemas and contracts
- [x] database/schema.md - Database schema for conversations/messages
- [x] ui/chatkit.md - ChatKit integration patterns

### Code Generation
- [ ] Frontend: Chat page with ChatKit integration
- [ ] Frontend: Chat components (MessageList, TypingIndicator, InputArea)
- [ ] Frontend: API client extended with chat endpoint
- [ ] Frontend: TypeScript types for chat
- [ ] Backend: Chat endpoint with agent runner
- [ ] Backend: MCP server with 5 required tools
- [ ] Backend: MCP tool implementations
- [ ] Backend: Agent orchestration with OpenAI Agents SDK
- [ ] Backend: Conversation and Message SQLModels
- [ ] Backend: Database migrations for new tables

### Documentation
- [ ] README.md updated with Phase III setup instructions
- [ ] .env.example updated with OPENAI_API_KEY

### Evidence
- [ ] Spec versions show iterative refinement
- [ ] All code generated by Claude Code (no manual coding)
- [ ] Demo flows showing natural language E2E functionality

## Next Steps

1. Review all specification files for completeness
2. Run `/sp.clarify` to resolve any underspecified areas
3. Run `/sp.plan` to create implementation plan
4. Run `/sp.tasks` to generate task breakdown
5. Begin implementation using `/sp.implement`

## References

- [Main Spec](spec.md)
- [Features](features/chatbot.md)
- [MCP Tools](api/mcp-tools.md)
- [Database Schema](database/schema.md)
- [ChatKit UI](ui/chatkit.md)
- [OpenAI ChatKit Docs](https://platform.openai.com/docs/chatkit)
- [OpenAI Agents SDK](https://platform.openai.com/docs/agents)
- [MCP Protocol](https://modelcontextprotocol.io)

---

*Phase III Specification Summary*
