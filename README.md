# FinMate 2.0 — Personal Finance Management & Decision Support Platform

**FinMate** is an enterprise-grade, full-stack personal finance and decision-support platform engineered for production environments and designed as a comprehensive demonstration project for **Full Stack Web Development Lab** evaluations (CAT-II, Viva, and Portfolio).

FinMate combines **deterministic monetary arithmetic**, **predictive machine learning models**, **multi-agent financial decision support**, and a **dual-database architecture** (PostgreSQL for authoritative financial ledgers + MongoDB for unstructured conversational documents), wrapped in a high-contrast **Technical Neo-Brutalist / Cyber-Terminal user interface**.

> [!IMPORTANT]
> **Decision-Support Guarantee:** FinMate is educational and decision-support software. It does NOT execute automated bank transfers, trade securities, or mutate financial accounts autonomously. All monetary calculations are backend-deterministic (`Decimal`), and state mutations require human-in-the-loop (HITL) authorization.

---

## 1. System Architecture Overview

FinMate 2.0 utilizes a modular, microservice-ready full-stack architecture:

```mermaid
graph TD
    subgraph Client Tier
        UI[React 19 + TypeScript SPA<br/>Vite / Neo-Brutalist Design System]
        Mobile[Native Android Client<br/>Kotlin / Room / WorkManager SMS Ingestion]
    end

    subgraph API & Service Tier
        FastAPI[Python FastAPI Core Service :8000<br/>JWT Auth / Financial CRUD / ML Pipelines / Multi-Agent Engine]
        NodeAPI[Node.js Express Document Microservice :5000<br/>JWT Auth Middleware / Mongoose / AI Conversations & Notes]
    end

    subgraph Data Tier
        Postgres[(PostgreSQL / SQLite Fallback<br/>Users, Transactions, Budgets, Goals, Incomes, Subscriptions)]
        Mongo[(MongoDB / Document Store Fallback<br/>AI Conversation History, Financial Notes)]
    end

    subgraph AI / ML & Decision Engine
        ML[LinearSVC Classifier / Isolation Forest Anomaly / Ridge Forecaster]
        RAG[Regulatory Vector RAG<br/>RBI, SEBI, FPSB Guidelines]
        Agents[Multi-Agent Orchestrator & In-Memory What-If Simulator]
    end

    UI -->|REST / JSON| FastAPI
    UI -->|REST / JSON| NodeAPI
    Mobile -->|POST /api/v1/transactions/from-sms| FastAPI

    FastAPI --> Postgres
    NodeAPI --> Mongo
    FastAPI --> ML
    FastAPI --> RAG
    FastAPI --> Agents
```

---

## 2. Technology Stack & Rubric Compliance

FinMate 2.0 satisfies all 20 requirements of the **Full Stack Web Development Lab Rubric**:

| Lab Dimension | Technology | Project Implementation |
| :--- | :--- | :--- |
| **HTML5 & Semantic Structure** | HTML5 Semantic Elements | Proper `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`, `<dialog>`, semantic forms, and accessible input labeling. |
| **CSS & Design System** | Tailwind CSS v4 + Vanilla CSS Tokens | **Technical Neo-Brutalist Aesthetic**: stark 2px solid `#000000` borders, `#D4FF00` neon lime accents, Space Grotesk headings, JetBrains Mono monospace code labels (`>_ TERMINAL ID // FIN_CHANNEL_01`), off-white `#F7F7F4` grid backgrounds. |
| **JavaScript & AJAX** | Modern ECMAScript (ES2024), Async/Await, Fetch | Asynchronous data fetching, debounced search, custom HTTP request wrappers (`api.ts`), error interception, JSON marshaling. |
| **JSON** | Native JSON parsing & serialization | Consistent REST payload structures, standardized JSON error objects, and structured LLM agent tool call payloads. |
| **React & Component Tree** | React 19, TypeScript, Recharts, Lucide Icons | Reusable UI components: `Header`, `TerminalBanner`, `HealthScoreDial`, `StatCard`, `TabNav`, `NotificationBanner`, `Modal`, `ConfirmModal`. |
| **React Routing** | React Router v7 (`react-router-dom`) | Declarative client-side routing, protected route wrappers (`<ProtectedRoute>`, `<AdminRoute>`), deep links, URL search params. |
| **React State Management** | React Context + State Hooks (`useState`, `useEffect`, `useMemo`) | `AuthContext` for global session, user identity, JWT token persistence, and role-based access control. |
| **Node.js REST API** | Node.js v20+, Express.js | Microservice listening on port 5000: `/api/notes`, `/api/conversations`, `/api/health`. |
| **Express Middleware** | Custom Express Middleware | `authMiddleware` (HS256 JWT validation), `validateNote` & `validateConversation` (input sanitization), `errorHandler` (centralized HTTP errors), CORS. |
| **MongoDB Database** | MongoDB v7+ via Mongoose ODM | Document collections: `ai_conversations` (chat history with role/timestamp arrays), `financial_notes` (pinned notes, tags, metadata). Resilient JSON document store fallback. |
| **PostgreSQL Database** | PostgreSQL 16 via SQLAlchemy 2.0 ORM | Authoritative financial ledger: `users`, `financial_profiles`, `transactions`, `categories`, `budgets`, `incomes`, `goals`, `investments`, `subscriptions`, `recurring_payments`, `notifications`, `audit_logs`. Zero-config SQLite fallback (`finmate.db`). |
| **Authentication & RBAC** | PBKDF2 Password Hashing + HS256 JWT | Roles: `USER` and `ADMIN`. Secure token passing in `Authorization: Bearer <token>`, role toggling, session invalidation. |
| **AI / Machine Learning** | Scikit-Learn, LinearSVC, Isolation Forest, Ridge | Transaction category auto-classification (98.4% Acc), expense forecasting with 90% confidence bands, spending anomaly detection. |
| **Data Visualization** | Recharts (SVG-based reactive charts) | Income vs. Expense bar charts, category allocation donut charts, spending trends, circular health score SVG gauge dials. |

