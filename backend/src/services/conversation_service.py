# @spec: specs/003-ai-chatbot/spec.md (FR-023 to FR-028)
# @spec: specs/003-ai-chatbot/data-model.md
# Conversation service for chatbot history persistence

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ..models.conversation import Conversation
from ..models.message import Message, MessageRole
from ..models.user import User


class ConversationService:
    """Service for managing conversations and messages.

    Handles:
    - Creating and loading conversations
    - Persisting messages
    - Retrieving conversation history
    """

    async def _ensure_user_exists(
        self,
        session: AsyncSession,
        user_id: UUID,
    ) -> None:
        """Ensure user exists in database before creating conversation.

        This is called before creating a conversation to prevent foreign key violations.
        If the user doesn't exist, a placeholder user is created.

        Args:
            session: Async database session
            user_id: User UUID
        """
        # Expunge any existing user objects from session to force fresh database query
        session.expunge_all()

        query = select(User).where(User.id == str(user_id))
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            # Create placeholder user to satisfy foreign key constraint
            placeholder_user = User(
                id=str(user_id),
                email=f"user-{user_id}@auto-provisioned.local",
                name=None,
                email_verified=True,
                is_active=True,
            )
            session.add(placeholder_user)
            await session.flush()  # Use flush instead of commit to avoid transaction issues

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

        # Ensure user exists before creating conversation
        await self._ensure_user_exists(session, user_id)

        # Create new conversation (use naive UTC datetime for database compatibility)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        conversation = Conversation(
            user_id=user_id,
            title="New Chat",
            created_at=now,
            updated_at=now,
        )
        session.add(conversation)
        await session.flush()
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
        # Use naive UTC datetime for database compatibility
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=now,
        )
        session.add(message)

        # Update conversation timestamp using bulk update to avoid autoflush issues
        from sqlalchemy import update
        stmt = (
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(updated_at=now)
        )
        await session.execute(stmt)

        await session.flush()
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

    async def get_messages(
        self,
        session: AsyncSession,
        conversation_id: UUID,
        limit: int = 1000,
    ) -> List[Message]:
        """Convenience alias for get_conversation_messages.

        Args:
            session: Async database session
            conversation_id: Conversation UUID
            limit: Maximum messages to return (default 1000)

        Returns:
            List of messages ordered by created_at ASC
        """
        return await self.get_conversation_messages(session, conversation_id, limit)

    async def get_conversation(
        self,
        session: AsyncSession,
        conversation_id: UUID,
    ) -> Optional[Conversation]:
        """Get a conversation by ID.

        Args:
            session: Async database session
            conversation_id: Conversation UUID

        Returns:
            Conversation instance or None if not found
        """
        query = select(Conversation).where(Conversation.id == conversation_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()

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
            # Use naive UTC datetime for database compatibility
            conversation.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            await session.flush()
            await session.refresh(conversation)

        return conversation
