# Phase 0 Research: Technology Decisions

**Feature**: 003-ai-chatbot
**Date**: 2025-12-31
**Status**: Complete

## Overview

This document consolidates technology research and decisions for implementing the AI-powered chatbot interface for the todo application. All decisions align with Phase III requirements and the constitution.

---

## Research Questions & Decisions

### 1. OpenAI ChatKit Integration

**Question**: What is the exact npm package name and installation process for ChatKit? How does ChatKit handle message history persistence vs. manual storage?

**Decision**: Use OpenAI ChatKit for frontend chat UI

**Rationale**:
- OpenAI ChatKit provides a batteries-included framework for building high-quality, AI-powered chat experiences
- Supports deep UI customization, response streaming, and built-in message history management
- Pre-built components reduce frontend development time significantly
- Designed specifically for AI chat applications with production-ready patterns

**Installation**:
```bash
npm install @openai/chatkit
# or
npm install @openai/chatkit-js
```

**Message History**:
- ChatKit handles message history persistence internally for session continuity
- Manual storage is also supported for custom persistence requirements
- For this project, we'll use PostgreSQL for long-term conversation persistence (across browser sessions)
- ChatKit's localStorage integration for `conversation_id` provides session-to-session continuity

**Alternatives Considered**:
- Custom chat UI implementation: More control but significant development overhead
- Third-party chat widgets: Less integration with OpenAI ecosystem
- Rejected due to increased development time and maintenance burden

