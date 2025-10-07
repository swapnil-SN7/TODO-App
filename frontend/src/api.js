import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const api = axios.create({ baseURL: API_BASE });

export async function fetchTodos() {
  const { data } = await api.get("/todos");
  return data;
}

export async function createTodo(payload) {
  const { data } = await api.post("/todos", payload);
  return data;
}

export async function updateTodo(id, updates) {
  const { data } = await api.put(`/todos/${id}`, updates);
  return data;
}

export async function deleteTodo(id) {
  await api.delete(`/todos/${id}`);
}


