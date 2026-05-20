import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { serviceClient } from "../lib/supabase";
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
  notes: z.string().optional(),
  payment_method: z.enum(["esewa", "cod"]).default("cod"),
  shipping: z.coerce.number().min(0).default(0),
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

    // Fetch current prices and stock from DB
    const productIds = payload.items.map((i) => i.product_id);
    const { data: products, error: productError } = await serviceClient
      .from("products")
      .select("id, price, stock")
      .in("id", productIds);

    if (productError) {
      return next(productError);
    }

    const productMap = new Map<string, { price: number; stock: number }>(
      (products ?? []).map((p: { id: string; price: number; stock: number }) => [
        p.id,
        { price: Number(p.price), stock: p.stock }
      ])
    );

    // Validate stock availability
    for (const item of payload.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product ${item.product_id}. Available: ${product.stock}`
        });
      }
    }

    const itemsWithPrice = payload.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: productMap.get(item.product_id)!.price
    }));

    const { data, error } = await serviceClient
      .from("orders")
      .insert({
        items: itemsWithPrice,
        customer_email: payload.customer_email,
        customer_name: payload.customer_name,
        notes: payload.notes ?? null,
        user_id: req.user!.id,
        payment_method: payload.payment_method,
        payment_status: payload.payment_method === "cod" ? "cod" : "pending",
        shipping: payload.shipping,
      })
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    // Decrement stock for each ordered product
    for (const item of payload.items) {
      const current = productMap.get(item.product_id)!;
      await serviceClient
        .from("products")
        .update({ stock: current.stock - item.quantity })
        .eq("id", item.product_id);
    }

    publishEvent({
      type: "order.created",
      data: { orderId: data.id, userId: req.user!.id }
    });

    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const client = res.locals.userClient;

    const { data: order, error: fetchErr } = await client
      .from("orders")
      .select("id, status, user_id, items")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== req.user!.id) {
      return res.status(403).json({ error: "Not your order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    const { data, error } = await serviceClient
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    // Restore stock for cancelled order items
    const items = order.items as { product_id: string; quantity: number }[];
    for (const item of items) {
      const { data: product } = await serviceClient
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      if (product) {
        await serviceClient
          .from("products")
          .update({ stock: product.stock + item.quantity })
          .eq("id", item.product_id);
      }
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
