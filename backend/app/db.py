"""Database connection setup using the SQLAlchemy 2.0 async engine."""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# The engine manages connections to PostgreSQL (Neon).
# pool_pre_ping checks a connection is alive before using it (Neon pauses when idle).
engine = create_async_engine(settings.database_url, pool_pre_ping=True)

# Factory that creates a new session (one "conversation" with the database).
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Parent class for all database models (tables)."""


async def get_db():
    """Give each request its own database session, then close it automatically."""
    async with AsyncSessionLocal() as session:
        yield session