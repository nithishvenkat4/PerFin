"""Income management API endpoints."""

import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.income import Income
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeResponse, IncomeUpdate

router = APIRouter(prefix="/incomes", tags=["Income"])


@router.get("", response_model=List[IncomeResponse])
def get_incomes(
    source: Optional[str] = Query(None),
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all income entries for the current user with optional filters."""
    query = db.query(Income).filter(Income.user_id == current_user.id)
    if source:
        query = query.filter(Income.source.ilike(f"%{source}%"))
    if start_date:
        query = query.filter(Income.date >= start_date)
    if end_date:
        query = query.filter(Income.date <= end_date)
    return query.order_by(Income.date.desc()).all()


@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(
    payload: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new income record."""
    income = Income(
        user_id=current_user.id,
        source=payload.source.strip(),
        amount=payload.amount,
        date=payload.date,
        frequency=payload.frequency,
        description=payload.description
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.get("/{income_id}", response_model=IncomeResponse)
def get_income(
    income_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a single income entry by ID."""
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found.")
    return income


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: uuid.UUID,
    payload: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates an income entry."""
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found.")

    if payload.source is not None:
        income.source = payload.source.strip()
    if payload.amount is not None:
        income.amount = payload.amount
    if payload.date is not None:
        income.date = payload.date
    if payload.frequency is not None:
        income.frequency = payload.frequency
    if payload.description is not None:
        income.description = payload.description

    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}", status_code=status.HTTP_200_OK)
def delete_income(
    income_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an income entry."""
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income entry not found.")
    db.delete(income)
    db.commit()
    return {"message": "Income entry deleted successfully."}
