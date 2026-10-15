import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

function jsonResponse(body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve(jsonResponse({ todos: [] })));
});

afterEach(() => {
  delete global.fetch;
});

test("renders the todo form and empty state", async () => {
  render(<App />);

  expect(screen.getByLabelText(/todo/i)).toBeInTheDocument();
  expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
});

test("creates a todo and refreshes the list", async () => {
  const created = jsonResponse({
    id: "1",
    description: "learn docker",
    created_at: "t",
  });
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(jsonResponse({ todos: [] }))
    .mockResolvedValueOnce(created)
    .mockResolvedValueOnce(
      jsonResponse({ todos: [{ id: "1", description: "learn docker", created_at: "t" }] })
    );

  render(<App />);

  const input = await screen.findByLabelText(/todo/i);
  fireEvent.change(input, { target: { value: "learn docker" } });
  fireEvent.click(screen.getByRole("button", { name: /add/i }));

  expect(await screen.findByText("learn docker")).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(3);
  expect(global.fetch.mock.calls[1][1].method).toBe("POST");
});
