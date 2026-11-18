"""Add up to 15 repeatable sample events for local pagination testing."""
import asyncio
from datetime import date, timedelta

from sqlalchemy import select

from app.models import Event
from app.db import AsyncSessionLocal, engine

SAMPLE_TITLES = [
    "Team kickoff",
    "Product planning workshop",
    "Customer success meetup",
    "Design thinking session",
    "Quarterly town hall",
    "Innovation showcase",
    "Wellness morning",
    "New team welcome",
    "Leadership roundtable",
    "Community volunteer day",
    "Learning and development day",
    "Project retrospective",
    "Company celebration",
    "Cross-team collaboration",
    "Year-end gathering",
]


async def seed_test_events():
    """Create missing sample events without duplicating existing sample data."""
    titles = [
        f"Test Event {index:02d} - {name}"
        for index, name in enumerate(SAMPLE_TITLES, start=1)
    ]
    async with AsyncSessionLocal() as db:
        existing_titles = set(
            (
                await db.scalars(
                    select(Event.title).where(Event.title.in_(titles))
                )
            ).all()
        )
        events = [
            Event(
                title=title,
                description="Sample event for checking the event dashboard and pagination.",
                event_date=date.today() + timedelta(days=index * 4),
                location=("Main office" if index % 2 else "Online"),
                max_capacity=25 + index,
            )
            for index, title in enumerate(titles, start=1)
            if title not in existing_titles
        ]
        db.add_all(events)
        if events:
            await db.commit()
    await engine.dispose()
    print(f"Added {len(events)} sample events; {len(existing_titles)} were already present.")


asyncio.run(seed_test_events())
