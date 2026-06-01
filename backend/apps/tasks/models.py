import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.requests.models import MarketingRequest
from apps.users.models import User


class TaskStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    IN_PROGRESS = "IN_PROGRESS", "In Progress"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(MarketingRequest, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="assigned_tasks")
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="delegated_tasks")
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=TaskStatus.choices, default=TaskStatus.PENDING)
    progress_percentage = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tasks"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.assigned_to}"


class TaskDeliverable(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="deliverables")
    file = models.FileField(upload_to="deliverables/%Y/%m/")
    filename = models.CharField(max_length=255)
    file_size = models.PositiveBigIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "task_deliverables"
        ordering = ["-created_at"]

    def __str__(self):
        return self.filename
