# PerFin — Railway Deployment Guide

This guide walks you through deploying the complete **PerFin** platform on [Railway](https://railway.app) from scratch.

---

## Architecture Overview on Railway

Your Railway Project will contain **5 connected services**:

| Service | Type | Role | Port |
| :--- | :--- | :--- | :--- |
| **Postgres** | Managed Plugin | Authoritative relational financial ledger | `5432` |
| **MongoDB** | Managed Plugin | Document store for notes & conversations | `27017` |
| **Backend** | Python / FastAPI | Core ledger calculations, ML classification, decision models | `8000` |
| **Node API** | Node.js / Express | Document-oriented notes & conversation microservice | `5000` |
| **Frontend** | React 19 / Vite | SaaS web client | `80` / `5173` |

---

## Step 1: Push Code to GitHub

Make sure all your latest changes are pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: rename to PerFin and prepare for Railway deployment"
git push origin main
```

---

## Step 2: Create a New Project on Railway

1. Log in to [Railway](https://railway.app).
2. Click **"+ New Project"**.
3. Select **"Empty Project"** (or start by provisioning databases).

---

## Step 3: Provision Databases (1 Click Each)

### 3.1 Provision PostgreSQL
1. Inside your new Railway project canvas, click **"+ Create"** (or press `Ctrl + K` / `Cmd + K`).
2. Select **"Database"** -> **"Add PostgreSQL"**.
3. Railway will provision a managed PostgreSQL database.
4. Click on the PostgreSQL card -> **"Variables"** -> note that `${{Postgres.DATABASE_URL}}` is created automatically.

### 3.2 Provision MongoDB
1. Click **"+ Create"** again.
2. Select **"Database"** -> **"Add MongoDB"**.
3. Railway will provision a managed MongoDB instance.
4. Click on the MongoDB card -> **"Variables"** -> note `${{MongoDB.MONGO_URL}}`.

---

## Step 4: Deploy the FastAPI Backend

1. In your project canvas, click **"+ Create"** -> **"GitHub Repo"**.
2. Select your repository.
3. Once the service card appears, click on it and open **"Settings"**:
   - **Service Name**: Rename to `perfin-backend`.
   - **Root Directory**: Set to `/backend`.
   - Railway will automatically detect `backend/Dockerfile`.
4. Go to the **"Variables"** tab and add the following environment variables:
   ```env
   APP_NAME=PerFin
   APP_ENV=production
   APP_VERSION=2.0.0
   DEBUG=False
   SECRET_KEY=generate-any-random-32-character-secret-key-here
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   CORS_ORIGINS=["*"]
   PORT=8000
   ```
5. Go to the **"Networking"** tab:
   - Click **"Generate Domain"** (e.g., `perfin-backend-production.up.railway.app`).
   - Copy this URL (you'll need it for the frontend).

---

## Step 5: Deploy the Node.js Document Microservice

1. In your project canvas, click **"+ Create"** -> **"GitHub Repo"** -> select the same repository.
2. Click on the new service card -> **"Settings"**:
   - **Service Name**: Rename to `perfin-node-api`.
   - **Root Directory**: Set to `/node-service`.
   - Railway will automatically detect `node-service/Dockerfile`.
3. Go to the **"Variables"** tab and add:
   ```env
   PORT=5000
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   JWT_SECRET=generate-any-random-32-character-secret-key-here
   ```
4. Go to the **"Networking"** tab:
   - Click **"Generate Domain"** (e.g., `perfin-node-production.up.railway.app`).
   - Copy this URL.

---

## Step 6: Deploy the React Frontend

1. In your project canvas, click **"+ Create"** -> **"GitHub Repo"** -> select the same repository.
2. Click on the new service card -> **"Settings"**:
   - **Service Name**: Rename to `perfin-frontend`.
   - **Root Directory**: Set to `/frontend`.
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
3. Go to the **"Variables"** tab and add:
   ```env
   VITE_API_URL=https://<your-perfin-backend-domain>.up.railway.app
   VITE_NODE_API_URL=https://<your-perfin-node-domain>.up.railway.app
   ```
   *(Replace with the actual domains generated in Steps 4 and 5)*
4. Go to the **"Networking"** tab:
   - Click **"Generate Domain"** (e.g., `perfin.up.railway.app`).

---

## Step 7: Verification

Open your live frontend URL (`https://perfin.up.railway.app`):
1. **Login & Register**: Sign in with Demo User (`demo@finmate.local` / `demo123`) or register a new account.
2. **Ledger & Budgets**: Add transactions and budgets; data persists to PostgreSQL.
3. **Notes**: Create notes and tags; data persists to MongoDB via the Node microservice.
4. **Google Sign-In**:
   - Now that you have a live URL, add `https://perfin.up.railway.app` to **Authorized JavaScript Origins** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Add `GOOGLE_CLIENT_ID` to your Backend variables and `VITE_GOOGLE_CLIENT_ID` to your Frontend variables.
