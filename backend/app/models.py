"""SQLAlchemy models: Python classes that map to PostgreSQL tables."""
from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Event(Base):
    """A corporate event (workshop, launch, conference, ...)."""

    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    event_date: Mapped[date] = mapped_column(Date, index=True)
    location: Mapped[str] = mapped_column(String(255))
    max_capacity: Mapped[int]
    # passive_deletes lets PostgreSQL CASCADE remove registrations without an extra SELECT.
    registrations: Mapped[list[Registration]] = relationship(
        back_populates="event",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Registration(Base):
    """An attendee's registration for one event."""

    __tablename__ = "registrations"
    __table_args__ = (
        UniqueConstraint(
            "event_id",
            "employee_email",
            name="uq_registration_event_email",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"),
        index=True,
    )
    employee_name: Mapped[str] = mapped_column(String(200))
    employee_email: Mapped[str] = mapped_column(String(320))
    event: Mapped[Event] = relationship(back_populates="registrations")
