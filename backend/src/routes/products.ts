import { Router } from "express";
import { z } from "zod";
import { anonClient } from "../lib/supabase";

const router = Router();

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
  query: z.string().optional()
});

router.get("/", async (req, res, next) => {
  try {
    const { limit, offset, query } = listSchema.parse(req.query);
    let request = anonClient
      .from("products")
      .select("id,name,price,image_url,category_slug,stock")
      .range(offset, offset + limit - 1);

    if (query) {
      request = request.ilike("name", `%${query}%`);
    }

    const { data, error } = await request;

    if (error) {
      return next(error);
    }

    res.json({ data, limit, offset });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { data, error } = await anonClient
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
