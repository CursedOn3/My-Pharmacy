import { Router } from "express";
import { anonClient } from "../lib/supabase";

const router = Router();

router.get("/banners", async (req, res, next) => {
  try {
    const { placement } = req.query;

    let query = anonClient
      .from("marketing_banners")
      .select("id,title,description,image_url,placement,active,created_at")
      .eq("active", true);

    if (placement) {
      query = query.eq("placement", placement);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return next(error);
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
