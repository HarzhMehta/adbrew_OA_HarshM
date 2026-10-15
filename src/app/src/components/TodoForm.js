import { useState } from "react";

export function TodoForm({ onSubmit }) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = description.trim().length > 0 && !isSubmitting;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(description.trim());
      setDescription("");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="todo">ToDo: </label>
        <input
          id="todo"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What needs to be done?"
        />
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div style={{ marginTop: "5px" }}>
        <button type="submit" disabled={!canSubmit}>
          {isSubmitting ? "Adding..." : "Add ToDo!"}
        </button>
      </div>
    </form>
  );
}

export default TodoForm;