**Sources**:
- [OpenAI ChatKit Documentation](https://github.com/openai/chatkit-js)
- [OpenAI ChatKit Advanced Samples](https://github.com/openai/openai-chatkit-advanced-samples)

---

### 2. OpenAI Agents SDK MCP Tool Binding

**Question**: How to bind custom MCP tools to an OpenAI Agent? What is the Python API for tool registration?

**Decision**: Use OpenAI Agents SDK Python with `@function_tool` decorator and `HostedMCPTool` class

**Rationale**:
- `@function_tool` decorator provides simple, declarative tool registration
- Automatic schema generation from type hints and docstrings
- Two integration patterns: direct function tools and hosted MCP servers
- Built-in tracing support via OpenAI platform for debugging
- Lightweight primitives: Agents, Handoffs, Guardrails, Sessions

**Implementation Pattern 1: Direct Function Tools** (preferred for this project)
```python
from agents import Agent, Runner, function_tool

@function_tool
async def add_task(user_id: str, title: str, description: str | None = None) -> dict:
    """Create a new task for the user."""
    # SQLModel DB call to create task
    return {"success": True, "task_id": "uuid", "title": title}

agent = Agent(
    name="Todo Assistant",
    instructions="Help users manage their todo tasks through conversation",
    tools=[add_task],
)
```

**Implementation Pattern 2: Hosted MCP Servers** (alternative approach)
```python
from agents import Agent, HostedMCPTool

agent = Agent(
    name="Assistant",
    tools=[
        HostedMCPTool(
            tool_config={
                "type": "mcp",
                "server_label": "todo-tools",
                "server_url": "http://localhost:8000/mcp",
                "require_approval": "never",
            }
        )
    ],
)
```

**Chosen Approach**: Direct function tools using `@function_tool` decorator because:
- Simpler for self-contained task operations
- No external MCP server process needed
- Easier testing and debugging
- Better control over tool execution

**Alternatives Considered**:
- Raw OpenAI API with function calling: More manual, less structured
- LangChain agent framework: Additional abstraction layer not needed
- Rejected due to OpenAI Agents SDK's native MCP support and simpler API

**Sources**:
- [OpenAI Agents Python SDK](https://github.com/openai/openai-agents-python)
- [Agents Documentation](https://github.com/openai/openai-agents-python/blob/main/docs/agents.md)
- [MCP Integration Guide](https://github.com/openai/openai-agents-python/blob/main/docs/mcp.md)

---

### 3. Official MCP SDK for FastAPI

**Question**: What is the Python package for MCP SDK? How to create an MCP server within FastAPI? What is the tool definition format?

**Decision**: Use Official MCP Python SDK (`@modelcontextprotocol/python-sdk`) with `FastMCP` class

**Rationale**:
- Official SDK maintained by Model Context Protocol team
- High benchmark score (89.2) and excellent source reputation
- `FastMCP` provides seamless FastAPI integration
- Built-in support for tools, resources, and prompts
- Async-first design compatible with FastAPI
- Automatic schema generation and validation

**Implementation**:
```python
from mcp.server.fastmcp import FastMCP

# Initialize MCP server with FastAPI integration
mcp = FastMCP("Todo Tools Server")

# Define tools using @mcp.tool() decorator
@mcp.tool()
async def add_task(user_id: str, title: str, description: str | None = None) -> dict:
    """Add a new task for the specified user."""
    # Implement SQLModel CRUD operation
    return {"success": True, "task_id": "task_uuid"}

@mcp.tool()
async def list_tasks(user_id: str) -> list[dict]:
    """List all tasks for the specified user."""
    # Implement SQLModel query
    return [{"task_id": "uuid", "title": "Buy milk", "completed": False}]

@mcp.tool()
async def update_task(user_id: str, task_id: str, title: str | None = None, description: str | None = None) -> dict:
    """Update an existing task."""
    return {"success": True, "task_id": task_id}

@mcp.tool()
async def delete_task(user_id: str, task_id: str) -> dict:
    """Delete a task by ID."""
    return {"success": True, "task_id": task_id}

@mcp.tool()
async def complete_task(user_id: str, task_id: str, completed: bool) -> dict:
    """Mark a task as completed or incomplete."""
    return {"success": True, "task_id": task_id, "completed": completed}

# Run server (defaults to stdio, can use SSE or HTTP)
if __name__ == "__main__":
    mcp.run()
```

**Tool Definition Format**:
- Tools defined using Python type hints (`str`, `int`, `bool`, optional with `| None`)
- Docstrings automatically converted to tool descriptions
- Input schema generated from function parameters
- Output schema inferred from return type hints
- JSON schema validation built-in

**Transport Options**:
- `stdio` (default): Standard input/output for local processes
- `streamable-http`: Low-latency HTTP for internal infrastructure
- `sse`: Server-Sent Events for long-lived connections

**Integration with OpenAI Agents SDK**:
OpenAI Agents SDK can connect to MCP servers via:
- `HostedMCPTool` for remote MCP servers
- Direct function tools for co-located tools (chosen approach)

**Alternatives Considered**:
- Custom MCP server implementation: More work, less standard compliance
- Third-party MCP SDKs: Lower benchmark scores, less official support
- Rejected due to official SDK's proven track record and FastAPI integration

**Sources**:
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Documentation](https://github.com/modelcontextprotocol/python-sdk/blob/main/docs/index.md)
- [FastMCP Examples](https://github.com/modelcontextprotocol/python-sdk/blob/main/README.md)

---

### 4. Rate Limiting Implementation

**Question**: Should we use slowapi, built-in FastAPI middleware, or a custom implementation? How to handle distributed rate limiting across multiple backend instances?

**Decision**: Use SlowAPI (`@laurents/slowapi`) with sliding window algorithm

**Rationale**:
- SlowAPI is specifically designed for Starlette and FastAPI
- High benchmark score (94.6) indicating production readiness
- Simple decorator-based API (`@limiter.limit()`)
- Supports multiple storage backends (in-memory, Redis, Memcached)
- Built-in distributed support for multi-instance deployments
- Response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

**Implementation**:
```python
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# Initialize limiter with user-based key function
def get_user_id(request: Request) -> str:
    """Extract user_id from JWT token for rate limiting key."""
    # Implementation depends on Phase II auth middleware
    return request.state.user_id  # Set by JWT auth middleware

limiter = Limiter(key_func=get_user_id)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply rate limit to chat endpoint
@app.post("/api/{user_id}/chat")
@limiter.limit("60/minute")  # FR-029: 60 requests/minute per user
async def chat_endpoint(request: Request, user_id: str, message: ChatRequest):
    # Handle chat logic
    return ChatResponse(...)
```

**Rate Limit Configuration**:
- **Algorithm**: Sliding window (default) for smooth request distribution
- **Limit**: 60 requests per minute per user (FR-029)
- **Key Function**: `get_user_id` to rate limit per user, not per IP
- **Storage**: In-memory for single-instance, upgrade to Redis for distributed

**Distributed Rate Limiting**:
For multi-instance deployments (Phase IV/V), configure Redis storage:
```python
from slowapi.util import get_remote_address

# Redis configuration for distributed rate limiting
limiter = Limiter(
    key_func=get_user_id,
    storage_uri="redis://localhost:6379/0",  # Redis connection string
    default_limits=["60/minute"],
)
```

**Response Headers** (enabled by default):
- `X-RateLimit-Limit`: 60
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when window resets
- `Retry-After`: Seconds until next request allowed

**Alternatives Considered**:
- Custom FastAPI middleware: More control, more implementation burden
- Cloud rate limiting services (e.g., Cloudflare): External dependency
- `throttled-py`: Higher complexity, SlowAPI is simpler
- Rejected due to SlowAPI's production maturity and FastAPI-specific design

**Sources**:
- [SlowAPI Documentation](https://github.com/laurents/slowapi)
- [FastAPI Rate Limiting Setup](https://github.com/laurents/slowapi/blob/master/docs/index.md)

---

### 5. Conversation History Query Performance

**Question**: With 100 conversations max per user and potentially 1000 messages per conversation, what indexing strategy ensures optimal query performance for loading conversation history?

**Decision**: Use composite indexes on `(user_id, conversation_id)` and `(conversation_id, created_at)` with PostgreSQL

**Rationale**:
- PostgreSQL's composite indexes efficiently handle multi-column filtering
- `user_id` filtering isolates user conversations (FR-003: user isolation)
- `created_at` ordering ensures messages load in correct chronological order
- B-tree indexes optimize `WHERE user_id = ? AND conversation_id = ? ORDER BY created_at DESC`
- Estimated query time: <50ms for 1000 messages with proper indexes

**Indexing Strategy**:

**Conversation Table**:
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Index for user's conversation list queries
CREATE INDEX idx_conversations_user ON conversations(user_id DESC, updated_at DESC);
```

**Messages Table**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    tool_calls JSONB  -- Optional: track AI tool invocations
);

-- Composite index for loading conversation messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Partial index for user's conversation history (e.g., search across conversations)
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
```

**Query Optimization**:

**Load Conversation** (typical operation):
```sql
-- Optimized query with composite index
SELECT id, role, content, created_at, tool_calls
FROM messages
WHERE conversation_id = ?
ORDER BY created_at DESC
LIMIT 100;  -- Optional: paginate for large conversations
```

**User's Conversations List**:
```sql
-- Optimized query with user_id index
SELECT id, title, created_at, updated_at
FROM conversations
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 100;  -- FR-028: Max 100 conversations per user
```

**Performance Considerations**:
- **Conversation archival**: When messages exceed 1000, archive old messages to maintain performance
- **Soft deletes**: Mark as deleted instead of hard delete to preserve query patterns
- **Connection pooling**: Reuse PostgreSQL connections with SQLModel
- **Pagination**: Implement cursor-based pagination for infinite scroll

**Alternatives Considered**:
- Single `created_at` index: Less efficient for `WHERE conversation_id = ?`
- No indexes: Unacceptable performance for >100 messages
- External search (Elasticsearch): Overkill for <100K total messages
- Rejected due to PostgreSQL's built-in B-tree efficiency and lower complexity

**Sources**:
- [PostgreSQL Indexing Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [SQLModel Best Practices](https://sqlmodel.tiangolo.com/)

---

## Technology Stack Summary

| Component | Technology | Version | Package/URL | Decision Rationale |
|------------|-----------|---------|------------------|-------------------|
| Frontend Chat UI | OpenAI ChatKit | `@openai/chatkit-js` | Official framework, built-in streaming, production-ready |
| Agent Orchestration | OpenAI Agents SDK | `openai-agents-python` | Native MCP support, @function_tool decorator, tracing |
| MCP Server | Official MCP SDK | `@modelcontextprotocol/python-sdk` | FastMCP integration, async-first, official support |
| Rate Limiting | SlowAPI | `slowapi` | FastAPI-native, sliding window, distributed support |
| ORM | SQLModel | `sqlmodel` | Reuse from Phase II, Pydantic validation |
| Backend Framework | FastAPI | `fastapi` | Reuse from Phase II, async-native |
| Database | Neon PostgreSQL | N/A | Serverless, existing from Phase II |
| Authentication | Better Auth (JWT) | `better-auth` | Reuse from Phase II, proven security |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|-------|----------|-------------|
| OpenAI API rate limits separate from our 60 req/min | Medium | Document both limits in error messages; implement exponential backoff |
| ChatKit breaking changes | Medium | Pin specific version in package.json; monitor changelog |
| MCP SDK immaturity | Low | Official SDK has high score (89.2); test thoroughly |
| PostgreSQL connection exhaustion | Low | Connection pooling; monitor connection count |
| Redis dependency for distributed rate limiting | Low | Use in-memory for single-instance; Redis only in Phase IV/V |

---

## Dependencies Required

**Backend (requirements.txt)**:
```
# Existing from Phase II
fastapi
sqlmodel
pydantic
better-auth[python]

# New for Phase III
openai-agents-python>=0.2.9
@modelcontextprotocol/python-sdk>=0.3.0
slowapi>=0.1.9
```

**Frontend (package.json)**:
```json
{
  "dependencies": {
    // Existing from Phase II
    "next": "16+",
    "@tanstack/react-query": "^5.0.0",
    "better-auth": "^1.0.0",

    // New for Phase III
    "@openai/chatkit": "^1.0.0",
    "zod": "^4.0.0"
  }
}
```

---

## Acceptance Criteria

All research questions resolved:
- [x] OpenAI ChatKit integration approach determined
- [x] OpenAI Agents SDK MCP tool binding pattern identified
- [x] MCP SDK for FastAPI implementation defined
- [x] Rate limiting strategy selected with distributed support plan
- [x] Conversation history query optimization strategy designed

Technology decisions documented with:
- [x] Decision and rationale for each choice
- [x] Implementation code examples
- [x] Alternatives considered and rejected
- [x] Sources cited
- [x] Risk assessment included
- [x] Dependencies listed

**Status**: ✅ Phase 0 Research Complete - Ready for Phase 1 Design
