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
