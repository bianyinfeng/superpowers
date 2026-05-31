"""FastAPI application and REST endpoints."""

from __future__ import annotations

import json
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from api_key_pool.pool import APIKeyPool
from doc_packer.packer import DocPacker
from scheduler.scheduler import TaskScheduler
from storage.database import get_db
from storage.models import SubTask, Task, TaskStatus
from task_decomposer.decomposer import TaskDecomposer
from token_accountant.accountant import TokenAccountant

# Global instances
key_pool = APIKeyPool()
accountant = TokenAccountant()
decomposer = TaskDecomposer()
doc_packer = DocPacker()
task_scheduler = TaskScheduler(key_pool=key_pool, accountant=accountant)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: init and cleanup."""
    db = get_db()
    await db.init()
    yield
    await db.close()


app = FastAPI(
    title="Shared AI Taskflow",
    description="AI task decomposition framework using shared idle API keys",
    version="0.1.0",
    lifespan=lifespan,
)


# --- Request/Response Models ---


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=50000)
    context_directory: str | None = None


class TaskResponse(BaseModel):
    id: str
    title: str
    status: str
    subtask_count: int = 0


class KeyRegisterRequest(BaseModel):
    owner_id: str
    api_key: str
    provider: str
    model_name: str | None = None


class KeyResponse(BaseModel):
    id: str
    message: str


class RewardResponse(BaseModel):
    owner_id: str
    total_tokens_contributed: int
    total_reward_earned: float
    total_reward_paid: float
    balance: float


# --- Task Endpoints ---


@app.post("/tasks", response_model=TaskResponse)
async def create_task(request: TaskCreateRequest):
    """Submit a new task for AI decomposition and execution."""
    db = get_db()

    # Create the task
    async with db.session() as session:
        task = Task(
            title=request.title,
            description=request.description,
            status=TaskStatus.DECOMPOSING,
        )
        session.add(task)
        await session.flush()
        task_id = task.id

    # Decompose the task
    context = ""
    if request.context_directory:
        packed = doc_packer.pack_directory(request.context_directory)
        context = packed.summary

    try:
        result = await decomposer.decompose(request.description, context=context)
    except Exception as e:
        async with db.session() as session:
            from sqlalchemy import update

            await session.execute(
                update(Task).where(Task.id == task_id).values(status=TaskStatus.FAILED)
            )
        raise HTTPException(status_code=500, detail=f"Decomposition failed: {e}")

    # Store subtasks
    async with db.session() as session:
        for i, sub in enumerate(result.subtasks):
            subtask = SubTask(
                task_id=task_id,
                title=sub.title,
                description=sub.description,
                priority=sub.priority,
                dependencies=json.dumps(sub.dependencies),
            )
            session.add(subtask)

        from sqlalchemy import update

        await session.execute(
            update(Task).where(Task.id == task_id).values(status=TaskStatus.READY)
        )

    return TaskResponse(
        id=task_id,
        title=request.title,
        status="ready",
        subtask_count=len(result.subtasks),
    )


@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Get task status."""
    db = get_db()
    async with db.session() as session:
        from sqlalchemy import func, select

        result = await session.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        count_result = await session.execute(
            select(func.count(SubTask.id)).where(SubTask.task_id == task_id)
        )
        count = count_result.scalar()

        return TaskResponse(
            id=task.id,
            title=task.title,
            status=task.status.value,
            subtask_count=count or 0,
        )


@app.post("/tasks/{task_id}/execute")
async def execute_task(task_id: str):
    """Start executing a task's subtasks."""
    import asyncio

    # Run in background
    asyncio.create_task(task_scheduler.run_task(task_id))
    return {"message": "Task execution started", "task_id": task_id}


# --- API Key Endpoints ---


@app.post("/keys", response_model=KeyResponse)
async def register_key(request: KeyRegisterRequest):
    """Register a new API key in the shared pool."""
    key_id = await key_pool.register_key(
        owner_id=request.owner_id,
        api_key=request.api_key,
        provider=request.provider,
        model_name=request.model_name,
    )
    return KeyResponse(id=key_id, message="Key registered successfully")


@app.delete("/keys/{key_id}")
async def deregister_key(key_id: str):
    """Remove an API key from the pool."""
    success = await key_pool.deregister_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="Key not found")
    return {"message": "Key removed successfully"}


@app.get("/keys")
async def list_keys(owner_id: str | None = None):
    """List all registered keys (without exposing the actual key values)."""
    return await key_pool.list_keys(owner_id=owner_id)


# --- Reward Endpoints ---


@app.get("/rewards/{owner_id}", response_model=RewardResponse)
async def get_rewards(owner_id: str):
    """Get reward balance for an API key owner."""
    report = await accountant.get_owner_report(owner_id)
    return RewardResponse(**report)


@app.get("/rewards/summary/all")
async def get_usage_summary():
    """Get overall platform usage summary."""
    return await accountant.get_usage_summary()


# --- Entry point ---


def run():
    """Run the API server."""
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
