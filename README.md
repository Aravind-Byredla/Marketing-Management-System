# MBRMS — Marketing & Branding Requirement Management System

## Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (JWT)
- **Hosting:** VPS (NGINX + PM2)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your DB URL and secrets
```

### 3. Set up database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@mbrms.com | admin123 |
| Admin | admin@mbrms.com | admin123 |
| Manager | manager@mbrms.com | admin123 |
| Team Member | team@mbrms.com | admin123 |

## Roles & Access
- **Manager** — Create and track requests
- **Admin** — Assign tasks, manage statuses
- **Team Member** — View and complete assigned tasks
- **Super Admin** — Full platform control
