import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import type { Product } from "@/lib/products";

const ProductCard = ({ p }: { p: Product }) => {
  const { open, add } = useCart();
  const { toggleWishlist, isWished } = useFavorites();
  const wished = isWished(p.name);
  return (
    <article
      onClick={() => open(p)}
      className="group bg-card rounded-2xl border border-border p-3 shadow-card hover:shadow-soft transition-shadow cursor-pointer text-left"
    >
      <div className="relative bg-muted rounded-xl overflow-hidden aspect-square mb-3">
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          {p.discount && (
            <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-full">
              -{p.discount}
            </span>
          )}
          {p.stock !== undefined && p.stock <= 0 && (
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
              Out of stock
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(p);
          }}
          aria-label={`${wished ? "Remove" : "Add"} ${p.name} ${wished ? "from" : "to"} wishlist`}
          className={`absolute top-2 right-2 z-10 h-7 w-7 rounded-full flex items-center justify-center shadow-soft transition-colors ${
            wished
              ? "bg-accent text-accent-foreground"
              : "bg-background/90 text-primary-deep hover:bg-mint"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${wished ? "fill-current" : ""}`} />
        </button>
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          width={512}
          height={512}
          className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${p.stock !== undefined && p.stock <= 0 ? "opacity-50" : ""}`}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (p.stock !== undefined && p.stock <= 0) return;
            add(p);
          }}
          disabled={p.stock !== undefined && p.stock <= 0}
          aria-label={`Add ${p.name} to cart`}
          className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-primary-deep text-primary-deep-foreground flex items-center justify-center shadow-soft hover:scale-110 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          {p.brand}
        </p>
        <h3 className="text-sm font-semibold text-primary-deep line-clamp-2 leading-snug min-h-[2.5rem]">
          {p.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-primary-deep">{p.price}</span>
            {p.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {p.oldPrice}
              </span>
            )}
          </div>
          {p.rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              {p.rating}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
export { Link };
