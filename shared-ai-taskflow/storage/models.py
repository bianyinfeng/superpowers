"""Database models using SQLAlchemy."""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    DECOMPOSING = "decomposing"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class KeyStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    RATE_LIMITED = "rate_limited"
    EXHAUSTED = "exhausted"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    subtasks = relationship("SubTask", back_populates="task", cascade="all, delete-orphan")


class SubTask(Base):
    __tablename__ = "subtasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(Integer, default=0)
    dependencies = Column(Text, default="[]")  # JSON list of subtask IDs
    result = Column(Text, nullable=True)
    assigned_key_id = Column(String, ForeignKey("api_keys.id"), nullable=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="subtasks")
    api_key = relationship("APIKeyRecord", back_populates="subtasks")


class APIKeyRecord(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, nullable=False)
    encrypted_key = Column(String, nullable=False)
    provider = Column(String, nullable=False)  # openai, anthropic, google, etc.
    model_name = Column(String, nullable=True)
    status = Column(Enum(KeyStatus), default=KeyStatus.ACTIVE)
    total_tokens_used = Column(Integer, default=0)
    request_count = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    registered_at = Column(DateTime, default=func.now())

    subtasks = relationship("SubTask", back_populates="api_key")
    usage_logs = relationship("TokenUsageLog", back_populates="api_key")


class TokenUsageLog(Base):
    __tablename__ = "token_usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    api_key_id = Column(String, ForeignKey("api_keys.id"), nullable=False)
    subtask_id = Column(String, ForeignKey("subtasks.id"), nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    model = Column(String, nullable=False)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())

    api_key = relationship("APIKeyRecord", back_populates="usage_logs")


class RewardAccount(Base):
    __tablename__ = "reward_accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, unique=True, nullable=False)
    total_tokens_contributed = Column(Integer, default=0)
    total_reward_earned = Column(Float, default=0.0)
    total_reward_paid = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
