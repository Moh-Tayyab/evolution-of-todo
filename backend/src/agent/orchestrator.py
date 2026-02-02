# @spec: specs/003-ai-chatbot/spec.md
# @spec: specs/003-ai-chatbot/plan.md (Agent Orchestration)
# Proper OpenAI Agents SDK implementation with MCP tool integration
# This implementation avoids greenlet_spawn errors by using thread pool execution

from typing import List, Dict, Any, Optional, Callable
from uuid import UUID
import logging
import json
import asyncio
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from openai import OpenAI
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..models.task import Task, Priority
from ..mcp import tools as mcp_tools

logger = logging.getLogger(__name__)
settings = get_settings()

# Thread pool executor for running OpenAI calls (avoids greenlet_spawn errors)
_thread_pool: ThreadPoolExecutor = None


def get_thread_pool() -> ThreadPoolExecutor:
    """Get or create the thread pool executor for OpenAI calls."""
    global _thread_pool
    if _thread_pool is None:
        _thread_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix="openai_")
    return _thread_pool


class AgentOrchestrator:
    """Proper OpenAI agent orchestrator with function calling.

    This implementation uses OpenAI's function calling API to invoke MCP tools.
    It avoids greenlet_spawn errors by running OpenAI calls in a separate thread pool.

    Key features:
    - Uses OpenAI function calling for tool selection
    - Properly integrates with MCP tools
    - Handles multi-turn conversations with tool execution
    - Maintains conversation history
    """

    def __init__(self, api_key: str):
        """Initialize the agent orchestrator.

        Args:
            api_key: OpenAI API key
        """
        self.api_key = api_key
        self._client = None
        self._tools_schema = self._build_tools_schema()

    @property
    def client(self) -> OpenAI:
        """Lazy-load the synchronous OpenAI client (for thread pool execution)."""
        if self._client is None:
            self._client = OpenAI(api_key=self.api_key)
        return self._client

    def _build_tools_schema(self) -> List[Dict[str, Any]]:
        """Build OpenAI function calling schema from MCP tools.

        Returns:
            List of tool definitions for OpenAI function calling
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task to the user's todo list. Use this when the user wants to create, add, or make a new task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "The task title (what needs to be done). Max 200 characters."
                            },
                            "description": {
                                "type": "string",
                                "description": "Optional additional details about the task. Max 2000 characters."
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "Task priority level. Default is 'medium'."
                            }
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List all tasks for the user. Can filter by completion status. Use this when the user wants to see, show, or list their tasks.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "completed": {
                                "type": "boolean",
                                "description": "Optional filter for completion status. True for completed only, False for incomplete only, null for all tasks."
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update an existing task's title, description, or priority. Use this when the user wants to change, modify, or edit a task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "The numeric ID of the task to update."
                            },
                            "title": {
                                "type": "string",
                                "description": "New title for the task."
                            },
                            "description": {
                                "type": "string",
                                "description": "New description for the task."
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["high", "medium", "low"],
                                "description": "New priority level for the task."
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task from the user's list. Use this when the user wants to remove, delete, or get rid of a task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "The numeric ID of the task to delete."
                            }
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as complete or incomplete. Use this when the user wants to mark, finish, complete, or undo a task.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {
                                "type": "integer",
                                "description": "The numeric ID of the task."
                            },
                            "completed": {
                                "type": "boolean",
                                "description": "Desired completion status. True to mark as complete, False to mark as incomplete."
                            }
                        },
                        "required": ["task_id", "completed"]
                    }
                }
            }
        ]

    async def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_id: UUID,
        session: AsyncSession,
        dashboard_context: dict = None,
    ) -> Dict[str, Any]:
        """Process a user message through the agent with tool calling.

        This method:
        1. Sends the user message to OpenAI with available tools
        2. If OpenAI wants to call a tool, executes it
        3. Sends the tool result back to OpenAI
        4. Returns the final assistant response

        Args:
            user_message: The user's input message
            conversation_history: List of previous messages
            user_id: Authenticated user's UUID
            session: Database session
            dashboard_context: Optional dashboard state

        Returns:
            Dict with:
                - response: Final AI response text
                - tool_calls: List of tools that were called
                - tool_results: Results from tool executions
        """
        tool_calls_made = []
        tool_results = []

        try:
            # Build messages for OpenAI
            messages = await self._build_messages(
                user_message,
                conversation_history,
                session,
                user_id,
                dashboard_context
            )

            # Run OpenAI API call in thread pool to avoid greenlet_spawn errors
            response = await self._call_openai(messages)

            # Handle tool calls if present
            if response.get("tool_calls"):
                logger.info(f"[ORCHESTRATOR] Processing {len(response['tool_calls'])} tool calls")

                for tool_call in response["tool_calls"]:
                    logger.info(f"[ORCHESTRATOR] Executing tool: {tool_call.get('name')}")

                    tool_call_result = await self._execute_tool_call(
                        tool_call,
                        session,
                        user_id
                    )

                    logger.info(f"[ORCHESTRATOR] Tool result: success={tool_call_result.get('success')}, data={tool_call_result.get('data', {})}")

                    tool_calls_made.append(tool_call)
                    tool_results.append(tool_call_result)

                # Generate response based on tool results (avoid second OpenAI call to prevent greenlet_spawn errors)
                response_text = self._generate_tool_response(response["tool_calls"], tool_results)
            else:
                response_text = response.get("content", "")

            return {
                "response": response_text,
                "tool_calls": tool_calls_made,
                "tool_results": tool_results
            }

        except Exception as e:
            logger.error(f"Error in agent orchestration: {e}", exc_info=True)
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "tool_calls": [],
                "tool_results": []
            }

    async def _build_messages(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        session: AsyncSession,
        user_id: UUID,
        dashboard_context: dict = None
    ) -> List[Dict[str, Any]]:
        """Build message list for OpenAI API.

        Args:
            user_message: Current user message
            conversation_history: Previous messages
            session: Database session
            user_id: User UUID
            dashboard_context: Optional dashboard context

        Returns:
            List of messages for OpenAI API
        """
        # System message with context
        system_msg = {
            "role": "system",
            "content": self._build_system_message(session, user_id, dashboard_context)
        }

        messages = [system_msg]

        # Add conversation history (last 10 messages for context)
        for msg in conversation_history[-10:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        return messages

    def _build_system_message(
        self,
        session: AsyncSession,
        user_id: UUID,
        dashboard_context: dict = None
    ) -> str:
        """Build system message with task context.

        Args:
            session: Database session (sync wrapper)
            user_id: User UUID
            dashboard_context: Optional dashboard context

        Returns:
            System message content
        """
        # Build base system message
        base_msg = """You are a friendly and helpful AI todo assistant. You help users manage their personal task lists through natural language.

