import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { ALL } from "@/lib/products";
import { api, type FavoriteRow, type ProductDto } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";

type ListKey = "favorites" | "wishlist";

type FavoritesCtx = {
  favorites: Product[];
  wishlist: Product[];
  isFavorite: (name: string) => boolean;
  isWished: (name: string) => boolean;
  toggleFavorite: (p: Product) => void;
  toggleWishlist: (p: Product) => void;
  removeFavorite: (name: string) => void;
  removeWishlist: (name: string) => void;
  moveWishlistToFavorites: (name: string) => void;
};

const FavoritesContext = createContext<FavoritesCtx | null>(null);

const STORAGE = {
  favorites: "medicare.favorites.guest.v1",
  wishlist: "medicare.wishlist.guest.v1"
} as const;

const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

const toPrice = (value: number) => `$${value.toFixed(2)}`;

const mapProduct = (
  dto: ProductDto | null,
  fallback?: Product | null
): Product | null => {
  if (!dto && !fallback) return null;
  const base = fallback ?? (dto ? ALL.find((p) => p.name === dto.name) : null);
  if (!dto && base) return base;
  if (!dto) return null;
  return {
    id: dto.id,
    name: dto.name,
    brand: base?.brand ?? "Generic",
    category: base?.category ?? "General",
    price: toPrice(dto.price),
    oldPrice: base?.oldPrice,
    discount: base?.discount,
    image: dto.image_url ?? base?.image ?? "",
    rating: base?.rating,
    description: base?.description,
    stock: dto.stock
  };
};

const mapRows = (rows: FavoriteRow[], inventory: Product[]) => {
  return rows
    .map((row) => {
      const fallback = inventory.find((p) => p.id === row.product_id) ?? null;
      return mapProduct(row.products, fallback);
    })
    .filter(Boolean) as Product[];
};

