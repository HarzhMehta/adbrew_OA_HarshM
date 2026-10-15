from unittest.mock import patch

from django.test import SimpleTestCase
from pymongo.errors import ServerSelectionTimeoutError
from rest_framework.test import APIRequestFactory

from todos.validation import TodoValidator, ValidationError
from todos.views import TodoListView


class FakeTodoRepository:
    def __init__(self):
        self.todos = []
        self.created = []

    def list_all(self):
        return self.todos

    def create(self, description):
        self.created.append(description)
        return {"id": "abc123", "description": description, "created_at": "t"}


class TodoValidatorTests(SimpleTestCase):
    def setUp(self):
        self.validator = TodoValidator()

    def test_returns_cleaned_description(self):
        payload = {"description": "  learn docker  "}
        self.assertEqual(self.validator.validate_new(payload), "learn docker")

    def test_rejects_missing_description(self):
        with self.assertRaises(ValidationError):
            self.validator.validate_new({})

    def test_rejects_non_string_description(self):
        with self.assertRaises(ValidationError):
            self.validator.validate_new({"description": 42})

    def test_rejects_blank_description(self):
        with self.assertRaises(ValidationError):
            self.validator.validate_new({"description": "   "})

    def test_rejects_too_long_description(self):
        with self.assertRaises(ValidationError):
            self.validator.validate_new({"description": "x" * 501})


class TodoListViewTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.repository = FakeTodoRepository()

    def get(self):
        request = self.factory.get("/todos/")
        return TodoListView.as_view(repository=self.repository)(request)

    def post(self, payload):
        request = self.factory.post("/todos/", payload, format="json")
        return TodoListView.as_view(repository=self.repository)(request)

    def test_get_returns_todos(self):
        self.repository.todos = [{"id": "1", "description": "a", "created_at": "t"}]
        response = self.get()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data, {"todos": [{"id": "1", "description": "a", "created_at": "t"}]}
        )

    def test_post_creates_todo(self):
        response = self.post({"description": "learn mongo"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["description"], "learn mongo")
        self.assertEqual(self.repository.created, ["learn mongo"])

    def test_post_rejects_blank_description(self):
        response = self.post({"description": "   "})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_post_returns_503_when_mongo_is_down(self):
        with patch.object(
            FakeTodoRepository, "create", side_effect=ServerSelectionTimeoutError("down")
        ):
            response = self.post({"description": "x"})
        self.assertEqual(response.status_code, 503)

    def test_get_returns_503_when_mongo_is_down(self):
        with patch.object(
            FakeTodoRepository, "list_all", side_effect=ServerSelectionTimeoutError("down")
        ):
            response = self.get()
        self.assertEqual(response.status_code, 503)
