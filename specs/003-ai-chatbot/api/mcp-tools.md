# MCP Tools Specification: AI Chatbot Task Management

**Feature**: AI-Powered Chatbot
**Related**: [spec.md](../spec.md), [features/chatbot.md](../features/chatbot.md)

## Overview

Defines the 5 required MCP (Model Context Protocol) tools that enable the AI agent to perform task management operations. All tools are stateless and require `user_id` as a mandatory parameter for security and user isolation.

## Tool Architecture

### Design Principles

1. **Stateless**: All tools accept `user_id` parameter and store NO state in memory
2. **User Isolation**: Every tool validates `user_id` against the authenticated user
3. **Database-Persisted**: All state is read from and written to PostgreSQL
4. **Structured Responses**: Consistent JSON format with `success`, `data`/`message`, and `error` fields
5. **Error Handling**: Graceful error messages for task not found, invalid parameters, database errors

### Tool Registration Pattern

```python
from mcp import Tool

# Tool registration
@server.tool(
    name="add_task",
    description="Create a new task for the authenticated user"
)
async def add_task_handler(user_id: str, title: str, description: Optional[str] = None) -> dict:
    # Implementation here
    pass
```

## Tool Definitions

### Tool 1: add_task

**Purpose**: Create a new task for the authenticated user.

**Description**: Creates a new task with title (required) and optional description in the user's task list.

**MCP Tool Schema**:
```json
{
  "name": "add_task",
  "description": "Create a new task for the authenticated user",
  "input_schema": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID (UUID format)",
        "format": "uuid"
      },
      "title": {
        "type": "string",
        "description": "The task title (required, max 200 characters)",
        "minLength": 1,
        "maxLength": 200
      },
      "description": {
        "type": "string",
        "description": "Optional task description (max 2000 characters)",
        "maxLength": 2000
      }
    },
    "required": ["user_id", "title"]
  }
}
```

**Input Parameters**:
- `user_id` (required, string, UUID): The authenticated user's ID
- `title` (required, string): The task title (1-200 characters)
- `description` (optional, string): Task description (0-2000 characters)

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation succeeded"
    },
    "task": {
      "type": "object",
      "properties": {
        "id": {"type": "string", "description": "Task UUID"},
        "title": {"type": "string", "description": "Task title"},
        "description": {"type": ["string", "null"], "description": "Task description or null"},
        "completed": {"type": "boolean", "description": "Completion status"},
        "created_at": {"type": "string", "description": "ISO 8601 timestamp"}
      }
    },
    "error": {
      "type": ["string", "null"],
      "description": "Error message if success is false"
    }
  }
}
```

**Success Example**:
```json
{
  "success": true,
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440",
    "title": "Buy groceries",
    "description": null,
    "completed": false,
    "created_at": "2025-12-31T12:00:00Z"
  },
  "error": null
}
```

**Error Examples**:
```json
{
  "success": false,
  "task": null,
  "error": "Title is required and must be between 1 and 200 characters"
}
```

```json
{
  "success": false,
  "task": null,
  "error": "User not found"
}
```

---

### Tool 2: list_tasks

**Purpose**: Retrieve all tasks for the authenticated user, with optional status filtering.

**Description**: Lists all tasks for a user, optionally filtered by completion status (incomplete/completed/all).

**MCP Tool Schema**:
```json
{
  "name": "list_tasks",
  "description": "List all tasks for the authenticated user",
  "input_schema": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID (UUID format)",
        "format": "uuid"
      },
      "status": {
        "type": "string",
        "description": "Filter by completion status: 'incomplete', 'completed', or 'all' (default)",
        "enum": ["incomplete", "completed", "all"],
        "default": "all"
      }
    },
    "required": ["user_id"]
  }
}
```

**Input Parameters**:
- `user_id` (required, string, UUID): The authenticated user's ID
- `status` (optional, string, enum): Filter by status - "incomplete", "completed", or "all" (default)

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation succeeded"
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"},
          "description": {"type": ["string", "null"]},
          "completed": {"type": "boolean"},
          "created_at": {"type": "string"}
        }
      }
    },
    "count": {
      "type": "integer",
      "description": "Total number of tasks"
    },
    "error": {
      "type": ["string", "null"],
      "description": "Error message if success is false"
    }
  }
}
```

