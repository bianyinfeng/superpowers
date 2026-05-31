"""Token consumption tracking and reward calculation.

Records token usage per API call, aggregates by key owner,
computes rewards based on configurable rates, and generates reports.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import func, select, update

from storage.database import get_db
from storage.models import APIKeyRecord, RewardAccount, TokenUsageLog


@dataclass
class RewardRate:
    """Configurable reward rate per model."""

    model: str
    rate_per_1k_tokens: float  # USD per 1000 tokens


# Default reward rates (owner receives this much per 1K tokens consumed)
DEFAULT_REWARD_RATES: list[RewardRate] = [
    RewardRate(model="gpt-4o", rate_per_1k_tokens=0.002),
    RewardRate(model="gpt-4o-mini", rate_per_1k_tokens=0.0003),
    RewardRate(model="claude-3-5-sonnet", rate_per_1k_tokens=0.002),
    RewardRate(model="claude-3-haiku", rate_per_1k_tokens=0.0002),
    RewardRate(model="gemini-1.5-pro", rate_per_1k_tokens=0.001),
    RewardRate(model="default", rate_per_1k_tokens=0.001),
]


class TokenAccountant:
    """Tracks token consumption and calculates rewards for key owners."""

    def __init__(self, reward_rates: list[RewardRate] | None = None):
        self.reward_rates = {r.model: r for r in (reward_rates or DEFAULT_REWARD_RATES)}

    def get_rate(self, model: str) -> float:
        """Get reward rate for a model (USD per 1K tokens)."""
        rate = self.reward_rates.get(model)
        if rate:
            return rate.rate_per_1k_tokens
        return self.reward_rates.get("default", RewardRate("default", 0.001)).rate_per_1k_tokens

    def calculate_reward(self, model: str, total_tokens: int) -> float:
        """Calculate reward amount for token usage."""
        rate = self.get_rate(model)
        return (total_tokens / 1000.0) * rate

    async def record_usage(
        self,
        api_key_id: str,
        subtask_id: str,
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
    ) -> float:
        """Record token usage and return calculated reward.

        Args:
            api_key_id: The API key that was used.
            subtask_id: The subtask that consumed the tokens.
            model: The model name used.
            prompt_tokens: Number of prompt tokens.
            completion_tokens: Number of completion tokens.

        Returns:
            The reward amount in USD.
        """
        total_tokens = prompt_tokens + completion_tokens
        reward = self.calculate_reward(model, total_tokens)

        db = get_db()
        async with db.session() as session:
            log = TokenUsageLog(
                api_key_id=api_key_id,
                subtask_id=subtask_id,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                model=model,
                cost_usd=reward,
            )
            session.add(log)

            # Update the key's running total
            await session.execute(
                update(APIKeyRecord)
                .where(APIKeyRecord.id == api_key_id)
                .values(
                    total_tokens_used=APIKeyRecord.total_tokens_used + total_tokens,
                    request_count=APIKeyRecord.request_count + 1,
                    last_used_at=datetime.utcnow(),
                )
            )

            # Update reward account
            key_result = await session.execute(
                select(APIKeyRecord).where(APIKeyRecord.id == api_key_id)
            )
            key_record = key_result.scalar_one()

            reward_result = await session.execute(
                select(RewardAccount).where(RewardAccount.owner_id == key_record.owner_id)
            )
            account = reward_result.scalar_one_or_none()

            if account is None:
                account = RewardAccount(
                    owner_id=key_record.owner_id,
                    total_tokens_contributed=total_tokens,
                    total_reward_earned=reward,
                )
                session.add(account)
            else:
                await session.execute(
                    update(RewardAccount)
                    .where(RewardAccount.owner_id == key_record.owner_id)
                    .values(
                        total_tokens_contributed=RewardAccount.total_tokens_contributed
                        + total_tokens,
                        total_reward_earned=RewardAccount.total_reward_earned + reward,
                    )
                )

        return reward

    async def get_owner_report(self, owner_id: str) -> dict:
        """Generate a reward report for a key owner."""
        db = get_db()
        async with db.session() as session:
            account_result = await session.execute(
                select(RewardAccount).where(RewardAccount.owner_id == owner_id)
            )
            account = account_result.scalar_one_or_none()

            if account is None:
                return {
                    "owner_id": owner_id,
                    "total_tokens_contributed": 0,
                    "total_reward_earned": 0.0,
                    "total_reward_paid": 0.0,
                    "balance": 0.0,
                }

            return {
                "owner_id": owner_id,
                "total_tokens_contributed": account.total_tokens_contributed,
                "total_reward_earned": account.total_reward_earned,
                "total_reward_paid": account.total_reward_paid,
                "balance": account.total_reward_earned - account.total_reward_paid,
            }

    async def get_usage_summary(self) -> dict:
        """Get overall token usage summary."""
        db = get_db()
        async with db.session() as session:
            result = await session.execute(
                select(
                    func.count(TokenUsageLog.id).label("total_calls"),
                    func.sum(TokenUsageLog.total_tokens).label("total_tokens"),
                    func.sum(TokenUsageLog.cost_usd).label("total_rewards"),
                )
            )
            row = result.one()
            return {
                "total_calls": row.total_calls or 0,
                "total_tokens": row.total_tokens or 0,
                "total_rewards_usd": float(row.total_rewards or 0.0),
            }
