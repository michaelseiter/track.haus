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

def get_user_stats(db: Session, user_id: int) -> dict:
    """Get comprehensive stats for a user."""
    # Get all plays for the user with their related entities
    plays = db.query(Play).filter(Play.user_id == user_id).options(
        joinedload(Play.track).joinedload(Track.artist),
        joinedload(Play.track).joinedload(Track.album),
        joinedload(Play.station)
    ).all()

    if not plays:
        raise HTTPException(
            status_code=404,
            detail="No plays found"
        )

    # Calculate overall stats
    total_plays = len(plays)
    unique_tracks = len(set(play.track_id for play in plays))
    unique_artists = len(set(play.track.artist_id for play in plays))
    total_time = sum(play.track.duration or 0 for play in plays)
    first_play = min(play.played_at for play in plays)
    last_play = max(play.played_at for play in plays)

    # Calculate top items (tracks, artists, albums, stations)
    track_counts = {}
    artist_counts = {}
    album_counts = {}
    station_counts = {}
    hour_counts = {}
    day_counts = {}
    month_counts = {}
    rating_counts = {rating: 0 for rating in Rating}

    for play in plays:
        # Track stats
        track_id = play.track_id
        if track_id not in track_counts:
            track_counts[track_id] = {
                'id': track_id,
                'name': play.track.title,
                'play_count': 0,
                'last_played': play.played_at
            }
        track_counts[track_id]['play_count'] += 1
        track_counts[track_id]['last_played'] = max(
            track_counts[track_id]['last_played'],
            play.played_at
        )

        # Artist stats
        artist_id = play.track.artist_id
        if artist_id not in artist_counts:
            artist_counts[artist_id] = {
                'id': artist_id,
                'name': play.track.artist.name,
                'play_count': 0,
                'last_played': play.played_at
            }
        artist_counts[artist_id]['play_count'] += 1
        artist_counts[artist_id]['last_played'] = max(
            artist_counts[artist_id]['last_played'],
            play.played_at
        )

        # Album stats
        album_id = play.track.album_id
        if album_id not in album_counts:
            album_counts[album_id] = {
                'id': album_id,
                'name': play.track.album.title,
                'play_count': 0,
                'last_played': play.played_at
            }
        album_counts[album_id]['play_count'] += 1
        album_counts[album_id]['last_played'] = max(
            album_counts[album_id]['last_played'],
            play.played_at
        )

        # Station stats
        station_id = play.station_id
        if station_id not in station_counts:
            station_counts[station_id] = {
                'id': station_id,
                'name': play.station.name,
                'play_count': 0,
                'last_played': play.played_at
            }
        station_counts[station_id]['play_count'] += 1
        station_counts[station_id]['last_played'] = max(
            station_counts[station_id]['last_played'],
            play.played_at
        )

        # Time stats
        hour = play.played_at.hour
        day = play.played_at.weekday()
        month = play.played_at.month

        hour_counts[hour] = hour_counts.get(hour, 0) + 1
        day_counts[day] = day_counts.get(day, 0) + 1
        month_counts[month] = month_counts.get(month, 0) + 1

        # Rating stats
        rating_counts[play.rating] += 1

    return {
        'overall': {
            'total_plays': total_plays,
            'unique_tracks': unique_tracks,
            'unique_artists': unique_artists,
            'total_time_seconds': total_time,
            'first_play': first_play,
            'last_play': last_play
        },
        'top_tracks': sorted(
            track_counts.values(),
            key=lambda x: (x['play_count'], x['last_played']),
            reverse=True
        )[:10],
        'top_artists': sorted(
            artist_counts.values(),
            key=lambda x: (x['play_count'], x['last_played']),
            reverse=True
        )[:10],
        'top_albums': sorted(
            album_counts.values(),
            key=lambda x: (x['play_count'], x['last_played']),
            reverse=True
        )[:10],
        'top_stations': sorted(
            station_counts.values(),
            key=lambda x: (x['play_count'], x['last_played']),
            reverse=True
        )[:10],
        'plays_by_hour': [
            {'hour': hour, 'play_count': count}
            for hour, count in sorted(hour_counts.items())
        ],
        'plays_by_day': [
            {'day': day, 'play_count': count}
            for day, count in sorted(day_counts.items())
        ],
        'plays_by_month': [
            {'month': month, 'play_count': count}
            for month, count in sorted(month_counts.items())
        ],
        'rating_distribution': [
            {'rating': rating, 'play_count': count}
            for rating, count in rating_counts.items()
        ]
    }

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
