from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from schemas import PlayCreate, UserCreate, UserResponse, PlayResponse
from crud import get_user_by_api_key, create_play, create_user, get_user_plays

app = FastAPI(title="Track.haus API")

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

async def get_current_user(
    api_key: str,
    db: Session = Depends(get_db)
):
    user = get_user_by_api_key(db, api_key)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return user

@app.get("/")
async def root():
    return {"message": "Welcome to Track.haus API"}

@app.post("/auth/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user and generate their API key."""
    return create_user(db, user_data.email, user_data.password)

@app.get("/plays", response_model=list[PlayResponse])
async def get_plays(
    limit: int = 50,
    offset: int = 0,
    api_key: str = None,
    db: Session = Depends(get_db)
):
    """Get the authenticated user's play history."""
    user = await get_current_user(api_key, db)
    return get_user_plays(db, user.id, limit, offset)

@app.post("/track/play")
async def record_play(
    play: PlayCreate,
    api_key: str,
    db: Session = Depends(get_db),
):
    """Record a track play from Pianobar."""
    user = await get_current_user(api_key, db)
    try:
        play_record = create_play(db, play, user.id)
        return {
            "message": "Play recorded successfully",
            "id": play_record.id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record play: {str(e)}"
        )
