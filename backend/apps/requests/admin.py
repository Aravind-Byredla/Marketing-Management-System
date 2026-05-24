from django.contrib import admin

from .models import Attachment, Comment, MarketingRequest


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ["filename", "file_size", "mime_type", "uploaded_by", "created_at"]


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ["user", "message", "created_at"]


@admin.register(MarketingRequest)
class MarketingRequestAdmin(admin.ModelAdmin):
    list_display = ["request_id", "title", "status", "priority", "company", "branch", "created_by", "created_at"]
    list_filter = ["status", "priority", "category", "company"]
    search_fields = ["request_id", "title", "objective"]
    readonly_fields = ["id", "request_id", "created_at", "updated_at"]
    inlines = [AttachmentInline, CommentInline]
    ordering = ["-created_at"]
