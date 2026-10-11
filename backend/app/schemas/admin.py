"""Admin Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
import uuid
from typing import List, Optional
from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_transactions: int
    total_goals: int
    total_investments: int
    total_imports: int
    total_transaction_volume: Decimal
    system_status: str


class AdminUserListItem(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    created_at: datetime
    transaction_count: int = 0
    total_spent: Decimal = Decimal("0.00")

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    action: str
    resource: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SystemHealthResponse(BaseModel):
    status: str
    app_version: str
    database_type: str
    database_connected: bool
    ai_provider: str
    environment: str
    uptime_seconds: float
