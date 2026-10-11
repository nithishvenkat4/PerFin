"""API v1 master router module."""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    users,
    auth,
    profile,
    categories,
    transactions,
    goals,
    investments,
    budgets,
    income,
    subscriptions,
    recurring,
    notifications,
    admin,
    export,
    analytics,
    imports,
    data_quality,
    ai,
    agent,
    decisions,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(profile.router)
api_router.include_router(categories.router)
api_router.include_router(transactions.router)
api_router.include_router(goals.router)
api_router.include_router(investments.router)
api_router.include_router(budgets.router)
api_router.include_router(income.router)
api_router.include_router(subscriptions.router)
api_router.include_router(recurring.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
api_router.include_router(export.router)
api_router.include_router(analytics.router)
api_router.include_router(imports.router)
api_router.include_router(data_quality.router)
api_router.include_router(ai.router)
api_router.include_router(agent.router)
api_router.include_router(decisions.router)
