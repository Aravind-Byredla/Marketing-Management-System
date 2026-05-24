from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "is_read",
            "notification_type",
            "object_id",
            "object_type",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
