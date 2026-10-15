import os
from datetime import datetime, timezone
from typing import Dict, List

from pymongo import DESCENDING, MongoClient
from pymongo.database import Database

TODO_COLLECTION = "todos"


def get_default_database() -> Database:
    host = os.environ.get("MONGO_HOST", "mongo")
    port = os.environ.get("MONGO_PORT", "27017")
    client = MongoClient(f"mongodb://{host}:{port}", serverSelectionTimeoutMS=5000)
    return client["test_db"]


class MongoTodoRepository:
    def __init__(self, database: Database):
        self._todos = database[TODO_COLLECTION]

    def list_all(self) -> List[Dict[str, str]]:
        cursor = self._todos.find().sort("created_at", DESCENDING)
        return [self._to_dict(document) for document in cursor]

    def create(self, description: str) -> Dict[str, str]:
        document = {"description": description, "created_at": datetime.now(timezone.utc)}
        result = self._todos.insert_one(document)
        document["_id"] = result.inserted_id
        return self._to_dict(document)

    @staticmethod
    def _to_dict(document: Dict) -> Dict[str, str]:
        created_at = document["created_at"]
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return {
            "id": str(document["_id"]),
            "description": document["description"],
            "created_at": created_at.isoformat(),
        }
