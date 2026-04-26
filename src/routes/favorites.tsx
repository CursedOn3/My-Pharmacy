import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2, RefreshCcw } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "Favorites — Medicare" },
      {
        name: "description",
        content:
          "Your saved favorite products — quickly add them to your cart again.",
      },
      { property: "og:title", content: "Favorites — Medicare" },
      {
        property: "og:description",
        content: "Your saved favorite products at Medicare Pharmacy.",
      },
    ],
  }),
});

function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const { add } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
              Saved for you
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep flex items-center gap-2">
              <Heart className="h-7 w-7 fill-accent text-accent" /> Favorites
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {favorites.length} item{favorites.length === 1 ? "" : "s"} you
              love
            </p>
          </div>
          {favorites.length > 0 && (
            <Link
              to="/reorder-favorites"
              className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              <RefreshCcw className="h-4 w-4" /> Reorder all favorites
            </Link>
          )}
        </header>

        {favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((p) => (
              <article
                key={p.name}
                className="bg-card border border-border rounded-3xl p-4 shadow-card flex gap-4"
              >
                <div className="h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {p.brand}
                  </p>
                  <h3 className="text-sm font-semibold text-primary-deep line-clamp-2">
                    {p.name}
                  </h3>
                  <span className="font-bold text-primary-deep mt-auto pt-2">
                    {p.price}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => add(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-3 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> Add
                    </button>
                    <button
                      onClick={() => removeFavorite(p.name)}
                      aria-label={`Remove ${p.name} from favorites`}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-muted hover:bg-rose"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-primary-deep" />
                    </button>
                  </div>
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

function EmptyState() {
  return (
    <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-card">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-mint flex items-center justify-center mb-4">
        <Heart className="h-6 w-6 text-primary-deep" />
      </div>
      <h2 className="font-display text-xl font-extrabold text-primary-deep">
        No favorites yet
      </h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Tap the heart on any product to save it here for one-tap reordering.
      </p>
      <Link
        to="/products"
        className="inline-flex mt-5 items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
      >
        Browse products
      </Link>
    </div>
  );
}
