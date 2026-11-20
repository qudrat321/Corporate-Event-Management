"""Database connection setup using the SQLAlchemy 2.0 async engine."""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

_engine_kwargs: dict = {
    "pool_pre_ping": True,
}

# Neon/Postgres pool tuning. SQLite (tests) uses StaticPool and rejects these.
if settings.database_url.startswith("postgresql"):
    _engine_kwargs.update(
        {
            "pool_size": 5,
            "max_overflow": 10,
            "pool_recycle": 180,
            "connect_args": {
                "timeout": 10,
                "command_timeout": 30,
            },
        }
    )

engine = create_async_engine(settings.database_url, **_engine_kwargs)

# Factory that creates a new session (one "conversation" with the database).
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Parent class for all database models (tables)."""


async def get_db():
    """Give each request its own database session, then close it automatically."""
    async with AsyncSessionLocal() as session:
        yield session
