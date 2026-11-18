"""Entry point of the Acme Corp Event Management API."""
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app import services
from app.auth import create_access_token, credentials_match, require_admin
from app.config import settings
from app.db import get_db
from app.schemas import (
    EventCreate,
    EventListResponse,
    EventResponse,
    EventUpdate,
    LoginRequest,
    RegistrationCreate,
    RegistrationResponse,
    TokenResponse,
)

app = FastAPI(title="Acme Corp Event Management API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"], summary="Show API links")
async def api_root():
    """Show the API documentation and health-check addresses."""
    return {"name": app.title, "docs": "/docs", "health": "/health"}


@app.get("/health", tags=["Health"], summary="Check API and database status")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Return ok if the API is running and the database answers."""
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(data: LoginRequest):
    """Check the configured administrator credentials and return an access token."""
    if not credentials_match(data.username, data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {
        "access_token": create_access_token(data.username),
        "token_type": "bearer",
    }


@app.post(
    "/events",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Events"],
    summary="Create an event",
)
async def create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    return await services.create_event(db, data)


@app.get("/events", response_model=EventListResponse, tags=["Events"], summary="List events")
async def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=10),
    title: str | None = Query(None, max_length=200),
    event_date: date | None = Query(None, alias="date"),
    db: AsyncSession = Depends(get_db),
):
    events, total = await services.list_events(db, skip, limit, title, event_date)
    return {"items": events, "total": total}


@app.get("/events/{event_id}", response_model=EventResponse, tags=["Events"], summary="Get one event")
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event = await services.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.put("/events/{event_id}", response_model=EventResponse, tags=["Events"], summary="Replace an event")
async def update_event(
    event_id: int,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    try:
        event = await services.update_event(db, event_id, data)
    except services.CapacityBelowRegistrations:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Capacity cannot be lower than the current number of registrations.",
        ) from None
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.delete(
    "/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Events"],
    summary="Delete an event",
)
async def delete_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    deleted = await services.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    return None


@app.get(
    "/events/{event_id}/registrations",
    response_model=list[RegistrationResponse],
    tags=["Registrations"],
)
async def list_registrations(
    event_id: int,
    db: AsyncSession = Depends(get_db),
):
    registrations = await services.list_registrations(db, event_id)
    if registrations is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return registrations


@app.post(
    "/events/{event_id}/registrations",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Registrations"],
)
async def create_registration(
    event_id: int,
    data: RegistrationCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        registration = await services.create_registration(db, event_id, data)
    except services.RegistrationConflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already registered for the event.",
        ) from None
    except services.EventAtCapacity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This event has reached its maximum capacity.",
        ) from None
    if registration is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return registration


@app.delete(
    "/registrations/{registration_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Registrations"],
)
async def cancel_registration(
    registration_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    deleted = await services.delete_registration(db, registration_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registration not found")
    return None