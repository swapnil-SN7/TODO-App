import React, { useEffect, useMemo, useState } from "react";
import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./api.js";

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-white/90">
          ✕
        </button>
      </div>
    </div>
  );
}

function AddTodoForm({ onAdd, loading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), description: description.trim() });
    setTitle("");
    setDescription("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow flex flex-col gap-3"
    >
      <input
        className="border rounded px-3 py-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border rounded px-3 py-2"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        disabled={loading}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Todo"}
      </button>
    </form>
  );
}

function TodoCard({ todo, onToggle, onDelete, onEdit }) {
  const isCompleted = todo.status === "completed";
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3
          className={`font-semibold ${
            isCompleted ? "line-through text-gray-500" : ""
          }`}
        >
          {todo.title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isCompleted
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isCompleted ? "Completed" : "Pending"}
        </span>
      </div>
      {todo.description && (
        <p
          className={`text-sm ${
            isCompleted ? "line-through text-gray-500" : "text-gray-700"
          }`}
        >
          {todo.description}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onToggle(todo)}
          className="px-3 py-1 rounded bg-indigo-600 text-white"
        >
          {isCompleted ? "Mark Pending" : "Mark Completed"}
        </button>
        <button
          onClick={() => onEdit(todo)}
          className="px-3 py-1 rounded bg-amber-600 text-white"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo)}
          className="px-3 py-1 rounded bg-red-600 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function EditModal({ open, initial, onClose, onSave, saving }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
  }, [initial]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow p-4 w-full max-w-md flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Edit Todo</h2>
        <input
          className="border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={() =>
              onSave({ title: title.trim(), description: description.trim() })
            }
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [editing, setEditing] = useState(null);
  const anyCompleted = useMemo(
    () => todos.some((t) => t.status === "completed"),
    [todos]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTodos();
        setTodos(data);
      } catch (e) {
        setToast({ message: "Failed to load todos", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAdd(payload) {
    try {
      const created = await createTodo(payload);
      setTodos((prev) => [created, ...prev]);
      setToast({ message: "Todo added", type: "success" });
    } catch (e) {
      setToast({
        message: e?.response?.data?.error || "Failed to add",
        type: "error",
      });
    }
  }

  async function handleToggle(todo) {
    try {
      const updated = await updateTodo(todo.id, {
        status: todo.status === "completed" ? "pending" : "completed",
      });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      setToast({ message: "Status updated", type: "success" });
    } catch (e) {
      setToast({ message: "Failed to update status", type: "error" });
    }
  }

  async function handleDelete(todo) {
    try {
      await deleteTodo(todo.id);
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      setToast({ message: "Todo deleted", type: "success" });
    } catch (e) {
      setToast({ message: "Failed to delete", type: "error" });
    }
  }

  async function handleEditSave(fields) {
    try {
      const updated = await updateTodo(editing.id, fields);
      setTodos((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
      setEditing(null);
      setToast({ message: "Todo updated", type: "success" });
    } catch (e) {
      setToast({
        message: e?.response?.data?.error || "Failed to update",
        type: "error",
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CC Todo</h1>
        {anyCompleted && (
          <span className="text-sm text-gray-600">
            Completed: {todos.filter((t) => t.status === "completed").length}
          </span>
        )}
      </header>

      <AddTodoForm onAdd={handleAdd} loading={loading} />

      <section>
        <h2 className="sr-only">Todos</h2>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={setEditing}
              />
            ))}
            {todos.length === 0 && (
              <div className="text-gray-600">No todos yet. Add one above.</div>
            )}
          </div>
        )}
      </section>

      <EditModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
        saving={false}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}


