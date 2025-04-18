"""initial schema

Revision ID: a949d2d8c37b
Revises: 
Create Date: 2025-03-27 20:41:14.096573+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a949d2d8c37b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('artists',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('mbid', sa.String(length=36), nullable=True, comment='MusicBrainz Artist ID'),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.Column('validated', sa.DateTime(), nullable=True, comment='Last MusicBrainz validation timestamp'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('mbid')
    )
    op.create_table('stations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('api_key', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.Column('last_login_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('api_key'),
    sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_api_key', 'users', ['api_key'], unique=False)
    op.create_table('albums',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('artist_id', sa.Integer(), nullable=False),
    sa.Column('mbid', sa.String(length=36), nullable=True, comment='MusicBrainz Release ID'),
    sa.Column('cover_art_url', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.Column('validated', sa.DateTime(), nullable=True, comment='Last MusicBrainz validation timestamp'),
    sa.ForeignKeyConstraint(['artist_id'], ['artists.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('mbid')
    )
    op.create_table('tracks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('artist_id', sa.Integer(), nullable=False),
    sa.Column('album_id', sa.Integer(), nullable=False),
    sa.Column('mbid', sa.String(length=36), nullable=True, comment='MusicBrainz Recording ID'),
    sa.Column('duration', sa.Integer(), nullable=True),
    sa.Column('detail_url', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.Column('validated', sa.DateTime(), nullable=True, comment='Last MusicBrainz validation timestamp'),
    sa.ForeignKeyConstraint(['album_id'], ['albums.id'], ),
    sa.ForeignKeyConstraint(['artist_id'], ['artists.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('mbid')
    )
    op.create_table('plays',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('track_id', sa.Integer(), nullable=False),
    sa.Column('station_id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Enum('LIKE', 'DISLIKE', 'UNRATED', name='rating'), nullable=False),
    sa.Column('played_at', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ),
    sa.ForeignKeyConstraint(['track_id'], ['tracks.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_plays_track_played_at', 'plays', ['track_id', 'played_at'], unique=False)
    op.create_index('idx_plays_user_played_at', 'plays', ['user_id', 'played_at'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('idx_plays_user_played_at', table_name='plays')
    op.drop_index('idx_plays_track_played_at', table_name='plays')
    op.drop_table('plays')
    op.drop_table('tracks')
    op.drop_table('albums')
    op.drop_index('idx_users_api_key', table_name='users')
    op.drop_table('users')
    op.drop_table('stations')
    op.drop_table('artists')
    # ### end Alembic commands ###
