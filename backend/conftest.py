import pytest
from rest_framework.test import APIClient

from apps.users.models import User, UserRole


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def super_admin(db):
    return User.objects.create_superuser(
        email="superadmin@test.com",
        password="testpass123",
        full_name="Super Admin",
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@test.com",
        password="testpass123",
        full_name="Admin User",
        role=UserRole.ADMIN,
    )


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(
        email="manager@test.com",
        password="testpass123",
        full_name="Manager User",
        role=UserRole.MANAGER,
    )


@pytest.fixture
def team_member(db):
    return User.objects.create_user(
        email="team@test.com",
        password="testpass123",
        full_name="Team Member",
        role=UserRole.TEAM_MEMBER,
    )


@pytest.fixture
def auth_client(api_client, admin_user):
    from rest_framework_simplejwt.tokens import RefreshToken
    token = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return api_client


@pytest.fixture
def manager_client(api_client, manager_user):
    from rest_framework_simplejwt.tokens import RefreshToken
    token = RefreshToken.for_user(manager_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return api_client
