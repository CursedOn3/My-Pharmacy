import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { serviceClient } from "../lib/supabase";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("services")
      .select("id,name,type,description,price,duration,home_available")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/bookings", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        service_id: z.string().min(1),
        visit_type: z.enum(["home", "clinic"]),
        preferred_date: z.string().min(1),
        preferred_time: z.string().min(1),
        customer_name: z.string().min(1),
        customer_email: z.string().email(),
        customer_phone: z.string().min(1),
        notes: z.string().optional()
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("bookings")
      .insert({
        service_id: payload.service_id,
        user_id: req.user!.id,
        visit_type: payload.visit_type,
        preferred_date: payload.preferred_date,
        preferred_time: payload.preferred_time,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        notes: payload.notes ?? null,
        status: "pending"
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

router.get("/bookings", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("bookings")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
