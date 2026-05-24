from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, parsers, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.notifications.services import notify_task_event
from apps.users.models import UserRole
from core.permissions import IsAdmin

from .models import Task, TaskDeliverable, TaskStatus
from .serializers import TaskCreateSerializer, TaskDeliverableSerializer, TaskProgressSerializer, TaskSerializer


class TaskViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "assigned_to", "request"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "deadline", "progress_percentage"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related(
            "request", "assigned_to", "assigned_by"
        ).prefetch_related("deliverables")
        if user.role == UserRole.TEAM_MEMBER:
            return qs.filter(assigned_to=user)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return TaskCreateSerializer
        return TaskSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        task = serializer.save()
        notify_task_event(task, event_type="task_assigned", actor=self.request.user)

    @extend_schema(summary="Update task progress", tags=["Tasks"])
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_progress(self, request, pk=None):
        task = self.get_object()
        if task.assigned_to != request.user and not request.user.is_admin:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        serializer = TaskProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.progress_percentage = serializer.validated_data["progress_percentage"]
        if "status" in serializer.validated_data:
            task.status = serializer.validated_data["status"]
        if task.status == TaskStatus.COMPLETED and not task.completed_at:
            task.completed_at = timezone.now()
        task.save()
        notify_task_event(task, event_type="progress_updated", actor=request.user)
        return Response(TaskSerializer(task, context={"request": request}).data)

    @extend_schema(summary="Upload task deliverables", tags=["Tasks"])
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def upload_deliverables(self, request, pk=None):
        task = self.get_object()
        if task.assigned_to != request.user and not request.user.is_admin:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        files = request.FILES.getlist("files")
        if not files:
            return Response({"detail": "No files provided."}, status=status.HTTP_400_BAD_REQUEST)
        deliverables = []
        for f in files:
            d = TaskDeliverable.objects.create(
                task=task,
                file=f,
                filename=f.name,
                file_size=f.size,
                uploaded_by=request.user,
            )
            deliverables.append(d)
        return Response(
            TaskDeliverableSerializer(deliverables, many=True, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
