import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ordersRouter from "./orders";
import cartRouter from "./cart";
import prescriptionsRouter from "./prescriptions";
import adminRouter from "./admin";
import eventsRouter from "./events";
import favoritesRouter from "./favorites";
import wishlistRouter from "./wishlist";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/cart", cartRouter);
router.use("/prescriptions", prescriptionsRouter);
router.use("/admin", adminRouter);
router.use("/events", eventsRouter);
router.use("/favorites", favoritesRouter);
router.use("/wishlist", wishlistRouter);

export default router;
