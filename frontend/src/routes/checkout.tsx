import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Truck, Wallet } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api";

type PaymentMethod = "esewa" | "cod";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — Medicare" },
      {
        name: "description",
        content: "Secure checkout with multiple payment options.",
      },
    ],
  }),
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { createOrder } = useStore();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const shipping = items.length > 0 ? 100 : 0;
  const total = subtotal + shipping;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  const [esewaFields, setEsewaFields] = useState<Record<string, string> | null>(null);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate({ to: "/login" });
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate({ to: "/cart" });
      return;
    }
    if (!address.trim() || !phone.trim()) {
      toast.error("Please fill shipping details");
      return;
    }

    setProcessing(true);

    let order = null;
    try {
      order = await createOrder({
        customerEmail: user.email,
        customerName: user.name,
        lines: items.map((i) => ({ productName: i.name, qty: i.qty })),
        shipping,
        paymentMethod,
      });
    } catch {
      toast.error("Checkout failed", {
        description: "Please try again in a moment.",
      });
      setProcessing(false);
      return;
    }

    if (!order) {
      toast.error("Some items are out of stock", {
        description: "Please review your cart.",
      });
      setProcessing(false);
      navigate({ to: "/cart" });
      return;
    }

    if (paymentMethod === "cod") {
      clear();
      toast.success(`Order ${order.id} placed! Pay on delivery.`);
      navigate({ to: "/orders" });
      return;
    }

    try {
      const paymentData = await api.initiateEsewaPayment({
        order_id: order.id,
        amount: subtotal,
        tax_amount: 0,
        delivery_charge: shipping,
      });

      setEsewaFields(paymentData);
      clear();

      setTimeout(() => {
        formRef.current?.submit();
      }, 100);
    } catch {
      toast.error("Failed to initiate payment. Order placed as COD.");
      clear();
      navigate({ to: "/orders" });
    }
  };

  const esewaUrl =
    import.meta.env.VITE_ESEWA_ENV === "production"
      ? "https://epay.esewa.com.np/api/epay/main/v2/form"
      : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep mb-2">
          Checkout
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Complete your order with your preferred payment option.
        </p>

        {items.length === 0 && !esewaFields ? (
          <div className="bg-cream rounded-[2rem] p-10 text-center space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              No items to checkout
            </h2>
            <p className="text-sm text-muted-foreground">
              Add products to cart first, then come back to checkout.
            </p>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-3 rounded-full text-sm font-semibold"
            >
              Go to cart
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-5">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-display text-xl font-extrabold text-primary-deep mb-4">
                  Shipping details
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-primary-deep block mb-1">
                      Delivery address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, city, landmark"
                      rows={3}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-deep/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-primary-deep block mb-1">
                      Phone number
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your contact number"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-deep/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-display text-xl font-extrabold text-primary-deep mb-4">
                  Payment method
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <PaymentOption
                    active={paymentMethod === "esewa"}
                    onClick={() => setPaymentMethod("esewa")}
                    icon={<Wallet className="h-4 w-4" />}
                    title="eSewa"
                    subtitle="Pay via eSewa wallet"
                  />
                  <PaymentOption
                    active={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                    icon={<Truck className="h-4 w-4" />}
                    title="Cash on delivery"
                    subtitle="Pay when order arrives"
                  />
                </div>
              </div>
            </section>

            <aside className="bg-cream rounded-3xl p-6 h-fit space-y-4 sticky top-24">
              <h2 className="font-display text-xl font-extrabold text-primary-deep">
                Order summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-primary-deep/80">
                  <span>Subtotal</span>
                  <span className="font-semibold">NPR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary-deep/80">
                  <span>Delivery</span>
                  <span className="font-semibold">NPR {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary-deep pt-2 border-t border-border">
                  <span className="font-bold">Total</span>
                  <span className="font-display font-extrabold text-xl">
                    NPR {total.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Delivery charge: NPR 100 inside city, NPR 200 outside city.
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : paymentMethod === "esewa"
                    ? "Pay with eSewa"
                    : "Place order"}
              </button>
              <ul className="text-xs text-primary-deep/70 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure payments
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" /> Delivered in 2 hours
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
      <Footer />

      {esewaFields && (
        <form
          ref={formRef}
          action={esewaUrl}
          method="POST"
          style={{ display: "none" }}
        >
          <input name="amount" value={esewaFields.amount} readOnly />
          <input name="tax_amount" value={esewaFields.tax_amount} readOnly />
          <input name="product_service_charge" value={esewaFields.product_service_charge} readOnly />
          <input name="product_delivery_charge" value={esewaFields.product_delivery_charge} readOnly />
          <input name="total_amount" value={esewaFields.total_amount} readOnly />
          <input name="transaction_uuid" value={esewaFields.transaction_uuid} readOnly />
          <input name="product_code" value={esewaFields.product_code} readOnly />
          <input name="signed_field_names" value={esewaFields.signed_field_names} readOnly />
          <input name="signature" value={esewaFields.signature} readOnly />
          <input name="success_url" value={esewaFields.success_url} readOnly />
          <input name="failure_url" value={esewaFields.failure_url} readOnly />
        </form>
      )}
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-colors ${
        active
          ? "border-primary-deep bg-primary-deep/5"
          : "border-border bg-background hover:border-primary-deep/40"
      }`}
    >
      <div className="flex items-center gap-2 text-primary-deep">
        {icon}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </button>
  );
}
