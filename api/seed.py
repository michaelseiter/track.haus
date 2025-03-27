from datetime import datetime, timedelta, UTC
import secrets
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

from models import User, Artist, Album, Track, Station, Play
from database import SessionLocal

def seed_database():
    db = SessionLocal()
    try:
        # Create test user
        test_user = User(
            email="test@example.com",
            password_hash=bcrypt.hash("password123"),
            api_key=secrets.token_urlsafe(32),
            created_at=datetime.now(UTC)
        )
        db.add(test_user)
        db.flush()

        # Create some artists with MusicBrainz IDs
        # Create artists
        radiohead = Artist(
            name="Radiohead",
            mbid="a74b1b7f-71a5-4011-9441-d0b5e4122711",
            validated=datetime.now(UTC)
        )
        boards = Artist(
            name="Boards of Canada",
            mbid="69158f97-4c07-4c4e-baf8-4e4ab1ed666e",
            validated=datetime.now(UTC)
        )
        db.add(radiohead)
        db.add(boards)
        db.flush()

        # Create some albums
        # Create albums
        kid_a = Album(
            title="Kid A",
            artist_id=radiohead.id,
            mbid="b1da184c-5bf9-3f41-9ac8-0bf279ce2f45",
            validated=datetime.now(UTC)
        )
        mhtrtc = Album(
            title="Music Has the Right to Children",
            artist_id=boards.id,
            mbid="f7d97e6d-6ace-34a4-a891-fb95f5a2b6ce",
            validated=datetime.now(UTC)
        )
        db.add(kid_a)
        db.add(mhtrtc)
        db.flush()

        # Create some tracks
        # Create tracks
        track1 = Track(
            title="Everything in Its Right Place",
            artist_id=radiohead.id,
            album_id=kid_a.id,
            mbid="2f250ed2-6285-403e-9c79-5cf2b997de39",
            validated=datetime.now(UTC)
        )
        track2 = Track(
            title="Kid A",
            artist_id=radiohead.id,
            album_id=kid_a.id,
            mbid="105e11d7-29f2-4972-8df6-8961b2f5e07c",
            validated=datetime.now(UTC)
        )
        track3 = Track(
            title="Roygbiv",
            artist_id=boards.id,
            album_id=mhtrtc.id,
            mbid="c481f44b-3a2d-4a85-a896-419c56f10002",
            validated=datetime.now(UTC)
        )
        tracks = [track1, track2, track3]
        for track in tracks:
            db.add(track)
        db.flush()

        # Create a test station
        station = Station(
            name="Radiohead Radio",
            created_at=datetime.now(UTC)
        )
        db.add(station)
        db.flush()

        # Create some sample plays
        base_time = datetime.now(UTC) - timedelta(days=7)
        plays = []
        for i, track in enumerate(tracks):
            # Add multiple plays for each track at different times
            for j in range(3):
                plays.append(
                    Play(
                        user_id=test_user.id,
                        track_id=track.id,
                        station_id=station.id,
                        played_at=base_time + timedelta(hours=i*24 + j*8)
                    )
                )
        db.bulk_save_objects(plays)
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
