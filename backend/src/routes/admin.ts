import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { serviceClient } from "../lib/supabase";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/orders", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
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

router.patch("/orders/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const { status } = z
      .object({ status: z.string().min(1) })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("orders")
      .update({ status })
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

router.get("/prescriptions", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("prescriptions")
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

router.patch("/prescriptions/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const payload = z
      .object({ status: z.string().min(1), reviewer_note: z.string().optional() })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("prescriptions")
      .update({ status: payload.status, reviewer_note: payload.reviewer_note ?? null })
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
        placement: z.enum(["home", "products", "checkout"]),
        active: z.boolean().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("marketing_banners")
      .insert({
        title: payload.title,
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

export default router;
