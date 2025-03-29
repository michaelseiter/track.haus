"""remove_played_at_column

Revision ID: 9374e5a21110
Revises: 7ce6c3784371
Create Date: 2025-03-29 20:14:32.503126+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9374e5a21110'
down_revision: Union[str, None] = '7ce6c3784371'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new indexes first
    op.create_index('idx_plays_user_created_at', 'plays', ['user_id', 'created_at'])
    op.create_index('idx_plays_track_created_at', 'plays', ['track_id', 'created_at'])

    # Drop the played_at column
    op.drop_column('plays', 'played_at')


def downgrade() -> None:
    # Add back played_at column
    op.add_column('plays', sa.Column('played_at', sa.DateTime(), nullable=False))

    # Drop new indexes
    op.drop_index('idx_plays_user_created_at', table_name='plays')
    op.drop_index('idx_plays_track_created_at', table_name='plays')
