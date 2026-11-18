"""Pydantic schemas: validate incoming data and shape outgoing responses."""
from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EventBase(BaseModel):
    """Fields shared by create, update and response schemas."""

    # Strip spaces around text so "   " counts as empty and is rejected.
    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "title": "IEC Peshawar Bootcamp",
                "description": "A three-month Agentic AI bootcamp from basic to advanced.",
                "event_date": "2026-11-12",
                "location": "Peshawar",
                "max_capacity": 100,
            }
        },
    )

    title: str = Field(..., min_length=1, max_length=200, description="Event title")
    description: str | None = Field(None, max_length=2000, description="Event details")
    event_date: date = Field(..., description="Event date (YYYY-MM-DD)")
    location: str = Field(..., min_length=1, max_length=255, description="Venue")
    max_capacity: int = Field(..., gt=0, description="Maximum attendees (must be > 0)")


class EventCreate(EventBase):
    """Request body for POST /events."""


class EventUpdate(EventBase):
    """Request body for PUT /events/{id} (full replacement)."""


class EventResponse(EventBase):
    """Event as returned by the API (includes the database id)."""

    id: int
    # Lets Pydantic read data from a SQLAlchemy object, not just a dict.
    model_config = ConfigDict(from_attributes=True)


class EventListResponse(BaseModel):
    """A page of matching events and the total number of matches."""

    items: list[EventResponse]
    total: int


class LoginRequest(BaseModel):
    """Administrator credentials sent to POST /auth/login."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Bearer token returned after a successful administrator login."""

    access_token: str
    token_type: str = "bearer"


class RegistrationCreate(BaseModel):
    """Attendee details sent to register for an event."""

    model_config = ConfigDict(str_strip_whitespace=True)

    employee_name: str = Field(..., min_length=1, max_length=200)
    employee_email: EmailStr


class RegistrationResponse(BaseModel):
    """Attendee registration returned by the API."""

    id: int
    event_id: int
    employee_name: str
    employee_email: EmailStr

    model_config = ConfigDict(from_attributes=True)