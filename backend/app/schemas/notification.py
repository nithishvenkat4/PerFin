"""Notification Pydantic schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    type: str = Field("insight", max_length=50)
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
