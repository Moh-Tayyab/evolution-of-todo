from typing import Optional
import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True):
    """
    User model matching Better Auth schema.
    Better Auth creates the user table with these columns.
    """
    __tablename__ = "user"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    email: str = Field(unique=True, index=True, max_length=255)
    email_verified: bool = Field(default=False)
    name: Optional[str] = Field(default=None, max_length=255)
    image: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Additional fields for our application (not managed by Better Auth)
    # Note: Better Auth uses separate session table, not user.password
    hashed_password: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
