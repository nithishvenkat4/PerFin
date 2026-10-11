"""Budget management API endpoints."""

from decimal import Decimal
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["Budgets"])


def enrich_budget(budget: Budget, db: Session) -> BudgetResponse:
    """Calculates actual spent, remaining, percentage, and status from transactions."""
    stmt = (
        select(func.sum(Transaction.amount))
        .where(
            Transaction.user_id == budget.user_id,
            Transaction.transaction_type == "expense",
            func.lower(Transaction.category) == func.lower(budget.category)
        )
    )
    spent = db.scalar(stmt) or Decimal("0.00")
    remaining = max(Decimal("0.00"), budget.amount - spent)
    pct = float((spent / budget.amount) * 100) if budget.amount > 0 else 0.0

    if pct >= 100.0:
        budget_status = "exceeded"
    elif pct >= float(budget.alert_threshold):
        budget_status = "warning"
    else:
        budget_status = "normal"

    return BudgetResponse(
        id=budget.id,
        user_id=budget.user_id,
        category=budget.category,
        amount=budget.amount,
        period=budget.period,
        alert_threshold=budget.alert_threshold,
        spent=spent,
        remaining=remaining,
        percentage_used=round(pct, 1),
        status=budget_status,
        created_at=budget.created_at,
        updated_at=budget.updated_at,
    )


@router.get("", response_model=List[BudgetResponse])
def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all category budgets with spent metrics for the current user."""
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).order_by(Budget.category.asc()).all()
    return [enrich_budget(b, db) for b in budgets]


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new category budget."""
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        func.lower(Budget.category) == payload.category.lower().strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Budget for category '{payload.category}' already exists."
        )

    budget = Budget(
        user_id=current_user.id,
        category=payload.category.strip(),
        amount=payload.amount,
        period=payload.period,
        alert_threshold=payload.alert_threshold
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return enrich_budget(budget, db)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a single budget by ID."""
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    return enrich_budget(budget, db)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: uuid.UUID,
    payload: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates budget properties."""
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")

    if payload.category is not None:
        budget.category = payload.category.strip()
    if payload.amount is not None:
        budget.amount = payload.amount
    if payload.period is not None:
        budget.period = payload.period
    if payload.alert_threshold is not None:
        budget.alert_threshold = payload.alert_threshold

    db.commit()
    db.refresh(budget)
    return enrich_budget(budget, db)


@router.delete("/{budget_id}", status_code=status.HTTP_200_OK)
def delete_budget(
    budget_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a budget."""
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully."}
