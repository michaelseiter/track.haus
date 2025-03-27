from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Index
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import expression
import enum
import secrets

class Base(DeclarativeBase):
    pass

def generate_api_key() -> str:
    return secrets.token_urlsafe(32)

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        # Index for API key lookups
        Index('idx_users_api_key', 'api_key'),
    )

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    api_key = Column(String, unique=True, nullable=False, default=generate_api_key)
    is_active = Column(Boolean, server_default=expression.true(), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    plays = relationship("Play", back_populates="user")

class Rating(enum.Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    UNRATED = "unrated"

class Artist(Base):
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    mbid = Column(String(36), unique=True, nullable=True, comment="MusicBrainz Artist ID")
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)
    validated = Column(DateTime, nullable=True, comment="Last MusicBrainz validation timestamp")

    # Relationships
    tracks = relationship("Track", back_populates="artist")
    albums = relationship("Album", back_populates="artist")

class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    mbid = Column(String(36), unique=True, nullable=True, comment="MusicBrainz Release ID")
    cover_art_url = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)
    validated = Column(DateTime, nullable=True, comment="Last MusicBrainz validation timestamp")

    # Relationships
    artist = relationship("Artist", back_populates="albums")
    tracks = relationship("Track", back_populates="album")

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)

    # Relationships
    plays = relationship("Play", back_populates="station")

class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=False)
    mbid = Column(String(36), unique=True, nullable=True, comment="MusicBrainz Recording ID")
    duration = Column(Integer)  # Duration in seconds
    detail_url = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)
    validated = Column(DateTime, nullable=True, comment="Last MusicBrainz validation timestamp")

    # Relationships
    artist = relationship("Artist", back_populates="tracks")
    album = relationship("Album", back_populates="tracks")
    plays = relationship("Play", back_populates="track")

class Play(Base):
    """Represents a single play/listen of a track"""
    __tablename__ = "plays"
    __table_args__ = (
        # Index for user's play history
        Index('idx_plays_user_played_at', 'user_id', 'played_at'),
        # Index for track play counts
        Index('idx_plays_track_played_at', 'track_id', 'played_at'),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("tracks.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    rating = Column(Enum(Rating), default=Rating.UNRATED, nullable=False)
    played_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    # Relationships
    user = relationship("User", back_populates="plays")
    track = relationship("Track", back_populates="plays")
    station = relationship("Station", back_populates="plays")
