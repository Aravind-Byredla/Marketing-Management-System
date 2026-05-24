from rest_framework import serializers

from apps.requests.serializers import MarketingRequestListSerializer
from apps.users.serializers import UserMinimalSerializer

from .models import Task, TaskDeliverable, TaskStatus


class TaskDeliverableSerializer(serializers.ModelSerializer):
    uploaded_by_detail = UserMinimalSerializer(source="uploaded_by", read_only=True)

    class Meta:
        model = TaskDeliverable
        fields = ["id", "file", "filename", "file_size", "uploaded_by_detail", "created_at"]
        read_only_fields = ["id", "filename", "file_size", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserMinimalSerializer(source="assigned_to", read_only=True)
    assigned_by_detail = UserMinimalSerializer(source="assigned_by", read_only=True)
    deliverables = TaskDeliverableSerializer(many=True, read_only=True)
    request_detail = MarketingRequestListSerializer(source="request", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "request",
            "request_detail",
            "assigned_to",
            "assigned_to_detail",
            "assigned_by",
            "assigned_by_detail",
            "title",
            "description",
            "deadline",
            "status",
            "progress_percentage",
            "deliverables",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "assigned_by", "completed_at", "created_at", "updated_at"]


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["request", "assigned_to", "title", "description", "deadline"]

    def create(self, validated_data):
        validated_data["assigned_by"] = self.context["request"].user
        return super().create(validated_data)


class TaskProgressSerializer(serializers.Serializer):
    progress_percentage = serializers.IntegerField(min_value=0, max_value=100)
    status = serializers.ChoiceField(choices=TaskStatus.choices, required=False)
