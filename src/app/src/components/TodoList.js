function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TodoList({ todos, isLoading, error, onRetry }) {
  if (error) {
    return (
      <div className="alert alert-error">
        <p role="alert">{error}</p>
        <button type="button" className="btn btn-outline" onClick={() => onRetry()}>
          Retry
        </button>
      </div>
    );
  }
  if (isLoading) return <p className="muted">Loading...</p>;
  if (todos.length === 0) return <p className="muted">No TODOs yet — add one!</p>;

  return (
    <ul>
      {todos.map((todo) => (
        <li className="todo-item" key={todo.id}>
          <span className="todo-description">{todo.description}</span>
          <span className="todo-date">{formatDate(todo.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