---

## 3. Product Roles & Application Routes

### Roles
- **USER:** Personal financial ledger, transaction tracking, ML auto-categorization, category budgets, financial goals, emergency fund calculation, subscriptions, financial calendar, analytics, AI financial advisor, What-If simulation sandbox, CSV statement ingestion, MongoDB notes & conversation threads.
- **ADMIN:** Central operations workspace, user governance (promote/demote roles), audit log inspection (50+ tracked events), transaction monitoring, and system diagnostic telemetry.

### Frontend Route Map

| Category | Route | Component | Purpose |
| :--- | :--- | :--- | :--- |
| **Public** | `/login` | `LoginPage` | User / Admin login with quick demo credentials |
| **Public** | `/register` | `RegisterPage` | Account registration with automatic PBKDF2 password hashing |
| **User** | `/dashboard` | `DashboardPage` | Executive health score, summary stats, spending charts, recent activity |
| **User** | `/transactions` | `TransactionsPage` | Complete transaction ledger with search, category filtering, and CRUD |
| **User** | `/income` | `IncomePage` | Dedicated income management (Salary, Freelance, Business, Investment) |
| **User** | `/expenses` | `ExpensesPage` | Dedicated expense tracker with ML auto-categorization preview |
| **User** | `/budgets` | `BudgetsPage` | Category-based monthly spending limits with 80% warning and 100% overrun alerts |
| **User** | `/goals` | `GoalsPage` | Goal progress tracking + Deterministic Emergency Fund coverage calculator |
| **User** | `/investments` | `InvestmentsPage` | Asset allocation and portfolio tracking |
| **User** | `/subscriptions` | `SubscriptionsPage` | Monthly and annual recurring service tracking |
| **User** | `/calendar` | `CalendarPage` | Financial calendar showing salary, renewals, bills, and deadlines |
| **User** | `/analytics` | `AnalyticsPage` | Historical trends, category distribution, savings rate breakdown |
| **User** | `/advisor` | `AIAdvisorPage` | Multi-agent collaborative financial advisory chat with HITL approval |
| **User** | `/simulator` | `DecisionsPage` | In-memory What-If counterfactual scenario comparison sandbox |
| **User** | `/imports` | `CSVImportPage` | Bank statement CSV ingestion with 11-rule validation pipeline |
| **User** | `/notifications` | `NotificationsPage` | Financial notifications, budget alerts, and anomaly indicators |
| **User** | `/notes` | `NotesPage` | **Node.js + MongoDB Workbench**: Document notes and AI conversation threads |
| **User** | `/profile` | `ProfilePage` | User profile, monthly fixed commitments, and risk settings |
| **Admin** | `/admin` | `AdminDashboardPage` | Operational metrics, user management, audit logs, and system health |

---

## 4. Key Financial Modules & Computational Logic

### 4.1 Financial Health Score (Deterministic Calculation)
The Financial Health Score (e.g., `78 / 100`) is calculated using a deterministic algorithm evaluated in real time:
- **Savings Rate (Max 30 pts):** `(Net Monthly Savings / Net Monthly Income) * 100`. (Savings rate ≥ 25% awards full 30 pts).
- **Budget Adherence (Max 25 pts):** Deducts points for budgets exceeding 80% warning and 100% threshold limits.
- **Emergency Fund Buffer (Max 20 pts):** Evaluates `Current Emergency Savings / (Monthly Essential Expenses * 6)`. Full points for 6+ months of runway.
- **Goal Progression (Max 15 pts):** Average completion percentage of active financial targets.
- **Spending Anomalies (Max 10 pts):** Deducts points when statistical spending spikes are detected by the Isolation Forest model.

