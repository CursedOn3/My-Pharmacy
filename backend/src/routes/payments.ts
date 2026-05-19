import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { env } from "../config/env";
import { serviceClient } from "../lib/supabase";

const router = Router();

const ESEWA_SECRET = env.ESEWA_SECRET_KEY;
const ESEWA_PRODUCT_CODE = env.ESEWA_PRODUCT_CODE;

function generateSignature(message: string): string {
  const hmac = crypto.createHmac("sha256", ESEWA_SECRET);
  hmac.update(message);
  return hmac.digest("base64");
}

function verifySignature(message: string, signature: string): boolean {
  const expected = generateSignature(message);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "base64"),
    Buffer.from(signature, "base64")
  );
}

const initiateSchema = z.object({
  order_id: z.string().min(1),
  amount: z.number().positive(),
  tax_amount: z.number().min(0).default(0),
  delivery_charge: z.number().min(0).default(0),
});

router.post("/initiate", requireAuth, async (req, res, next) => {
  try {
    const { order_id, amount, tax_amount, delivery_charge } = initiateSchema.parse(req.body);

    const amountInt = Math.round(amount);
    const taxInt = Math.round(tax_amount);
    const deliveryInt = Math.round(delivery_charge);
    const totalInt = amountInt + taxInt + deliveryInt;
    const transaction_uuid = `${order_id}-${Date.now()}`;

    const signed_field_names = "total_amount,transaction_uuid,product_code";
    const message = `total_amount=${totalInt},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = generateSignature(message);

    res.json({
      data: {
        amount: String(amountInt),
        tax_amount: String(taxInt),
        product_service_charge: "0",
        product_delivery_charge: String(deliveryInt),
        total_amount: String(totalInt),
        transaction_uuid,
        product_code: ESEWA_PRODUCT_CODE,
        signed_field_names,
        signature,
        success_url: env.ESEWA_SUCCESS_URL || `${env.FRONTEND_URL}/payment-success`,
        failure_url: env.ESEWA_FAILURE_URL || `${env.FRONTEND_URL}/payment-failure`,
      },
    });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  encoded_response: z.string().min(1),
});

router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const { encoded_response } = verifySchema.parse(req.body);

    const decoded = JSON.parse(Buffer.from(encoded_response, "base64").toString("utf-8"));

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature,
    } = decoded;

    const fields = (signed_field_names as string).split(",");
    const messageObj: Record<string, string> = {
      transaction_code,
      status,
      total_amount: String(total_amount),
      transaction_uuid,
      product_code,
      signed_field_names,
    };
    const message = fields.map((f) => `${f}=${messageObj[f]}`).join(",");

    let verified = false;
    try {
      verified = verifySignature(message, signature);
    } catch {
      verified = false;
    }

    if (!verified || status !== "COMPLETE") {
      return res.status(400).json({ error: "payment_verification_failed" });
    }

    const orderId = transaction_uuid.split("-")[0];

    const { error } = await serviceClient
      .from("orders")
      .update({ status: "processing", payment_status: "paid", payment_method: "esewa", transaction_id: transaction_uuid })
      .eq("id", orderId);

    if (error) {
      return res.status(500).json({ error: "failed_to_update_order" });
    }

    res.json({
      data: {
        status: "COMPLETE",
        transaction_uuid,
        order_id: orderId,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/status/:transaction_uuid", requireAuth, async (req, res, next) => {
  try {
    const { transaction_uuid } = req.params;
    const { total_amount } = req.query;

    if (!total_amount) {
      return res.status(400).json({ error: "total_amount required" });
    }

    const esewaUrl = env.NODE_ENV === "production"
      ? "https://esewa.com.np/api/epay/transaction/status/"
      : "https://rc.esewa.com.np/api/epay/transaction/status/";

    const statusRes = await fetch(
      `${esewaUrl}?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`
    );
    const statusData = await statusRes.json();

    res.json({ data: statusData });
  } catch (err) {
    next(err);
  }
});

export default router;
