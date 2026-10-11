"""Budget SQLAlchemy ORM model."""

import uuid
from decimal import Decimal
from sqlalchemy import Numeric, String, Uuid, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Budget(Base, TimestampMixin):
    __tablename__ = "budgets"

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
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    period: Mapped[str] = mapped_column(String(20), default="monthly", nullable=False)
    alert_threshold: Mapped[int] = mapped_column(default=80, nullable=False)  # percentage (e.g. 80%)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="budgets")

    __table_args__ = (
        Index("ix_budgets_user_category", "user_id", "category"),
    )
