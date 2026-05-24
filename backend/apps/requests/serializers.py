from rest_framework import serializers

from apps.master_data.serializers import (
    BranchMinimalSerializer,
    CategoryMinimalSerializer,
    CompanyMinimalSerializer,
    DepartmentMinimalSerializer,
)
from apps.users.serializers import UserMinimalSerializer

from .models import Attachment, Comment, MarketingRequest, RequestStatus, VALID_TRANSITIONS


class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_detail = UserMinimalSerializer(source="uploaded_by", read_only=True)

    class Meta:
        model = Attachment
        fields = ["id", "file", "filename", "file_size", "mime_type", "uploaded_by_detail", "created_at"]
        read_only_fields = ["id", "filename", "file_size", "mime_type", "created_at"]


class AttachmentUploadSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(max_length=100, allow_empty_file=False, use_url=False),
        allow_empty=False,
    )


class CommentSerializer(serializers.ModelSerializer):
    user_detail = UserMinimalSerializer(source="user", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "request", "user", "user_detail", "message", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class MarketingRequestListSerializer(serializers.ModelSerializer):
    created_by_detail = UserMinimalSerializer(source="created_by", read_only=True)
    company_detail = CompanyMinimalSerializer(source="company", read_only=True)
    branch_detail = BranchMinimalSerializer(source="branch", read_only=True)
    category_detail = CategoryMinimalSerializer(source="category", read_only=True)
    attachment_count = serializers.IntegerField(source="attachments.count", read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)

    class Meta:
        model = MarketingRequest
        fields = [
            "id",
            "request_id",
            "title",
            "status",
            "priority",
            "deadline",
            "created_by_detail",
            "company_detail",
            "branch_detail",
            "category_detail",
            "attachment_count",
            "comment_count",
            "created_at",
            "updated_at",
        ]


class MarketingRequestDetailSerializer(serializers.ModelSerializer):
    created_by_detail = UserMinimalSerializer(source="created_by", read_only=True)
    approved_by_detail = UserMinimalSerializer(source="approved_by", read_only=True)
    company_detail = CompanyMinimalSerializer(source="company", read_only=True)
    branch_detail = BranchMinimalSerializer(source="branch", read_only=True)
    department_detail = DepartmentMinimalSerializer(source="department", read_only=True)
    category_detail = CategoryMinimalSerializer(source="category", read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    allowed_transitions = serializers.SerializerMethodField()

    class Meta:
        model = MarketingRequest
        fields = [
            "id",
            "request_id",
            "title",
            "objective",
            "summary",
            "quantity",
            "notes",
            "video_references",
            "company",
            "company_detail",
            "branch",
            "branch_detail",
            "department",
            "department_detail",
            "category",
            "category_detail",
            "subcategory",
            "status",
            "priority",
            "deadline",
            "created_by_detail",
            "approved_by_detail",
            "attachments",
            "comments",
            "allowed_transitions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "request_id", "created_at", "updated_at"]

    def get_allowed_transitions(self, obj):
        return list(VALID_TRANSITIONS.get(obj.status, []))


class MarketingRequestCreateSerializer(serializers.ModelSerializer):
    video_references = serializers.ListField(
        child=serializers.URLField(), required=False, default=list
    )

    class Meta:
        model = MarketingRequest
        fields = [
            "title",
            "objective",
            "summary",
            "quantity",
            "notes",
            "video_references",
            "company",
            "branch",
            "department",
            "category",
            "subcategory",
            "priority",
            "deadline",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        validated_data["status"] = RequestStatus.PENDING
        return super().create(validated_data)


class StatusTransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=RequestStatus.choices)
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        request_obj = self.context.get("request_obj")
        if request_obj and not request_obj.can_transition_to(value):
            raise serializers.ValidationError(
                f"Cannot transition from '{request_obj.status}' to '{value}'."
            )
        return value
