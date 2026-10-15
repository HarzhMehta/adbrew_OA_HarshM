import logging

from pymongo.errors import PyMongoError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from todos.validation import TodoValidator, ValidationError

logger = logging.getLogger(__name__)


class TodoListView(APIView):
    repository = None

    def get(self, request):
        try:
            todos = self.repository.list_all()
        except PyMongoError:
            logger.exception("Failed to list todos")
            return self._service_unavailable()
        return Response({"todos": todos}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            description = TodoValidator().validate_new(request.data)
        except ValidationError as exc:
            return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        try:
            todo = self.repository.create(description)
        except PyMongoError:
            logger.exception("Failed to create todo")
            return self._service_unavailable()
        return Response(todo, status=status.HTTP_201_CREATED)

    @staticmethod
    def _service_unavailable() -> Response:
        return Response(
            {"error": "The service is temporarily unavailable. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
