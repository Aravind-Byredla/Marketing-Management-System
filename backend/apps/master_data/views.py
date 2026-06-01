from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsAdmin, IsAdminOrReadOnly

from .models import Branch, Category, Company, Department, SubCategory
from .serializers import (
    BranchSerializer,
    CategorySerializer,
    CompanySerializer,
    DepartmentSerializer,
    SubCategorySerializer,
)


class CompanyViewSet(ModelViewSet):
    queryset = Company.objects.prefetch_related("branches", "departments").all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]

    @extend_schema(tags=["Master Data — Companies"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class BranchViewSet(ModelViewSet):
    queryset = Branch.objects.select_related("company").all()
    serializer_class = BranchSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["company", "is_active"]
    search_fields = ["name", "location"]
    ordering_fields = ["name", "created_at"]

    @extend_schema(tags=["Master Data — Branches"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.select_related("company").all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["company", "is_active"]
    search_fields = ["name"]

    @extend_schema(tags=["Master Data — Departments"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.prefetch_related("subcategories").all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "sort_order"]

    @extend_schema(tags=["Master Data — Categories"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class SubCategoryViewSet(ModelViewSet):
    queryset = SubCategory.objects.select_related("category").all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name"]

    @extend_schema(tags=["Master Data — SubCategories"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
