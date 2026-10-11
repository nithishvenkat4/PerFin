"""Recurring Payment Pydantic schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class RecurringPaymentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    amount: Decimal = Field(..., gt=0)
    frequency: str = Field("Monthly", pattern="^(Weekly|Monthly|Quarterly|Yearly)$")
    category: str = Field("Bills", max_length=100)
    start_date: date
    next_due_date: date


class RecurringPaymentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    amount: Optional[Decimal] = Field(None, gt=0)
    frequency: Optional[str] = Field(None, pattern="^(Weekly|Monthly|Quarterly|Yearly)$")
    category: Optional[str] = None
    start_date: Optional[date] = None
    next_due_date: Optional[date] = None


class RecurringPaymentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    amount: Decimal
    frequency: str
    category: str
    start_date: date
    next_due_date: date
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
