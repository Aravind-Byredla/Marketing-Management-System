from rest_framework.permissions import BasePermission

from apps.users.models import UserRole


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.SUPER_ADMIN


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        ]


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.MANAGER,
        ]


class IsTeamMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.MANAGER,
            UserRole.TEAM_MEMBER,
        ]


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        ]


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            return True
        owner = getattr(obj, "created_by", getattr(obj, "user", None))
        return owner == request.user
