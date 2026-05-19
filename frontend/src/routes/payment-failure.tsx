import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";

export const Route = createFileRoute("/payment-failure")({
  component: PaymentFailurePage,
  head: () => ({
    meta: [{ title: "Payment Failed — Medicare" }],
  }),
});

function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto h-16 w-16 rounded-full bg-peach flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-primary-deep">
            Payment failed
          </h2>
          <p className="text-sm text-muted-foreground">
            Your payment was not completed. This could be due to insufficient balance, session timeout, or cancellation. No amount has been deducted.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link
              to="/checkout"
              className="bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Try again
            </Link>
            <Link
              to="/orders"
              className="bg-muted text-primary-deep px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              View orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
