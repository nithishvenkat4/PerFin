"""Income SQLAlchemy ORM model."""

import datetime
import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import Date, Numeric, String, Text, Uuid, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Income(Base, TimestampMixin):
    __tablename__ = "incomes"

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
    source: Mapped[str] = mapped_column(String(100), nullable=False)  # Salary, Freelancing, Scholarship, Business, Interest, Investment, Other
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    frequency: Mapped[str] = mapped_column(String(50), default="Monthly", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="incomes")

    __table_args__ = (
        Index("ix_incomes_user_date", "user_id", "date"),
    )
