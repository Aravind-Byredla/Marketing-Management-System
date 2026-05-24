import pytest
from django.urls import reverse
from rest_framework import status

from apps.master_data.models import Branch, Category, Company, Department
from apps.requests.models import MarketingRequest, RequestStatus


@pytest.fixture
def company(db):
    return Company.objects.create(name="Test Co")


@pytest.fixture
def branch(db, company):
    return Branch.objects.create(company=company, name="HQ")


@pytest.fixture
def department(db, company):
    return Department.objects.create(company=company, name="Marketing")


@pytest.fixture
def category(db):
    return Category.objects.create(name="Digital Marketing", icon="📱")


@pytest.fixture
def request_payload(company, branch, department, category):
    return {
        "title": "Test Campaign",
        "objective": "Drive brand awareness",
        "summary": "Launch a social media campaign",
        "quantity": 1,
        "company": company.id,
        "branch": branch.id,
        "department": department.id,
        "category": category.id,
        "priority": "MEDIUM",
    }


@pytest.mark.django_db
class TestMarketingRequests:
    def test_manager_can_create_request(self, manager_client, request_payload):
        url = reverse("requests-list")
        response = manager_client.post(url, request_payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "Test Campaign"
        assert response.data["status"] == RequestStatus.PENDING

    def test_request_id_auto_generated(self, manager_client, request_payload):
        url = reverse("requests-list")
        response = manager_client.post(url, request_payload, format="json")
        assert response.data["request_id"].startswith("MKT-")

    def test_list_requests_authenticated(self, auth_client, manager_client, request_payload):
        manager_client.post(reverse("requests-list"), request_payload, format="json")
        response = auth_client.get(reverse("requests-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1

    def test_unauthenticated_cannot_list(self, api_client):
        response = api_client.get(reverse("requests-list"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_admin_can_transition_status(self, auth_client, manager_client, request_payload):
        create_resp = manager_client.post(reverse("requests-list"), request_payload, format="json")
        request_id = create_resp.data["id"]
        url = reverse("requests-transition", args=[request_id])
        response = auth_client.post(url, {"status": RequestStatus.ASSIGNED}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == RequestStatus.ASSIGNED

    def test_invalid_transition_rejected(self, auth_client, manager_client, request_payload):
        create_resp = manager_client.post(reverse("requests-list"), request_payload, format="json")
        request_id = create_resp.data["id"]
        url = reverse("requests-transition", args=[request_id])
        # Cannot go from PENDING directly to COMPLETED
        response = auth_client.post(url, {"status": RequestStatus.COMPLETED}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
