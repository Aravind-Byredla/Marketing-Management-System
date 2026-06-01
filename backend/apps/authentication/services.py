import logging
import secrets
from datetime import timedelta

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from apps.users.models import User

logger = logging.getLogger(__name__)

PASSWORD_RESET_TIMEOUT_HOURS = 24


def generate_reset_token(user: User) -> str:
    token = secrets.token_urlsafe(32)
    user.password_reset_token = token
    user.password_reset_expires = timezone.now() + timedelta(hours=PASSWORD_RESET_TIMEOUT_HOURS)
    user.save(update_fields=["password_reset_token", "password_reset_expires"])
    return token


def send_password_reset_email(user: User, reset_url: str) -> None:
    subject = "Reset your password — Marketing & Branding System"
    message = (
        f"Hi {user.full_name},\n\n"
        f"You requested a password reset. Click the link below to set a new password:\n\n"
        f"{reset_url}\n\n"
        f"This link expires in {PASSWORD_RESET_TIMEOUT_HOURS} hours.\n\n"
        f"If you did not request this, please ignore this email."
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", user.email, exc)


def validate_reset_token(token: str):
    """Return the User if token is valid and not expired, else None."""
    try:
        user = User.objects.get(password_reset_token=token)
    except User.DoesNotExist:
        return None
    if user.password_reset_expires and user.password_reset_expires < timezone.now():
        return None
    return user


def clear_reset_token(user: User) -> None:
    user.password_reset_token = None
    user.password_reset_expires = None
    user.save(update_fields=["password_reset_token", "password_reset_expires"])
