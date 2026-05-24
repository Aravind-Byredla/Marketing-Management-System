from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Use console email in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Relax CORS in dev
CORS_ALLOW_ALL_ORIGINS = True

# Django debug toolbar (optional — install separately)
INTERNAL_IPS = ["127.0.0.1"]