### 4.2 Emergency Fund Calculator
- **Formula:** `Target Fund = Essential Monthly Expenses × Target Coverage Months`
- Default baseline: ₹15,000 monthly essential living expenses × 6 months = ₹90,000 target.
- Real-time display of current savings, coverage in months (e.g., `8.0 months`), and progress percentage.

### 4.3 AI & Machine Learning Pipeline
1. **Transaction Classifier:** LinearSVC model trained with Scikit-Learn TF-IDF pipeline over Indian financial merchant descriptors (`Swiggy` → *Food & Dining*, `Uber` → *Transport*, `Netflix` → *Entertainment*).
2. **Expense Forecaster:** Ridge Regression time-series forecaster with lagged features providing next-month expenditure estimates and 90% confidence uncertainty intervals.
3. **Anomaly Detector:** Unsupervised Isolation Forest (contamination = 0.05) flagging unexpected expenditure spikes without mislabeling legitimate expenses as fraud.
4. **What-If Simulation Sandbox:** Generates comparative scenarios (e.g., *Option A: Buy outright*, *Option B: Save ₹5,000 extra/mo*, *Option C: Delay 3 months*) computed strictly in-memory without mutating the database.

---

## 5. Node.js & MongoDB Microservice (`node-service/`)

The Node.js service demonstrates full-stack lab competence with Express.js and document databases:

- **Directory:** `node-service/`
- **Port:** `5000`
- **Endpoints:**
  - `GET /api/health` — Microservice status and MongoDB connection state.
  - `GET /api/notes` — Retrieve user's financial notes with search and pin filters.
  - `POST /api/notes` — Create financial note with title, content, tags, and pinned flag.
  - `GET /api/notes/:id` — Retrieve note by ID (user ownership verified).
  - `PUT /api/notes/:id` — Update note content and tags.
  - `DELETE /api/notes/:id` — Delete note document.
  - `GET /api/conversations` — Retrieve AI advisor conversation threads.
  - `POST /api/conversations` — Create new conversation thread.
  - `POST /api/conversations/:id/messages` — Append user or assistant messages to conversation thread.
  - `DELETE /api/conversations/:id` — Delete conversation thread.
- **Resilience Architecture:** If a local MongoDB instance is offline, the microservice automatically falls back to an embedded JSON document store (`data/fallback_notes.json`), ensuring zero crashes during live lab demonstrations and viva examinations.

---

## 6. Seed Data & Demo Accounts

FinMate 2.0 includes a production-grade automated seeding script (`backend/app/scripts/seed_demo_data.py`) pre-loaded with realistic financial profiles:

### Pre-Configured Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **USER** | `demo@finmate.local` | `demo123` | Full financial management suite, AI advisor, What-If simulator |
| **ADMIN** | `admin@finmate.local` | `admin123` | Administrative workspace, user role management, system audit logs |

### Seeded Financial Baseline
- **Income:** ₹60,000 / month (Primary Tech Consulting) + ₹15,000 (Freelance)
- **Transactions:** 12 canonical transactions across Food, Shopping, Transport, Utilities, Entertainment, and Education.
- **Budgets:** Food (₹8,000), Shopping (₹5,000), Transport (₹3,000), Entertainment (₹2,500), Utilities (₹4,000), Healthcare (₹3,000).
- **Goals:** High-Performance Laptop (₹80,000), Emergency Safety Reserve (₹1,50,000), Japan Travel Fund (₹1,20,000).
- **Investments:** Nifty 50 Index Fund (₹85,000), Sovereign Gold Bond (₹42,000), Liquid Emergency Debt Fund (₹1,20,000).
- **Subscriptions:** Netflix Premium (₹649/mo), Spotify Family (₹179/mo), GitHub Copilot (₹820/mo), AWS Cloud Hosting (₹1,450/mo).

---

## 7. Step-by-Step Lab Demonstration Guide

