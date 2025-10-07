import "dotenv/config";
import express from "express";
import cors from "cors";
import { getConfig } from "./utils/config.js";
import todosRouter from "./routes/todos.js";

const app = express();
const config = getConfig();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/todos", todosRouter);

// Not found handler
app.use((req, res, _next) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});


