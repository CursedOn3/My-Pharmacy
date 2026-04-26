import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "not_found" });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  req.log?.error({ err }, "request error");

  if (err instanceof ZodError) {
    return res.status(400).json({ error: "validation_error", issues: err.issues });
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message ?? "internal_server_error";

  res.status(status).json({ error: message });
};
