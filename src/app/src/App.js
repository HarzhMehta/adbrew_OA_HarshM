import "./App.css";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";

export function App() {
  const { todos, isLoading, error, addTodo, refresh } = useTodos();

  return (
    <div className="App">
      <header className="app-header">
        <h1>TODOs</h1>
      
      </header>
      <main>
        <section className="card">
          <h2>Your TODOs</h2>
          <TodoList todos={todos} isLoading={isLoading} error={error} onRetry={() => refresh()} />
        </section>
        <section className="card">
          <h2>Add a TODO</h2>
          <TodoForm onSubmit={addTodo} />
        </section>
      </main>
    </div>
  );
}

export default App;
