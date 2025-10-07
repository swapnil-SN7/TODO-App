import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  createTodo,
  listTodos,
  getTodoById,
  updateTodoById,
  deleteTodoById,
} from "../db/dynamo.js";
import {
  validateCreateTodo,
  validateUpdateTodo,
} from "../shared/validation.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const validationError = validateCreateTodo(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const id = uuidv4();
    const todo = {
      id,
      title: String(req.body.title).trim(),
      description: req.body.description
        ? String(req.body.description).trim()
        : "",
      status: "pending",
    };
    await createTodo(todo);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const items = await listTodos();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await getTodoById(req.params.id);
    if (!item) return res.status(404).json({ error: "Todo not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const validationError = validateUpdateTodo(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const existing = await getTodoById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Todo not found" });

    const updates = {};
    if (req.body.title !== undefined)
      updates.title = String(req.body.title).trim();
    if (req.body.description !== undefined)
      updates.description = String(req.body.description).trim();
    if (req.body.status !== undefined)
      updates.status = String(req.body.status).trim();

    const updated = await updateTodoById(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await getTodoById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Todo not found" });
    await deleteTodoById(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;


