"""update rating enum

Revision ID: b949d2d8c37c
Revises: a949d2d8c37b
Create Date: 2025-03-28 15:14:05.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b949d2d8c37c'
down_revision: Union[str, None] = 'a949d2d8c37b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

old_enum = postgresql.ENUM('LIKE', 'DISLIKE', 'UNRATED', name='rating')
new_enum = postgresql.ENUM('UNRATED', 'LIKE', 'BAN', 'TIRED', name='rating')

def upgrade() -> None:
    # Create the new enum type
    op.execute('CREATE TYPE rating_new AS ENUM (\'UNRATED\', \'LIKE\', \'BAN\', \'TIRED\')')
    
    # Add a new column with the new enum type
    op.execute('ALTER TABLE plays ADD COLUMN rating_new rating_new')
    
    # Convert data to new enum values
    op.execute("""
        UPDATE plays SET rating_new = CASE rating::text
            WHEN 'UNRATED' THEN 'UNRATED'::rating_new
            WHEN 'LIKE' THEN 'LIKE'::rating_new
            WHEN 'DISLIKE' THEN 'BAN'::rating_new
            ELSE 'UNRATED'::rating_new
        END
    """)
    
    # Drop the old column and rename the new one
    op.drop_column('plays', 'rating')
    op.alter_column('plays', 'rating_new', new_column_name='rating')
    
    # Drop the old enum type
    old_enum.drop(op.get_bind())


def downgrade() -> None:
    # Create the old enum type
    op.execute('CREATE TYPE rating_old AS ENUM (\'LIKE\', \'DISLIKE\', \'UNRATED\')')
    
    # Add a temporary column with the old enum type
    op.execute('ALTER TABLE plays ADD COLUMN rating_old rating_old')
    
    # Convert data back to old enum values
    op.execute("""
        UPDATE plays SET rating_old = CASE rating::text
            WHEN 'UNRATED' THEN 'UNRATED'::rating_old
            WHEN 'LIKE' THEN 'LIKE'::rating_old
            WHEN 'BAN' THEN 'DISLIKE'::rating_old
            WHEN 'TIRED' THEN 'DISLIKE'::rating_old
            ELSE 'UNRATED'::rating_old
        END
    """)
    
    # Drop the new column and rename the old one
    op.drop_column('plays', 'rating')
    op.alter_column('plays', 'rating_old', new_column_name='rating')
    
    # Drop the new enum type
    new_enum.drop(op.get_bind())
