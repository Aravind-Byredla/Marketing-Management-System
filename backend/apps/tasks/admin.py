from django.contrib import admin

from .models import Task, TaskDeliverable


class DeliverableInline(admin.TabularInline):
    model = TaskDeliverable
    extra = 0
    readonly_fields = ["filename", "file_size", "uploaded_by", "created_at"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "request", "assigned_to", "status", "progress_percentage", "deadline"]
    list_filter = ["status"]
    search_fields = ["title", "description"]
    readonly_fields = ["id", "created_at", "updated_at", "completed_at"]
    inlines = [DeliverableInline]
