"""Recurring Payment SQLAlchemy ORM model."""

import datetime
import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import Date, Numeric, String, Text, Uuid, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class RecurringPayment(Base, TimestampMixin):
    __tablename__ = "recurring_payments"

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
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    frequency: Mapped[str] = mapped_column(String(30), default="Monthly", nullable=False)  # Weekly, Monthly, Quarterly, Yearly
    category: Mapped[str] = mapped_column(String(100), default="Bills", nullable=False)
    start_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    next_due_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recurring_payments")

    __table_args__ = (
        Index("ix_recurring_user_due_date", "user_id", "next_due_date"),
    )
