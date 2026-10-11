"""Subscription tracking API endpoints."""

from decimal import Decimal
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


def enrich_subscription(sub: Subscription) -> SubscriptionResponse:
    monthly_equiv = sub.amount if sub.billing_frequency.lower() == "monthly" else round(sub.amount / Decimal("12.0"), 2)
    return SubscriptionResponse(
        id=sub.id,
        user_id=sub.user_id,
        name=sub.name,
        provider=sub.provider,
        amount=sub.amount,
        billing_frequency=sub.billing_frequency,
        next_billing_date=sub.next_billing_date,
        category=sub.category,
        status=sub.status,
        monthly_equivalent=monthly_equiv,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
    )


@router.get("", response_model=List[SubscriptionResponse])
def get_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all subscriptions for current user."""
    subs = db.query(Subscription).filter(Subscription.user_id == current_user.id).order_by(Subscription.next_billing_date.asc()).all()
    return [enrich_subscription(s) for s in subs]


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    payload: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a new subscription."""
    sub = Subscription(
        user_id=current_user.id,
        name=payload.name.strip(),
        provider=payload.provider.strip(),
        amount=payload.amount,
        billing_frequency=payload.billing_frequency,
        next_billing_date=payload.next_billing_date,
        category=payload.category,
        status=payload.status
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return enrich_subscription(sub)


@router.get("/{sub_id}", response_model=SubscriptionResponse)
def get_subscription(
    sub_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves single subscription."""
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    return enrich_subscription(sub)


@router.put("/{sub_id}", response_model=SubscriptionResponse)
def update_subscription(
    sub_id: uuid.UUID,
    payload: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates a subscription."""
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")

    if payload.name is not None:
        sub.name = payload.name.strip()
    if payload.provider is not None:
        sub.provider = payload.provider.strip()
    if payload.amount is not None:
        sub.amount = payload.amount
    if payload.billing_frequency is not None:
        sub.billing_frequency = payload.billing_frequency
    if payload.next_billing_date is not None:
        sub.next_billing_date = payload.next_billing_date
    if payload.category is not None:
        sub.category = payload.category
    if payload.status is not None:
        sub.status = payload.status

    db.commit()
    db.refresh(sub)
    return enrich_subscription(sub)


@router.delete("/{sub_id}", status_code=status.HTTP_200_OK)
def delete_subscription(
    sub_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a subscription."""
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    db.delete(sub)
    db.commit()
    return {"message": "Subscription deleted successfully."}
