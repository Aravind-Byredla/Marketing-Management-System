import uuid

from django.db import models

from apps.master_data.models import Branch, Category, Company, Department, SubCategory
from apps.users.models import User


class RequestStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PENDING = "PENDING", "Pending"
    ASSIGNED = "ASSIGNED", "Assigned"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    COMPLETED = "COMPLETED", "Completed"
    CLOSED = "CLOSED", "Closed"
    REJECTED = "REJECTED", "Rejected"


class RequestPriority(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    URGENT = "URGENT", "Urgent"


# Valid workflow transitions
VALID_TRANSITIONS = {
    RequestStatus.DRAFT: [RequestStatus.PENDING],
    RequestStatus.PENDING: [RequestStatus.ASSIGNED, RequestStatus.REJECTED],
    RequestStatus.ASSIGNED: [RequestStatus.IN_PROGRESS, RequestStatus.REJECTED],
    RequestStatus.IN_PROGRESS: [RequestStatus.UNDER_REVIEW],
    RequestStatus.UNDER_REVIEW: [RequestStatus.COMPLETED, RequestStatus.IN_PROGRESS],
    RequestStatus.COMPLETED: [RequestStatus.CLOSED],
    RequestStatus.CLOSED: [],
    RequestStatus.REJECTED: [],
}


def generate_request_id():
    import datetime
    year = datetime.datetime.now().year
    count = MarketingRequest.objects.filter(
        created_at__year=year
    ).count() + 1
    return f"MKT-{year}-{count:04d}"


class MarketingRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=500)
    objective = models.TextField()
    summary = models.TextField()
    quantity = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)

    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="requests")
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="requests")
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name="requests")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="requests")
    subcategory = models.ForeignKey(
        SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests"
    )

    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_requests")
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_requests"
    )

    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.DRAFT)
    priority = models.CharField(max_length=10, choices=RequestPriority.choices, default=RequestPriority.MEDIUM)
    deadline = models.DateField(null=True, blank=True)

    # Video references
    video_references = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "marketing_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.request_id}] {self.title}"

    def save(self, *args, **kwargs):
        if not self.request_id:
            self.request_id = generate_request_id()
        super().save(*args, **kwargs)

    def can_transition_to(self, new_status: str) -> bool:
        return new_status in VALID_TRANSITIONS.get(self.status, [])


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(MarketingRequest, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="attachments/%Y/%m/")
    filename = models.CharField(max_length=255)
    file_size = models.PositiveBigIntegerField()
    mime_type = models.CharField(max_length=100, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="uploaded_files")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "attachments"
        ordering = ["-created_at"]

    def __str__(self):
        return self.filename


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(MarketingRequest, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "comments"
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.user.full_name} on {self.request.request_id}"
