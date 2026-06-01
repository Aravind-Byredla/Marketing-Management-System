from django.urls import path

from .views import (
    DashboardStatsView,
    MonthlyRequestsView,
    RequestsByCategoryView,
    RequestsByBranchView,
    RequestsByStatusView,
)

urlpatterns = [
    path("dashboard/", DashboardStatsView.as_view(), name="analytics-dashboard"),
    path("requests/by-status/", RequestsByStatusView.as_view(), name="analytics-by-status"),
    path("requests/by-category/", RequestsByCategoryView.as_view(), name="analytics-by-category"),
    path("requests/by-branch/", RequestsByBranchView.as_view(), name="analytics-by-branch"),
    path("requests/monthly/", MonthlyRequestsView.as_view(), name="analytics-monthly"),
]
