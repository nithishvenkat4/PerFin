"""Recurring payments API endpoints."""

from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.recurring import RecurringPayment
from app.models.user import User
from app.schemas.recurring import (
    RecurringPaymentCreate,
    RecurringPaymentResponse,
    RecurringPaymentUpdate,
)

router = APIRouter(prefix="/recurring", tags=["Recurring Payments"])


@router.get("", response_model=List[RecurringPaymentResponse])
def get_recurring_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all recurring payments for the current user."""
    return (
        db.query(RecurringPayment)
        .filter(RecurringPayment.user_id == current_user.id)
        .order_by(RecurringPayment.next_due_date.asc())
        .all()
    )


@router.post("", response_model=RecurringPaymentResponse, status_code=status.HTTP_201_CREATED)
def create_recurring_payment(
    payload: RecurringPaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new recurring payment."""
    rec = RecurringPayment(
        user_id=current_user.id,
        name=payload.name.strip(),
        amount=payload.amount,
        frequency=payload.frequency,
        category=payload.category,
        start_date=payload.start_date,
        next_due_date=payload.next_due_date
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.get("/{rec_id}", response_model=RecurringPaymentResponse)
def get_recurring_payment(
    rec_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves single recurring payment."""
    rec = db.query(RecurringPayment).filter(RecurringPayment.id == rec_id, RecurringPayment.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring payment not found.")
    return rec


@router.put("/{rec_id}", response_model=RecurringPaymentResponse)
def update_recurring_payment(
    rec_id: uuid.UUID,
    payload: RecurringPaymentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates a recurring payment."""
    rec = db.query(RecurringPayment).filter(RecurringPayment.id == rec_id, RecurringPayment.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring payment not found.")

    if payload.name is not None:
        rec.name = payload.name.strip()
    if payload.amount is not None:
        rec.amount = payload.amount
    if payload.frequency is not None:
        rec.frequency = payload.frequency
    if payload.category is not None:
        rec.category = payload.category
    if payload.start_date is not None:
        rec.start_date = payload.start_date
    if payload.next_due_date is not None:
        rec.next_due_date = payload.next_due_date

    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{rec_id}", status_code=status.HTTP_200_OK)
def delete_recurring_payment(
    rec_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a recurring payment."""
    rec = db.query(RecurringPayment).filter(RecurringPayment.id == rec_id, RecurringPayment.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recurring payment not found.")
    db.delete(rec)
    db.commit()
    return {"message": "Recurring payment deleted successfully."}
