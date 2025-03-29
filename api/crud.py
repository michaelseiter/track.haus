from datetime import datetime, timedelta, UTC
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import select
from passlib.hash import bcrypt

from fastapi import HTTPException

from models import User, Artist, Album, Track, Station, Play, Rating, generate_verification_token
from schemas import PlayCreate

def create_user(db: Session, email: str, password: str) -> User:
    """Create a new user with email and password."""
    # Check if user already exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user with verification token
    token = generate_verification_token()
    user = User(
        email=email,
        password_hash=bcrypt.hash(password),
        verification_token=token,
        verification_token_expires=datetime.now(UTC) + timedelta(hours=24)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def verify_email(db: Session, token: str) -> User:
    """Verify a user's email using their verification token."""
    user = db.query(User).filter(
        User.verification_token == token,
        User.verification_token_expires > datetime.now(UTC)
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )
    
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    db.refresh(user)
    return user

def resend_verification(db: Session, user_id: int) -> User:
    """Resend verification email by generating a new token."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="Email already verified"
        )
    
    user.verification_token = generate_verification_token()
    user.verification_token_expires = datetime.now(UTC) + timedelta(hours=24)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_api_key(db: Session, api_key: str) -> User | None:
    """Get a user by their API key."""
    return db.query(User).filter(User.api_key == api_key).first()

def get_user_by_email(db: Session, email: str) -> User | None:
    """Get a user by their email."""
    return db.query(User).filter(User.email == email).first()

def get_or_create_artist(db: Session, name: str) -> Artist:
    """Get an artist by name or create if not exists."""
    artist = db.query(Artist).filter(Artist.name == name).first()
    if not artist:
        artist = Artist(name=name)
        db.add(artist)
        db.flush()
    return artist

def get_or_create_album(db: Session, title: str, artist_id: int) -> Album:
    """Get an album by title and artist or create if not exists."""
    album = db.query(Album).filter(
        Album.title == title,
        Album.artist_id == artist_id
    ).first()
    if not album:
        album = Album(title=title, artist_id=artist_id)
        db.add(album)
        db.flush()
    return album

def get_or_create_track(db: Session, title: str, artist_id: int, album_id: int) -> Track:
    """Get a track by title, artist, and album or create if not exists."""
    track = db.query(Track).filter(
        Track.title == title,
        Track.artist_id == artist_id,
        Track.album_id == album_id
    ).first()
    if not track:
        track = Track(
            title=title,
            artist_id=artist_id,
            album_id=album_id
        )
        db.add(track)
        db.flush()
    return track

def get_or_create_station(db: Session, name: str) -> Station:
    """Get a station by name or create if not exists."""
    station = db.query(Station).filter(Station.name == name).first()
    if not station:
        station = Station(name=name)
        db.add(station)
        db.flush()
    return station

def get_user_plays(db: Session, user_id: int, limit: int = 50, offset: int = 0) -> list[Play]:
    """Get a user's play history with all related entities."""
    return db.query(Play).join(
        Play.track
    ).join(
        Play.station
    ).options(
        # Eagerly load all the relationships we need
        selectinload(Play.track).joinedload(Track.artist),
        selectinload(Play.track).joinedload(Track.album),
        selectinload(Play.station)
    ).filter(
        Play.user_id == user_id
    ).order_by(
        Play.played_at.desc()
    ).offset(offset).limit(limit).all()

def create_play(db: Session, play_data: PlayCreate, user_id: int) -> Play:
    """Create a new play record with all related entities."""
    # Get or create related entities
    artist = get_or_create_artist(db, play_data.artist)
    album = get_or_create_album(db, play_data.album, artist.id)
    track = get_or_create_track(db, play_data.title, artist.id, album.id)
    station = get_or_create_station(db, play_data.station)

    # Create the play record
    play = Play(
        user_id=user_id,
        track_id=track.id,
        station_id=station.id,
        rating={0: Rating.UNRATED, 1: Rating.LIKE, 2: Rating.BAN, 3: Rating.TIRED}.get(play_data.rating, Rating.UNRATED),
        played_at=datetime.now(UTC)
    )
    db.add(play)
    db.commit()
    return play
