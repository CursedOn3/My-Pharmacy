import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, RefreshCcw, ShoppingCart, Check } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/reorder-favorites")({
  component: ReorderFavoritesPage,
  head: () => ({
    meta: [
      { title: "Reorder Favorites — Medicare" },
      {
        name: "description",
        content:
          "Choose quantities and reorder all your favorite products in one tap.",
      },
      { property: "og:title", content: "Reorder Favorites — Medicare" },
      {
        property: "og:description",
        content: "One-tap reorder of your favorite Medicare Pharmacy products.",
      },
    ],
  }),
});

const parsePrice = (price: string) => Number(price.replace(/[^0-9.]/g, "")) || 0;

function ReorderFavoritesPage() {
  const { favorites } = useFavorites();
  const { add } = useCart();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(favorites.map((p) => [p.name, true])),
  );
  const [qtys, setQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(favorites.map((p) => [p.name, 1])),
  );

  const summary = useMemo(() => {
    const lines = favorites.filter((p) => selected[p.name]);
    const items = lines.reduce((s, p) => s + (qtys[p.name] ?? 1), 0);
    const subtotal = lines.reduce(
      (s, p) => s + parsePrice(p.price) * (qtys[p.name] ?? 1),
      0,
    );
    return { count: lines.length, items, subtotal };
  }, [favorites, selected, qtys]);

  const allSelected =
    favorites.length > 0 && favorites.every((p) => selected[p.name]);
  const toggleAll = () => {
    const next = !allSelected;
    setSelected(Object.fromEntries(favorites.map((p) => [p.name, next])));
  };

  const reorder = () => {
    const picks = favorites.filter((p) => selected[p.name]);
    if (picks.length === 0) {
      toast.error("Select at least one favorite to reorder");
      return;
    }
    picks.forEach((p) => add(p, qtys[p.name] ?? 1));
    navigate({ to: "/cart" });
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-card max-w-xl mx-auto">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-mint flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary-deep" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-primary-deep">
              No favorites to reorder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save your go-to products as favorites first, then reorder them
              here in a single tap.
            </p>
            <Link
              to="/favorites"
              className="inline-flex mt-5 items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Go to favorites
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
              One-tap checkout
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep flex items-center gap-2">
              <RefreshCcw className="h-7 w-7 text-primary-deep" /> Reorder
              favorites
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pick what you need and we'll add it all to your cart.
            </p>
          </div>
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 bg-mint text-primary-deep px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary"
          >
            <Check className="h-3.5 w-3.5" />
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl shadow-card divide-y divide-border">
            {favorites.map((p) => {
              const isOn = !!selected[p.name];
              const qty = qtys[p.name] ?? 1;
              return (
                <label
                  key={p.name}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${isOn ? "bg-mint/30" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={(e) =>
                      setSelected((prev) => ({
                        ...prev,
                        [p.name]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-primary-deep"
                  />
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                      {p.brand}
                    </p>
                    <h3 className="text-sm font-semibold text-primary-deep truncate">
                      {p.name}
                    </h3>
                    <span className="text-sm font-bold text-primary-deep">
                      {p.price}
                    </span>
                  </div>
                  <div
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center bg-muted rounded-full"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setQtys((prev) => ({
                          ...prev,
                          [p.name]: Math.max(1, (prev[p.name] ?? 1) - 1),
                        }))
                      }
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-primary-deep">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQtys((prev) => ({
                          ...prev,
                          [p.name]: Math.min(99, (prev[p.name] ?? 1) + 1),
                        }))
                      }
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </label>
              );
            })}
          </div>

          <aside className="bg-card border border-border rounded-3xl p-5 shadow-card h-fit lg:sticky lg:top-24 space-y-4">
            <h2 className="font-display text-lg font-extrabold text-primary-deep">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <Row label="Selected" value={`${summary.count} product${summary.count === 1 ? "" : "s"}`} />
              <Row label="Total items" value={String(summary.items)} />
              <div className="border-t border-border pt-2">
                <Row
                  label="Subtotal"
                  value={`$${summary.subtotal.toFixed(2)}`}
                  bold
                />
              </div>
            </div>
            <button
              onClick={reorder}
              disabled={summary.count === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-3 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ShoppingCart className="h-4 w-4" /> Add all to cart
            </button>
            <p className="text-xs text-muted-foreground text-center">
              You'll review the cart before checkout.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${bold ? "font-display text-lg font-extrabold" : "font-semibold"} text-primary-deep`}
      >
        {value}
      </span>
    </div>
  );
}