**Success Example**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440",
      "title": "Buy groceries",
      "description": null,
      "completed": false,
      "created_at": "2025-12-31T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655441",
      "title": "Pay bills",
      "description": "Electric and water bills",
      "completed": true,
      "created_at": "2025-12-30T15:00:00Z"
    }
  ],
  "count": 2,
  "error": null
}
```

---

### Tool 3: update_task

**Purpose**: Update an existing task's title and/or description.

**Description**: Modifies a task's title and/or description for the authenticated user. At least one field must be updated.

**MCP Tool Schema**:
```json
{
  "name": "update_task",
  "description": "Update an existing task's title and/or description",
  "input_schema": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID (UUID format)",
        "format": "uuid"
      },
      "task_id": {
        "type": "string",
        "description": "The task ID to update (UUID format)",
        "format": "uuid"
      },
      "title": {
        "type": "string",
        "description": "New task title (max 200 characters)",
        "maxLength": 200
      },
      "description": {
        "type": "string",
        "description": "New task description (max 2000 characters)",
        "maxLength": 2000
      }
    },
    "required": ["user_id", "task_id"]
  }
}
```

**Input Parameters**:
- `user_id` (required, string, UUID): The authenticated user's ID
- `task_id` (required, string, UUID): The task ID to update
- `title` (optional, string): New task title (1-200 characters)
- `description` (optional, string): New task description (0-2000 characters)

**Validation**:
- At least one of `title` or `description` must be provided
- `task_id` must exist and belong to `user_id`

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation succeeded"
    },
    "task": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "title": {"type": "string"},
        "description": {"type": ["string", "null"]},
        "completed": {"type": "boolean"},
        "updated_at": {"type": "string", "description": "ISO 8601 timestamp"}
      }
    },
    "error": {
      "type": ["string", "null"],
      "description": "Error message if success is false"
    }
  }
}
```

**Success Example**:
```json
{
  "success": true,
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440",
    "title": "Buy groceries",
    "description": null,
    "completed": false,
    "updated_at": "2025-12-31T12:05:00Z"
  },
  "error": null
}
```

**Error Examples**:
```json
{
  "success": false,
  "task": null,
  "error": "At least one of title or description must be provided"
}
```

```json
{
  "success": false,
  "task": null,
  "error": "Task not found"
}
```

---

### Tool 4: delete_task

**Purpose**: Delete a task from the user's task list.

**Description**: Permanently removes a task from the authenticated user's task list.

**MCP Tool Schema**:
```json
{
  "name": "delete_task",
  "description": "Delete a task from the user's task list",
  "input_schema": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID (UUID format)",
        "format": "uuid"
      },
      "task_id": {
        "type": "string",
        "description": "The task ID to delete (UUID format)",
        "format": "uuid"
      }
    },
    "required": ["user_id", "task_id"]
  }
}
```

**Input Parameters**:
- `user_id` (required, string, UUID): The authenticated user's ID
- `task_id` (required, string, UUID): The task ID to delete

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation succeeded"
    },
    "message": {
      "type": "string",
      "description": "Confirmation message on success, null on error"
    },
    "error": {
      "type": ["string", "null"],
      "description": "Error message if success is false"
    }
  }
}
```

**Success Example**:
```json
{
  "success": true,
  "message": "Task 'Team meeting' has been deleted",
  "error": null
}
```

**Error Examples**:
```json
{
  "success": false,
  "message": null,
  "error": "Task not found"
}
```

---

### Tool 5: complete_task

**Purpose**: Mark a task as complete or incomplete.

**Description**: Toggles the completion status of a task for the authenticated user.

**MCP Tool Schema**:
```json
{
  "name": "complete_task",
  "description": "Mark a task as complete or incomplete",
  "input_schema": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID (UUID format)",
        "format": "uuid"
      },
      "task_id": {
        "type": "string",
        "description": "The task ID to update (UUID format)",
        "format": "uuid"
      },
      "completed": {
        "type": "boolean",
        "description": "True to mark complete, false to mark incomplete"
      }
    },
    "required": ["user_id", "task_id", "completed"]
  }
}
```

**Input Parameters**:
- `user_id` (required, string, UUID): The authenticated user's ID
- `task_id` (required, string, UUID): The task ID to update
- `completed` (required, boolean): True to mark complete, false to mark incomplete

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "Whether the operation succeeded"
    },
    "task": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "title": {"type": "string"},
        "completed": {"type": "boolean"},
        "updated_at": {"type": "string", "description": "ISO 8601 timestamp"}
      }
    },
    "error": {
      "type": ["string", "null"],
      "description": "Error message if success is false"
    }
  }
}
```

**Success Example**:
```json
{
  "success": true,
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440",
    "title": "Pay bills",
    "completed": true,
    "updated_at": "2025-12-31T12:10:00Z"
  },
  "error": null
}
```

**Error Examples**:
```json
{
  "success": false,
  "task": null,
  "error": "Task not found"
}
```

---

## MCP Server Configuration

### Tool Registration

All 5 tools must be registered with the MCP server using the Official MCP SDK:

