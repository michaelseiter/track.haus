from datetime import datetime, UTC
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from schemas import PlayCreate, UserCreate, UserResponse, PlayResponse, VerifyEmailRequest, VerifyEmailResponse
from crud import get_user_by_api_key, create_play, create_user, get_user_plays, get_user_by_email, verify_email, resend_verification
from passlib.hash import bcrypt
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os


app = FastAPI(title="Track.haus API")

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current user from API key in header.
    This is now a backup validation since middleware handles most cases."""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing API key"
        )
    
    user = get_user_by_api_key(db, api_key)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    return user

class APIKeyMiddleware:
    def __init__(self, app, public_paths: set[str]):
        self.app = app
        self.public_paths = public_paths

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope, receive=receive)
        # Always allow OPTIONS requests for CORS
        if scope["method"] == "OPTIONS" or request.url.path in self.public_paths:
            return await self.app(scope, receive, send)

        api_key = request.headers.get('X-API-Key')
        if not api_key:
            response = JSONResponse(
                status_code=401,
                content={"detail": "Missing API key"}
            )
            await response(scope, receive, send)
            return
        
        # Validate API key here to fail fast before hitting the endpoint
        db = next(get_db())
        user = get_user_by_api_key(db, api_key)
        if not user:
            response = JSONResponse(
                status_code=401,
                content={"detail": "Invalid API key"}
            )
            await response(scope, receive, send)
            return
        
        await self.app(scope, receive, send)


# Configure middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.add_middleware(APIKeyMiddleware, public_paths=set([
    "/",  # Entry point needs to be public
    "/docs",
    "/redoc",
    "/openapi.json",
    "/auth/register",
    "/auth/login",
    "/auth/verify"
]))

@app.get("/")
async def root():
    """Root endpoint requires API key like all other endpoints."""
    return {"message": "Welcome to Track.haus API"}

def send_verification_email(to_email: str, token: str):
    """Send verification email to user."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    if not all([smtp_user, smtp_pass]):
        print("Warning: Email credentials not configured. Skipping verification email.")
        print(f"Verification token for {to_email}: {token}")
        return

    msg = MIMEMultipart()
    msg["Subject"] = "Verify your Track.haus account"
    msg["From"] = smtp_user
    msg["To"] = to_email

    verify_url = f"http://localhost:5173/verify?token={token}"
    html = f"""
    <html>
        <body>
            <h1>Welcome to Track.haus!</h1>
            <p>Please click the link below to verify your email address:</p>
            <p><a href="{verify_url}">{verify_url}</a></p>
            <p>This link will expire in 24 hours.</p>
        </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        print(f"Verification token for {to_email}: {token}")

@app.post("/auth/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user and generate their API key."""
    if not user_data.password_confirm:
        raise HTTPException(
            status_code=400,
            detail="Password confirmation is required for registration"
        )
    
    user = create_user(db, user_data.email, user_data.password)
    send_verification_email(user.email, user.verification_token)
    return user

@app.post("/auth/login", response_model=UserResponse)
async def login_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Login a user and return their API key."""
    user = get_user_by_email(db, user_data.email)
    if not user or not bcrypt.verify(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=401,
            detail="Please verify your email before logging in"
        )
    
    user.last_login_at = datetime.now(UTC)
    db.commit()
    return user

@app.post("/auth/verify", response_model=VerifyEmailResponse)
async def verify_user_email(
    verify_data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """Verify a user's email using their verification token."""
    user = verify_email(db, verify_data.token)
    return VerifyEmailResponse(
        message="Email verified successfully",
        is_verified=True
    )

@app.post("/auth/resend-verification", response_model=UserResponse)
async def resend_verification_email(
    request: Request,
    db: Session = Depends(get_db)
):
    """Resend verification email to user."""
    user = await get_current_user(request, db)
    user = resend_verification(db, user.id)
    send_verification_email(user.email, user.verification_token)
    return user

@app.get("/plays", response_model=list[PlayResponse])
async def get_plays(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get the authenticated user's play history."""
    user = await get_current_user(request, db)
    return get_user_plays(db, user.id, limit, offset)

@app.post("/track/play")
async def record_play(
    request: Request,
    play: PlayCreate,
    db: Session = Depends(get_db),
):
    """Record a track play from Pianobar."""
    user = await get_current_user(request, db)
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
