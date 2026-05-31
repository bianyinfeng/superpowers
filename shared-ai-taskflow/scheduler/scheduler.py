"""Task scheduler with DAG-based execution.

Picks executable subtasks from the DAG, assigns API keys,
handles retries and concurrency control.
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime

import litellm
from sqlalchemy import select, update

from api_key_pool.pool import APIKeyPool, LoadBalanceStrategy
from storage.database import get_db
from storage.models import KeyStatus, SubTask, Task, TaskStatus
from token_accountant.accountant import TokenAccountant

logger = logging.getLogger(__name__)


class TaskScheduler:
    """Schedules and executes subtasks from the task DAG."""

    def __init__(
        self,
        key_pool: APIKeyPool,
        accountant: TokenAccountant,
        max_concurrency: int = 5,
        max_retries: int = 3,
    ):
        self.key_pool = key_pool
        self.accountant = accountant
        self.max_concurrency = max_concurrency
        self.max_retries = max_retries
        self._semaphore = asyncio.Semaphore(max_concurrency)
        self._running = False

    async def get_ready_subtasks(self, task_id: str) -> list[SubTask]:
        """Get subtasks whose dependencies are all completed."""
        db = get_db()
        async with db.session() as session:
            result = await session.execute(
                select(SubTask).where(
                    SubTask.task_id == task_id,
                    SubTask.status == TaskStatus.PENDING,
                )
            )
            pending = result.scalars().all()

            # Get completed subtask IDs
            completed_result = await session.execute(
                select(SubTask.id).where(
                    SubTask.task_id == task_id,
                    SubTask.status == TaskStatus.COMPLETED,
                )
            )
            completed_ids = set(row[0] for row in completed_result.all())

            ready = []
            for subtask in pending:
                deps = json.loads(subtask.dependencies) if subtask.dependencies else []
                if all(dep in completed_ids for dep in deps):
                    ready.append(subtask)

            # Sort by priority
            ready.sort(key=lambda s: s.priority)
            return ready

    async def execute_subtask(self, subtask_id: str) -> bool:
        """Execute a single subtask using an available API key.

        Returns True if successful, False otherwise.
        """
        async with self._semaphore:
            db = get_db()

            # Get the subtask
            async with db.session() as session:
                result = await session.execute(
                    select(SubTask).where(SubTask.id == subtask_id)
                )
                subtask = result.scalar_one_or_none()
                if subtask is None:
                    return False

                # Mark as running
                await session.execute(
                    update(SubTask)
                    .where(SubTask.id == subtask_id)
                    .values(status=TaskStatus.RUNNING)
                )

            # Get an available key
            key_info = await self.key_pool.get_available_key(
                strategy=LoadBalanceStrategy.LEAST_USED
            )
            if key_info is None:
                logger.error("No available API keys for subtask %s", subtask_id)
                async with db.session() as session:
                    await session.execute(
                        update(SubTask)
                        .where(SubTask.id == subtask_id)
                        .values(status=TaskStatus.PENDING)
                    )
                return False

            key_id, api_key = key_info

            # Execute with retries
            for attempt in range(self.max_retries):
                try:
                    response = await litellm.acompletion(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "Complete the following task."},
                            {"role": "user", "content": subtask.description},
                        ],
                        api_key=api_key,
                    )

                    result_text = response.choices[0].message.content
                    usage = response.usage

                    # Record token usage
                    await self.accountant.record_usage(
                        api_key_id=key_id,
                        subtask_id=subtask_id,
                        model="gpt-4o-mini",
                        prompt_tokens=usage.prompt_tokens,
                        completion_tokens=usage.completion_tokens,
                    )

                    # Mark as completed
                    async with db.session() as session:
                        await session.execute(
                            update(SubTask)
                            .where(SubTask.id == subtask_id)
                            .values(
                                status=TaskStatus.COMPLETED,
                                result=result_text,
                                assigned_key_id=key_id,
                                tokens_used=usage.total_tokens,
                                completed_at=datetime.utcnow(),
                            )
                        )
                    return True

                except Exception as e:
                    logger.warning(
                        "Subtask %s attempt %d failed: %s", subtask_id, attempt + 1, e
                    )
                    if "rate_limit" in str(e).lower():
                        await self.key_pool.mark_key_status(key_id, KeyStatus.RATE_LIMITED)
                        # Try with a different key
                        key_info = await self.key_pool.get_available_key(
                            strategy=LoadBalanceStrategy.LEAST_USED
                        )
                        if key_info:
                            key_id, api_key = key_info
                    await asyncio.sleep(2**attempt)

            # All retries failed
            async with db.session() as session:
                await session.execute(
                    update(SubTask)
                    .where(SubTask.id == subtask_id)
                    .values(status=TaskStatus.FAILED)
                )
            return False

    async def run_task(self, task_id: str) -> bool:
        """Run all subtasks for a task respecting the DAG order.

        Returns True if all subtasks completed successfully.
        """
        self._running = True
        db = get_db()

        # Mark task as running
        async with db.session() as session:
            await session.execute(
                update(Task).where(Task.id == task_id).values(status=TaskStatus.RUNNING)
            )

        while self._running:
            ready = await self.get_ready_subtasks(task_id)
            if not ready:
                # Check if all done or if there's a failure
                async with db.session() as session:
                    result = await session.execute(
                        select(SubTask).where(
                            SubTask.task_id == task_id,
                            SubTask.status.in_([TaskStatus.PENDING, TaskStatus.RUNNING]),
                        )
                    )
                    remaining = result.scalars().all()
                    if not remaining:
                        break
                    # If some are running, wait
                    await asyncio.sleep(1)
                    continue

            # Execute ready subtasks concurrently
            tasks = [self.execute_subtask(s.id) for s in ready]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Check for failures
            if any(r is False or isinstance(r, Exception) for r in results):
                logger.warning("Some subtasks failed for task %s", task_id)

        # Check final status
        async with db.session() as session:
            result = await session.execute(
                select(SubTask).where(
                    SubTask.task_id == task_id, SubTask.status == TaskStatus.FAILED
                )
            )
            failed = result.scalars().all()

            final_status = TaskStatus.COMPLETED if not failed else TaskStatus.FAILED
            await session.execute(
                update(Task).where(Task.id == task_id).values(status=final_status)
            )

        return final_status == TaskStatus.COMPLETED

    def stop(self) -> None:
        """Stop the scheduler."""
        self._running = False