const mapNamesToProducts = (names: string[], inventory: Product[]) => {
  const base = inventory.length ? inventory : ALL;
  const byName = new Map(base.map((p) => [p.name, p]));
  return names.map((name) => byName.get(name)).filter(Boolean) as Product[];
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { inventory } = useStore();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const syncedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadGuest = () => {
      const favNames = safeRead<string[]>(STORAGE.favorites, []);
      const wishNames = safeRead<string[]>(STORAGE.wishlist, []);
      setFavorites(mapNamesToProducts(favNames, inventory));
      setWishlist(mapNamesToProducts(wishNames, inventory));
    };

    const syncGuestToAccount = async () => {
      const favNames = safeRead<string[]>(STORAGE.favorites, []);
      const wishNames = safeRead<string[]>(STORAGE.wishlist, []);
      if (favNames.length === 0 && wishNames.length === 0) return;

      const base = inventory.length ? inventory : ALL;
      const byName = new Map(base.map((p) => [p.name, p]));
      const favIds = favNames
        .map((name) => byName.get(name)?.id)
        .filter(Boolean) as string[];
      const wishIds = wishNames
        .map((name) => byName.get(name)?.id)
        .filter(Boolean) as string[];

      await Promise.all([
        ...favIds.map((id) => api.addFavorite(id)),
        ...wishIds.map((id) => api.addWishlist(id))
      ]);

      safeWrite(STORAGE.favorites, []);
      safeWrite(STORAGE.wishlist, []);
    };

    const load = async () => {
      if (!user) {
        syncedRef.current = false;
        loadGuest();
        return;
      }

      try {
        if (!syncedRef.current) {
          await syncGuestToAccount();
          syncedRef.current = true;
        }
        const [favRows, wishRows] = await Promise.all([
          api.listFavorites(),
          api.listWishlist()
        ]);
        if (!active) return;
        setFavorites(mapRows(favRows, inventory));
        setWishlist(mapRows(wishRows, inventory));
      } catch {
        // ignore load errors for now
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [inventory, user]);

  const has = (list: Product[], name: string) =>
    list.some((p) => p.name === name);

  const isFavorite = useCallback(
    (name: string) => has(favorites, name),
    [favorites]
  );
  const isWished = useCallback(
    (name: string) => has(wishlist, name),
    [wishlist]
  );

  const resolveId = (p: Product) => {
    return p.id ?? inventory.find((i) => i.name === p.name)?.id ?? null;
  };

  const toggle = useCallback(
    async (key: ListKey, p: Product) => {
      const list = key === "favorites" ? favorites : wishlist;
      const setter = key === "favorites" ? setFavorites : setWishlist;
      const label = key === "favorites" ? "Favorites" : "Wishlist";
      const storageKey = key === "favorites" ? STORAGE.favorites : STORAGE.wishlist;

      if (!user) {
        if (has(list, p.name)) {
          const next = list.filter((i) => i.name !== p.name);
          setter(next);
          safeWrite(storageKey, next.map((i) => i.name));
          toast.message(`Removed from ${label}`, { description: p.name });
          return;
        }
        const next = [p, ...list];
        setter(next);
        safeWrite(storageKey, next.map((i) => i.name));
        toast.success(`Added to ${label}`, { description: p.name });
        return;
      }

      const id = resolveId(p);
      if (!id) {
        toast.error("This item is not available right now");
        return;
      }
      if (has(list, p.name)) {
        try {
          if (key === "favorites") await api.removeFavorite(id);
          else await api.removeWishlist(id);
          setter((prev) => prev.filter((i) => i.name !== p.name));
          toast.message(`Removed from ${label}`, { description: p.name });
        } catch {
          toast.error("Failed to update list");
        }
        return;
      }
      try {
        if (key === "favorites") await api.addFavorite(id);
        else await api.addWishlist(id);
        setter((prev) => [p, ...prev]);
        toast.success(`Added to ${label}`, { description: p.name });
      } catch {
        toast.error("Failed to update list");
      }
    },
    [favorites, wishlist, inventory, user]
  );

  const toggleFavorite = useCallback((p: Product) => toggle("favorites", p), [toggle]);
  const toggleWishlist = useCallback((p: Product) => toggle("wishlist", p), [toggle]);

  const removeFavorite = useCallback(
    async (name: string) => {
      if (!user) {
        const next = favorites.filter((i) => i.name !== name);
        setFavorites(next);
        safeWrite(STORAGE.favorites, next.map((i) => i.name));
        return;
      }
      const target = favorites.find((p) => p.name === name);
      if (!target) return;
      const id = resolveId(target);
      if (!id) return;
      try {
        await api.removeFavorite(id);
        setFavorites((prev) => prev.filter((i) => i.name !== name));
      } catch {
        toast.error("Failed to remove favorite");
      }
    },
    [favorites, inventory]
  );

  const removeWishlist = useCallback(
    async (name: string) => {
      if (!user) {
        const next = wishlist.filter((i) => i.name !== name);
        setWishlist(next);
        safeWrite(STORAGE.wishlist, next.map((i) => i.name));
        return;
      }
      const target = wishlist.find((p) => p.name === name);
      if (!target) return;
      const id = resolveId(target);
      if (!id) return;
      try {
        await api.removeWishlist(id);
        setWishlist((prev) => prev.filter((i) => i.name !== name));
      } catch {
        toast.error("Failed to remove wishlist item");
      }
    },
    [wishlist, inventory]
  );

  const moveWishlistToFavorites = useCallback(
    async (name: string) => {
      const item = wishlist.find((p) => p.name === name);
      if (!item) return;
      if (!user) {
        const nextFavs = has(favorites, name) ? favorites : [item, ...favorites];
        const nextWish = wishlist.filter((i) => i.name !== name);
        setFavorites(nextFavs);
        setWishlist(nextWish);
        safeWrite(STORAGE.favorites, nextFavs.map((i) => i.name));
        safeWrite(STORAGE.wishlist, nextWish.map((i) => i.name));
        toast.success("Moved to Favorites", { description: name });
        return;
      }
      const id = resolveId(item);
      if (!id) return;
      try {
        await Promise.all([api.removeWishlist(id), api.addFavorite(id)]);
        setWishlist((prev) => prev.filter((i) => i.name !== name));
        setFavorites((prev) => (has(prev, name) ? prev : [item, ...prev]));
        toast.success("Moved to Favorites", { description: name });
      } catch {
        toast.error("Failed to move item");
      }
    },
    [wishlist, inventory, user]
  );

  const value = useMemo<FavoritesCtx>(
    () => ({
      favorites,
      wishlist,
      isFavorite,
      isWished,
      toggleFavorite,
      toggleWishlist,
      removeFavorite,
      removeWishlist,
      moveWishlistToFavorites
    }),
    [
      favorites,
      wishlist,
      isFavorite,
      isWished,
      toggleFavorite,
      toggleWishlist,
      removeFavorite,
      removeWishlist,
      moveWishlistToFavorites
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const c = useContext(FavoritesContext);
  if (!c) throw new Error("useFavorites must be used within FavoritesProvider");
  return c;
};
