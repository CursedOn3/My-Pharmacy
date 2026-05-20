import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { serviceClient } from "../lib/supabase";

const router = Router();

router.use(requireAuth, requireAdmin);

const ORDER_STATUS = z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]);
const PRESCRIPTION_STATUS = z.enum(["pending", "approved", "rejected"]);

router.get("/orders", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("orders")
      .select("id,user_id,customer_email,customer_name,items,notes,status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/orders/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { status } = z
      .object({ status: ORDER_STATUS })
      .parse(req.body);

    // Fetch current order to check previous status
    const { data: existing, error: fetchErr } = await serviceClient
      .from("orders")
      .select("status, items")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { data, error } = await serviceClient
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    // Restore stock if order is being cancelled from a non-cancelled state
    if (status === "cancelled" && existing.status !== "cancelled") {
      const items = existing.items as { product_id: string; quantity: number }[];
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
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/prescriptions", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("prescriptions")
      .select("id,user_id,customer_email,customer_name,file_path,file_name,file_type,file_size,notes,reviewer_note,reviewed_at,status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/prescriptions/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({ status: PRESCRIPTION_STATUS, reviewer_note: z.string().optional() })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("prescriptions")
      .update({
        status: payload.status,
        reviewer_note: payload.reviewer_note ?? null,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/products", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("products")
      .select("id,name,price,image_url,category_slug,stock,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const payload = z
      .object({
        name: z.string().min(1),
        price: z.number().nonnegative(),
        image_url: z.string().optional(),
        category_slug: z.string().optional(),
        stock: z.number().int().nonnegative().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("products")
      .insert({
        name: payload.name,
        price: payload.price,
        image_url: payload.image_url ?? null,
        category_slug: payload.category_slug ?? null,
        stock: payload.stock ?? 0
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

router.patch("/products/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({
        name: z.string().min(1).optional(),
        price: z.number().nonnegative().optional(),
        image_url: z.string().optional(),
        category_slug: z.string().optional(),
        stock: z.number().int().nonnegative().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { error } = await serviceClient.from("products").delete().eq("id", id);

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/marketing/discounts", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("marketing_discounts")
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

router.post("/marketing/discounts", async (req, res, next) => {
  try {
    const payload = z
      .object({
        product_id: z.string().min(1),
        percent: z.number().int().min(1).max(90),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("marketing_discounts")
      .insert({
        product_id: payload.product_id,
        percent: payload.percent,
        active: payload.active ?? true
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

router.patch("/marketing/discounts/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({
        product_id: z.string().min(1).optional(),
        percent: z.number().int().min(1).max(90).optional(),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("marketing_discounts")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/marketing/discounts/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { error } = await serviceClient
      .from("marketing_discounts")
      .delete()
      .eq("id", id);

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/marketing/banners", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("marketing_banners")
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

router.post("/marketing/banners", async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string().min(3).max(80),
        description: z.string().max(500).optional(),
        image_url: z.string().optional(),
        placement: z.enum(["home", "products", "checkout"]),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("marketing_banners")
      .insert({
        title: payload.title,
        description: payload.description ?? null,
        image_url: payload.image_url ?? null,
        placement: payload.placement,
        active: payload.active ?? true
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

router.patch("/marketing/banners/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({
        title: z.string().min(3).max(80).optional(),
        description: z.string().max(500).optional(),
        image_url: z.string().optional(),
        placement: z.enum(["home", "products", "checkout"]).optional(),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("marketing_banners")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/marketing/banners/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { error } = await serviceClient
      .from("marketing_banners")
      .delete()
      .eq("id", id);

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── Services (Lab & Physiotherapy) ───

const SERVICE_TYPE = z.enum(["lab", "physiotherapy"]);

router.get("/services", async (req, res, next) => {
  try {
    const typeFilter = req.query.type as string | undefined;
    let query = serviceClient
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (typeFilter && (typeFilter === "lab" || typeFilter === "physiotherapy")) {
      query = query.eq("type", typeFilter);
    }

    const { data, error } = await query;

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/services", async (req, res, next) => {
  try {
    const payload = z
      .object({
        name: z.string().min(1),
        type: SERVICE_TYPE,
        description: z.string().optional(),
        price: z.number().nonnegative(),
        duration: z.string().optional(),
        home_available: z.boolean().optional(),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("services")
      .insert({
        name: payload.name,
        type: payload.type,
        description: payload.description ?? null,
        price: payload.price,
        duration: payload.duration ?? null,
        home_available: payload.home_available ?? false,
        active: payload.active ?? true
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

router.patch("/services/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({
        name: z.string().min(1).optional(),
        type: SERVICE_TYPE.optional(),
        description: z.string().optional(),
        price: z.number().nonnegative().optional(),
        duration: z.string().optional(),
        home_available: z.boolean().optional(),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("services")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/services/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { error } = await serviceClient.from("services").delete().eq("id", id);

    if (error) {
      return next(error);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── Bookings ───

router.get("/bookings", async (req, res, next) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    let query = serviceClient
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/bookings/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({
        status: z.enum(["pending", "confirmed", "completed", "cancelled"])
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("bookings")
      .update({ status: payload.status })
      .eq("id", id)
      .select("*")
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
