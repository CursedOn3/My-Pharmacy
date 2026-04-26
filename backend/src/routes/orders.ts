import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { publishEvent } from "../realtime/event-bus";

const router = Router();

const createSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1),
  customer_email: z.string().email(),
  customer_name: z.string().min(1),
  notes: z.string().optional()
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const client = res.locals.userClient;
    const { data, error } = await client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

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
    const payload = createSchema.parse(req.body);
    const client = res.locals.userClient;
    const { data, error } = await client
      .from("orders")
      .insert({
        items: payload.items,
        customer_email: payload.customer_email,
        customer_name: payload.customer_name,
        notes: payload.notes ?? null,
        user_id: req.user?.id
      })
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    publishEvent({
      type: "order.created",
      data: { orderId: data.id, userId: req.user?.id }
    });

    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
