from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional
from models import Rating

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        description="Password must be at least 8 characters and contain at least one letter and one number"
    )
    password_confirm: str | None = Field(
        default=None,
        description="Password confirmation for registration. Not required for login."
    )

    @field_validator('password')
    def validate_password(cls, v: str) -> str:
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

    @field_validator('password_confirm')
    def passwords_match(cls, v: str | None, info) -> str | None:
        if info.data.get('password') and v is not None and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123",
                "password_confirm": "strongpassword123"
            }
        }
    )

class UserResponse(BaseModel):
    email: str
    api_key: str
    created_at: datetime
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)

class VerifyEmailRequest(BaseModel):
    token: str

class VerifyEmailResponse(BaseModel):
    message: str
    is_verified: bool

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

class TopItemStats(BaseModel):
    id: int
    name: str
    play_count: int
    last_played: datetime

class TimeStats(BaseModel):
    hour: int | None = None
    day: int | None = None
    month: int | None = None
    year: int | None = None
    play_count: int

class RatingStats(BaseModel):
    rating: Rating
    play_count: int

class OverallStats(BaseModel):
    total_plays: int
    unique_tracks: int
    unique_artists: int
    total_time_seconds: int
    first_play: datetime
    last_play: datetime

class StatsResponse(BaseModel):
    overall: OverallStats
    top_tracks: list[TopItemStats]
    top_artists: list[TopItemStats]
    top_albums: list[TopItemStats]
    top_stations: list[TopItemStats]
    plays_by_hour: list[TimeStats]
    plays_by_day: list[TimeStats]
    plays_by_month: list[TimeStats]
    rating_distribution: list[RatingStats]

class PlayCreate(BaseModel):
    title: str
    artist: str
    album: str
    station: str
    rating: Optional[int] = None  # Pianobar: 0=Unrated, 1=Like, 2=Ban, 3=Tired

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
