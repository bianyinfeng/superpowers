"""Tests for the TaskScheduler module."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from scheduler.scheduler import CyclicDependencyError, TaskScheduler


@pytest.fixture
def scheduler():
    key_pool = MagicMock()
    accountant = MagicMock()
    return TaskScheduler(key_pool=key_pool, accountant=accountant)


@pytest.mark.asyncio
async def test_check_for_cycles_no_cycle(scheduler):
    """No error raised when DAG has no cycles."""
    subtask1 = MagicMock(id="s1", dependencies="[]")
    subtask2 = MagicMock(id="s2", dependencies='["s1"]')
    subtask3 = MagicMock(id="s3", dependencies='["s2"]')

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [subtask1, subtask2, subtask3]

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    mock_db = MagicMock()
    mock_db.session.return_value.__aenter__ = AsyncMock(return_value=mock_session)
    mock_db.session.return_value.__aexit__ = AsyncMock(return_value=None)

    with patch("scheduler.scheduler.get_db", return_value=mock_db):
        # Should not raise
        await scheduler._check_for_cycles("task-1")


@pytest.mark.asyncio
async def test_check_for_cycles_with_cycle(scheduler):
    """CyclicDependencyError raised when DAG contains a cycle."""
    subtask1 = MagicMock(id="s1", dependencies='["s3"]')
    subtask2 = MagicMock(id="s2", dependencies='["s1"]')
    subtask3 = MagicMock(id="s3", dependencies='["s2"]')

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [subtask1, subtask2, subtask3]

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    mock_db = MagicMock()
    mock_db.session.return_value.__aenter__ = AsyncMock(return_value=mock_session)
    mock_db.session.return_value.__aexit__ = AsyncMock(return_value=None)

    with patch("scheduler.scheduler.get_db", return_value=mock_db):
        with pytest.raises(CyclicDependencyError):
            await scheduler._check_for_cycles("task-1")


@pytest.mark.asyncio
async def test_check_for_cycles_empty_dag(scheduler):
    """No error when DAG is empty."""
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    mock_db = MagicMock()
    mock_db.session.return_value.__aenter__ = AsyncMock(return_value=mock_session)
    mock_db.session.return_value.__aexit__ = AsyncMock(return_value=None)

    with patch("scheduler.scheduler.get_db", return_value=mock_db):
        await scheduler._check_for_cycles("task-1")
