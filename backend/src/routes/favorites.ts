import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    const client = res.locals.userClient;
    const { data, error } = await client
      .from("favorites")
      .select("id, product_id, products (id, name, price, image_url, category_slug, stock)")
      .order("created_at", { ascending: false });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = z
      .object({ product_id: z.string().min(1) })
      .parse(req.body);

    const client = res.locals.userClient;
    const { data, error } = await client
      .from("favorites")
      .upsert({ product_id: payload.product_id, user_id: req.user?.id })
      .select("id, product_id, products (id, name, price, image_url, category_slug, stock)")
      .single();

    if (error) {
      return next(error);
    }

    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:productId", async (req, res, next) => {
  try {
    const { productId } = z.object({ productId: z.string().min(1) }).parse(req.params);
    const client = res.locals.userClient;
    const { error } = await client
      .from("favorites")
      .delete()
      .eq("product_id", productId);

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
