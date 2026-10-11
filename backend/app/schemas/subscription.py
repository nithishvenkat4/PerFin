"""Subscription Pydantic schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class SubscriptionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    provider: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0)
    billing_frequency: str = Field("Monthly", pattern="^(Monthly|Yearly)$")
    next_billing_date: date
    category: str = Field("Entertainment", max_length=100)
    status: str = Field("Active", pattern="^(Active|Paused|Cancelled)$")


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    provider: Optional[str] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    billing_frequency: Optional[str] = Field(None, pattern="^(Monthly|Yearly)$")
    next_billing_date: Optional[date] = None
    category: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(Active|Paused|Cancelled)$")


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    provider: str
    amount: Decimal
    billing_frequency: str
    next_billing_date: date
    category: str
    status: str
    monthly_equivalent: Decimal = Decimal("0.00")
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