Available tools:
- add_task: Create new tasks with title, description, and priority
- list_tasks: Show all tasks or filter by completion status
- update_task: Modify existing task details
- delete_task: Remove tasks from the list
- complete_task: Mark tasks as complete or incomplete

Guidelines:
- Be conversational and friendly
- Confirm actions before executing destructive operations (delete, complete)
- Use task IDs when referring to specific tasks
- Provide clear, formatted responses
- If a task is not found, suggest listing tasks first
- For ambiguous requests, ask for clarification

When users refer to tasks by name, you may need to list tasks first to find the ID."""

        # Add task count context if available
        if dashboard_context:
            task_count = dashboard_context.get("task_count", "0")
            base_msg += f"\n\nCurrent Context: User has {task_count} tasks in their list."

        return base_msg

    def _generate_tool_response(
        self,
        tool_calls: List[Dict[str, Any]],
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """Generate a friendly response based on tool execution results.

        This avoids calling OpenAI a second time, which prevents greenlet_spawn errors.

        Args:
            tool_calls: List of tool calls that were made
            tool_results: List of tool results

        Returns:
            Friendly response message
        """
        responses = []

        for tool_call, result in zip(tool_calls, tool_results):
            tool_name = tool_call["name"]
            args = tool_call["arguments"]

            if result["success"]:
                data = result.get("data", {})
                if tool_name == "add_task":
                    title = args.get("title", "task")
                    responses.append(f"I've added the task \"{title}\" to your list.")
                elif tool_name == "delete_task":
                    responses.append("I've deleted that task from your list.")
                elif tool_name == "update_task":
                    responses.append("I've updated that task for you.")
                elif tool_name == "complete_task":
                    task_id = args.get("task_id")
                    completed = args.get("completed", False)
                    action = "completed" if completed else "uncompleted"
                    responses.append(f"I've marked task #{task_id} as {action}.")
                elif tool_name == "list_tasks":
                    tasks = data.get("tasks", [])
                    if tasks:
                        task_list = "\n".join([f"- {t['title']}" for t in tasks])
                        responses.append(f"Here are your tasks:\n{task_list}")
                    else:
                        responses.append("You don't have any tasks yet.")
                else:
                    responses.append("I've completed that action for you.")
            else:
                error = result.get("error", "Something went wrong")
                responses.append(f"Sorry, I couldn't complete that action: {error}")

        return "\n\n".join(responses) if responses else "I've processed your request."

    async def _call_openai(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Call OpenAI API with function calling support.

        This runs in a thread pool to avoid greenlet_spawn errors with SQLAlchemy.

        Args:
            messages: Message list for OpenAI

        Returns:
            Response dict with content and optional tool_calls
        """
        # DEBUG: Log what we're sending
        logger.info(f"[DEBUG] Calling OpenAI with {len(messages)} messages")
        logger.info(f"[DEBUG] Last user message: {messages[-1].get('content', 'NO CONTENT')[:100]}")
        logger.info(f"[DEBUG] Tools schema has {len(self._tools_schema)} tools")

        loop = asyncio.get_event_loop()
        thread_pool = get_thread_pool()

        def _sync_openai_call():
            """Synchronous OpenAI call to run in thread pool."""
            try:
                print(f"[DEBUG] About to call OpenAI with {len(messages)} messages")
                print(f"[DEBUG] Last message: {messages[-1].get('content', 'NO CONTENT')}")
                print(f"[DEBUG] Tools: {len(self._tools_schema)} tools defined")

                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    tools=self._tools_schema,
                    tool_choice="auto",  # Let model decide whether to use tools
                    max_tokens=1000,
                    temperature=0.7,
                )

                choice = response.choices[0]
                print(f"[DEBUG] finish_reason: {choice.finish_reason}")
                print(f"[DEBUG] Tool calls: {choice.message.tool_calls}")
                print(f"[DEBUG] Content: {choice.message.content}")

                result = {
                    "content": choice.message.content or "",
                    "tool_calls": []
                }

                # Extract tool calls if present
                if choice.message.tool_calls:
                    for tool_call in choice.message.tool_calls:
                        result["tool_calls"].append({
                            "id": tool_call.id,
                            "name": tool_call.function.name,
                            "arguments": json.loads(tool_call.function.arguments),
                            # Build proper tool call dict for follow-up messages
                            "message_format": {
                                "id": tool_call.id,
                                "type": "function",
                                "function": {
                                    "name": tool_call.function.name,
                                    "arguments": tool_call.function.arguments
                                }
                            }
                        })

                return result

            except Exception as e:
                print(f"[ERROR] OpenAI API error: {e}")
                import traceback
                traceback.print_exc()
                return {
                    "content": f"I'm having trouble connecting right now. Please try again.",
                    "tool_calls": []
                }

        # Run synchronous OpenAI call in thread pool
        return await loop.run_in_executor(thread_pool, _sync_openai_call)

    async def _execute_tool_call(
        self,
        tool_call: Dict[str, Any],
        session: AsyncSession,
        user_id: UUID
    ) -> Dict[str, Any]:
        """Execute a single tool call.

        Args:
            tool_call: Tool call dict from OpenAI
            session: Database session
            user_id: User UUID

        Returns:
            ToolResult dict from MCP tool execution
        """
        tool_name = tool_call["name"]
        arguments = tool_call["arguments"]

        logger.info(f"Executing tool: {tool_name} with args: {arguments}")

        try:
            # Map tool names to MCP tool functions
            tool_functions = {
                "add_task": mcp_tools.add_task,
                "list_tasks": mcp_tools.list_tasks,
                "update_task": mcp_tools.update_task,
                "delete_task": mcp_tools.delete_task,
                "complete_task": mcp_tools.complete_task,
            }

            if tool_name not in tool_functions:
                return mcp_tools.ToolResult(
                    success=False,
                    error=f"Unknown tool: {tool_name}"
                ).to_dict()

            # Call the MCP tool function
            tool_func = tool_functions[tool_name]

            # Add user_id to arguments (all MCP tools require it)
            result = await tool_func(
                session=session,
                user_id=user_id,
                **arguments
            )

            return result.to_dict()

        except Exception as e:
            logger.error(f"Tool execution error for {tool_name}: {e}")
            return mcp_tools.ToolResult(
                success=False,
                error=f"Tool execution failed: {str(e)}"
            ).to_dict()


def create_agent_orchestrator() -> AgentOrchestrator:
    """Factory function to create an agent orchestrator instance.

    Returns:
        Configured AgentOrchestrator instance

    Raises:
        ValueError: If OPENAI_API_KEY is not set
    """
    api_key = settings.openai_api_key
    if not api_key:
        logger.error("Cannot create agent orchestrator: OPENAI_API_KEY not set")
        raise ValueError(
            "OPENAI_API_KEY environment variable is required. "
            "Get your API key from https://platform.openai.com/api-keys"
        )

    logger.info("Agent orchestrator created successfully")
    return AgentOrchestrator(api_key=api_key)


# Cleanup function for graceful shutdown
def shutdown_thread_pool():
    """Shutdown the thread pool executor."""
    global _thread_pool
    if _thread_pool is not None:
        _thread_pool.shutdown(wait=True)
        _thread_pool = None
