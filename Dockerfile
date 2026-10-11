# ============================================================
# Single-Container Unified Production Deployment for PerFin
# Builds React frontend and serves both API and Web UI via FastAPI
# Zero external database required (automatic SQLite + embedded docs)
# ============================================================

# Step 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Step 2: Build Python Backend & Package Frontend
FROM python:3.13-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for ultra-fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy backend dependencies and install
COPY backend/pyproject.toml backend/README.md ./
RUN uv pip install --system --no-cache -e .

# Copy backend source code
COPY backend/app/ ./app/
COPY backend/alembic/ ./alembic/
COPY backend/alembic.ini ./

# Copy compiled frontend from Step 1 into backend's auto-detected dist folder
COPY --from=frontend-builder /app/frontend/dist /app/frontend_dist

ENV PYTHONUNBUFFERED=1
ENV APP_NAME=PerFin
ENV APP_ENV=production
ENV FRONTEND_DIST_PATH=/app/frontend_dist
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
