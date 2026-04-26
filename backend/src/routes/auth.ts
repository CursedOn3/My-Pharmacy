import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", requireAuth, (_req, res) => {
  res.status(204).send();
});

export default router;
