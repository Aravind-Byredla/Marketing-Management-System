from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MarketingRequestViewSet

router = DefaultRouter()
router.register("", MarketingRequestViewSet, basename="requests")

urlpatterns = [path("", include(router.urls))]
