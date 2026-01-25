# @spec: specs/003-ai-chatbot/api/mcp-tools.md
# @spec: specs/003-ai-chatbot/research.md (Official MCP SDK Integration)
# MCP server module for task management tools

"""
MCP (Model Context Protocol) Server Module

This module provides both:
1. Official MCP server using FastMCP for tool discovery and standard protocol
2. Legacy tool functions for backward compatibility

The MCP server exposes tools for todo task management:
- add_task: Create a new task
- list_tasks: List all tasks (optionally filtered)
- update_task: Update an existing task
- delete_task: Delete a task
- complete_task: Mark a task as complete/incomplete
"""

# Legacy tool functions (kept for backward compatibility)
from .tools import (
    add_task,
    list_tasks,
    update_task,
    delete_task,
    complete_task,
    ToolResult,
)

# Official MCP server using FastMCP
from .server import (
    create_mcp_server,
    get_mcp_server,
)

__all__ = [
    # Legacy tool functions
    "add_task",
    "list_tasks",
    "update_task",
    "delete_task",
    "complete_task",
    "ToolResult",
    # Official MCP server
    "create_mcp_server",
    "get_mcp_server",
]
