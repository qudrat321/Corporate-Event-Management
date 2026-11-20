"""One-off script: create every table defined in models.py."""
import asyncio

from sqlalchemy import inspect, text

from app import models  # noqa: F401  (importing registers the tables on Base)
from app.db import Base, engine


async def create_tables():
    """Migrate the event title column, then create any missing tables and indexes."""
    async with engine.begin() as conn:

        def rename_legacy_event_title(sync_conn):
            inspector = inspect(sync_conn)
            if not inspector.has_table("events"):
                return
            columns = {column["name"] for column in inspector.get_columns("events")}
            if "name" in columns and "title" not in columns:
                sync_conn.execute(text("ALTER TABLE events RENAME COLUMN name TO title"))

        def ensure_event_date_index(sync_conn):
            inspector = inspect(sync_conn)
            if not inspector.has_table("events"):
                return
            existing = {index["name"] for index in inspector.get_indexes("events")}
            if "ix_events_event_date" not in existing:
                sync_conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS ix_events_event_date "
                        "ON events (event_date)"
                    )
                )

        await conn.run_sync(rename_legacy_event_title)
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(ensure_event_date_index)
    await engine.dispose()


asyncio.run(create_tables())
