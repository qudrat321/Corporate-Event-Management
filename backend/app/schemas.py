"""Define the event data accepted by and returned from the API."""

from datetime import date
from pydantic import BaseModel, ConfigDict, Field

class EventBase(BaseModel):
    """Share the common fields and validation rules for an event."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example":{
                "title": "I E C Peshawar Bootcamp",
                "description": "I E C arranging three month Agentic AI bootcamp to deliver from basic to advance agentic AI curriculum",
                "event_date": "2026-11-12",
                "location": "Peshawar",
                "max_capacity": 100,
            }

        }

    )
    title: str = Field(..., min_length=1, max_length=200, description="The title of the event.")
    description: str | None = Field(None, max_length=2000, description="A detailed description of the event.")
    event_date: date = Field(..., description="The date when the event will take place.")
    location: str = Field(..., min_length=1, max_length=255, description="Location of the event")
    max_capacity: int = Field(..., ge=1, description="Maximum attendees (must be > 0)")

class EventCreate(EventBase):
    """Describe the information needed to create an event."""

class EventUpdate(EventBase):
    """Describe the information used to update an event."""

class EventResponse(EventBase):
    """Describe the event data returned by the API."""

    id: int
    model_config = ConfigDict(from_attributes=True)




