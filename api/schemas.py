from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from models import Rating

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123"
            }
        }
    )

class UserResponse(BaseModel):
    email: str
    api_key: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ArtistResponse(BaseModel):
    id: int
    name: str
    mbid: str | None
    validated: datetime | None

    model_config = ConfigDict(from_attributes=True)

class AlbumResponse(BaseModel):
    id: int
    title: str
    artist_id: int
    mbid: str | None
    cover_art_url: str | None
    validated: datetime | None

    model_config = ConfigDict(from_attributes=True)

class TrackResponse(BaseModel):
    id: int
    title: str
    artist: ArtistResponse
    album: AlbumResponse
    mbid: str | None
    created_at: datetime
    updated_at: datetime
    validated: datetime | None

    model_config = ConfigDict(from_attributes=True)

class StationResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlayResponse(BaseModel):
    id: int
    track: TrackResponse
    station: StationResponse
    rating: Rating
    played_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlayCreate(BaseModel):
    title: str
    artist: str
    album: str
    station: str
    rating: Optional[int] = None  # Pianobar uses 0 or 1

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Everything in Its Right Place",
                "artist": "Radiohead",
                "album": "Kid A",
                "station": "Radiohead Radio",
                "rating": 1
            }
        }
    )
