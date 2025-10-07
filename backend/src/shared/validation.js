const allowedStatuses = new Set(["pending", "completed"]);

export function validateCreateTodo(body) {
  if (!body || typeof body !== "object") return "Invalid request body";
  if (body.title === undefined || String(body.title).trim().length === 0) {
    return "Title is required";
  }
  if (body.status !== undefined && !allowedStatuses.has(String(body.status))) {
    return "Invalid status";
  }
  return null;
}

export function validateUpdateTodo(body) {
  if (!body || typeof body !== "object") return "Invalid request body";
  const hasAny = ["title", "description", "status"].some(
    (k) => body[k] !== undefined
  );
  if (!hasAny) return "No updatable fields provided";
  if (body.title !== undefined && String(body.title).trim().length === 0) {
    return "Title cannot be empty";
  }
  if (body.status !== undefined && !allowedStatuses.has(String(body.status))) {
    return "Invalid status";
  }
  return null;
}


