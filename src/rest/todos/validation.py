MAX_DESCRIPTION_LENGTH = 500


class ValidationError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class TodoValidator:
    def validate_new(self, payload) -> str:
        if not isinstance(payload, dict):
            raise ValidationError("Request body must be a JSON object.")

        description = payload.get("description")
        if not isinstance(description, str):
            raise ValidationError("'description' is required and must be a string.")

        cleaned = description.strip()
        if not cleaned:
            raise ValidationError("'description' cannot be empty.")

        if len(cleaned) > MAX_DESCRIPTION_LENGTH:
            raise ValidationError(
                f"'description' must be at most {MAX_DESCRIPTION_LENGTH} characters."
            )
        return cleaned
