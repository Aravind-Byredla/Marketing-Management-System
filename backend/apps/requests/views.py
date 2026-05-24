from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, parsers, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.users.models import UserRole
from core.permissions import IsAdmin, IsManager, IsOwnerOrAdmin

from .filters import MarketingRequestFilter
from .models import Attachment, Comment, MarketingRequest, RequestStatus
from .serializers import (
    AttachmentSerializer,
    CommentSerializer,
    MarketingRequestCreateSerializer,
    MarketingRequestDetailSerializer,
    MarketingRequestListSerializer,
    StatusTransitionSerializer,
)
from .services import transition_request_status, upload_attachments


class MarketingRequestViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MarketingRequestFilter
    search_fields = ["title", "request_id", "objective", "summary"]
    ordering_fields = ["created_at", "updated_at", "deadline", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        qs = MarketingRequest.objects.select_related(
            "company", "branch", "department", "category", "subcategory",
            "created_by", "approved_by",
        ).prefetch_related("attachments", "comments")

        if user.role == UserRole.MANAGER:
            return qs.filter(created_by=user)
        if user.role == UserRole.TEAM_MEMBER:
            return qs.filter(tasks__assigned_to=user).distinct()
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return MarketingRequestCreateSerializer
        if self.action in ["retrieve", "update", "partial_update"]:
            return MarketingRequestDetailSerializer
        return MarketingRequestListSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [IsManager()]
        if self.action in ["destroy"]:
            return [IsAdmin()]
        return [IsAuthenticated()]

    @extend_schema(summary="Transition request status", tags=["Requests"])
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def transition(self, request, pk=None):
        req_obj = self.get_object()
        serializer = StatusTransitionSerializer(
            data=request.data,
            context={"request": request, "request_obj": req_obj},
        )
        serializer.is_valid(raise_exception=True)
        updated = transition_request_status(
            request_obj=req_obj,
            new_status=serializer.validated_data["status"],
            actor=request.user,
            reason=serializer.validated_data.get("reason", ""),
        )
        return Response(MarketingRequestDetailSerializer(updated, context={"request": request}).data)

    @extend_schema(summary="Upload attachments to a request", tags=["Requests"])
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def upload(self, request, pk=None):
        req_obj = self.get_object()
        files = request.FILES.getlist("files")
        if not files:
            return Response({"detail": "No files provided."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            attachments = upload_attachments(req_obj, files, request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AttachmentSerializer(attachments, many=True, context={"request": request}).data)

    @extend_schema(summary="Delete an attachment", tags=["Requests"])
    @action(detail=True, methods=["delete"], url_path="attachments/(?P<attachment_id>[^/.]+)")
    def delete_attachment(self, request, pk=None, attachment_id=None):
        req_obj = self.get_object()
        try:
            attachment = req_obj.attachments.get(id=attachment_id)
        except Attachment.DoesNotExist:
            return Response({"detail": "Attachment not found."}, status=status.HTTP_404_NOT_FOUND)
        if request.user != attachment.uploaded_by and not request.user.is_admin:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        attachment.file.delete(save=False)
        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(summary="List comments on a request", tags=["Requests"])
    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def comments(self, request, pk=None):
        req_obj = self.get_object()
        if request.method == "GET":
            qs = req_obj.comments.select_related("user").all()
            serializer = CommentSerializer(qs, many=True, context={"request": request})
            return Response(serializer.data)
        serializer = CommentSerializer(
            data={**request.data, "request": req_obj.id},
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
