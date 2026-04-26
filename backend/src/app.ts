import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { requestId } from "./middleware/request-id";
import { errorHandler, notFound } from "./middleware/error-handler";
import apiRouter from "./routes";

const app = express();
const logger = pino({ level: env.LOG_LEVEL });

app.disable("x-powered-by");
app.use(requestId());
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  cors({
    origin:
      env.CORS_ORIGIN === "*"
        ? true
        : env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "2mb" }));

app.use("/api/v1", apiRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
