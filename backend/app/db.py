"""Database connection setup using the SQLAlchemy 2.0 async engine."""
import asyncio
import socket

# Force direct IPv4 resolution to eliminate 25s DNS timeouts and broken IPv6 hanging on dual-stack networks
_orig_getaddrinfo = socket.getaddrinfo
_NEON_IPV4 = [
    (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("52.76.212.156", 5432)),
    (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("3.0.27.201", 5432)),
    (socket.AF_INET, socket.SOCK_STREAM, 6, "", ("52.76.246.190", 5432)),
]


def _fast_neon_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if host and "neon.tech" in str(host):
        return [(f, t, p, c, (ip, port)) for f, t, p, c, (ip, _) in _NEON_IPV4]
    return _orig_getaddrinfo(host, port, family, type, proto, flags)


socket.getaddrinfo = _fast_neon_getaddrinfo

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# The engine manages connections to PostgreSQL (Neon).
# pool_pre_ping is disabled to eliminate 15-20s pre-ping latency over international network.
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=False,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
)

# Factory that creates a new session (one "conversation" with the database).
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Parent class for all database models (tables)."""


async def get_db():
    """Give each request its own database session, then close it automatically."""
    async with AsyncSessionLocal() as session:
        yield session
