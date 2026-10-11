"""Admin operations API router."""

from decimal import Decimal
import time
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.core.config import settings
from app.db.session import check_db_health, get_db
from app.models.audit_log import AuditLog
from app.models.goal import Goal
from app.models.import_record import ImportRecord
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.admin import (
    AdminStatsResponse,
    AdminUserListItem,
    AuditLogResponse,
    SystemHealthResponse,
)

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

START_TIME = time.time()


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieves high-level platform statistics for the administrator."""
    total_users = db.scalar(select(func.count(User.id))) or 0
    total_tx = db.scalar(select(func.count(Transaction.id))) or 0
    total_goals = db.scalar(select(func.count(Goal.id))) or 0
    total_inv = db.scalar(select(func.count(Investment.id))) or 0
    total_imports = db.scalar(select(func.count(ImportRecord.id))) or 0
    total_volume = db.scalar(select(func.sum(Transaction.amount))) or Decimal("0.00")

    return AdminStatsResponse(
        total_users=total_users,
        active_users=total_users,
        total_transactions=total_tx,
        total_goals=total_goals,
        total_investments=total_inv,
        total_imports=total_imports,
        total_transaction_volume=total_volume,
        system_status="OPERATIONAL"
    )


@router.get("/users", response_model=List[AdminUserListItem])
def list_admin_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Lists registered platform users with summary usage metrics."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        tx_count = db.scalar(select(func.count(Transaction.id)).where(Transaction.user_id == u.id)) or 0
        spent = db.scalar(
            select(func.sum(Transaction.amount)).where(
                Transaction.user_id == u.id,
                Transaction.transaction_type == "expense"
            )
        ) or Decimal("0.00")

        result.append(AdminUserListItem(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            created_at=u.created_at,
            transaction_count=tx_count,
            total_spent=spent
        ))
    return result


@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: uuid.UUID,
    role: str = Query(..., pattern="^(USER|ADMIN)$"),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Updates user role between USER and ADMIN."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.role = role.upper()
    audit = AuditLog(
        user_id=admin_user.id,
        action="ADMIN_ROLE_CHANGE",
        resource="User",
        details=f"Updated role of {user.email} to {role.upper()}"
    )
    db.add(audit)
    db.commit()
    return {"message": f"User role updated to {role.upper()}."}


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieves recent security and operational audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        user_email = l.user.email if l.user else None
        results.append(AuditLogResponse(
            id=l.id,
            user_id=l.user_id,
            user_email=user_email,
            action=l.action,
            resource=l.resource,
            details=l.details,
            ip_address=l.ip_address,
            created_at=l.created_at
        ))
    return results


@router.get("/system", response_model=SystemHealthResponse)
def get_system_health(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Returns system diagnostic health."""
    db_ok = check_db_health()
    uptime = time.time() - START_TIME
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL.lower() else "SQLite Fallback"

    return SystemHealthResponse(
        status="HEALTHY" if db_ok else "DEGRADED",
        app_version=settings.APP_VERSION,
        database_type=db_type,
        database_connected=db_ok,
        ai_provider=settings.AI_PROVIDER,
        environment=settings.APP_ENV,
        uptime_seconds=round(uptime, 2)
    )
