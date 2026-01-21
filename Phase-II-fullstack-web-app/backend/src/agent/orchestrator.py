# @spec: specs/003-ai-chatbot/spec.md
# @spec: specs/003-ai-chatbot/research.md (Section 2: OpenAI Agents SDK)
# Agent orchestrator using OpenAI Agents SDK with function tools

from typing import List, Dict, Any, Optional
from uuid import UUID
import logging

from agents import Agent, Runner, function_tool
from agents import OpenAIChatCompletionsModel
from agents.run import RunResult

from ..mcp.tools import (
    add_task,
    list_tasks,
    update_task,
    delete_task,
    complete_task,
)
from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def create_agent(session, user_id: UUID) -> Agent:
    """Create an OpenAI Agent with task management tools.

    The agent is configured with:
    - Friendly instructions for conversational task management
    - 5 function tools for CRUD operations on tasks
    - OpenAI GPT model for natural language understanding

    Args:
        session: Database session for tool operations
        user_id: Authenticated user's UUID (passed to tools for authorization)

    Returns:
        Configured Agent instance
    """

    async def add_task_tool(title: str, description: str = None) -> str:
        """Add a new task to the user's todo list.

        Args:
            title: The task title (what needs to be done)
            description: Optional additional details about the task

        Returns:
            Confirmation message with task details
        """
        # user_id is captured from closure (set by create_agent)
        result = await add_task(session, user_id, title, description)

        if result.success:
            task = result.data
            return f"I've added '{task['title']}' to your tasks."
        return f"Sorry, I couldn't add that task: {result.error}"

    async def list_tasks_tool(completed: bool = None) -> str:
        """List all tasks for the user.

        Args:
            completed: Optional filter for completion status (true/false)

        Returns:
            Formatted list of tasks with completion status
        """
        # user_id is captured from closure (set by create_agent)
        result = await list_tasks(session, user_id, completed)

        if result.success:
            tasks = result.data["tasks"]
            count = result.data["count"]
            if count == 0:
                return "You don't have any tasks yet. Would you like to add one?"
            return f"You have {count} task(s):\n" + "\n".join(
                f"- {t['title']} {'[DONE]' if t['completed'] else '[TODO]'}"
                for t in tasks
            )
        return f"Sorry, I couldn't retrieve your tasks: {result.error}"

    async def update_task_tool(task_id: int, title: str = None, description: str = None) -> str:
        """Update an existing task.

        Args:
            task_id: The ID of the task to update
            title: New title for the task
            description: New description for the task

        Returns:
            Confirmation message with updated task details
        """
        # user_id is captured from closure (set by create_agent)
        result = await update_task(session, user_id, task_id, title, description)

        if result.success:
            task = result.data
            return f"I've updated task {task_id}: '{task['title']}'"
        return f"Sorry, I couldn't update that task: {result.error}"

    async def delete_task_tool(task_id: int) -> str:
        """Delete a task.

        Args:
            task_id: The ID of the task to delete

        Returns:
            Confirmation message
        """
        # user_id is captured from closure (set by create_agent)
        result = await delete_task(session, user_id, task_id)

        if result.success:
            return result.data["message"]
        return f"Sorry, I couldn't delete that task: {result.error}"

    async def complete_task_tool(task_id: int, completed: bool = True) -> str:
        """Mark a task as complete or incomplete.

        Args:
            task_id: The ID of the task to update
            completed: Whether the task is complete (true) or incomplete (false)

        Returns:
            Confirmation message with new status
        """
        # user_id is captured from closure (set by create_agent)
        result = await complete_task(session, user_id, task_id, completed)

        if result.success:
            return result.data["message"]
        return f"Sorry, I couldn't update that task: {result.error}"

    # Create the agent with tools
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
            function_tool(add_task_tool),
            function_tool(list_tasks_tool),
            function_tool(update_task_tool),
            function_tool(delete_task_tool),
            function_tool(complete_task_tool),
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
            List of tool call dictionaries
        """
        tool_calls = []
        for event in result.events:
            if hasattr(event, "tool_calls") and event.tool_calls:
                for call in event.tool_calls:
                    tool_calls.append({
                        "name": call.function_name,
                        "arguments": call.arguments,
                    })
        return tool_calls


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
