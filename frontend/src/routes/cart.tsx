import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your Cart — Medicare" },
      { name: "description", content: "Review the items in your cart and checkout." },
    ],
  }),
});

function CartPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = items.length > 0 ? 4.99 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate({ to: "/login" });
      return;
    }
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
              Your cart
            </h1>
            <p className="text-sm text-muted-foreground">
              {items.length} item{items.length === 1 ? "" : "s"} ready to ship
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                clear();
                toast.success("Cart cleared");
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-destructive"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-cream rounded-[2rem] p-12 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-mint flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-primary-deep" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Your cart is empty
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Add medicines, vitamins or wellness essentials to start your order.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-3 rounded-full text-sm font-semibold"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const lineTotal =
                  Number(item.price.replace(/[^0-9.]/g, "")) * item.qty;
                return (
                  <div
                    key={item.name}
                    className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-center shadow-card"
                  >
                    <div className="h-20 w-20 rounded-xl bg-mint shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide">
                        {item.brand} · {item.category}
                      </p>
                      <h3 className="text-sm font-semibold text-primary-deep truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-primary-deep mt-1">
                        ${lineTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center bg-muted rounded-full">
                      <button
                        onClick={() => setQty(item.name, item.qty - 1)}
                        aria-label="Decrease"
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-mint"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-primary-deep">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => setQty(item.name, item.qty + 1)}
                        aria-label="Increase"
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-mint"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        remove(item.name);
                        toast.success("Removed from cart");
                      }}
                      aria-label={`Remove ${item.name}`}
                      className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <aside className="bg-cream rounded-3xl p-6 h-fit space-y-4 sticky top-24">
              <h2 className="font-display text-xl font-extrabold text-primary-deep">
                Order summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-primary-deep/80">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary-deep/80">
                  <span>2-hour delivery</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary-deep pt-2 border-t border-border">
                  <span className="font-bold">Total</span>
                  <span className="font-display font-extrabold text-xl">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform"
              >
                Checkout
              </button>
              <ul className="text-xs text-primary-deep/70 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" /> Delivered in 2 hours
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% genuine medicines
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
