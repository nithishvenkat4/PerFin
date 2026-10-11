"""Integration tests for FinMate 2.0 Auth, Budgets, Incomes, Subscriptions, Recurring, Notifications, and Admin."""

from decimal import Decimal
import pytest
from starlette.testclient import TestClient

from app.main import app





def test_auth_register_login_and_me(client: TestClient):
    # Register new user
    reg_payload = {
        "name": "Priya Sharma",
        "email": "priya.test@finmate.local",
        "password": "securepassword123",
        "role": "USER"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "priya.test@finmate.local"
    assert data["role"] == "USER"
    token = data["access_token"]

    # Login
    login_payload = {
        "email": "priya.test@finmate.local",
        "password": "securepassword123"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # /auth/me with bearer
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "priya.test@finmate.local"


def test_google_auth_endpoint(client: TestClient):
    # Test Google SSO provision/login
    payload = {
        "email": "rohan.google@finmate.local",
        "name": "Rohan Google User"
    }
    res = client.post("/api/v1/auth/google", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "rohan.google@finmate.local"
    assert data["name"] == "Rohan Google User"
    assert data["role"] == "USER"


def test_budgets_crud_and_enrichment(client: TestClient):
    # Create budget
    b_payload = {
        "category": "Dining Test",
        "amount": 4000.00,
        "period": "monthly",
        "alert_threshold": 80
    }
    res = client.post("/api/v1/budgets", json=b_payload)
    assert res.status_code == 201
    b_data = res.json()
    b_id = b_data["id"]
    assert b_data["category"] == "Dining Test"
    assert Decimal(str(b_data["amount"])) == Decimal("4000.00")

    # List budgets
    res_list = client.get("/api/v1/budgets")
    assert res_list.status_code == 200
    assert any(b["id"] == b_id for b in res_list.json())

    # Update budget
    res_up = client.put(f"/api/v1/budgets/{b_id}", json={"amount": 4500.00})
    assert res_up.status_code == 200
    assert Decimal(str(res_up.json()["amount"])) == Decimal("4500.00")

    # Delete budget
    res_del = client.delete(f"/api/v1/budgets/{b_id}")
    assert res_del.status_code == 200


def test_incomes_crud(client: TestClient):
    payload = {
        "source": "Consulting Stint",
        "amount": 12500.00,
        "date": "2026-09-10",
        "frequency": "One-time",
        "description": "API Architecture review"
    }
    res = client.post("/api/v1/incomes", json=payload)
    assert res.status_code == 201
    inc_data = res.json()
    inc_id = inc_data["id"]

    res_get = client.get(f"/api/v1/incomes/{inc_id}")
    assert res_get.status_code == 200
    assert res_get.json()["source"] == "Consulting Stint"

    client.delete(f"/api/v1/incomes/{inc_id}")


def test_subscriptions_and_recurring(client: TestClient):
    # Subscription
    sub_payload = {
        "name": "Cloud Storage Test",
        "provider": "Cloud Provider",
        "amount": 399.00,
        "billing_frequency": "Monthly",
        "next_billing_date": "2026-10-15",
        "category": "Tech",
        "status": "Active"
    }
    res_sub = client.post("/api/v1/subscriptions", json=sub_payload)
    assert res_sub.status_code == 201
    sub_id = res_sub.json()["id"]

    # Recurring
    rec_payload = {
        "name": "Coworking Desk",
        "amount": 5000.00,
        "frequency": "Monthly",
        "category": "Work",
        "start_date": "2026-09-01",
        "next_due_date": "2026-10-01"
    }
    res_rec = client.post("/api/v1/recurring", json=rec_payload)
    assert res_rec.status_code == 201
    rec_id = res_rec.json()["id"]

    # Clean up
    client.delete(f"/api/v1/subscriptions/{sub_id}")
    client.delete(f"/api/v1/recurring/{rec_id}")


def test_notifications_lifecycle(client: TestClient):
    notif_payload = {
        "type": "insight",
        "title": "Test Insight",
        "message": "Financial ratio on track"
    }
    res = client.post("/api/v1/notifications", json=notif_payload)
    assert res.status_code == 201
    notif_id = res.json()["id"]
    assert res.json()["is_read"] is False

    # Mark as read
    res_read = client.put(f"/api/v1/notifications/{notif_id}/read")
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True

    client.delete(f"/api/v1/notifications/{notif_id}")


def test_admin_rbac_and_stats(client: TestClient):
    # Demo user is USER role -> should be rejected from /admin
    res_unauth = client.get("/api/v1/admin/stats")
    assert res_unauth.status_code == 403

    # Login as admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@finmate.local",
        "password": "admin123"
    })
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]

    # Admin access with token
    res_stats = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_stats.status_code == 200
    data = res_stats.json()
    assert data["system_status"] == "OPERATIONAL"
    assert "total_users" in data

    # Admin list users
    res_users = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_users.status_code == 200
    assert len(res_users.json()) >= 1

    # Admin system health
    res_sys = client.get("/api/v1/admin/system", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_sys.status_code == 200
    assert res_sys.json()["status"] in ["HEALTHY", "DEGRADED"]


def test_export_endpoints(client: TestClient):
    res_csv = client.get("/api/v1/export/transactions/csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "Date,Description,Amount" in res_csv.text

    res_report = client.get("/api/v1/export/report/json")
    assert res_report.status_code == 200
    assert "financial_summary" in res_report.json()
