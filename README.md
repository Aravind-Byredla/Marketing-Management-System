# Marketing & Branding Requirement Management System

A centralized, production-ready web platform for managing marketing and branding service requests across companies, branches, and departments.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI |
| State | Zustand, TanStack Query |
| Backend | Django 5, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, Celery |
| Real-time | Django Channels (WebSocket) |
| Docs | drf-spectacular (Swagger / ReDoc) |
| Proxy | Nginx |
| Containers | Docker, Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose v2+
- Node.js 20+ (local development)
- Python 3.12+ (local development)

### 1. Clone & configure

```bash
git clone <repo-url>
cd marketing-branding-system
cp .env.example .env
# Edit .env with your values
```

### 2. Run with Docker

```bash
docker compose up --build
```

Services start at:
- Frontend: http://localhost
- API: http://localhost/api/
- Swagger: http://localhost/api/docs/
- Django Admin: http://localhost/admin/

### 3. Local development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

**Redis + Celery (backend):**
```bash
# Terminal 1
redis-server

# Terminal 2
celery -A core worker -l info

# Terminal 3
celery -A core beat -l info
```

## User Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full platform access, manage users & workflows |
| `ADMIN` | Manage requests, assign tasks, company/branch CRUD |
| `MANAGER` | Create & track requests, confirm completed work |
| `TEAM_MEMBER` | View assigned tasks, upload deliverables |

## Request Workflow

```
DRAFT → PENDING → ASSIGNED → IN_PROGRESS → UNDER_REVIEW → COMPLETED → CLOSED
                                                                     ↘ REJECTED
```

## API Documentation

- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- OpenAPI schema: `/api/schema/`

## Project Structure

```
marketing-branding-system/
├── backend/                  # Django REST API
│   ├── core/                 # Project settings & routing
│   └── apps/
│       ├── authentication/   # JWT auth endpoints
│       ├── users/            # User management
│       ├── master_data/      # Company / Branch / Category CRUD
│       ├── requests/         # Request lifecycle
│       ├── tasks/            # Task assignment & tracking
│       ├── notifications/    # In-app + WebSocket notifications
│       ├── analytics/        # Dashboard metrics
│       └── audit_logs/       # Immutable audit trail
├── frontend/                 # Next.js 14 app
│   └── src/
│       ├── app/              # App Router pages
│       ├── components/       # UI & layout components
│       ├── features/         # Feature-specific components
│       ├── hooks/            # Custom React hooks
│       ├── services/         # Axios API clients
│       ├── store/            # Zustand stores
│       └── types/            # TypeScript interfaces
├── nginx/                    # Reverse proxy config
├── docker-compose.yml
└── .env.example
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## License

Proprietary — All rights reserved.
