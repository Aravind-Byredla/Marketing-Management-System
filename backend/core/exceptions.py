import logging

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, Http404):
        return Response(
            {"detail": "The requested resource was not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, PermissionDenied):
        return Response(
            {"detail": "You do not have permission to perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, ValidationError):
        return Response(
            {"detail": exc.message_dict if hasattr(exc, "message_dict") else str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if response is not None:
        error_data = {
            "detail": response.data,
            "status_code": response.status_code,
        }
        if isinstance(response.data, dict):
            error_data = response.data
        response.data = error_data
        return response

    logger.exception("Unhandled exception: %s", exc)
    return Response(
        {"detail": "An internal server error occurred. Please try again later."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
