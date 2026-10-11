"""Budget Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0)
    period: str = Field("monthly", max_length=20)
    alert_threshold: int = Field(80, ge=1, le=100)


class BudgetUpdate(BaseModel):
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[Decimal] = Field(None, gt=0)
    period: Optional[str] = None
    alert_threshold: Optional[int] = Field(None, ge=1, le=100)


class BudgetResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category: str
    amount: Decimal
    period: str
    alert_threshold: int
    spent: Decimal = Decimal("0.00")
    remaining: Decimal = Decimal("0.00")
    percentage_used: float = 0.0
    status: str = "normal"  # normal, warning, exceeded
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
