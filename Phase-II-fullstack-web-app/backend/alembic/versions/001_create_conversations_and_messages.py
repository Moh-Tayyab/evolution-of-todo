# @spec: specs/003-ai-chatbot/spec.md
# @spec: specs/003-ai-chatbot/data-model.md
# Alembic migration for creating conversations and messages tables

"""create conversations and messages tables

Revision ID: 001
Revises:
Create Date: 2025-01-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create conversations and messages tables with indexes and foreign keys."""

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='conversations_pkey')
    )

    # Create indexes for conversations
    op.create_index(
        'idx_conversations_user_id',
        'conversations',
        ['user_id']
    )
    op.create_index(
        'idx_conversations_user_updated',
        'conversations',
        [sa.text('user_id DESC'), sa.text('updated_at DESC')]
    )
    op.create_index(
        'idx_conversations_created',
        'conversations',
        [sa.text('created_at DESC')]
    )

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('conversation_id', sa.UUID(), nullable=False),
        sa.Column('content', sa.String(length=10000), nullable=False),
        sa.Column('role', sa.Enum('user', 'assistant', 'system', name='messagerole'), nullable=False),
        sa.Column('tool_calls', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(
            ['conversation_id'],
            ['conversations.id'],
            name='messages_conversation_id_fkey',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id', name='messages_pkey')
    )

    # Create indexes for messages
    op.create_index(
        'idx_messages_conversation_id',
        'messages',
        ['conversation_id']
    )
    op.create_index(
        'idx_messages_conversation_created',
        'messages',
        [sa.text('conversation_id'), sa.text('created_at DESC')]
    )
    op.create_index(
        'idx_messages_role_created',
        'messages',
        [sa.text('role'), sa.text('created_at DESC')]
    )


def downgrade() -> None:
    """Drop conversations and messages tables."""

    # Drop messages table first (due to foreign key)
    op.drop_index('idx_messages_role_created', table_name='messages')
    op.drop_index('idx_messages_conversation_created', table_name='messages')
    op.drop_index('idx_messages_conversation_id', table_name='messages')
    op.drop_table('messages')

    # Drop conversations table
    op.drop_index('idx_conversations_created', table_name='conversations')
    op.drop_index('idx_conversations_user_updated', table_name='conversations')
    op.drop_index('idx_conversations_user_id', table_name='conversations')
    op.drop_table('conversations')
