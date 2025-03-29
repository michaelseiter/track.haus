from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://trackhaus:trackhaus@localhost:5432/trackhaus"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,  # Increased from default of 5
    max_overflow=30,  # Increased from default of 10
    pool_timeout=60,  # Increased from default of 30
    pool_recycle=3600  # Recycle connections after 1 hour
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
