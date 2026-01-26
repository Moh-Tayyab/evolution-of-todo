# @spec: specs/003-ai-chatbot/spec.md
# @spec: specs/003-ai-chatbot/research.md (Section 2: OpenAI Agents SDK)
# @spec: specs/003-ai-chatbot/api/mcp-tools.md (Official MCP SDK Integration)
# Agent orchestrator using OpenAI Agents SDK with MCP tools

from typing import List, Dict, Any, Optional
from uuid import UUID
import logging

from agents import Agent, Runner, function_tool
from agents import OpenAIChatCompletionsModel
from agents.run import RunResult

from ..mcp.server import get_mcp_server
from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def create_agent(session, user_id: UUID) -> Agent:
    """Create an OpenAI Agent with MCP tools from FastMCP server.

    The agent is configured with:
    - Friendly instructions for conversational task management
    - MCP tools for CRUD operations on tasks (exposed via FastMCP)
    - OpenAI GPT model for natural language understanding

    The MCP server provides:
    - add_task: Create a new task
    - list_tasks: List all tasks (optionally filtered)
    - update_task: Update an existing task
    - delete_task: Delete a task
    - complete_task: Mark a task as complete/incomplete

    Args:
        session: Database session for tool operations
        user_id: Authenticated user's UUID (passed to tools for authorization)

    Returns:
        Configured Agent instance with MCP tools
    """
    # Get the MCP server instance
    mcp_server = get_mcp_server()

    # Set the session context for MCP tools
    # This allows MCP tools to access the database session and user ID
    mcp_server.set_session_context(session, user_id)

    # Create wrapper functions that call MCP tools
    # These wrappers provide the interface expected by OpenAI Agents SDK

    async def add_task_wrapper(title: str, description: str = None, priority: str = "medium") -> str:
        """Add a new task to the user's todo list.

        Args:
            title: The task title (what needs to be done)
            description: Optional additional details about the task
            priority: Task priority (high/medium/low)

        Returns:
            Confirmation message with task details
        """
        # Set context for this request
        mcp_server.set_session_context(session, user_id)

        # Get the tool and call it
        tool = await mcp_server.get_tool("add_task")
        result = await tool.fn(title=title, description=description, priority=priority)

        return result

    async def list_tasks_wrapper(completed: bool = None) -> str:
        """List all tasks for the user.

        Args:
            completed: Optional filter for completion status (true/false)

        Returns:
            Formatted list of tasks with completion status
        """
        # Set context for this request
        mcp_server.set_session_context(session, user_id)

        # Get the tool and call it
        tool = await mcp_server.get_tool("list_tasks")
        result = await tool.fn(completed=completed)

        return result

    async def update_task_wrapper(task_id: int, title: str = None, description: str = None, priority: str = None) -> str:
        """Update an existing task.

        Args:
            task_id: The ID of the task to update
            title: New title for the task
            description: New description for the task
            priority: New priority for the task

        Returns:
            Confirmation message with updated task details
        """
        # Set context for this request
        mcp_server.set_session_context(session, user_id)

        # Get the tool and call it
        tool = await mcp_server.get_tool("update_task")
        result = await tool.fn(task_id=task_id, title=title, description=description, priority=priority)

        return result

    async def delete_task_wrapper(task_id: int) -> str:
        """Delete a task.

        Args:
            task_id: The ID of the task to delete

        Returns:
            Confirmation message
        """
        # Set context for this request
        mcp_server.set_session_context(session, user_id)

        # Get the tool and call it
        tool = await mcp_server.get_tool("delete_task")
        result = await tool.fn(task_id=task_id)

        return result

    async def complete_task_wrapper(task_id: int, completed: bool = True) -> str:
        """Mark a task as complete or incomplete.

        Args:
            task_id: The ID of the task to update
            completed: Whether the task is complete (true) or incomplete (false)

        Returns:
            Confirmation message with new status
        """
        # Set context for this request
        mcp_server.set_session_context(session, user_id)

        # Get the tool and call it
        tool = await mcp_server.get_tool("complete_task")
        result = await tool.fn(task_id=task_id, completed=completed)

        return result

    # Create the agent with MCP tools wrapped as function_tool
    return Agent(
        name="Todo Assistant",
        instructions=(
            "You are a friendly todo task assistant. Help users manage their tasks through conversation. "
            "Always provide confirmatory responses after each action. "
            "If users ask to see tasks, show them the list clearly. "
            "If a task is not found, suggest they list their tasks to see available IDs. "
            "Be helpful and conversational."
        ),
        tools=[
            function_tool(add_task_wrapper),
            function_tool(list_tasks_wrapper),
            function_tool(update_task_wrapper),
            function_tool(delete_task_wrapper),
            function_tool(complete_task_wrapper),
        ],
    )


class AgentOrchestrator:
    """Orchestrates agent interactions with conversation history.

    This class manages:
    - Agent creation and lifecycle
    - Message processing with OpenAI
    - Conversation context management
    - Error handling and retry logic
    """

    def __init__(self, api_key: str):
        """Initialize the agent orchestrator.

        Args:
            api_key: OpenAI API key for agent operations
        """
        self.api_key = api_key
        self._model = None

    @property
    def model(self) -> OpenAIChatCompletionsModel:
        """Lazy-load the OpenAI model."""
        if self._model is None:
            self._model = OpenAIChatCompletionsModel(
                model="gpt-4o-mini",
                api_key=self.api_key,
            )
        return self._model

    async def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_id: UUID,
        session,
    ) -> RunResult:
        """Process a user message through the agent.

        Args:
            user_message: The user's input message
            conversation_history: List of previous messages for context
            user_id: Authenticated user's UUID
            session: Database session for tool operations

        Returns:
            RunResult with agent response and any tool calls

        Raises:
            Exception: If agent processing fails
        """
        try:
            # Create agent with database session and user_id
            agent = create_agent(session, user_id)

            # Convert history to Agent SDK format
            context = []
            for msg in conversation_history:
                if msg["role"] == "user":
                    context.append({"role": "user", "content": msg["content"]})
                elif msg["role"] == "assistant":
                    context.append({"role": "assistant", "content": msg["content"]})

            # Run the agent
            result = await Runner.run(
                starting_agent=agent,
                input=user_message,
                context=context,
            )

            return result

        except Exception as e:
            raise Exception(f"Agent processing failed: {str(e)}")

    def get_response_text(self, result: RunResult) -> str:
        """Extract the response text from a RunResult.

        Args:
            result: The RunResult from agent processing

        Returns:
            The assistant's response text
        """
        return result.final_output

    def get_tool_calls(self, result: RunResult) -> List[Dict[str, Any]]:
        """Extract tool calls from a RunResult.

        Args:
            result: The RunResult from agent processing

        Returns:
            List of tool call dictionaries (empty list for now as tool calls are embedded in response)
        """
        # The OpenAI Agents SDK embeds tool call results in the final_output
        # For now, return empty list as tool calls are already reflected in the response
        return []


def create_agent_orchestrator() -> AgentOrchestrator:
    """Factory function to create an AgentOrchestrator instance.

    Reads the OpenAI API key from application settings.

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
