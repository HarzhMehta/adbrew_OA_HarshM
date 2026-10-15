import { useCallback, useEffect, useState } from "react";
import { createTodo, fetchTodos } from "../api/todoApi";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fetchTodos({ signal });
      setTodos(fetched);
    } catch (fetchError) {
      if (fetchError.name === "AbortError") return;
      setError(fetchError.message);
    } finally {
      if (!signal || !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const addTodo = useCallback(
    async (description) => {
      await createTodo(description);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { todos, isLoading, error, addTodo, refresh };
}
