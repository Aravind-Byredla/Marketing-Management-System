from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsAdmin, IsSuperAdmin

from .models import User
from .serializers import ChangePasswordSerializer, UserCreateSerializer, UserSerializer, UserUpdateSerializer


@extend_schema_view(
    list=extend_schema(summary="List users", tags=["Users"]),
    create=extend_schema(summary="Create user", tags=["Users"]),
    retrieve=extend_schema(summary="Retrieve user", tags=["Users"]),
    update=extend_schema(summary="Update user", tags=["Users"]),
    partial_update=extend_schema(summary="Partial update user", tags=["Users"]),
    destroy=extend_schema(summary="Delete user", tags=["Users"]),
)
class UserViewSet(ModelViewSet):
    queryset = User.objects.select_related("company", "branch", "department").all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["role", "is_active", "company", "branch", "department"]
    search_fields = ["full_name", "email", "phone"]
    ordering_fields = ["full_name", "email", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action == "destroy":
            return [IsSuperAdmin()]
        return [IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # Non-admins can only see users in their company
        if not user.is_admin:
            qs = qs.filter(company=user.company)
        return qs

    @extend_schema(summary="Get current user profile", tags=["Users"])
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    @extend_schema(summary="Update current user profile", tags=["Users"])
    @action(detail=False, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)

    @extend_schema(summary="Change password", tags=["Users"])
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"detail": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password changed successfully."})

    @extend_schema(summary="Toggle user active status", tags=["Users"])
    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({"is_active": user.is_active})
