from django.urls import path

from todos.repository import MongoTodoRepository, get_default_database
from todos.views import TodoListView

urlpatterns = [
    path(
        "",
        TodoListView.as_view(repository=MongoTodoRepository(get_default_database())),
        name="todos",
    ),
]
