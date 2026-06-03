FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Python env
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . .

# Create directories
RUN mkdir -p /app/media /app/staticfiles /app/logs

# Non-root user
RUN addgroup --system appgroup && adduser --system --group appuser
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

# Run migrations + collect static, then start the ASGI server.
# Shell form is required so $PORT (set by Render) expands at runtime.
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    python manage.py ensure_admin && \
    gunicorn core.asgi:application \
        -k uvicorn.workers.UvicornWorker \
        --workers ${WEB_CONCURRENCY:-2} \
        --bind 0.0.0.0:${PORT:-8000} \
        --timeout 120 \
        --access-logfile -