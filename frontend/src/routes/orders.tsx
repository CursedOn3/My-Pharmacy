import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Package, RefreshCcw, ShoppingBag } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useAuth } from "@/context/AuthContext";
import { useStore, type Order } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "Recent Orders — Medicare" },
      {
        name: "description",
        content:
          "Review your recent orders and reorder them with a single tap.",
      },
      { property: "og:title", content: "Recent Orders — Medicare" },
      {
        property: "og:description",
        content: "Track and reorder your past Medicare Pharmacy orders.",
      },
    ],
  }),
});

function OrdersPage() {
  const { user } = useAuth();
  const { orders, inventory } = useStore();
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  const myOrders = useMemo(
    () =>
      user
        ? orders.filter(
            (o) => o.customerEmail.toLowerCase() === user.email.toLowerCase(),
          )
        : [],
    [orders, user],
  );

  const reorder = (order: Order) => {
    let added = 0;
    for (const line of order.lines) {
      const product = inventory.find((p) => p.name === line.name);
      if (product) {
        add(product, line.qty);
        added++;
      }
    }
    if (added === 0) {
      toast.error("These items are no longer available");
      return;
    }
    navigate({ to: "/cart" });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 space-y-6">
        <header>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
            Order history
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep flex items-center gap-2">
            <Package className="h-7 w-7 text-primary-deep" /> Recent Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {myOrders.length} order{myOrders.length === 1 ? "" : "s"} placed
          </p>
        </header>

        {myOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-card">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-peach flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-primary-deep" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-primary-deep">
              No orders yet
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              When you place an order it will appear here for easy tracking and
              reordering.
            </p>
            <Link
              to="/products"
              className="inline-flex mt-5 items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((o) => (
              <article
                key={o.id}
                className="bg-card border border-border rounded-3xl p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-display text-lg font-extrabold text-primary-deep">
                      {o.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusColor(o.status)}`}
                    >
                      {o.status}
                    </span>
                    <span className="text-sm font-bold text-primary-deep">
                      ${o.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {o.lines.map((l) => (
                    <div
                      key={l.productId + l.name}
                      className="flex items-center gap-2 bg-muted rounded-2xl pr-3"
                    >
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-background">
                        <img
                          src={l.image}
                          alt={l.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-primary-deep line-clamp-1 max-w-[180px]">
                          {l.name}
                        </div>
                        <div className="text-muted-foreground">
                          ×{l.qty} · ${l.unitPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {o.lines.length} line item
                    {o.lines.length === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => reorder(o)}
                    className="inline-flex items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Reorder
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const statusColor = (s: string) => {
  switch (s) {
    case "Pending":
      return "bg-peach text-primary-deep";
    case "Processing":
      return "bg-sun text-primary-deep";
    case "Shipped":
      return "bg-mint text-primary-deep";
    case "Delivered":
      return "bg-mint text-primary-deep";
    case "Cancelled":
      return "bg-rose text-primary-deep";
    default:
      return "bg-cream text-primary-deep";
  }
};
