"""empty message

Revision ID: 3733d7048280
Revises: b949d2d8c37c, add_email_verification
Create Date: 2025-03-29 16:57:44.212816+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3733d7048280'
down_revision: Union[str, None] = ('b949d2d8c37c', 'add_email_verification')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
