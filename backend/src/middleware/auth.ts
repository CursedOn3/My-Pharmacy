import type { RequestHandler } from "express";
import { anonClient, createUserClient, serviceClient } from "../lib/supabase";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.header("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({ error: "missing_token" });
  }

  const { data, error } = await anonClient.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "invalid_token" });
  }

  req.user = { id: data.user.id, email: data.user.email ?? null };
  res.locals.userClient = createUserClient(token);

  next();
};

export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "missing_user" });
  }

  const { data, error } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", req.user.id)
    .single();

  if (error || data?.role !== "admin") {
    return res.status(403).json({ error: "forbidden" });
  }

  next();
};
