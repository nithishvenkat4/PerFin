"""Export endpoints for CSV and reports."""

import csv
from decimal import Decimal
import io
import json
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.goal import Goal
from app.models.investment import Investment
from app.models.profile import FinancialProfile
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/transactions/csv")
def export_transactions_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exports user transactions as downloadable CSV file."""
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.transaction_date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Description", "Amount", "Type", "Category", "Payment Method", "Notes"])

    for tx in txs:
        writer.writerow([
            str(tx.id),
            tx.transaction_date.isoformat(),
            tx.description,
            str(tx.amount),
            tx.transaction_type,
            tx.category,
            tx.payment_method or "N/A",
            tx.notes or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=finmate_transactions_{current_user.id}.csv"}
    )


@router.get("/report/json")
def export_financial_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates comprehensive JSON financial audit report."""
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()

    total_income = sum(t.amount for t in txs if t.transaction_type == "income")
    total_expense = sum(t.amount for t in txs if t.transaction_type == "expense")
    net_savings = total_income - total_expense
    investment_val = sum(i.current_value for i in investments)

    report = {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "financial_summary": {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "net_savings": float(net_savings),
            "total_investments": float(investment_val),
            "current_savings_balance": float(profile.current_savings if profile else 0),
            "monthly_income_profile": float(profile.monthly_income if profile else 0),
        },
        "goals": [
            {
                "name": g.name,
                "target_amount": float(g.target_amount),
                "current_amount": float(g.current_amount),
                "target_date": g.target_date.isoformat(),
                "priority": g.priority
            }
            for g in goals
        ],
        "investments": [
            {
                "asset_name": inv.asset_name,
                "type": inv.investment_type,
                "quantity": float(inv.quantity),
                "current_value": float(inv.current_value)
            }
            for inv in investments
        ],
        "transaction_count": len(txs)
    }

    return Response(
        content=json.dumps(report, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=finmate_financial_report_{current_user.id}.json"}
    )
