from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BranchViewSet, CategoryViewSet, CompanyViewSet, DepartmentViewSet, SubCategoryViewSet

router = DefaultRouter()
router.register("companies", CompanyViewSet, basename="companies")
router.register("branches", BranchViewSet, basename="branches")
router.register("departments", DepartmentViewSet, basename="departments")
router.register("categories", CategoryViewSet, basename="categories")
router.register("subcategories", SubCategoryViewSet, basename="subcategories")

urlpatterns = [path("", include(router.urls))]
