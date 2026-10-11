"""Subscription SQLAlchemy ORM model."""

import datetime
import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import Date, Numeric, String, Uuid, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    billing_frequency: Mapped[str] = mapped_column(String(30), default="Monthly", nullable=False)  # Monthly, Yearly
    next_billing_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="Entertainment", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Active", nullable=False)  # Active, Paused, Cancelled

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscriptions")

    __table_args__ = (
        Index("ix_subscriptions_user_date", "user_id", "next_billing_date"),
    )
