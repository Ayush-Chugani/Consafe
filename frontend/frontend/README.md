# PPE Analytics Platform

Industrial PPE compliance and worker attendance monitoring system powered by computer vision.

## Project Structure

```
PPE-detection/
├── frontend/          React + Vite + TypeScript SPA
├── backend/           Node.js + Express REST API (TypeScript)
└── database/          PostgreSQL schema and seed data
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Python 3.10+ (AI microservice)

---

### 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE ppe_analytics;"

# Apply schema
psql -U postgres -d ppe_analytics -f database/schema.sql

# Load sample data
psql -U postgres -d ppe_analytics -f database/seed.sql
```

---

### 2. Backend

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, etc.

# Install dependencies
npm install

# Start development server (hot-reload)
npm run dev

# Or build and run production
npm run build
npm start
```

The API will be available at `http://localhost:4000`

---

### 3. Frontend

```bash
cd frontend

cp .env.example .env
# Edit VITE_API_BASE_URL=http://localhost:4000/api/v1

npm install
npm run dev
```

The SPA will be available at `http://localhost:5173`

---

## Default Login Credentials

| Role        | Email                           | Password   |
|-------------|----------------------------------|------------|
| Super Admin | admin@ppe-analytics.com          | Admin@123  |
| Admin       | manager@ppe-analytics.com        | Admin@123  |
| Supervisor  | supervisor@ppe-analytics.com     | Admin@123  |
| Viewer      | viewer@ppe-analytics.com         | Admin@123  |

> Change all passwords immediately after first login in production.

---

## API Documentation

**Base URL:** `http://localhost:4000/api/v1`

**Health Check:** `GET http://localhost:4000/health`

### Authentication

All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | /auth/login               | Login, returns access + refresh token|
| POST   | /auth/logout              | Clear refresh token cookie           |
| POST   | /auth/refresh             | Refresh access token from cookie     |
| GET    | /auth/me                  | Get current user profile             |

### Workers

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | /workers                      | List workers (search/filter)   |
| POST   | /workers                      | Create worker (ADMIN+)         |
| GET    | /workers/:id                  | Get worker by ID               |
| PUT    | /workers/:id                  | Update worker (ADMIN+)         |
| DELETE | /workers/:id                  | Soft-delete worker (ADMIN+)    |
| GET    | /workers/:id/attendance       | Worker attendance history      |
| GET    | /workers/:id/ppe-summary      | Worker PPE compliance summary  |
| GET    | /workers/:id/violations       | Worker violation frames        |
| GET    | /workers/:id/face-log         | Worker face detection log      |
| GET    | /workers/:id/safety-score     | Worker safety score + history  |
| POST   | /workers/:id/enroll-face      | Enroll face (ADMIN+)           |

### Attendance

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | /attendance               | List records (date/status/dept)|
| GET    | /attendance/summary       | Daily attendance summary       |
| GET    | /attendance/trend         | N-day trend data               |
| POST   | /attendance/log           | AI layer logs a detection      |
| PUT    | /attendance/:id           | Update record (ADMIN+)         |
| POST   | /attendance/:id/flag      | Flag as false detection        |

### PPE Jobs

| Method | Endpoint                      | Description                     |
|--------|-------------------------------|---------------------------------|
| POST   | /videos/analyze               | Upload + submit video job       |
| GET    | /jobs                         | List jobs (filter/paginate)     |
| GET    | /jobs/:id                     | Job detail + metrics            |
| GET    | /jobs/:id/stream              | SSE real-time progress stream   |
| GET    | /jobs/:id/result              | Full results after completion   |
| GET    | /jobs/:id/download            | Redirect to output video        |
| DELETE | /jobs/:id                     | Delete job (ADMIN+)             |
| GET    | /jobs/:id/frames              | Violation frames for job        |
| GET    | /jobs/:id/workers             | Workers detected in job         |

### Dashboard

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | /dashboard/kpis                   | KPI cards with trend values    |
| GET    | /dashboard/attendance-trend       | Daily attendance trend         |
| GET    | /dashboard/ppe-by-category        | PPE compliance by category     |
| GET    | /dashboard/violations-trend       | Violations over time           |
| GET    | /dashboard/safety-distribution    | Worker safety score tiers      |
| GET    | /dashboard/activity-feed          | Unified recent activity        |

### Reports

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| POST   | /reports/generate         | Generate on-demand report      |
| GET    | /reports/scheduled        | List scheduled reports         |
| POST   | /reports/scheduled        | Create scheduled report (ADMIN)|
| PUT    | /reports/scheduled/:id    | Update scheduled report (ADMIN)|
| DELETE | /reports/scheduled/:id    | Delete scheduled report (ADMIN)|

### Admin

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | /admin/users                      | List admin users (SUPER_ADMIN)     |
| POST   | /admin/users                      | Create admin user (SUPER_ADMIN)    |
| PUT    | /admin/users/:id                  | Update admin user (SUPER_ADMIN)    |
| DELETE | /admin/users/:id                  | Deactivate admin user (SUPER_ADMIN)|
| GET    | /admin/audit-log                  | Paginated audit log                |
| POST   | /admin/users/:id/reset-password   | Reset user password (SUPER_ADMIN)  |

---

## Role Hierarchy

```
VIEWER < SUPERVISOR < ADMIN < SUPER_ADMIN
```

| Action                    | Minimum Role  |
|---------------------------|---------------|
| Read data                 | VIEWER        |
| View dashboard            | SUPERVISOR    |
| Submit videos, flag detections | SUPERVISOR |
| Create/edit workers       | ADMIN         |
| Manage admin users        | SUPER_ADMIN   |

---

## Environment Variables

See `backend/.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Min 32 characters, used for access tokens
- `JWT_REFRESH_SECRET` — Min 32 characters, used for refresh tokens
- `AI_API_BASE_URL` — URL of the Python AI microservice (default: http://localhost:8000)
- `MEDIA_STORAGE_PATH` — Local directory for uploaded videos and frame images
- `CORS_ORIGIN` — Allowed frontend origin (default: http://localhost:5173)

---

## Database Schema

Core tables:
- `admin_users` — Platform operators
- `workers` — Field workers being monitored
- `attendance_records` — Daily clock-in/out (one row per worker per day)
- `ppe_jobs` — Video analysis jobs
- `ppe_metrics` — Job-level summary statistics
- `ppe_class_counts` — Detection counts per PPE class per job
- `worker_ppe_summary` — Per-worker compliance within a job
- `violation_frames` — Individual frames with PPE violations
- `face_detection_log` — Every face recognition event
- `safety_scores` — Daily composite safety score per worker
- `audit_log` — Immutable admin action trail
- `scheduled_reports` — Periodic report delivery configurations

---

## Development

```bash
# Run database migration only
cd backend && npm run db:migrate

# Type check
npx tsc --noEmit

# Build for production
npm run build
```
