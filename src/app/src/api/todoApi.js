const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const TODOS_URL = `${API_BASE_URL}/todos/`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function extractErrorMessage(response) {
  try {
    const body = await response.json();
    return body.error || body.detail || `Request failed with status ${response.status}.`;
  } catch (error) {
    return `Request failed with status ${response.status}.`;
  }
}

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Could not reach the server. Check that it is running.", 0);
  }

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }
  return response.json();
}

export async function fetchTodos(options = {}) {
  const data = await request(TODOS_URL, { ...options, headers: { Accept: "application/json" } });
  return data.todos;
}

export async function createTodo(description, options = {}) {
  return request(TODOS_URL, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ description }),
  });
}
