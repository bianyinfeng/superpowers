"""Database connection and session management."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from storage.models import Base

_engine = None
_session_factory = None


class Database:
    """Manages database connection lifecycle."""

    def __init__(self, url: str = "sqlite+aiosqlite:///taskflow.db"):
        self.url = url
        self.engine = create_async_engine(url, echo=False)
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)

    async def init(self) -> None:
        """Create all tables."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def close(self) -> None:
        """Close database engine."""
        await self.engine.dispose()

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """Provide a transactional session."""
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise


_db_instance: Database | None = None


def get_db() -> Database:
    """Get the global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance


def set_db(db: Database) -> None:
    """Set the global database instance (for testing)."""
    global _db_instance
    _db_instance = db
