import type { RequestHandler } from "express";
import { randomUUID } from "crypto";

export const requestId = (): RequestHandler => (req, res, next) => {
  const id = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", id);
  req.headers["x-request-id"] = id;
  next();
};
