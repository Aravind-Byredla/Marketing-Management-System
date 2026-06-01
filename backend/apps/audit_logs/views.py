from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from core.permissions import IsAdmin

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["model_name", "action", "user"]
    search_fields = ["object_id", "action", "user__email"]
    ordering_fields = ["timestamp"]
    ordering = ["-timestamp"]

    @extend_schema(tags=["Audit Logs"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
