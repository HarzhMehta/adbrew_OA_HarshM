export function TodoList({ todos, isLoading, error, onRetry }) {
  if (error) {
    return (
      <div className="state-error">
        <p role="alert">{error}</p>
        <button type="button" onClick={() => onRetry()}>
          Retry
        </button>
      </div>
    );
  }
  if (isLoading) return <p>Loading...</p>;
  if (todos.length === 0) return <p>No TODOs yet — add one!</p>;

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.description}</li>
      ))}
    </ul>
  );
}

export default TodoList;
