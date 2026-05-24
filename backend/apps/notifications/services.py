import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from apps.users.models import User, UserRole

logger = logging.getLogger(__name__)


def create_notification(user, title: str, message: str, notification_type: str, object_id: str = None, object_type: str = None):
    from .models import Notification

    notif = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        object_id=object_id,
        object_type=object_type,
    )
    _push_websocket(user, notif)
    return notif


def _push_websocket(user, notification):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    try:
        from .serializers import NotificationSerializer

        data = NotificationSerializer(notification).data
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {"type": "notification.message", "notification": data},
        )
    except Exception as exc:
        logger.warning("WebSocket push failed for user %s: %s", user.id, exc)


def notify_request_event(request_obj, event_type: str, actor, extra: dict = None):
    from .models import NotificationType

    extra = extra or {}
    request_id = str(request_obj.id)

    if event_type == "status_changed":
        new_status = extra.get("new_status", "")
        # Notify creator
        if request_obj.created_by != actor:
            create_notification(
                user=request_obj.created_by,
                title="Request Status Updated",
                message=f"Your request [{request_obj.request_id}] has been updated to '{new_status}'.",
                notification_type=NotificationType.REQUEST_STATUS_CHANGED,
                object_id=request_id,
                object_type="MarketingRequest",
            )
        # Notify admins
        for admin_user in User.objects.filter(role__in=[UserRole.ADMIN, UserRole.SUPER_ADMIN], is_active=True).exclude(id=actor.id):
            create_notification(
                user=admin_user,
                title="Request Status Updated",
                message=f"Request [{request_obj.request_id}] status changed to '{new_status}' by {actor.full_name}.",
                notification_type=NotificationType.REQUEST_STATUS_CHANGED,
                object_id=request_id,
                object_type="MarketingRequest",
            )


def notify_task_event(task, event_type: str, actor):
    from .models import NotificationType

    task_id = str(task.id)

    if event_type == "task_assigned" and task.assigned_to:
        create_notification(
            user=task.assigned_to,
            title="New Task Assigned",
            message=f"You have been assigned task: '{task.title}'.",
            notification_type=NotificationType.TASK_ASSIGNED,
            object_id=task_id,
            object_type="Task",
        )

    elif event_type == "progress_updated":
        if task.request and task.request.created_by:
            create_notification(
                user=task.request.created_by,
                title="Task Progress Updated",
                message=f"Task '{task.title}' is now at {task.progress_percentage}% completion.",
                notification_type=NotificationType.PROGRESS_UPDATED,
                object_id=task_id,
                object_type="Task",
            )
