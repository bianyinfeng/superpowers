"""Tests for the TaskDecomposer module."""

from unittest.mock import AsyncMock, patch

import pytest

from task_decomposer.decomposer import DecomposedSubtask, TaskDecomposer


@pytest.fixture
def decomposer():
    return TaskDecomposer(max_depth=2, max_subtasks=10)


@pytest.mark.asyncio
async def test_decompose_returns_subtasks(decomposer):
    mock_response = AsyncMock()
    mock_response.choices = [
        AsyncMock(
            message=AsyncMock(
                content='{"reasoning":"Test","subtasks":[{"id":"s1","title":"Sub 1","description":"Do thing 1","priority":0,"dependencies":[]},{"id":"s2","title":"Sub 2","description":"Do thing 2","priority":1,"dependencies":["s1"]}]}'
            )
        )
    ]

    with patch("litellm.acompletion", return_value=mock_response):
        result = await decomposer.decompose("Build a web app")

    assert len(result.subtasks) == 2
    assert result.subtasks[0].title == "Sub 1"
    assert result.subtasks[1].dependencies == ["s1"]
    assert result.reasoning == "Test"


@pytest.mark.asyncio
async def test_decompose_respects_max_subtasks():
    decomposer = TaskDecomposer(max_subtasks=1)
    mock_response = AsyncMock()
    mock_response.choices = [
        AsyncMock(
            message=AsyncMock(
                content='{"reasoning":"","subtasks":[{"id":"s1","title":"A","description":"a","priority":0,"dependencies":[]},{"id":"s2","title":"B","description":"b","priority":1,"dependencies":[]}]}'
            )
        )
    ]

    with patch("litellm.acompletion", return_value=mock_response):
        result = await decomposer.decompose("Complex task")

    assert len(result.subtasks) == 1
