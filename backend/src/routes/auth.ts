import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { anonClient, serviceClient } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { env } from "../config/env";

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

// Strict rate limiter for password reset — 3 requests per 15 min per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_requests" });
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(255)
});

router.post("/forgot-password", forgotPasswordLimiter, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const redirectTo = `${env.FRONTEND_URL}/reset-password`;

    const { data, error } = await serviceClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo }
    });

    if (error) {
      // Don't reveal whether the email exists — return 200 regardless
      console.error("[forgot-password] generateLink error:", error.message);
      return res.json({ sent: true });
    }

    // In development: return the magic link in the response so it can be
    // displayed directly on the page without needing email delivery.
    // In production: the link is only delivered via Supabase email.
    const responseBody: { sent: boolean; devLink?: string } = { sent: true };
    if (env.NODE_ENV === "development" && data?.properties?.action_link) {
      responseBody.devLink = data.properties.action_link;
    }

    res.json(responseBody);
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
