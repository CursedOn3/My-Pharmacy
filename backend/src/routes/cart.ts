import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = Router();

const addSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1)
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const client = res.locals.userClient;
    const { data, error } = await client.from("cart_items").select("*");

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = addSchema.parse(req.body);
    const client = res.locals.userClient;
    const { data, error } = await client
      .from("cart_items")
      .upsert({
        user_id: req.user?.id,
        product_id: payload.product_id,
        quantity: payload.quantity
      })
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const client = res.locals.userClient;
    const { error } = await client.from("cart_items").delete().eq("id", id);

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete("/", requireAuth, async (_req, res, next) => {
  try {
    const client = res.locals.userClient;
    const { error } = await client.from("cart_items").delete();

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
