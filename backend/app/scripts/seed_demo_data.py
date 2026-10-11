"""Deterministic Synthetic Demo Data Generator for FinMate 2.0.

Seeds reproducible, synthetic financial records for testing, development, and lab demonstrations.
Command: python -m app.scripts.seed_demo_data
"""

import datetime
from decimal import Decimal
import sys
import uuid

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.audit_log import AuditLog
from app.models.budget import Budget
from app.models.category import TransactionCategory
from app.models.goal import Goal
from app.models.income import Income
from app.models.investment import Investment
from app.models.notification import Notification
from app.models.profile import FinancialProfile
from app.models.recurring import RecurringPayment
from app.models.subscription import Subscription
from app.models.transaction import Transaction
from app.models.user import User
from app.repositories.category_repo import CategoryRepository


def seed_demo_data():
    print("=" * 60)
    print("Seeding FinMate 2.0 Demo Financial Dataset...")
    print("=" * 60)

    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Categories
        cat_repo = CategoryRepository(db)
        cat_repo.seed_defaults()
        print("[+] Categories verified/seeded.")

        # 2. Get or Create Demo User
        user = db.query(User).filter(User.email == "demo@finmate.local").first()
        if not user:
            user = User(
                id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                name="Aarav Sharma",
                email="demo@finmate.local",
                password_hash=hash_password("demo123"),
                role="USER"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"[+] Created Demo User: {user.name} ({user.email})")
        else:
            user.password_hash = hash_password("demo123")
            user.role = "USER"
            print(f"[+] Verified Demo User: {user.name} ({user.email})")

        # 3. Get or Create Admin User
        admin_user = db.query(User).filter(User.email == "admin@finmate.local").first()
        if not admin_user:
            admin_user = User(
                id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
                name="System Administrator",
                email="admin@finmate.local",
                password_hash=hash_password("admin123"),
                role="ADMIN"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"[+] Created Admin User: {admin_user.name} ({admin_user.email})")
        else:
            admin_user.password_hash = hash_password("admin123")
            admin_user.role = "ADMIN"
            print(f"[+] Verified Admin User: {admin_user.name} ({admin_user.email})")

        # 4. Create or Update Financial Profile
        # Monthly Income: ₹60,000 | Fixed Expenses: ₹15,000 | Savings: ₹1,20,000
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
        if not profile:
            profile = FinancialProfile(
                user_id=user.id,
                monthly_income=Decimal("60000.00"),
                monthly_fixed_expenses=Decimal("15000.00"),
                current_savings=Decimal("120000.00"),
                risk_preference="moderate"
            )
            db.add(profile)
            print("[+] Created Financial Profile: Income=INR 60,000, Fixed=INR 15,000, Savings=INR 1,20,000")
        else:
            profile.monthly_income = Decimal("60000.00")
            profile.monthly_fixed_expenses = Decimal("15000.00")
            profile.current_savings = Decimal("120000.00")
            profile.risk_preference = "moderate"
            print("[+] Updated Financial Profile with demo baselines.")

        # 5. Seed Canonical Transactions
        db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.source_type.in_(["synthetic", "manual"])
        ).delete(synchronize_session=False)

        demo_transactions = [
            ("Monthly Salary Deposit", Decimal("60000.00"), "income", "Salary", datetime.date(2026, 9, 1), "Net pay credit"),
            ("Freelance UI Consultation", Decimal("8500.00"), "income", "Other", datetime.date(2026, 9, 15), "Client milestone payment"),
            ("Swiggy Gourmet Delivery", Decimal("520.00"), "expense", "Food", datetime.date(2026, 9, 2), "Dinner order"),
            ("Amazon Electronics Order", Decimal("2450.00"), "expense", "Shopping", datetime.date(2026, 9, 3), "USB-C monitor hub"),
            ("Uber City Ride", Decimal("340.00"), "expense", "Transport", datetime.date(2026, 9, 4), "Commute to office"),
            ("Netflix Premium Plan", Decimal("649.00"), "expense", "Entertainment", datetime.date(2026, 9, 5), "Monthly 4K subscription"),
            ("Electricity & Water Utility", Decimal("1850.00"), "expense", "Bills", datetime.date(2026, 9, 6), "State power bill"),
            ("Organic Grocery Store", Decimal("3200.00"), "expense", "Food", datetime.date(2026, 9, 8), "Weekly supplies"),
            ("Airtel Fiber Broadband", Decimal("999.00"), "expense", "Bills", datetime.date(2026, 9, 10), "Monthly internet bill"),
            ("Starbucks Reserve Coffee", Decimal("410.00"), "expense", "Food", datetime.date(2026, 9, 12), "Team discussion coffee"),
            ("Pharmacy Healthcare Prescriptions", Decimal("680.00"), "expense", "Healthcare", datetime.date(2026, 9, 14), "Monthly supplements"),
            ("Coursera Financial Engineering", Decimal("2200.00"), "expense", "Education", datetime.date(2026, 9, 18), "Certification course"),
        ]

        for desc, amt, t_type, cat_name, t_date, notes in demo_transactions:
            cat = cat_repo.get_or_create(cat_name, t_type)
            tx = Transaction(
                user_id=user.id,
                category_id=cat.id,
                transaction_date=t_date,
                description=desc,
                amount=amt,
                transaction_type=t_type,
                category=cat.name,
                notes=notes,
                source_type="synthetic"
            )
            db.add(tx)
        print(f"[+] Seeded {len(demo_transactions)} canonical demo transactions.")

        # 6. Seed Incomes
        db.query(Income).filter(Income.user_id == user.id).delete(synchronize_session=False)
        incomes = [
            Income(
                user_id=user.id,
                source="Salary",
                amount=Decimal("60000.00"),
                date=datetime.date(2026, 9, 1),
                frequency="Monthly",
                description="Core software engineering salary"
            ),
            Income(
                user_id=user.id,
                source="Freelancing",
                amount=Decimal("8500.00"),
                date=datetime.date(2026, 9, 15),
                frequency="One-time",
                description="Full-stack contract UI work"
            ),
        ]
        for inc in incomes:
            db.add(inc)
        print(f"[+] Seeded {len(incomes)} demo income streams.")

        # 7. Seed Budgets
        db.query(Budget).filter(Budget.user_id == user.id).delete(synchronize_session=False)
        budgets = [
            Budget(user_id=user.id, category="Food", amount=Decimal("6000.00"), alert_threshold=80),
            Budget(user_id=user.id, category="Shopping", amount=Decimal("4000.00"), alert_threshold=80),
            Budget(user_id=user.id, category="Transport", amount=Decimal("2000.00"), alert_threshold=80),
            Budget(user_id=user.id, category="Bills", amount=Decimal("5000.00"), alert_threshold=80),
            Budget(user_id=user.id, category="Entertainment", amount=Decimal("2000.00"), alert_threshold=80),
            Budget(user_id=user.id, category="Healthcare", amount=Decimal("2500.00"), alert_threshold=80),
        ]
        for b in budgets:
            db.add(b)
        print(f"[+] Seeded {len(budgets)} category budgets.")

        # 8. Seed Goals
        db.query(Goal).filter(Goal.user_id == user.id).delete(synchronize_session=False)
        goals = [
            Goal(
                user_id=user.id,
                name="Higher Education & MS Fund",
                target_amount=Decimal("300000.00"),
                current_amount=Decimal("145000.00"),
                target_date=datetime.date(2027, 6, 30),
                priority="high"
            ),
            Goal(
                user_id=user.id,
                name="Emergency Buffer (6 Months)",
                target_amount=Decimal("180000.00"),
                current_amount=Decimal("120000.00"),
                target_date=datetime.date(2026, 12, 31),
                priority="high"
            ),
            Goal(
                user_id=user.id,
                name="MacBook Pro M3 Max",
                target_amount=Decimal("199000.00"),
                current_amount=Decimal("75000.00"),
                target_date=datetime.date(2027, 2, 28),
                priority="medium"
            ),
        ]
        for g in goals:
            db.add(g)
        print(f"[+] Seeded {len(goals)} demo financial goals.")

        # 9. Seed Investments
        db.query(Investment).filter(Investment.user_id == user.id).delete(synchronize_session=False)
        investments = [
            Investment(
                user_id=user.id,
                asset_name="Nifty 50 Index Fund",
                investment_type="Mutual Fund",
                quantity=Decimal("150.0000"),
                current_value=Decimal("45000.00")
            ),
            Investment(
                user_id=user.id,
                asset_name="Tata Silver ETF",
                investment_type="ETF",
                quantity=Decimal("100.0000"),
                current_value=Decimal("7200.00")
            ),
            Investment(
                user_id=user.id,
                asset_name="Sovereign Gold Bonds",
                investment_type="Bonds",
                quantity=Decimal("5.0000"),
                current_value=Decimal("36500.00")
            ),
        ]
        for inv in investments:
            db.add(inv)
        print(f"[+] Seeded {len(investments)} demo investment holdings.")

        # 10. Seed Subscriptions
        db.query(Subscription).filter(Subscription.user_id == user.id).delete(synchronize_session=False)
        subs = [
            Subscription(
                user_id=user.id,
                name="Netflix Premium",
                provider="Netflix Inc.",
                amount=Decimal("649.00"),
                billing_frequency="Monthly",
                next_billing_date=datetime.date(2026, 10, 5),
                category="Entertainment",
                status="Active"
            ),
            Subscription(
                user_id=user.id,
                name="Spotify Premium Duo",
                provider="Spotify AB",
                amount=Decimal("149.00"),
                billing_frequency="Monthly",
                next_billing_date=datetime.date(2026, 10, 12),
                category="Entertainment",
                status="Active"
            ),
            Subscription(
                user_id=user.id,
                name="Amazon Prime Annual",
                provider="Amazon India",
                amount=Decimal("1499.00"),
                billing_frequency="Yearly",
                next_billing_date=datetime.date(2027, 4, 1),
                category="Shopping",
                status="Active"
            ),
            Subscription(
                user_id=user.id,
                name="Google One 2TB Cloud",
                provider="Google",
                amount=Decimal("650.00"),
                billing_frequency="Monthly",
                next_billing_date=datetime.date(2026, 10, 22),
                category="Productivity",
                status="Active"
            ),
        ]
        for s in subs:
            db.add(s)
        print(f"[+] Seeded {len(subs)} demo subscriptions.")

        # 11. Seed Recurring Payments
        db.query(RecurringPayment).filter(RecurringPayment.user_id == user.id).delete(synchronize_session=False)
        recurring = [
            RecurringPayment(
                user_id=user.id,
                name="Apartment Rental Lease",
                amount=Decimal("15000.00"),
                frequency="Monthly",
                category="Housing",
                start_date=datetime.date(2026, 1, 1),
                next_due_date=datetime.date(2026, 10, 1)
            ),
            RecurringPayment(
                user_id=user.id,
                name="Airtel Optical Fiber",
                amount=Decimal("999.00"),
                frequency="Monthly",
                category="Bills",
                start_date=datetime.date(2026, 1, 1),
                next_due_date=datetime.date(2026, 10, 10)
            ),
            RecurringPayment(
                user_id=user.id,
                name="Cult.fit Fitness Pass",
                amount=Decimal("1450.00"),
                frequency="Monthly",
                category="Healthcare",
                start_date=datetime.date(2026, 3, 1),
                next_due_date=datetime.date(2026, 10, 15)
            ),
        ]
        for r in recurring:
            db.add(r)
        print(f"[+] Seeded {len(recurring)} demo recurring commitments.")

        # 12. Seed Notifications
        db.query(Notification).filter(Notification.user_id == user.id).delete(synchronize_session=False)
        notifications = [
            Notification(
                user_id=user.id,
                type="budget_alert",
                title="Food & Dining Budget Alert",
                message="Your Food & Dining spending has reached 68% of your ₹6,000 monthly target.",
                is_read=False
            ),
            Notification(
                user_id=user.id,
                type="subscription_due",
                title="Netflix Renewal Upcoming",
                message="Netflix Premium renewal of ₹649 is scheduled for October 5, 2026.",
                is_read=False
            ),
            Notification(
                user_id=user.id,
                type="insight",
                title="Emergency Fund Progress",
                message="You have saved ₹1,20,000 toward your 6-month buffer target of ₹1,80,000 (66.7% achieved).",
                is_read=True
            ),
            Notification(
                user_id=user.id,
                type="unusual_transaction",
                title="Transaction Monitoring Note",
                message="Single transaction of ₹2,450 for electronics was above your 30-day discretionary median.",
                is_read=False
            ),
        ]
        for n in notifications:
            db.add(n)
        print(f"[+] Seeded {len(notifications)} notifications.")

        # 13. Audit Log
        audit = AuditLog(
            user_id=admin_user.id,
            action="SYSTEM_SEED",
            resource="Database",
            details="Seeded FinMate 2.0 full financial demo dataset"
        )
        db.add(audit)

        db.commit()
        print("=" * 60)
        print("FinMate 2.0 demo data seeded successfully!")
        print("Demo User: demo@finmate.local / demo123 (Role: USER)")
        print("Admin User: admin@finmate.local / admin123 (Role: ADMIN)")
        print("=" * 60)

    except Exception as exc:
        db.rollback()
        print(f"[-] Error seeding demo data: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
