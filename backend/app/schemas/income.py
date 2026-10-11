"""Income Pydantic schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class IncomeCreate(BaseModel):
    source: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0)
    date: date
    frequency: str = Field("Monthly", max_length=50)
    description: Optional[str] = None


class IncomeUpdate(BaseModel):
    source: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[Decimal] = Field(None, gt=0)
    date: Optional[date] = None
    frequency: Optional[str] = None
    description: Optional[str] = None


class IncomeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    source: str
    amount: Decimal
    date: date
    frequency: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
