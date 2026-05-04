import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { anonClient, serviceClient } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_signup_attempts" });
  }
});

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100)
});

router.post("/signup", signupLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const { data, error } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (error) {
      if (/already registered|already exists/i.test(error.message)) {
        return res.status(409).json({ error: "email_already_registered" });
      }
      return next(error);
    }

    if (!data.user) {
      return res.status(502).json({ error: "signup_failed" });
    }

    const { error: profileError } = await serviceClient
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          role: "user"
        },
        { onConflict: "id" }
      );

    if (profileError) {
      return next(profileError);
    }

    res.status(201).json({
      data: {
        id: data.user.id,
        email: data.user.email ?? email
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", requireAuth, (_req, res) => {
  res.status(204).send();
});

export default router;
