import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
  } from "react";
  import { toast } from "sonner";
  import type { Product } from "@/lib/products";
  
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
    favorites: "medicare.favorites.v1",
    wishlist: "medicare.wishlist.v1",
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
      /* noop */
    }
  };
  
  export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [hydrated, setHydrated] = useState(false);
  
    useEffect(() => {
      setFavorites(safeRead<Product[]>(STORAGE.favorites, []));
      setWishlist(safeRead<Product[]>(STORAGE.wishlist, []));
      setHydrated(true);
    }, []);
  
    useEffect(() => {
      if (hydrated) safeWrite(STORAGE.favorites, favorites);
    }, [favorites, hydrated]);
  
    useEffect(() => {
      if (hydrated) safeWrite(STORAGE.wishlist, wishlist);
    }, [wishlist, hydrated]);
  
    const has = (list: Product[], name: string) =>
      list.some((p) => p.name === name);
  
    const isFavorite = useCallback(
      (name: string) => has(favorites, name),
      [favorites],
    );
    const isWished = useCallback(
      (name: string) => has(wishlist, name),
      [wishlist],
    );
  
    const makeToggle = (key: ListKey) => (p: Product) => {
      const setter = key === "favorites" ? setFavorites : setWishlist;
      const label = key === "favorites" ? "Favorites" : "Wishlist";
      setter((prev) => {
        if (has(prev, p.name)) {
          toast.message(`Removed from ${label}`, { description: p.name });
          return prev.filter((i) => i.name !== p.name);
        }
        toast.success(`Added to ${label}`, { description: p.name });
        return [p, ...prev];
      });
    };
  
    const toggleFavorite = useCallback(makeToggle("favorites"), []);
    const toggleWishlist = useCallback(makeToggle("wishlist"), []);
  
    const removeFavorite = useCallback((name: string) => {
      setFavorites((prev) => prev.filter((i) => i.name !== name));
    }, []);
  
    const removeWishlist = useCallback((name: string) => {
      setWishlist((prev) => prev.filter((i) => i.name !== name));
    }, []);
  
    const moveWishlistToFavorites = useCallback((name: string) => {
      setWishlist((prev) => {
        const item = prev.find((i) => i.name === name);
        if (!item) return prev;
        setFavorites((favs) =>
          has(favs, name) ? favs : [item, ...favs],
        );
        toast.success("Moved to Favorites", { description: name });
        return prev.filter((i) => i.name !== name);
      });
    }, []);
  
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
        moveWishlistToFavorites,
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
        moveWishlistToFavorites,
      ],
    );
  
    return (
      <FavoritesContext.Provider value={value}>
        {children}
      </FavoritesContext.Provider>
    );
  };
  
  export const useFavorites = () => {
    const c = useContext(FavoritesContext);
    if (!c)
      throw new Error("useFavorites must be used within FavoritesProvider");
    return c;
  };
  