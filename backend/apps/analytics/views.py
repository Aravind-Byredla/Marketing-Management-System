from django.db.models import Avg, Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.requests.models import MarketingRequest, RequestStatus
from apps.tasks.models import Task, TaskStatus
from apps.users.models import User, UserRole
from core.permissions import IsAdmin


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get dashboard statistics", tags=["Analytics"])
    def get(self, request):
        user = request.user
        now = timezone.now()

        req_qs = MarketingRequest.objects.all()
        task_qs = Task.objects.all()

        if user.role == UserRole.MANAGER:
            req_qs = req_qs.filter(created_by=user)
            task_qs = task_qs.filter(request__created_by=user)
        elif user.role == UserRole.TEAM_MEMBER:
            task_qs = task_qs.filter(assigned_to=user)
            req_qs = req_qs.filter(tasks__assigned_to=user).distinct()

        stats = {
            "requests": {
                "total": req_qs.count(),
                "draft": req_qs.filter(status=RequestStatus.DRAFT).count(),
                "pending": req_qs.filter(status=RequestStatus.PENDING).count(),
                "assigned": req_qs.filter(status=RequestStatus.ASSIGNED).count(),
                "in_progress": req_qs.filter(status=RequestStatus.IN_PROGRESS).count(),
                "under_review": req_qs.filter(status=RequestStatus.UNDER_REVIEW).count(),
                "completed": req_qs.filter(status=RequestStatus.COMPLETED).count(),
                "closed": req_qs.filter(status=RequestStatus.CLOSED).count(),
                "rejected": req_qs.filter(status=RequestStatus.REJECTED).count(),
            },
            "tasks": {
                "total": task_qs.count(),
                "pending": task_qs.filter(status=TaskStatus.PENDING).count(),
                "in_progress": task_qs.filter(status=TaskStatus.IN_PROGRESS).count(),
                "completed": task_qs.filter(status=TaskStatus.COMPLETED).count(),
                "overdue": task_qs.filter(
                    deadline__lt=now.date(),
                    status__in=[TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
                ).count(),
            },
        }

        if user.is_admin:
            stats["users"] = {
                "total": User.objects.filter(is_active=True).count(),
                "managers": User.objects.filter(role=UserRole.MANAGER, is_active=True).count(),
                "team_members": User.objects.filter(role=UserRole.TEAM_MEMBER, is_active=True).count(),
            }

        return Response(stats)


class RequestsByStatusView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(summary="Requests grouped by status", tags=["Analytics"])
    def get(self, request):
        data = (
            MarketingRequest.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )
        return Response(list(data))


class RequestsByCategoryView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(summary="Requests grouped by category", tags=["Analytics"])
    def get(self, request):
        data = (
            MarketingRequest.objects.values("category__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return Response(list(data))


class RequestsByBranchView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(summary="Requests grouped by branch", tags=["Analytics"])
    def get(self, request):
        data = (
            MarketingRequest.objects.values("branch__name", "branch__company__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return Response(list(data))


class MonthlyRequestsView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(summary="Monthly request count for the current year", tags=["Analytics"])
    def get(self, request):
        from django.db.models.functions import TruncMonth

        year = timezone.now().year
        data = (
            MarketingRequest.objects.filter(created_at__year=year)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        return Response(
            [{"month": item["month"].strftime("%Y-%m"), "count": item["count"]} for item in data]
        )
