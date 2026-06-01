import django_filters

from .models import MarketingRequest, RequestPriority, RequestStatus


class MarketingRequestFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=RequestStatus.choices)
    priority = django_filters.MultipleChoiceFilter(choices=RequestPriority.choices)
    category = django_filters.NumberFilter(field_name="category__id")
    company = django_filters.NumberFilter(field_name="company__id")
    branch = django_filters.NumberFilter(field_name="branch__id")
    department = django_filters.NumberFilter(field_name="department__id")
    created_by = django_filters.UUIDFilter(field_name="created_by__id")
    deadline_from = django_filters.DateFilter(field_name="deadline", lookup_expr="gte")
    deadline_to = django_filters.DateFilter(field_name="deadline", lookup_expr="lte")
    created_from = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_to = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = MarketingRequest
        fields = ["status", "priority", "category", "company", "branch", "department", "created_by"]
