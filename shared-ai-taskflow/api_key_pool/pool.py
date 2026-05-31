"""API Key pool management.

Handles key registration, health checking, load balancing,
and status monitoring.
"""

from __future__ import annotations

import enum
import secrets
from datetime import datetime

from cryptography.fernet import Fernet
from sqlalchemy import select, update

from storage.database import get_db
from storage.models import APIKeyRecord, KeyStatus


class LoadBalanceStrategy(str, enum.Enum):
    ROUND_ROBIN = "round_robin"
    LEAST_USED = "least_used"
    RANDOM = "random"


class APIKeyPool:
    """Manages a pool of shared API keys."""

    def __init__(self, encryption_key: bytes | None = None):
        """Initialize pool with optional encryption key for storing API keys."""
        if encryption_key is None:
            encryption_key = Fernet.generate_key()
        self._cipher = Fernet(encryption_key)
        self._round_robin_index = 0

    def _encrypt_key(self, api_key: str) -> str:
        """Encrypt an API key for secure storage."""
        return self._cipher.encrypt(api_key.encode()).decode()

    def _decrypt_key(self, encrypted_key: str) -> str:
        """Decrypt a stored API key."""
        return self._cipher.decrypt(encrypted_key.encode()).decode()

    async def register_key(
        self,
        owner_id: str,
        api_key: str,
        provider: str,
        model_name: str | None = None,
    ) -> str:
        """Register a new API key in the pool.

        Returns the key record ID.
        """
        encrypted = self._encrypt_key(api_key)
        db = get_db()
        async with db.session() as session:
            record = APIKeyRecord(
                owner_id=owner_id,
                encrypted_key=encrypted,
                provider=provider,
                model_name=model_name,
                status=KeyStatus.ACTIVE,
            )
            session.add(record)
            await session.flush()
            return record.id

    async def deregister_key(self, key_id: str) -> bool:
        """Remove an API key from the pool."""
        db = get_db()
        async with db.session() as session:
            result = await session.execute(
                select(APIKeyRecord).where(APIKeyRecord.id == key_id)
            )
            record = result.scalar_one_or_none()
            if record is None:
                return False
            await session.delete(record)
            return True

    async def get_available_key(
        self,
        provider: str | None = None,
        strategy: LoadBalanceStrategy = LoadBalanceStrategy.LEAST_USED,
    ) -> tuple[str, str] | None:
        """Select an available key based on the load balancing strategy.

        Returns (key_id, decrypted_api_key) or None if no keys available.
        """
        db = get_db()
        async with db.session() as session:
            query = select(APIKeyRecord).where(APIKeyRecord.status == KeyStatus.ACTIVE)
            if provider:
                query = query.where(APIKeyRecord.provider == provider)

            if strategy == LoadBalanceStrategy.LEAST_USED:
                query = query.order_by(APIKeyRecord.total_tokens_used.asc())
            elif strategy == LoadBalanceStrategy.RANDOM:
                query = query.order_by(APIKeyRecord.id)  # Simplified; true random in production

            result = await session.execute(query)
            keys = result.scalars().all()

            if not keys:
                return None

            if strategy == LoadBalanceStrategy.ROUND_ROBIN:
                selected = keys[self._round_robin_index % len(keys)]
                self._round_robin_index += 1
            elif strategy == LoadBalanceStrategy.RANDOM:
                import random
                selected = random.choice(keys)
            else:
                selected = keys[0]  # least_used is already sorted

            return selected.id, self._decrypt_key(selected.encrypted_key)

    async def mark_key_status(self, key_id: str, status: KeyStatus) -> None:
        """Update the status of a key."""
        db = get_db()
        async with db.session() as session:
            await session.execute(
                update(APIKeyRecord)
                .where(APIKeyRecord.id == key_id)
                .values(status=status)
            )

    async def record_usage(self, key_id: str, tokens_used: int) -> None:
        """Record token usage for a key."""
        db = get_db()
        async with db.session() as session:
            await session.execute(
                update(APIKeyRecord)
                .where(APIKeyRecord.id == key_id)
                .values(
                    total_tokens_used=APIKeyRecord.total_tokens_used + tokens_used,
                    request_count=APIKeyRecord.request_count + 1,
                    last_used_at=datetime.utcnow(),
                )
            )

    async def health_check(self, key_id: str) -> bool:
        """Check if a key is still valid by making a minimal API call.

        Returns True if healthy, False otherwise.
        """
        db = get_db()
        async with db.session() as session:
            result = await session.execute(
                select(APIKeyRecord).where(APIKeyRecord.id == key_id)
            )
            record = result.scalar_one_or_none()
            if record is None:
                return False

            try:
                import litellm
                decrypted = self._decrypt_key(record.encrypted_key)
                # Minimal call to verify key validity
                await litellm.acompletion(
                    model=f"{record.provider}/gpt-4o-mini"
                    if record.model_name is None
                    else record.model_name,
                    messages=[{"role": "user", "content": "hi"}],
                    max_tokens=1,
                    api_key=decrypted,
                )
                return True
            except Exception:
                await self.mark_key_status(key_id, KeyStatus.INACTIVE)
                return False

    async def list_keys(self, owner_id: str | None = None) -> list[dict]:
        """List all keys, optionally filtered by owner."""
        db = get_db()
        async with db.session() as session:
            query = select(APIKeyRecord)
            if owner_id:
                query = query.where(APIKeyRecord.owner_id == owner_id)
            result = await session.execute(query)
            keys = result.scalars().all()
            return [
                {
                    "id": k.id,
                    "owner_id": k.owner_id,
                    "provider": k.provider,
                    "model_name": k.model_name,
                    "status": k.status.value,
                    "total_tokens_used": k.total_tokens_used,
                    "request_count": k.request_count,
                    "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                }
                for k in keys
            ]
