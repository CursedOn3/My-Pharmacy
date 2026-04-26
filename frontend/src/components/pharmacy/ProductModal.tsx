import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, ShieldCheck, Truck, Star, Minus, Plus } from "lucide-react";

const ProductModal = () => {
  const { selected, close, add } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (selected) setQty(1);
  }, [selected]);

  const open = !!selected;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border-border">
        {selected && (
          <div className="grid md:grid-cols-2">
            <div className="bg-mint p-8 flex items-center justify-center relative">
              {selected.discount && (
                <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                  -{selected.discount} OFF
                </span>
              )}
              <img
                src={selected.image}
                alt={selected.name}
                className="max-h-72 w-auto object-contain rounded-2xl"
              />
            </div>

            <div className="p-6 md:p-8 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {selected.brand} · {selected.category}
                </p>
                <DialogTitle className="font-display text-2xl font-extrabold text-primary-deep mt-1">
                  {selected.name}
                </DialogTitle>
              </div>

              {selected.rating && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="font-semibold text-primary-deep">{selected.rating}</span>
                  <span>· 1.2k reviews</span>
                </div>
              )}

              <DialogDescription className="text-sm text-primary-deep/70">
                {selected.description ??
                  "Pharmacist-approved formula, manufactured in certified facilities. Sealed for freshness and dispatched in temperature-controlled packaging."}
              </DialogDescription>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="font-display text-3xl font-extrabold text-primary-deep">
                  {selected.price}
                </span>
                {selected.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {selected.oldPrice}
                  </span>
                )}
                {selected.discount && (
                  <span className="text-xs font-bold bg-mint text-primary-deep px-2 py-1 rounded-full">
                    Save {selected.discount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-muted rounded-full">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-mint"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-primary-deep">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    aria-label="Increase quantity"
                    className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-mint"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    add(selected, qty);
                    close();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-3 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </button>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> Free 2-hr delivery
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% genuine
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
