from rest_framework import serializers

from apps.users.serializers import UserMinimalSerializer

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_detail = UserMinimalSerializer(source="user", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user_detail",
            "action",
            "model_name",
            "object_id",
            "changes",
            "ip_address",
            "timestamp",
        ]
        read_only_fields = fields
