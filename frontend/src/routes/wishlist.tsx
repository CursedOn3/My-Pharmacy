import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, ShoppingCart, Trash2, Heart } from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist — Medicare" },
      {
        name: "description",
        content: "Items you'd like to buy later — kept just for you.",
      },
      { property: "og:title", content: "Wishlist — Medicare" },
      {
        property: "og:description",
        content: "Track products you want to buy later at Medicare Pharmacy.",
      },
    ],
  }),
});

function WishlistPage() {
  const { wishlist, removeWishlist, moveWishlistToFavorites } = useFavorites();
  const { add } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-card">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-sun flex items-center justify-center mb-4">
              <Bookmark className="h-6 w-6 text-primary-deep" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-primary-deep">
              Sign in to view your wishlist
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Your saved items are linked to your account.
            </p>
            <Link
              to="/login"
              className="inline-flex mt-5 items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Sign in
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
        <header>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
            For later
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep flex items-center gap-2">
            <Bookmark className="h-7 w-7 text-primary-deep" /> Wishlist
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {wishlist.length} item{wishlist.length === 1 ? "" : "s"} saved for
            later
          </p>
        </header>

        {wishlist.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-card">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-sun flex items-center justify-center mb-4">
              <Bookmark className="h-6 w-6 text-primary-deep" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-primary-deep">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Save items here while you decide. Move them to favorites when
              you're ready.
            </p>
            <Link
              to="/"
              className="inline-flex mt-5 items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl shadow-card divide-y divide-border">
            {wishlist.map((p) => (
              <div key={p.name} className="p-4 flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveWishlistToFavorites(p.name)}
                    className="hidden sm:inline-flex items-center gap-1.5 bg-mint text-primary-deep px-3 py-2 rounded-full text-xs font-semibold hover:bg-primary"
                  >
                    <Heart className="h-3.5 w-3.5" /> Favorite
                  </button>
                  <button
                    onClick={() => add(p)}
                    className="inline-flex items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-3 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add
                  </button>
                  <button
                    onClick={() => removeWishlist(p.name)}
                    aria-label={`Remove ${p.name} from wishlist`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-muted hover:bg-rose"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-primary-deep" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
