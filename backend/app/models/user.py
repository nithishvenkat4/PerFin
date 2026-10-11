"""User SQLAlchemy ORM model."""

import uuid
from typing import List, Optional
from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="USER", nullable=False)  # USER, ADMIN

    # Relationships
    financial_profile: Mapped[Optional["FinancialProfile"]] = relationship(
        "FinancialProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    goals: Mapped[List["Goal"]] = relationship(
        "Goal",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    investments: Mapped[List["Investment"]] = relationship(
        "Investment",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    incomes: Mapped[List["Income"]] = relationship(
        "Income",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    recurring_payments: Mapped[List["RecurringPayment"]] = relationship(
        "RecurringPayment",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user"
    )
    feedbacks: Mapped[List["Feedback"]] = relationship(
        "Feedback",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    decisions: Mapped[List["Decision"]] = relationship(
        "Decision",
        back_populates="user",
        cascade="all, delete-orphan"
    )
