# Set up the database tools used by the app.
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
# Provide the shared base class for database models.
from sqlalchemy.orm import DeclarativeBase

# Read the database address from the app settings.
from app.config import settings

# Create the async database engine and keep connections ready to use.
engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)
# Create a database session linked to the engine.
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    """Provide a shared base for database models."""

async def get_db():
    """Give callers a database session and close it when they finish."""
    async with AsyncSessionLocal() as session:
        # Hand the open session to the caller.
        yield session