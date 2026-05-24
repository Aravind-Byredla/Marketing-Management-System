import uuid

from django.db import models

from apps.users.models import User


class NotificationType(models.TextChoices):
    REQUEST_CREATED = "REQUEST_CREATED", "Request Created"
    REQUEST_STATUS_CHANGED = "REQUEST_STATUS_CHANGED", "Request Status Changed"
    TASK_ASSIGNED = "TASK_ASSIGNED", "Task Assigned"
    TASK_COMPLETED = "TASK_COMPLETED", "Task Completed"
    PROGRESS_UPDATED = "PROGRESS_UPDATED", "Progress Updated"
    COMMENT_ADDED = "COMMENT_ADDED", "Comment Added"
    DELIVERABLE_UPLOADED = "DELIVERABLE_UPLOADED", "Deliverable Uploaded"
    SYSTEM = "SYSTEM", "System"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
    )
    # Optional link back to the related object
    object_id = models.CharField(max_length=100, null=True, blank=True)
    object_type = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} → {self.user.email}"
