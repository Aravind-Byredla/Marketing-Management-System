import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestAuthEndpoints:
    def test_login_success(self, api_client, admin_user):
        url = reverse("auth-login")
        response = api_client.post(url, {"email": "admin@test.com", "password": "testpass123"})
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data

    def test_login_wrong_password(self, api_client, admin_user):
        url = reverse("auth-login")
        response = api_client.post(url, {"email": "admin@test.com", "password": "wrongpass"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_authenticated(self, auth_client):
        url = reverse("auth-me")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "admin@test.com"

    def test_me_unauthenticated(self, api_client):
        url = reverse("auth-me")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_password_reset_request(self, api_client, admin_user):
        url = reverse("auth-reset-request")
        response = api_client.post(url, {"email": "admin@test.com"})
        assert response.status_code == status.HTTP_200_OK

    def test_password_reset_nonexistent_email(self, api_client):
        url = reverse("auth-reset-request")
        response = api_client.post(url, {"email": "nobody@test.com"})
        # Should return 200 regardless (prevent enumeration)
        assert response.status_code == status.HTTP_200_OK