```python
from mcp.server import Server

server = Server("todo-chatbot-tools")

# Register all tools
@server.tool(name="add_task", description="Create a new task")
async def add_task_handler(user_id: str, title: str, description: Optional[str] = None):
    # Implementation
    pass

@server.tool(name="list_tasks", description="List all tasks")
async def list_tasks_handler(user_id: str, status: Optional[str] = "all"):
    # Implementation
    pass

@server.tool(name="update_task", description="Update a task")
async def update_task_handler(user_id: str, task_id: str, title: Optional[str] = None, description: Optional[str] = None):
    # Implementation
    pass

@server.tool(name="delete_task", description="Delete a task")
async def delete_task_handler(user_id: str, task_id: str):
    # Implementation
    pass

@server.tool(name="complete_task", description="Mark task complete")
async def complete_task_handler(user_id: str, task_id: str, completed: bool):
    # Implementation
    pass
```

### Server Startup

```python
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server

async def main():
    server = Server("todo-chatbot-tools")

    # Register all tools here...

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### Error Handling

All tools must implement consistent error handling:

1. **Validation Errors**: Return structured error with specific message
2. **Database Errors**: Log to stderr, return generic error to client
3. **User ID Validation**: Always verify `user_id` parameter matches authenticated user
4. **Task Ownership**: Verify task belongs to `user_id` before operations
5. **Not Found**: Return clear "Task not found" message

### Security Considerations

1. **Parameter Validation**: Validate UUID format for `user_id` and `task_id`
2. **SQL Injection**: Use SQLModel ORM with parameterized queries (never raw SQL)
3. **User Isolation**: All queries filtered by `user_id` foreign key
4. **Input Sanitization**: Sanitize title and description to prevent prompt injection
5. **Error Messages**: Never expose database internals or stack traces

---

## Agent Integration Patterns

### Tool Invocation Flow

```python
from openai import OpenAI, AsyncOpenAI

async def run_agent(user_id: str, user_message: str):
    client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])

    # Create agent with MCP tools
    agent = await client.agents.create(
        model="gpt-4o",
        name="Todo Assistant",
        instructions="You are a helpful todo task assistant. Use the available tools to manage the user's tasks.",
        tools=mcp_tool_definitions  # From MCP server
    )

    # Run agent with user message
    response = await client.agents.run(
        agent_id=agent.id,
        messages=[{"role": "user", "content": user_message}]
    )

    return response
```

### Tool Call Extraction

The agent must extract and execute tool calls:

```python
# Agent response contains tool_calls
for tool_call in agent_response.tool_calls:
    tool_name = tool_call.function.name
    tool_args = tool_call.function.arguments

    # Execute MCP tool
    result = await execute_mcp_tool(tool_name, tool_args)

    # Feed result back to agent
    await continue_conversation(agent_id, user_message, tool_name, result)
```

### Tool Result Streaming

MCP tools support streaming responses for better UX:

```python
@server.tool(name="list_tasks", description="List all tasks")
async def list_tasks_streaming(user_id: str, status: Optional[str] = "all"):
    # Query tasks from database
    tasks = await get_tasks(user_id, status)

    # Stream tasks one by one
    for task in tasks:
        yield {
            "success": True,
            "task": task.model_dump(),
            "error": None
        }
```

---

## Testing Requirements

### Unit Tests

Each MCP tool must have unit tests:

```python
# tests/test_mcp_tools.py

import pytest
from mcp_tools import add_task_handler, list_tasks_handler

@pytest.mark.asyncio
async def test_add_task_success():
    result = await add_task_handler(
        user_id="test-user-id",
        title="Test task"
    )
    assert result["success"] is True
    assert result["task"]["title"] == "Test task"

@pytest.mark.asyncio
async def test_add_task_missing_title():
    result = await add_task_handler(
        user_id="test-user-id",
        title=""
    )
    assert result["success"] is False
    assert "required" in result["error"].lower()
```

### Integration Tests

Test agent + MCP tool integration:

```python
@pytest.mark.asyncio
async def test_agent_adds_task():
    user_message = "Add task buy milk"
    response = await run_agent("user-123", user_message)

    # Verify agent called add_task tool
    tool_calls = [tc for tc in response.tool_calls if tc.function.name == "add_task"]
    assert len(tool_calls) == 1
    assert "buy milk" in tool_calls[0].function.arguments["title"]
```

---

## Performance Requirements

### Response Time

- **Target**: p95 response time < 500ms for all MCP tool invocations
- **Measurement**: Database query time + JSON serialization

### Rate Limiting

- **Limit**: 60 requests per minute per user_id
- **Implementation**: Redis counter with 1-minute TTL
- **Response**: HTTP 429 Too Many Requests with `Retry-After` header

### Database Optimization

- **Indexing**: Ensure `user_id` foreign key has index for all queries
- **Connection Pooling**: Use SQLModel's connection pooling
- **Query Optimization**: Use specific columns in SELECT (avoid `SELECT *`)

---

## References

- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [MCP SDK Python Documentation](https://github.com/modelcontextprotocol/protocols)
- [OpenAI Agents SDK Documentation](https://platform.openai.com/docs/agents)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)

---

*End of MCP Tools Specification*
