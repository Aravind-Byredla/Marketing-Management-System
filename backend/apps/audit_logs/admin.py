from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "model_name", "object_id", "user", "ip_address", "timestamp"]
    list_filter = ["model_name", "action"]
    search_fields = ["object_id", "user__email", "action"]
    readonly_fields = list(AuditLog._meta.fields.__class__.__name__ and [f.name for f in AuditLog._meta.fields])

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
