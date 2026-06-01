import logging
import mimetypes
import os

from django.db import transaction

from apps.audit_logs.services import log_action
from apps.notifications.services import notify_request_event

from .models import Attachment, MarketingRequest, RequestStatus

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "video/mp4", "video/quicktime", "video/x-msvideo",
    "text/plain", "text/csv",
}


def upload_attachments(request_obj: MarketingRequest, files: list, user) -> list[Attachment]:
    attachments = []
    for f in files:
        if f.size > MAX_FILE_SIZE:
            raise ValueError(f"File '{f.name}' exceeds the 50 MB size limit.")
        mime_type, _ = mimetypes.guess_type(f.name)
        if mime_type and mime_type not in ALLOWED_MIME_TYPES:
            raise ValueError(f"File type '{mime_type}' is not permitted.")
        attachment = Attachment.objects.create(
            request=request_obj,
            file=f,
            filename=f.name,
            file_size=f.size,
            mime_type=mime_type or "",
            uploaded_by=user,
        )
        attachments.append(attachment)
    return attachments


@transaction.atomic
def transition_request_status(request_obj: MarketingRequest, new_status: str, actor, reason: str = "") -> MarketingRequest:
    old_status = request_obj.status

    if new_status == RequestStatus.ASSIGNED or new_status == RequestStatus.REJECTED:
        request_obj.approved_by = actor

    request_obj.status = new_status
    request_obj.save(update_fields=["status", "approved_by", "updated_at"])

    log_action(
        user=actor,
        action=f"STATUS_CHANGED",
        model_name="MarketingRequest",
        object_id=str(request_obj.id),
        changes={"from": old_status, "to": new_status, "reason": reason},
    )

    notify_request_event(request_obj, event_type="status_changed", actor=actor, extra={"new_status": new_status})

    return request_obj
