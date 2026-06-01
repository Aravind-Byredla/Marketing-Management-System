import threading

_local = threading.local()


class AuditLogMiddleware:
    """Stores the current HTTP request in thread-local for use in services."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _local.request = request
        response = self.get_response(request)
        _local.request = None
        return response


def get_current_request():
    return getattr(_local, "request", None)
