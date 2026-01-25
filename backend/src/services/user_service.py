# @spec: specs/003-ai-chatbot/spec.md (FR-001 to FR-004)
# User service for auto-provisioning users from Better Auth JWT tokens

from typing import Optional
from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User


class UserService:
    """Service for managing users with auto-provisioning from Better Auth."""

    @staticmethod
    async def get_or_create_user_from_jwt(
        session: AsyncSession,
        user_id: str,
        email: Optional[str] = None,
        name: Optional[str] = None,
    ) -> User:
        """
        Get existing user or auto-provision from JWT payload.

        This solves the user synchronization issue between Better Auth
        (frontend) and the Neon database (backend). When a user authenticates
        via Better Auth JWT but doesn't exist in our database, we create them
        automatically based on the JWT claims.

        Args:
            session: Database session
            user_id: User ID from JWT sub claim
            email: User email from JWT (optional, will be fetched if needed)
            name: User name from JWT (optional)

        Returns:
            User object (existing or newly created)

        Raises:
            ValueError: If user_id is invalid
        """
        # Validate user_id is a valid UUID
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            raise ValueError(f"Invalid user_id format: {user_id}")

        # Check if user already exists
        statement = select(User).where(User.id == str(user_uuid))
        result = await session.execute(statement)
        user = result.scalar_one_or_none()

        if user:
            # User exists, return it
            return user

        # User doesn't exist - auto-provision from JWT
        # Create user with defaults from JWT payload
        user = User(
            id=str(user_uuid),
            email=email or f"user-{user_uuid}@example.com",  # Fallback email
            name=name,
            email_verified=True,  # Assumed verified if JWT is valid
            is_active=True,
        )

        session.add(user)
        # IMPORTANT: Must commit, not just flush, to ensure user is written to database
        # This fixes foreign key constraint violations when conversation is created immediately after
        await session.commit()
        await session.refresh(user)

        return user

    @staticmethod
    async def get_user_by_id(
        session: AsyncSession,
        user_id: str,
    ) -> Optional[User]:
        """Get user by ID, returns None if not found."""
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            return None

        statement = select(User).where(User.id == str(user_uuid))
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_user(
        session: AsyncSession,
        user_id: str,
        email: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Optional[User]:
        """Update user fields (email, name)."""
        user = await UserService.get_user_by_id(session, user_id)
        if not user:
            return None

        if email is not None:
            user.email = email
        if name is not None:
            user.name = name

        session.add(user)
        await session.commit()
        await session.refresh(user)

        return user
