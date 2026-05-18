import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { parsePrice } from "@/lib/utils";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export type CartItem = Product & { qty: number; cartItemId?: string };

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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  // Consume the pre-built map from StoreContext — no duplicate Map creation
  const { getStock, inventory, inventoryByName } = useStore();
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.listCart();
      const next: CartItem[] = data
        .map((row) => {
          const product = inventory.find((p) => p.id === row.product_id);
          if (!product) return null;
          return {
            ...product,
            qty: row.quantity,
            cartItemId: row.id
          };
        })
        .filter(Boolean) as CartItem[];
      setItems(next);
    } catch {
      // ignore load errors — local state remains usable
    }
  }, [inventory, user]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await loadCart();
    };
    load();
    return () => {
      active = false;
    };
  }, [loadCart]);

  const add: CartCtx["add"] = (p, qty = 1) => {
    const stock = getStock(p.name);
    // Snapshot the items before optimistic update for potential rollback
    let snapshot: CartItem[] = [];

    setItems((prev) => {
      snapshot = prev;
      const existing = prev.find((i) => i.name === p.name);
      const currentQty = existing?.qty ?? 0;
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

    const item = inventoryByName.get(p.name) ?? (p.id ? { id: p.id } : null);
    if (user && item?.id) {
      api
        .addCartItem({ product_id: item.id, quantity: qty })
        .then(loadCart)
        .catch(() => {
          // Rollback optimistic update on failure
          setItems(snapshot);
          toast.error("Failed to add item to cart", { description: p.name });
        });
    }
  };

  const remove: CartCtx["remove"] = (name) => {
    setItems((prev) => {
      const target = prev.find((i) => i.name === name);
      if (user && target?.cartItemId) {
        api.removeCartItem(target.cartItemId).catch(() => {
          // Restore removed item on failure
          setItems((curr) => {
            if (curr.find((i) => i.name === name)) return curr;
            return target ? [target, ...curr] : curr;
          });
          toast.error("Failed to remove item");
        });
      }
      return prev.filter((i) => i.name !== name);
    });
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
      const next = prev.map((i) => (i.name === name ? { ...i, qty: clamped } : i));

      if (user && item.cartItemId) {
        // Use PATCH to update the existing cart row — not a new upsert
        api
          .updateCartItem(item.cartItemId, clamped)
          .catch(() => {
            // Rollback to previous quantity on failure
            setItems((curr) =>
              curr.map((i) => (i.name === name ? { ...i, qty: item.qty } : i))
            );
            toast.error("Failed to update quantity");
          });
      } else if (user) {
        // cartItemId not yet known — fall back to upsert then reload
        const target = inventoryByName.get(name);
        if (target) {
          api
            .addCartItem({ product_id: target.id, quantity: clamped })
            .then(loadCart)
            .catch(() => {
              setItems((curr) =>
                curr.map((i) => (i.name === name ? { ...i, qty: item.qty } : i))
              );
              toast.error("Failed to update quantity");
            });
        }
      }

      return next;
    });
  };

  const clear = () => {
    const snapshot = items;
    setItems([]);
    if (user) {
      api.clearCart().catch(() => {
        setItems(snapshot);
        toast.error("Failed to clear cart");
      });
    }
  };

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
