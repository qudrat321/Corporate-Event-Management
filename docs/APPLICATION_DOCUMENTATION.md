# Acme Corp Event Management — Complete Documentation

> **Version:** 1.0.0 | **Last Updated:** November 2026 | **Stack:** FastAPI + React + Neon PostgreSQL

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Setup & Installation](#5-setup--installation)
6. [Configuration Reference](#6-configuration-reference)
7. [API Reference](#7-api-reference)
8. [Data Models](#8-data-models)
9. [Frontend Pages](#9-frontend-pages)
10. [Business Rules](#10-business-rules)
11. [Security](#11-security)
12. [Performance](#12-performance)
13. [Testing](#13-testing)
14. [Known Issues & Limitations](#14-known-issues--limitations)
15. [Development Workflow](#15-development-workflow)
16. [Deployment Checklist](#16-deployment-checklist)

---

## 1. Executive Summary

**Acme Corp Event Management** is a corporate internal web application that lets employees browse and register for company events, while a designated admin manages the full event lifecycle.

### Who Is It For?
| Role | Capabilities |
|------|-------------|
| **Employee (Public)** | Browse events, view details, register with name & email |
| **Admin** | Create, edit, delete events; view registrations; cancel registrations |

### Core Value
- Centralised event calendar for the entire organisation
- Self-service registration — no email chains or spreadsheets
- Real-time capacity enforcement prevents over-booking
- One admin, one source of truth

---

## 2. Architecture Overview

```mermaid
flowchart TD
    Browser["🌐 Browser\n(Employee / Admin)"]
    Vite["⚡ Vite Dev Server\nlocalhost:5173\nReact 18 + Tailwind CSS"]
    FastAPI["🚀 FastAPI\n127.0.0.1:8000\nPython 3.14 + Uvicorn"]
    Cache["🧠 In-Memory Cache\n300s TTL\n(services.py)"]
    Neon["🐘 Neon PostgreSQL\n(Serverless, Singapore)\nasyncpg driver"]

    Browser -->|"HTTP/JSON"| Vite
    Vite -->|"REST API calls\nAxios / fetch"| FastAPI
    FastAPI -->|"Cache hit → instant"| Cache
    FastAPI -->|"Cache miss → SQL"| Neon
    Neon -->|"Rows"| FastAPI
    FastAPI -->|"JSON response"| Vite
    Vite -->|"Rendered UI"| Browser
```

```mermaid
flowchart LR
    subgraph Auth Flow
        Login["POST /auth/login"] --> JWT["JWT Token\n(HS256, 60 min)"]
        JWT --> Header["Authorization: Bearer token"]
        Header --> Guard["require_admin()\ndependency"]
        Guard -->|"Valid"| ProtectedRoute["Protected Endpoint"]
        Guard -->|"Invalid / Missing"| E401["401 Unauthorized"]
    end
```

---

## 3. Technology Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Python | 3.14 |
| Web Framework | FastAPI | 0.162+ |
| ORM | SQLAlchemy (async) | 2.1+ |
| DB Driver | asyncpg | latest |
| Validation | Pydantic | v2 |
| Auth | PyJWT (HS256) | latest |
| Server | Uvicorn | latest |
| Database | Neon PostgreSQL | Serverless |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 18 |
| Build Tool | Vite | latest |
| Styling | Tailwind CSS | latest |
| HTTP Client | Axios / fetch | — |
| Routing | React Router | v6 |
| Language | JavaScript (ES2022) | — |

---

## 4. Project Structure

```
Corporate-Event-Management/
│
├── backend/                        # FastAPI application
│   ├── app/
│   │   ├── auth.py                 # JWT creation, admin login, require_admin guard
│   │   ├── config.py               # Pydantic Settings — reads from .env
│   │   ├── db.py                   # SQLAlchemy async engine + IPv4 DNS patch
│   │   ├── main.py                 # FastAPI app, all route definitions
│   │   ├── models.py               # SQLAlchemy ORM models (Event, Registration)
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   └── services.py             # Business logic + 300s in-memory cache
│   │
│   ├── tests/
│   │   └── test_api.py             # Integration tests (httpx + aiosqlite in-memory)
│   │
│   ├── create_tables.py            # One-time DB table creation script
│   ├── seed_test_events.py         # Loads 15 sample events into DB
│   ├── requirements.txt            # Production Python dependencies
│   ├── requirements-test.txt       # Test-only dependencies (httpx, aiosqlite)
│   └── .env                        # Environment variables (DO NOT COMMIT)
│
├── frontend/                       # React + Vite application
│   ├── src/
│   │   ├── App.jsx                 # React Router — route definitions
│   │   ├── api/
│   │   │   └── client.js           # Centralized API client (base URL, auth headers)
│   │   ├── components/
│   │   │   ├── AppLayout.jsx       # Shared nav/layout wrapper
│   │   │   ├── EventCard.jsx       # Reusable event card component
│   │   │   ├── LoadingState.jsx    # Spinner / loading UI
│   │   │   ├── RequireAuth.jsx     # Route guard for admin pages
│   │   │   └── Toast.jsx           # Notification toast component
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx         # Auth context — login, logout, token storage
│   │   │   └── useToast.jsx        # Toast state management
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page
│   │   │   ├── LoginPage.jsx       # Admin login form
│   │   │   ├── EventsPage.jsx      # Paginated events list + search/filter
│   │   │   ├── EventDetailsPage.jsx# Single event view + registration form
│   │   │   └── EventFormPage.jsx   # Create / Edit event form (admin only)
│   │   └── utils/
│   │       └── dates.js            # Date formatting helpers
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── APPLICATION_DOCUMENTATION.md   # ← This file
│   ├── API_REFERENCE.md               # Detailed API reference with curl examples
│   ├── postman/
│   │   └── Acme_Corp_Events.postman_collection.json
│   ├── agent-history.md               # AI development session history
│   ├── ai-usage/                      # (placeholder)
│   └── screenshots/                   # (placeholder)
│
└── README.md                          # Quick-start guide
```

---

## 5. Setup & Installation

### Prerequisites
- Python 3.11+ (see [Known Issues](#14-known-issues--limitations) for 3.14 notes)
- Node.js 18+ and npm
- A PostgreSQL database (Neon serverless recommended)
- Git

---

### 5.1 Backend Setup

```bash
# 1. Navigate to the backend directory
cd Corporate-Event-Management/backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install production dependencies
pip install -r requirements.txt

# 4. Create the .env file (see Section 6 for all variables)
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux
# Then edit .env with your values

# 5. Create database tables (run once)
python create_tables.py

# 6. (Optional) Seed 15 sample events
python seed_test_events.py

# 7. Start the backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Verify:** Open `http://127.0.0.1:8000/health` — should return `{"status": "ok"}`.

---

### 5.2 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Corporate-Event-Management/frontend

# 2. Install dependencies
npm install

# 3. Create frontend env file (if needed)
# VITE_API_BASE_URL is typically hardcoded in api/client.js as http://127.0.0.1:8000

# 4. Start the dev server
npm run dev
```

**Verify:** Open `http://localhost:5173` in your browser.

---

## 6. Configuration Reference

All backend configuration lives in `backend/.env`. **Never commit this file to version control.**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Full PostgreSQL connection string | `postgresql+asyncpg://user:pass@host/db` |
| `ADMIN_USERNAME` | ✅ | Admin login username | `admin` |
| `ADMIN_PASSWORD` | ✅ | Admin login password (min 12 chars recommended) | `StrongPass123!` |
| `JWT_SECRET_KEY` | ✅ | Secret for signing JWT tokens (min 32 bytes) | `a8ba4fb0db83...` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | Token lifetime in minutes | `60` |
| `CORS_ORIGINS` | ✅ | Comma-separated list of allowed frontend origins | `http://localhost:5173,http://localhost:5174` |

### Generating a Secure JWT Secret
```bash
# Python (run in terminal)
python -c "import secrets; print(secrets.token_hex(32))"

# PowerShell
-join ((1..32) | ForEach { '{0:X2}' -f (Get-Random -Max 256) })
```

> [!CAUTION]
> Never use a weak or default JWT secret in production. A leaked secret allows anyone to forge admin tokens and take full control of the application.

---

## 7. API Reference

**Base URL:** `http://127.0.0.1:8000`

**Authentication:** Admin-only endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

Obtain a token via `POST /auth/login`.

---

### 7.1 Health & Root

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Public | Returns API links |
| `GET` | `/health` | Public | Checks database connectivity |

**GET /health — Response (200)**
```json
{ "status": "ok" }
```

---

### 7.2 Authentication

#### `POST /auth/login`
Authenticate as admin and receive a JWT token.

**Request Body**
```json
{
  "username": "admin",
  "password": "your_admin_password"
}
```

**Response (200)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses**
| Status | Meaning |
|--------|---------|
| `401` | Invalid username or password |

---

### 7.3 Events

#### `GET /events`
List all events (paginated, with optional filters). **Public.**

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | `0` | Number of records to skip |
| `limit` | int | `10` | Max records to return |
| `title` | string | — | Filter by title (partial match) |
| `date` | string | — | Filter by event date (`YYYY-MM-DD`) |

**Response (200)**
```json
[
  {
    "id": 1,
    "title": "Annual Company Kickoff",
    "description": "New year planning event",
    "event_date": "2026-01-15",
    "location": "Main Auditorium",
    "max_capacity": 200
  }
]
```

---

#### `POST /events`
Create a new event. **Admin only.**

**Request Body**
```json
{
  "title": "Team Building Workshop",
  "description": "Optional description",
  "event_date": "2026-03-20",
  "location": "Conference Room A",
  "max_capacity": 50
}
```

**Response (201)** — Returns the created event object.

**Errors**
| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid token |
| `422` | Validation error (missing/invalid fields) |

---

#### `GET /events/{id}`
Get a single event by ID. **Public.**

**Response (200)** — Full event object.

**Errors**
| Status | Meaning |
|--------|---------|
| `404` | Event not found |

---

#### `PUT /events/{id}`
Update all fields of an event. **Admin only.**

**Request Body** — Same schema as `POST /events`. All fields required.

**Response (200)** — Updated event object.

**Errors**
| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid token |
| `404` | Event not found |
| `422` | Validation error |

---

#### `DELETE /events/{id}`
Delete an event (and all its registrations via cascade). **Admin only.**

**Response (200)**
```json
{ "message": "Event deleted" }
```

**Errors**
| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid token |
| `404` | Event not found |

---

### 7.4 Registrations

#### `GET /events/{id}/registrations`
List all registrations for a specific event. **Public.**

**Response (200)**
```json
[
  {
    "id": 42,
    "event_id": 1,
    "employee_name": "Jane Smith",
    "employee_email": "jane.smith@acmecorp.com"
  }
]
```

---

#### `POST /events/{id}/registrations`
Register an employee for an event. **Public.**

**Request Body**
```json
{
  "employee_name": "Jane Smith",
  "employee_email": "jane.smith@acmecorp.com"
}
```

**Response (201)** — Returns the new registration object.

**Errors**
| Status | Meaning |
|--------|---------|
| `400` | Event is at full capacity |
| `400` | Email already registered for this event |
| `404` | Event not found |
| `422` | Validation error |

---

#### `DELETE /registrations/{id}`
Cancel a registration by ID. **Admin only.**

**Response (200)**
```json
{ "message": "Registration cancelled" }
```

**Errors**
| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid token |
| `404` | Registration not found |

---

## 8. Data Models

### Event

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `title` | String(200) | NOT NULL | Event name |
| `description` | Text | Nullable | Optional long description |
| `event_date` | Date | NOT NULL | Date of the event |
| `location` | String(255) | NOT NULL | Venue or room |
| `max_capacity` | Integer | NOT NULL | Maximum attendees allowed |

### Registration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `event_id` | Integer | FK → Event(id) CASCADE DELETE | Parent event |
| `employee_name` | String(200) | NOT NULL | Full name of attendee |
| `employee_email` | String(320) | NOT NULL | Work email of attendee |

**Unique Constraint:** `(event_id, employee_email)` — one registration per person per event.

**Cascade Rule:** Deleting an Event automatically deletes all its Registrations.

---

## 9. Frontend Pages

| Page | Route | Auth Required | Description |
|------|-------|--------------|-------------|
| `HomePage` | `/` | No | Landing page with app introduction |
| `LoginPage` | `/login` | No | Admin login form; stores JWT in localStorage |
| `EventsPage` | `/events` | No | Paginated grid of event cards + search/filter bar |
| `EventDetailsPage` | `/events/:id` | No | Full event info + registration form |
| `EventFormPage` | `/events/new` | ✅ Admin | Create new event form |
| `EventFormPage` | `/events/:id/edit` | ✅ Admin | Edit existing event form |

### Key Components

| Component | Purpose |
|-----------|---------|
| `AppLayout` | Shared navigation bar, page wrapper |
| `RequireAuth` | Redirects non-admins away from admin routes |
| `EventCard` | Reusable card: title, date, location, capacity badge |
| `LoadingState` | Spinner shown during API calls |
| `Toast` | Auto-dismissing success/error notifications |

### State Management

- **Auth state:** Managed via `useAuth` hook + React Context; JWT stored in `localStorage`
- **Toast notifications:** Managed via `useToast` hook
- **API calls:** All routed through `src/api/client.js` which injects the `Authorization` header automatically

---

## 10. Business Rules

| Rule | Where Enforced |
|------|---------------|
| An employee cannot register for the same event twice (duplicate email) | DB unique constraint + `services.py` check → HTTP 400 |
| Registration fails if `current_registrations >= max_capacity` | `services.py` → HTTP 400 |
| Deleting an event removes all registrations automatically | SQLAlchemy cascade delete |
| Admin login uses constant-time password comparison (timing-safe) | `auth.py` with `hmac.compare_digest` |
| JWT tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 60 min) | `auth.py` |
| All admin writes invalidate the in-memory event cache | `services.py` cache clear on create/update/delete |

---

## 11. Security

### Authentication
- **Algorithm:** HS256 (HMAC-SHA256)
- **Token lifetime:** 60 minutes (configurable via env)
- **Storage:** Client stores JWT in `localStorage`

### Password Handling
- Passwords are compared using `hmac.compare_digest` (Python stdlib) — **timing-safe**, immune to timing oracle attacks
- No password hashing is used in this version (single admin, credential managed via env)

> [!WARNING]
> For production use with multiple users, upgrade to bcrypt or Argon2 password hashing.

### CORS
- Only origins listed in `CORS_ORIGINS` (`.env`) are allowed
- Credentials and all standard methods/headers are permitted for listed origins

### Input Validation
- All request bodies are validated by Pydantic v2 schemas before reaching business logic
- SQLAlchemy parameterized queries prevent SQL injection

### Recommendations for Production
- [ ] Rotate `JWT_SECRET_KEY` regularly
- [ ] Use HTTPS (TLS) in front of Uvicorn (nginx or cloud load balancer)
- [ ] Store secrets in a vault (e.g., AWS Secrets Manager, GCP Secret Manager)
- [ ] Enable rate limiting on `/auth/login`

---

## 12. Performance

### In-Memory Cache (`services.py`)

The event list is cached in memory for **300 seconds (5 minutes)** to avoid repeated database round-trips.

| Scenario | Response Time |
|----------|-------------|
| Cold (no cache, Neon cold-start) | 25–45 seconds |
| Warm (cache hit) | **~1.8 ms** |
| Warm (cache miss, DB warm) | ~200–500 ms |

**Cache invalidation:** The cache is cleared automatically whenever an event is created, updated, or deleted.

### IPv4 DNS Patch (`db.py`)

Python 3.14 on Windows tries IPv6 first when resolving Neon's hostname. Neon only responds on IPv4, causing a **25-second timeout** per connection. The patch in `db.py` forces IPv4 resolution:

```python
import socket
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_only(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_only
```

### Connection Pool Settings

```python
pool_size=10        # Maintained persistent connections
max_overflow=20     # Burst capacity above pool_size
pool_recycle=300    # Recycle connections after 5 minutes (matches Neon idle timeout)
pool_pre_ping=False # Disabled — saves a roundtrip per query
```

---

## 13. Testing

### Setup

```bash
cd backend

# Install test dependencies (separate from production)
pip install -r requirements-test.txt
```

`requirements-test.txt` includes:
- `httpx` — ASGI transport for FastAPI testing (no real HTTP server needed)
- `aiosqlite` — In-memory SQLite async driver (replaces Neon for tests)

### Running Tests

```bash
# From the backend/ directory
python -m unittest discover -s tests
```

### Test Architecture

Tests use an **in-memory SQLite database** via `aiosqlite`. The FastAPI app is mounted with an ASGI transport using `httpx.AsyncClient` — no real server is started.

```
tests/test_api.py
├── setUp()          — Creates in-memory SQLite DB, creates tables
├── test_health      — GET /health → 200
├── test_create_event — POST /events (admin auth) → 201
├── test_list_events  — GET /events → 200, returns list
├── test_register     — POST /events/{id}/registrations → 201
└── test_duplicate    — Duplicate email → 400
```

> [!IMPORTANT]
> Tests currently have a known incompatibility with **Python 3.14** (see [Known Issues](#14-known-issues--limitations)). Use Python 3.11 or 3.12 to run the test suite reliably.

---

## 14. Known Issues & Limitations

### 1. Python 3.14 + asyncpg SSL / ProactorEventLoop
**Issue:** Python 3.14 on Windows uses `ProactorEventLoop` by default. asyncpg's TLS handshake (`start_tls()`) is incompatible with this event loop, causing connection failures.

**Workaround:** The IPv4 DNS patch in `db.py` causes asyncpg to use a plain TCP connection path that avoids the broken TLS code path, restoring connectivity.

**Long-term fix:** Upgrade to asyncpg ≥ 0.30 (when it supports ProactorEventLoop), or switch the event loop to `SelectorEventLoop` at app startup.

---

### 2. aiosqlite Hangs on Python 3.14
**Issue:** `aiosqlite` uses a background thread + `asyncio.Event` for synchronization. Python 3.14's ProactorEventLoop has a synchronization bug that causes `asyncio.run()` to hang indefinitely when aiosqlite is used.

**Impact:** The test suite cannot run on Python 3.14.

**Workaround:** Use Python 3.11 or 3.12 to run tests.

---

### 3. Neon PostgreSQL Cold Starts
**Issue:** Neon's serverless PostgreSQL suspends after ~5 minutes of inactivity. The first query after suspension takes 5–30 seconds.

**Workaround:** `pool_recycle=300` recycles connections before Neon forcibly closes them. The in-memory cache shields most reads from cold starts.

---

### 4. Single Admin Account
The application supports only one admin user, configured via environment variables. There is no user management UI or multi-admin support.

---

### 5. No Password Hashing
Admin credentials are stored in plaintext in `.env` and compared with `hmac.compare_digest`. This is acceptable for a single-admin internal tool but should be upgraded before exposing the app to external networks.

---

## 15. Development Workflow

### Git Branch Strategy
```
main                   # Stable production branch
└── feature/event-crud # Current development branch
```

### Daily Development Cycle

```bash
# 1. Start the backend (from backend/)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start the frontend (from frontend/)
npm run dev

# 3. Check API health
curl http://127.0.0.1:8000/health

# 4. Seed data (optional, run once)
python seed_test_events.py

# 5. Run tests (use Python 3.11/3.12)
python -m unittest discover -s tests
```

### Adding a New API Endpoint

1. **Schema:** Add request/response Pydantic models in `schemas.py`
2. **Service:** Add business logic function in `services.py`
3. **Route:** Add FastAPI route in `main.py`
4. **Test:** Add test case in `tests/test_api.py`
5. **Docs:** Update `API_REFERENCE.md`

### Environment Files
| File | Purpose | Committed? |
|------|---------|-----------|
| `backend/.env` | Live secrets & config | ❌ No (in .gitignore) |
| `backend/.env.example` | Template with placeholder values | ✅ Yes |

---

## 16. Deployment Checklist

Before deploying to production, complete every item:

### Security
- [ ] Generate a new `JWT_SECRET_KEY` (≥ 32 bytes of random data)
- [ ] Set a strong `ADMIN_PASSWORD` (≥ 12 chars, mixed case + symbols)
- [ ] Restrict `CORS_ORIGINS` to your production frontend domain only
- [ ] Enable HTTPS (TLS) via a reverse proxy (nginx, Caddy, or cloud LB)
- [ ] Add rate limiting to `POST /auth/login`

### Database
- [ ] Run `python create_tables.py` against the production database
- [ ] Verify `DATABASE_URL` points to production Neon project
- [ ] Test database connectivity via `GET /health`

### Application
- [ ] Set `ACCESS_TOKEN_EXPIRE_MINUTES` to an appropriate value
- [ ] Remove or disable `seed_test_events.py` from production
- [ ] Build and serve the frontend: `npm run build` → serve `dist/`
- [ ] Update frontend API base URL to point to the production backend

### Monitoring
- [ ] Set up uptime monitoring on `GET /health`
- [ ] Configure error alerting (Sentry, Datadog, etc.)
- [ ] Enable Uvicorn access logs

---

## Appendix: Quick Reference

### Common Commands
```bash
# Start backend (dev)
cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Start frontend (dev)
cd frontend && npm run dev

# Create DB tables
cd backend && python create_tables.py

# Seed sample data
cd backend && python seed_test_events.py

# Run tests (Python 3.11/3.12 only)
cd backend && python -m unittest discover -s tests

# Generate JWT secret
python -c "import secrets; print(secrets.token_hex(32))"
```

### Key URLs
| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Frontend (dev) |
| `http://127.0.0.1:8000` | Backend API (dev) |
| `http://127.0.0.1:8000/health` | Health check |
| `http://127.0.0.1:8000/docs` | Auto-generated Swagger UI |
| `http://127.0.0.1:8000/redoc` | ReDoc API documentation |

> [!TIP]
> FastAPI auto-generates interactive API docs at `/docs` (Swagger UI) and `/redoc`. These are always up-to-date with your actual routes and schemas — use them for quick testing during development.
