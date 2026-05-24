import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close()
            return
        self.user = user
        self.group_name = f"user_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # Send unread count on connect
        count = await self._get_unread_count()
        await self.send(json.dumps({"type": "unread_count", "count": count}))

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get("type") == "mark_read":
                notification_id = data.get("notification_id")
                if notification_id:
                    await self._mark_read(notification_id)
        except (json.JSONDecodeError, KeyError) as exc:
            logger.warning("Invalid WS message: %s", exc)

    async def notification_message(self, event):
        await self.send(json.dumps({"type": "notification", "data": event["notification"]}))

    @database_sync_to_async
    def _get_unread_count(self):
        from .models import Notification

        return Notification.objects.filter(user=self.user, is_read=False).count()

    @database_sync_to_async
    def _mark_read(self, notification_id):
        from .models import Notification

        Notification.objects.filter(id=notification_id, user=self.user).update(is_read=True)
