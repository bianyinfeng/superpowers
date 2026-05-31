"""AI task decomposition engine.

Receives a large task description, uses AI to recursively decompose it
into atomic subtasks, generates a task dependency graph (DAG), and
prioritizes subtasks.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field

import litellm


@dataclass
class DecomposedSubtask:
    """A single atomic subtask from decomposition."""

    title: str
    description: str
    priority: int = 0
    dependencies: list[str] = field(default_factory=list)


@dataclass
class DecompositionResult:
    """Result of task decomposition."""

    subtasks: list[DecomposedSubtask]
    reasoning: str = ""


DECOMPOSE_SYSTEM_PROMPT = """\
You are a task decomposition expert. Given a complex task, break it down into \
atomic subtasks that can each be completed in a single AI API call.

Rules:
1. Each subtask must be self-contained and clearly described
2. Identify dependencies between subtasks (which must complete before others)
3. Assign priority (0=highest priority, higher numbers=lower priority)
4. Keep subtask descriptions concise but complete
5. Maximum decomposition depth: generate no more than 20 subtasks

Respond in JSON format:
{
  "reasoning": "Brief explanation of your decomposition strategy",
  "subtasks": [
    {
      "id": "subtask_1",
      "title": "Short title",
      "description": "Detailed description of what this subtask should accomplish",
      "priority": 0,
      "dependencies": []
    },
    {
      "id": "subtask_2",
      "title": "Another subtask",
      "description": "Description",
      "priority": 1,
      "dependencies": ["subtask_1"]
    }
  ]
}"""


class TaskDecomposer:
    """Decomposes large tasks into atomic subtasks using AI."""

    def __init__(self, max_depth: int = 3, max_subtasks: int = 20):
        self.max_depth = max_depth
        self.max_subtasks = max_subtasks

    async def decompose(
        self,
        task_description: str,
        model: str = "gpt-4o-mini",
        api_key: str | None = None,
        context: str = "",
    ) -> DecompositionResult:
        """Decompose a task into subtasks.

        Args:
            task_description: The full task description to decompose.
            model: The AI model to use for decomposition.
            api_key: Optional API key override.
            context: Additional context from doc_packer.

        Returns:
            DecompositionResult with list of subtasks and reasoning.
        """
        user_message = f"Task to decompose:\n{task_description}"
        if context:
            user_message = f"Project context:\n{context}\n\n{user_message}"

        kwargs: dict = {
            "model": model,
            "messages": [
                {"role": "system", "content": DECOMPOSE_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }
        if api_key:
            kwargs["api_key"] = api_key

        response = await litellm.acompletion(**kwargs)
        content = response.choices[0].message.content
        data = json.loads(content)

        subtasks = []
        for item in data.get("subtasks", [])[:self.max_subtasks]:
            subtasks.append(
                DecomposedSubtask(
                    title=item["title"],
                    description=item["description"],
                    priority=item.get("priority", 0),
                    dependencies=item.get("dependencies", []),
                )
            )

        return DecompositionResult(
            subtasks=subtasks,
            reasoning=data.get("reasoning", ""),
        )

    async def decompose_recursive(
        self,
        task_description: str,
        model: str = "gpt-4o-mini",
        api_key: str | None = None,
        context: str = "",
        depth: int = 0,
    ) -> DecompositionResult:
        """Recursively decompose tasks that are still too complex.

        Subtasks with descriptions longer than 500 chars are considered
        potentially complex and decomposed further up to max_depth.
        """
        result = await self.decompose(task_description, model, api_key, context)

        if depth >= self.max_depth:
            return result

        expanded_subtasks: list[DecomposedSubtask] = []
        for subtask in result.subtasks:
            if len(subtask.description) > 500:
                sub_result = await self.decompose_recursive(
                    subtask.description, model, api_key, context, depth + 1
                )
                expanded_subtasks.extend(sub_result.subtasks)
            else:
                expanded_subtasks.append(subtask)

        return DecompositionResult(
            subtasks=expanded_subtasks,
            reasoning=result.reasoning,
        )
