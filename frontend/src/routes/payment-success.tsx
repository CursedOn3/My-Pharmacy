import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { api } from "@/lib/api";

export const Route = createFileRoute("/payment-success")({
  component: PaymentSuccessPage,
  head: () => ({
    meta: [{ title: "Payment Status — Medicare" }],
  }),
});

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("data");

    if (!encodedData) {
      setStatus("failed");
      return;
    }

    api
      .verifyEsewaPayment(encodedData)
      .then((result) => {
        if (result.status === "COMPLETE") {
          setStatus("success");
          setOrderId(result.order_id);
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        } else {
          setStatus("failed");
        }
      })
      .catch(() => {
        setStatus("failed");
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
        {status === "verifying" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary-deep animate-spin mx-auto" />
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Verifying payment...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your transaction with eSewa.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto h-16 w-16 rounded-full bg-mint flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary-deep" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Payment successful!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your payment has been verified and your order is being processed.
            </p>
            {orderId && (
              <p className="text-xs font-semibold text-primary-deep bg-mint rounded-full px-4 py-2 inline-block">
                Order ID: {orderId}
              </p>
            )}
            <div className="flex justify-center gap-3 pt-4">
              <Link
                to="/orders"
                className="bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                View orders
              </Link>
              <Link
                to="/"
                className="bg-muted text-primary-deep px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto h-16 w-16 rounded-full bg-peach flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Payment verification failed
            </h2>
            <p className="text-sm text-muted-foreground">
              We could not verify your payment. If money was deducted, it will be refunded within 24 hours. Please try again or contact support.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <Link
                to="/orders"
                className="bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                View orders
              </Link>
              <Link
                to="/cart"
                className="bg-muted text-primary-deep px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                Back to cart
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
