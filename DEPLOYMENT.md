# Deployment Guide

This repository can be deployed on a single container host platform using either Fly.io or Render.

## Recommended approach

- **Backend:** deploy the Django app in `backend/`
- **Frontend:** deploy the Next.js app in `frontend/`
- **Database:** use a managed PostgreSQL instance
- **Cache/queue:** use a managed Redis instance (for Celery and Channels)
- **Env:** keep production values in platform secrets rather than in `.env`
- **Workers:** run separate worker services for Celery worker and Celery beat

---

## Fly.io deployment

Fly is a good fit when you want the backend and frontend to stay Docker-based. Use one Fly app for the backend web process and one Fly app for the frontend. Celery can run as additional Fly apps using the same backend image and a different command.

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Create the backend app

```bash
cd backend
fly launch --name marketing-backend --region iad --dockerfile Dockerfile --no-deploy
```

### 3. Create the frontend app

```bash
cd ../frontend
fly launch --name marketing-frontend --region iad --dockerfile Dockerfile --no-deploy
```

### 4. Add managed Postgres and Redis

```bash
fly postgres create --name marketing-db --region iad
```

For Redis, use a managed Redis provider such as Upstash, Redis Cloud, or your platform's current Redis offering, then copy the Redis URL.

### 5. Set secrets for backend

```bash
cd ../backend
fly secrets set \
  SECRET_KEY="<your-secret>" \
  DJANGO_SETTINGS_MODULE=core.settings.production \
  ALLOWED_HOSTS="marketing-backend.fly.dev" \
  DATABASE_URL="<postgres-connection-string>" \
  REDIS_URL="<redis-connection-string>" \
  CELERY_BROKER_URL="<redis-connection-string>" \
  CELERY_RESULT_BACKEND="<redis-connection-string>" \
  JWT_SECRET_KEY="<jwt-secret>" \
  CORS_ALLOWED_ORIGINS="https://marketing-frontend.fly.dev" \
  CSRF_TRUSTED_ORIGINS="https://marketing-frontend.fly.dev"
```

### 6. Set secrets for frontend

```bash
cd ../frontend
fly secrets set \
  NEXT_PUBLIC_API_URL="https://marketing-backend.fly.dev" \
  NEXT_PUBLIC_WS_URL="wss://marketing-backend.fly.dev" \
  NEXTAUTH_URL="https://marketing-frontend.fly.dev"
```

### 7. Deploy

`NEXT_PUBLIC_*` values are baked into the Next.js production build, so pass them as Docker build args when deploying the frontend.

```bash
cd ../backend
fly deploy

cd ../frontend
fly deploy \
  --build-arg NEXT_PUBLIC_API_URL="https://marketing-backend.fly.dev" \
  --build-arg NEXT_PUBLIC_WS_URL="wss://marketing-backend.fly.dev"
```

### 8. Add Celery worker apps

Create two additional Fly apps using the backend Dockerfile, then override each process command in the Fly dashboard or app config:

```bash
cd ../backend
fly launch --name marketing-worker --region iad --dockerfile Dockerfile --no-deploy
fly launch --name marketing-beat --region iad --dockerfile Dockerfile --no-deploy
```

Use the same backend secrets for both apps.

Worker command:

```bash
celery -A core worker -l info --concurrency 4 -Q default,notifications,emails
```

Beat command:

```bash
celery -A core beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### 9. Custom domain (optional)

```bash
fly domains add example.com
fly deploy
```

### Notes for Fly

- The backend uses `core.settings.production`; `backend/fly.toml` already includes the production setting.
- The backend Dockerfile exposes `8000`; the frontend Dockerfile exposes `3000`.
- If your Fly domain names differ, update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` accordingly.
- The backend Dockerfile now includes the production web command, so platform services can start it without copying the long Compose command.

---

## Render deployment

Render is usually the easiest GUI-based option for this repo. Create separate services for the web backend, frontend, Celery worker, and Celery beat.

### 1. Create services

Use the Render dashboard and connect this GitHub repository.

Create these services:

- **Marketing Backend**
  - Root: `backend/`
  - Environment: Docker
  - Dockerfile Path: `backend/Dockerfile`
  - Start Command: leave default (Docker CMD handles it)
  - Environment variables:
    - `DJANGO_SETTINGS_MODULE=core.settings.production`
    - `SECRET_KEY`
    - `ALLOWED_HOSTS` (your Render URL or custom domain)
    - `DATABASE_URL`
    - `REDIS_URL`
    - `CELERY_BROKER_URL`
    - `CELERY_RESULT_BACKEND`
    - `JWT_SECRET_KEY`
    - `CORS_ALLOWED_ORIGINS` (set to your frontend URL)
    - `CSRF_TRUSTED_ORIGINS` (set to your frontend URL)

- **Marketing Frontend**
  - Root: `frontend/`
  - Environment: Docker
  - Dockerfile Path: `frontend/Dockerfile`
  - Environment variables:
    - `NEXT_PUBLIC_API_URL` (your backend URL)
    - `NEXT_PUBLIC_WS_URL` (your backend `wss://` URL)
    - `NEXTAUTH_URL`

- **Marketing Celery Worker**
  - Root: `backend/`
  - Environment: Docker
  - Dockerfile Path: `backend/Dockerfile`
  - Start Command: `celery -A core worker -l info --concurrency 4 -Q default,notifications,emails`
  - Environment variables: same as the backend service

- **Marketing Celery Beat**
  - Root: `backend/`
  - Environment: Docker
  - Dockerfile Path: `backend/Dockerfile`
  - Start Command: `celery -A core beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler`
  - Environment variables: same as the backend service

### 2. Add managed Postgres + Redis

- Add a PostgreSQL database from Render
- Add a Redis instance from Render
- Copy the generated connection strings into backend service env vars

### 3. Deploy

- Render auto-deploys on git push by default.
- Push your branch to GitHub to trigger deployment.

---

## Production environment hints

- Set `DJANGO_SETTINGS_MODULE=core.settings.production`
- Keep `DEBUG=False`
- Set `ALLOWED_HOSTS` to the exact hostnames your app uses
- Set `CORS_ALLOWED_ORIGINS` to your frontend host
- Use `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` for the frontend API connection
- Keep `SECRET_KEY` and `JWT_SECRET_KEY` secret

## Platform-specific advice

- On Fly, use `fly status` and `fly logs` to inspect runtime status.
- On Render, use the dashboard logs and deploy history.
- In both cases, do not deploy the `db` or `redis` compose services from `docker-compose.yml`; use managed services instead.
