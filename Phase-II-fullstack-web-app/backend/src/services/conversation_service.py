# @spec: specs/003-ai-chatbot/spec.md (FR-023 to FR-028)
# @spec: specs/003-ai-chatbot/data-model.md
# Conversation service for chatbot history persistence

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ..models.conversation import Conversation
from ..models.message import Message, MessageRole


class ConversationService:
    """Service for managing conversations and messages.

    Handles:
    - Creating and loading conversations
    - Persisting messages
    - Retrieving conversation history
    """

    async def get_or_create_conversation(
        self,
        session: AsyncSession,
        user_id: UUID,
        conversation_id: Optional[str] = None,
    ) -> Conversation:
        """Get existing conversation or create a new one.

        Args:
            session: Async database session
            user_id: User UUID
            conversation_id: Optional conversation ID to load. If "latest", gets most recent

        Returns:
            Conversation instance

        Raises:
            ValueError: If conversation_id is provided but not found
        """
        if conversation_id and conversation_id != "latest":
            # Load specific conversation
            try:
                conv_uuid = UUID(conversation_id)
            except ValueError:
                raise ValueError(f"Invalid conversation ID: {conversation_id}")

            query = select(Conversation).where(
                Conversation.id == conv_uuid,
                Conversation.user_id == user_id
            )
            result = await session.execute(query)
            conversation = result.scalar_one_or_none()

            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            return conversation

        if conversation_id == "latest" or not conversation_id:
            # Get most recent conversation or create new one
            query = select(Conversation).where(
                Conversation.user_id == user_id
            ).order_by(Conversation.updated_at.desc()).limit(1)
            result = await session.execute(query)
            conversation = result.scalar_one_or_none()

            if conversation:
                return conversation

        # Create new conversation
        conversation = Conversation(
            user_id=user_id,
            title="New Chat",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)

        return conversation

    async def add_message(
        self,
        session: AsyncSession,
        conversation_id: UUID,
        role: MessageRole,
        content: str,
        tool_calls: Optional[dict] = None,
    ) -> Message:
        """Add a message to a conversation.

        Args:
            session: Async database session
            conversation_id: Conversation UUID
            role: Message role (user/assistant/system)
            content: Message content
            tool_calls: Optional tool invocation data

        Returns:
            Created Message instance
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=datetime.utcnow(),
        )
        session.add(message)

        # Update conversation timestamp
        query = select(Conversation).where(Conversation.id == conversation_id)
        result = await session.execute(query)
        conversation = result.scalar_one_or_none()

        if conversation:
            conversation.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(message)

        return message

    async def get_conversation_messages(
        self,
        session: AsyncSession,
        conversation_id: UUID,
        limit: int = 1000,
    ) -> List[Message]:
        """Get all messages in a conversation.

        Args:
            session: Async database session
            conversation_id: Conversation UUID
            limit: Maximum messages to return (default 1000)

        Returns:
            List of messages ordered by created_at ASC
        """
        query = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).limit(limit)

        result = await session.execute(query)
        return list(result.scalars().all())

    async def get_user_conversations(
        self,
        session: AsyncSession,
        user_id: UUID,
        limit: int = 100,
    ) -> List[Conversation]:
        """Get all conversations for a user.

        Args:
            session: Async database session
            user_id: User UUID
            limit: Maximum conversations to return (default 100)

        Returns:
            List of conversations ordered by updated_at DESC
        """
        query = select(Conversation).where(
            Conversation.user_id == user_id
        ).order_by(Conversation.updated_at.desc()).limit(limit)

        result = await session.execute(query)
        return list(result.scalars().all())

    async def update_conversation_title(
        self,
        session: AsyncSession,
        conversation_id: UUID,
        title: str,
    ) -> Conversation:
        """Update the title of a conversation.

        Args:
            session: Async database session
            conversation_id: Conversation UUID
            title: New title

        Returns:
            Updated conversation
        """
        query = select(Conversation).where(Conversation.id == conversation_id)
        result = await session.execute(query)
        conversation = result.scalar_one_or_none()

        if conversation:
            conversation.title = title[:255]  # Max length
            conversation.updated_at = datetime.utcnow()
            await session.commit()
            await session.refresh(conversation)

        return conversation
