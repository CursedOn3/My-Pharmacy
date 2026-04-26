import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth";
import { serviceClient } from "../lib/supabase";

const router = Router();

const uploadSchema = z.object({
  fileExt: z.string().min(1).max(8),
  contentType: z.string().min(1)
});

router.post("/upload-url", requireAuth, async (req, res, next) => {
  try {
    const payload = uploadSchema.parse(req.body);
    const fileId = randomUUID();
    const path = `${req.user?.id}/${fileId}.${payload.fileExt}`;

    const { data, error } = await serviceClient.storage
      .from("prescriptions")
      .createSignedUploadUrl(path);

    if (error || !data) {
      return next(error ?? new Error("upload_url_failed"));
    }

    res.json({ path, signedUrl: data.signedUrl });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const client = res.locals.userClient;
    const { data, error } = await client
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

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        path: z.string().min(1),
        notes: z.string().optional(),
        file_name: z.string().min(1),
        file_type: z.string().min(1),
        file_size: z.number().int().positive(),
        customer_email: z.string().email(),
        customer_name: z.string().min(1)
      })
      .parse(req.body);

    const { data, error } = await serviceClient
      .from("prescriptions")
      .insert({
        user_id: req.user?.id,
        customer_email: payload.customer_email,
        customer_name: payload.customer_name,
        file_path: payload.path,
        file_name: payload.file_name,
        file_type: payload.file_type,
        file_size: payload.file_size,
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

export default router;