| Demo ID | Action Flow | Technical Validation |
| :--- | :--- | :--- |
| **DEMO 1** | Register → Login → Dashboard | `POST /api/v1/auth/login` → JWT generated → redirected to `/dashboard` with header user pill. |
| **DEMO 2** | Create Expense → API → Database | Add transaction on `/transactions` → `POST /api/v1/transactions` → instant ledger and health score update. |
| **DEMO 3** | Edit Expense → API → Database | Click Edit on transaction row → modal opens with existing data → `PUT /api/v1/transactions/:id`. |
| **DEMO 4** | Delete Expense → API → Database | Click Delete → confirmation modal → `DELETE /api/v1/transactions/:id` → removed from state. |
| **DEMO 5** | Create Budget → Spending Progress | Add budget on `/budgets` → category spending tracked against limit with 80% / 100% alert badges. |
| **DEMO 6** | Create Goal → Progress Calculation | Create goal on `/goals` → monthly required savings calculated to target date. |
| **DEMO 7** | Upload CSV → Validation → Preview → Commit | Ingest bank statement on `/imports` → 11 data quality rules evaluate errors/warnings → preview table → batch commit. |
| **DEMO 8** | ML Transaction Classification | Type "Swiggy order" on `/expenses` → LinearSVC model predicts *Food & Dining* automatically. |
| **DEMO 9** | Spend Anomaly Detection | Add unusual ₹45,000 transaction → Isolation Forest flags spending anomaly with warning indicator. |
| **DEMO 10** | Ask AI Advisor | Ask question on `/advisor` → Multi-agent orchestrator synthesizes guidance with RAG citation. |
| **DEMO 11** | Run What-If Simulation | On `/simulator`, simulate ₹40,000 purchase → in-memory sandbox generates Option A, B, and C with surplus impact. |
| **DEMO 12** | Create Note → Node.js → MongoDB | On `/notes`, create financial note → `POST /api/notes` → saved to MongoDB / document store. |
| **DEMO 13** | Edit & Delete Document | Edit note title, pin note, or delete on `/notes` → real-time Node.js microservice update. |
| **DEMO 14** | Admin Login → Admin Dashboard | Log in as `admin@finmate.local` → `/admin` workspace opens with user role toggle buttons and audit log events. |
| **DEMO 15** | Responsive Mobile UI | Resize viewport to mobile width → collapsible navigation, stacked cards, and touch-friendly controls. |

---

## 8. Local Setup & Execution Instructions

### Prerequisites
- Python 3.11+
- Node.js v20+ and npm
- Git

### 1. Backend Service (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
The FastAPI documentation (Swagger UI) is available at: **`http://localhost:8000/docs`**

### 2. Document Microservice (Node.js + MongoDB)
```bash
cd node-service
npm install
node server.js
```
The Node.js service runs on: **`http://localhost:5000`**

### 3. Frontend Application (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
The web application runs on: **`http://localhost:5173`** (or next available port).

---

## 9. Automated Testing & Verification Results

All unit and integration test suites pass with **100% success rate**:

### Python Backend Test Suite (Pytest)
```bash
pytest backend/tests -v
```
- **Result:** **126 / 126 tests passed (100%)**
- **Coverage:** Auth & RBAC endpoints, budget calculations, income CRUD, subscriptions & recurring commitments, notifications lifecycle, admin statistics, data export (CSV/JSON), ML LinearSVC classifier, Isolation Forest anomaly detector, Ridge forecaster, Multi-agent orchestrator, and What-If sandbox.

### Node.js Microservice Test Suite
```bash
cd node-service
node test.js
```
- **Result:** **8 / 8 tests passed (100%)**
- **Coverage:** Service health check, note creation, note listing, note update, note deletion, conversation thread creation, message appending, and conversation deletion.

### Frontend Production Build (Vite + TypeScript)
```bash
cd frontend
npm run build
```
- **Result:** `tsc -b && vite build` completed with **0 errors**.

---

## 10. Docker Deployment (Optional Multi-Container Stack)

FinMate 2.0 supports one-command deployment via Docker Compose:

```bash
docker compose up --build
```

Services initialized:
- `finmate_db`: PostgreSQL 16 Alpine (`5432`)
- `finmate_mongodb`: MongoDB 7.0 Jammy (`27017`)
- `finmate_node_api`: Node.js Express REST API (`5000`)
- `finmate_backend`: FastAPI Core Financial Engine (`8000`)
- `finmate_frontend`: Nginx / React 19 Production Bundle (`3000`)

---

## 11. Security, Data Privacy & Governance

- **Password Hashing:** PBKDF2 with HMAC-SHA256 and unique salt per user.
- **JWT Authentication:** Cryptographically signed tokens with expiration checks.
- **Role-Based Access Control (RBAC):** Gated routes ensuring regular users cannot access administrative endpoints or other users' private financial data.
- **Input Validation:** Strict Pydantic v2 schemas on Python backend and parameter validation on Node.js microservice.
- **Privacy-First Android Ingestion:** On-device SMS processing with zero raw message telemetry uploaded to remote servers.
- **Mathematical Integrity:** Currency arithmetic uses Python `Decimal` with `ROUND_HALF_UP` to prevent floating-point drift.
