"""Business logic: the database operations for events."""
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event, Registration
from app.schemas import EventCreate, RegistrationCreate, EventUpdate


class RegistrationConflict(Exception):
    """Raised when an attendee is already registered for an event."""


class EventAtCapacity(Exception):
    """Raised when an event has no remaining attendee spaces."""


class CapacityBelowRegistrations(Exception):
    """Raised when an event's capacity is reduced below its current attendance."""


async def create_event(db: AsyncSession, data: EventCreate) -> Event:
    """Insert a new event and return it (with its generated id)."""
    event = Event(**data.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def list_events(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    title: str | None = None,
    event_date: date | None = None,
) -> tuple[list[Event], int]:
    """Return a filtered event page and the total number of matches."""
    filters = []
    if title:
        filters.append(Event.title.ilike(f"%{title}%"))
    if event_date is not None:
        filters.append(Event.event_date == event_date)

    total = await db.scalar(select(func.count()).select_from(Event).where(*filters))
    query = (
        select(Event)
        .where(*filters)
        .order_by(Event.event_date, Event.id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all()), total or 0


async def get_event(db: AsyncSession, event_id: int) -> Event | None:
    """Return one event by id, or None if it doesn't exist."""
    return await db.get(Event, event_id)


async def update_event(db: AsyncSession, event_id: int, data: EventUpdate) -> Event | None:
    """Replace all fields of an event. Returns None if it doesn't exist."""
    event = await db.scalar(
        select(Event).where(Event.id == event_id).with_for_update()
    )
    if event is None:
        return None
    registration_count = await db.scalar(
        select(func.count())
        .select_from(Registration)
        .where(Registration.event_id == event_id)
    )
    if data.max_capacity < (registration_count or 0):
        raise CapacityBelowRegistrations
    for field, value in data.model_dump().items():
        setattr(event, field, value)
    await db.commit()
    await db.refresh(event)
    return event


async def delete_event(db: AsyncSession, event_id: int) -> bool:
    """Delete an event. Returns False if it doesn't exist."""
    event = await db.get(Event, event_id)
    if event is None:
        return False
    await db.delete(event)
    await db.commit()
    return True


async def list_registrations(
    db: AsyncSession, event_id: int
) -> list[Registration] | None:
    """Return attendee registrations, or None when their event does not exist."""
    if await db.get(Event, event_id) is None:
        return None
    result = await db.execute(
        select(Registration)
        .where(Registration.event_id == event_id)
        .order_by(Registration.id)
    )
    return list(result.scalars().all())


async def create_registration(
    db: AsyncSession,
    event_id: int,
    data: RegistrationCreate,
) -> Registration | None:
    """Add an attendee unless the event is missing, full, or already includes them."""
    event = await db.scalar(
        select(Event).where(Event.id == event_id).with_for_update()
    )
    if event is None:
        return None

    normalized_email = str(data.employee_email).strip().casefold()
    existing = await db.scalar(
        select(Registration.id).where(
            Registration.event_id == event_id,
            func.lower(Registration.employee_email) == normalized_email,
        )
    )
    if existing is not None:
        raise RegistrationConflict

    registration_count = await db.scalar(
        select(func.count())
        .select_from(Registration)
        .where(Registration.event_id == event_id)
    )
    if (registration_count or 0) >= event.max_capacity:
        raise EventAtCapacity

    registration = Registration(
        event_id=event_id,
        employee_name=data.employee_name,
        employee_email=normalized_email,
    )
    db.add(registration)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise RegistrationConflict from None
    await db.refresh(registration)
    return registration


async def delete_registration(db: AsyncSession, registration_id: int) -> bool:
    """Remove one attendee registration, returning False when it does not exist."""
    registration = await db.get(Registration, registration_id)
    if registration is None:
        return False
    await db.delete(registration)
    await db.commit()
    return True