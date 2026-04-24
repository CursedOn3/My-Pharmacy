import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { useStore } from "@/context/StoreContext";

export type CartItem = Product & { qty: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (p: Product, qty?: number) => void;
  remove: (name: string) => void;
  setQty: (name: string, qty: number) => void;
  clear: () => void;
  selected: Product | null;
  open: (p: Product) => void;
  close: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const parsePrice = (price: string) => Number(price.replace(/[^0-9.]/g, "")) || 0;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const { getStock } = useStore();

  const add: CartCtx["add"] = (p, qty = 1) => {
    const stock = getStock(p.name);
    setItems((prev) => {
      const existing = prev.find((i) => i.name === p.name);
      const currentQty = existing?.qty ?? 0;
      // If we know the stock (>0), clamp; if unknown (0 may mean not yet seeded), allow
      if (stock > 0 && currentQty + qty > stock) {
        toast.error("Not enough stock", {
          description: `Only ${stock - currentQty} left of ${p.name}`,
        });
        return prev;
      }
      if (existing) {
        toast.success("Added to cart", { description: p.name });
        return prev.map((i) =>
          i.name === p.name ? { ...i, qty: i.qty + qty } : i,
        );
      }
      toast.success("Added to cart", { description: p.name });
      return [...prev, { ...p, qty }];
    });
  };

  const remove: CartCtx["remove"] = (name) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  };

  const setQty: CartCtx["setQty"] = (name, qty) => {
    setItems((prev) => {
      const item = prev.find((i) => i.name === name);
      if (!item) return prev;
      const stock = getStock(name);
      const clamped =
        stock > 0 ? Math.min(Math.max(1, qty), stock) : Math.max(1, qty);
      if (stock > 0 && qty > stock) {
        toast.error("Not enough stock", {
          description: `Only ${stock} available`,
        });
      }
      return prev.map((i) => (i.name === name ? { ...i, qty: clamped } : i));
    });
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.reduce((s, i) => s + i.qty, 0),
        subtotal: items.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0),
        add,
        remove,
        setQty,
        clear,
        selected,
        open: setSelected,
        close: () => setSelected(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
