# Track.haus API

This is the API service for Track.haus built with FastAPI.

## Development Setup

### Option 1: Docker (Recommended)

1. Start the API and database:
```bash
docker-compose up -d
```

The API will be available at http://localhost:8000

### Option 2: Local Setup

1. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn main:app --reload
```

## API Documentation

Once running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

When using Docker, PostgreSQL is available at:
- Host: localhost
- Port: 5432
- Database: trackhaus
- Username: trackhaus
- Password: trackhaus

## Development Notes

- The Docker setup includes hot-reload for the API code
- Database data persists between container restarts
- To rebuild containers: `docker-compose up -d --build`
- To view logs: `docker-compose logs -f`
