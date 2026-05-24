import logging

logger = logging.getLogger(__name__)


def log_action(user, action: str, model_name: str, object_id: str, changes: dict = None, request=None):
    from .models import AuditLog

    ip = None
    ua = ""
    if request:
        ip = _get_client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")

    try:
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id),
            changes=changes or {},
            ip_address=ip,
            user_agent=ua,
        )
    except Exception as exc:
        logger.error("Failed to create audit log: %s", exc)


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
