import { Router } from "express";
import { subscribe } from "../realtime/event-bus";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const unsubscribe = subscribe((payload) => {
    res.write(`event: ${payload.type}\n`);
    res.write(`data: ${JSON.stringify(payload.data)}\n\n`);
  });

  req.on("close", () => {
    unsubscribe();
    res.end();
  });
});

export default router;
