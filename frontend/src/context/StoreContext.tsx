import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ALL, CATEGORIES, type Product } from "@/lib/products";
import { api, type OrderDto, type PrescriptionDto, type ProductDto } from "@/lib/api";
import { parsePrice, toPrice } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

/* ================================ TYPES ================================ */

export type InventoryItem = Product & { id: string; stock: number };

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type OrderLine = {
  productId: string;
  name: string;
  image: string;
  qty: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  customerEmail: string;
  customerName: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "esewa" | "cod" | null;
  paymentStatus: "paid" | "pending" | "cod" | null;
  createdAt: string; // ISO
};

export type Customer = {
  email: string;
  name: string;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
};

export type PrescriptionStatus = "Pending" | "Approved" | "Rejected";

export type Prescription = {
  id: string;
  customerEmail: string;
  customerName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string | null; // object URL — only available current session
  note?: string;
  status: PrescriptionStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
};

/* =============================== CONTEXT =============================== */

type StoreCtx = {
  inventory: InventoryItem[];
  inventoryByName: Map<string, InventoryItem>;
  orders: Order[];
  customers: Customer[];
  prescriptions: Prescription[];
  loading: boolean;
  refreshOrders: () => Promise<void>;

  // inventory
  addProduct: (p: Omit<InventoryItem, "id">) => Promise<InventoryItem>;
  updateProduct: (id: string, patch: Partial<InventoryItem>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getStock: (idOrName: string) => number;

  // orders / customers
  createOrder: (input: {
    customerEmail: string;
    customerName: string;
    lines: { productName: string; qty: number }[];
    shipping: number;
    paymentMethod?: "esewa" | "cod";
  }) => Promise<Order | null>;
  cancelOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;

  // prescriptions
  addPrescription: (p: Prescription) => void;
  updatePrescription: (
    id: string,
    patch: Partial<Pick<Prescription, "status" | "reviewerNote">>,
  ) => Promise<void>;
};

const StoreContext = createContext<StoreCtx | null>(null);

/* =============================== HELPERS =============================== */

const mapCategorySlug = (slug: string | null) => {
  if (!slug) return "General";
  const match = CATEGORIES.find((c) => c.slug === slug);
  return match?.name ?? slug.replace(/-/g, " ");
};

const fromDto = (dto: ProductDto): InventoryItem => {
  const fallback = ALL.find((p) => p.name === dto.name);
  return {
    id: dto.id,
    name: dto.name,
    brand: fallback?.brand ?? "Generic",
    category: fallback?.category ?? mapCategorySlug(dto.category_slug),
    price: toPrice(dto.price),
    oldPrice: fallback?.oldPrice,
    discount: fallback?.discount,
    image: dto.image_url ?? fallback?.image ?? "",
    rating: fallback?.rating,
    description:
      fallback?.description ??
      "Pharmacist-approved formula, manufactured in certified facilities.",
    stock: dto.stock
  };
};

/**
 * Safely maps a raw DB status string to a typed OrderStatus.
 * Unknown values fall back to "Pending".
 */
const toOrderStatus = (raw: string): OrderStatus => {
  const map: Record<string, OrderStatus> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[raw?.toLowerCase()] ?? "Pending";
};

/**
 * Safely maps a raw DB status string to a typed PrescriptionStatus.
 * Unknown values fall back to "Pending".
 */
const toPrescriptionStatus = (raw: string): PrescriptionStatus => {
  const map: Record<string, PrescriptionStatus> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return map[raw?.toLowerCase()] ?? "Pending";
};

/* ============================== PROVIDER =============================== */

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const inventoryById = useMemo(
    () => new Map(inventory.map((i) => [i.id, i])),
    [inventory]
  );

  const inventoryByName = useMemo(
    () => new Map(inventory.map((i) => [i.name, i])),
    [inventory]
  );

  const inventoryByIdRef = useRef(inventoryById);
  inventoryByIdRef.current = inventoryById;

  const mapOrder = useCallback(
    (dto: OrderDto): Order => {
      const currentInventoryById = inventoryByIdRef.current;
      const lines = dto.items.map((line) => {
        const product = currentInventoryById.get(line.product_id);
        const unitPrice =
          line.unit_price != null && line.unit_price > 0
            ? line.unit_price
            : product
              ? parsePrice(product.price)
              : 0;
        return {
          productId: line.product_id,
          name: product?.name ?? "Unknown item",
          image: product?.image ?? "",
          qty: line.quantity,
          unitPrice
        };
      });
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
      const shipping = dto.shipping ?? 0;
      return {
        id: dto.id,
        customerEmail: dto.customer_email,
        customerName: dto.customer_name,
        lines,
        subtotal,
        shipping,
        total: subtotal + shipping,
        status: toOrderStatus(dto.status),
        paymentMethod: dto.payment_method ?? null,
        paymentStatus: dto.payment_status ?? null,
        createdAt: dto.created_at
      };
    },
    []
  );

  const mapPrescription = useCallback((dto: PrescriptionDto): Prescription => {
    return {
      id: dto.id,
      customerEmail: dto.customer_email,
      customerName: dto.customer_name,
      fileName: dto.file_name,
      fileType: dto.file_type,
      fileSize: dto.file_size,
      previewUrl: null,
      note: dto.notes ?? undefined,
      status: toPrescriptionStatus(dto.status),
      uploadedAt: dto.created_at,
      reviewedAt: dto.reviewed_at ?? undefined,
      reviewerNote: dto.reviewer_note ?? undefined
    };
  }, []);

  const loadInventory = useCallback(async () => {
    const [products, discounts] = await Promise.all([
      api.listProducts(),
      api.listActiveDiscounts().catch(() => [] as { product_id: string; percent: number }[])
    ]);
    const discountMap = new Map(discounts.map((d) => [d.product_id, d.percent]));
    setInventory(
      products.map((dto) => {
        const item = fromDto(dto);
        const pct = discountMap.get(dto.id);
        if (pct && pct > 0) {
          const originalPrice = parsePrice(item.price);
          const discountedPrice = originalPrice * (1 - pct / 100);
          return {
            ...item,
            oldPrice: item.price,
            price: toPrice(discountedPrice),
            discount: `${pct}%`
          };
        }
        return item;
      })
    );
  }, []);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    const data = user.role === "admin" ? await api.adminListOrders() : await api.listOrders();
    setOrders(data.map(mapOrder));
  }, [mapOrder, user]);

  const loadPrescriptions = useCallback(async () => {
    if (!user) {
      setPrescriptions([]);
      return;
    }
    const data =
      user.role === "admin"
        ? await api.adminListPrescriptions()
        : await api.listPrescriptions();
    setPrescriptions(data.map(mapPrescription));
  }, [mapPrescription, user]);

  // Initial load — all three fetches run in parallel
  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      try {
        await Promise.all([loadInventory(), loadOrders(), loadPrescriptions()]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, [loadInventory, loadOrders, loadPrescriptions]);

  // Refetch inventory on window focus for all users (picks up stock changes)
  useEffect(() => {
    const onFocus = () => void loadInventory();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadInventory]);

  // Admin polling — debounced with a 500 ms guard and proper cleanup
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPollRef = useRef(false);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const debouncedLoad = () => {
      if (pendingPollRef.current) return;
      pendingPollRef.current = true;
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = setTimeout(() => {
        pendingPollRef.current = false;
        void Promise.all([loadOrders(), loadInventory()]);
      }, 500);
    };

    const intervalId = window.setInterval(debouncedLoad, 30_000);

    window.addEventListener("focus", debouncedLoad);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) debouncedLoad();
    });

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", debouncedLoad);
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, [loadOrders, loadInventory, user]);

  /* ----------------------------- inventory ---------------------------- */

  const addProduct: StoreCtx["addProduct"] = useCallback(async (p) => {
    const price = parsePrice(p.price);
    const created = await api.adminCreateProduct({
      name: p.name,
      price,
      image_url: p.image,
      category_slug: p.category?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      stock: p.stock
    });
    const mapped = fromDto(created);
    setInventory((prev) => [mapped, ...prev]);
    return mapped;
  }, []);

  const updateProduct: StoreCtx["updateProduct"] = useCallback(
    async (id, patch) => {
      await api.adminUpdateProduct(id, {
        name: patch.name,
        price: patch.price ? parsePrice(patch.price) : undefined,
        image_url: patch.image,
        category_slug: patch.category
          ? patch.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : undefined,
        stock: patch.stock
      });
      setInventory((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      );
    },
    []
  );

  const deleteProduct: StoreCtx["deleteProduct"] = useCallback(async (id) => {
    await api.adminDeleteProduct(id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // O(1) lookup using the memoised Maps instead of linear array scans
  const getStock: StoreCtx["getStock"] = useCallback(
    (idOrName) => {
      const item = inventoryById.get(idOrName) ?? inventoryByName.get(idOrName);
      return item?.stock ?? 0;
    },
    [inventoryById, inventoryByName]
  );

  /* ------------------------------ orders ------------------------------ */

  const createOrder: StoreCtx["createOrder"] = useCallback(
    async ({ customerEmail, customerName, lines, shipping, paymentMethod }) => {
      const resolved: OrderLine[] = [];
      const payload: { product_id: string; quantity: number }[] = [];

      for (const l of lines) {
        const item = inventoryByName.get(l.productName);
        if (!item) return null;
        if (item.stock < l.qty) return null;
        resolved.push({
          productId: item.id,
          name: item.name,
          image: item.image,
          qty: l.qty,
          unitPrice: parsePrice(item.price)
        });
        payload.push({ product_id: item.id, quantity: l.qty });
      }

      const dto = await api.createOrder({
        items: payload,
        notes: "",
        customer_email: customerEmail,
        customer_name: customerName,
        payment_method: paymentMethod ?? "cod",
        shipping,
      });

      const order = mapOrder(dto);
      const total = order.subtotal + shipping;
      const nextOrder = { ...order, shipping, total };

      setOrders((prev) => [nextOrder, ...prev]);
      setInventory((prev) =>
        prev.map((i) => {
          const line = resolved.find((l) => l.productId === i.id);
          if (!line) return i;
          return { ...i, stock: Math.max(0, i.stock - line.qty) };
        })
      );
      return nextOrder;
    },
    [inventoryByName, mapOrder]
  );

  const cancelOrder: StoreCtx["cancelOrder"] = useCallback(
    async (id) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "Cancelled" as OrderStatus } : o))
      );
      try {
        await api.cancelOrder(id);
      } catch (err) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: "Pending" as OrderStatus } : o))
        );
        throw err;
      }
    },
    []
  );

  const updateOrderStatus: StoreCtx["updateOrderStatus"] = useCallback(
    async (id, status) => {
      let prevStatus: OrderStatus | null = null;
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === id) {
            prevStatus = o.status;
            return { ...o, status };
          }
          return o;
        })
      );
      try {
        await api.adminUpdateOrder(id, status);
      } catch (err) {
        if (prevStatus !== null) {
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: prevStatus! } : o))
          );
        }
        throw err;
      }
    },
    []
  );

  /* --------------------------- prescriptions -------------------------- */

  const addPrescription: StoreCtx["addPrescription"] = useCallback((p) => {
    setPrescriptions((prev) => [p, ...prev]);
  }, []);

  const updatePrescription: StoreCtx["updatePrescription"] = useCallback(
    async (id, patch) => {
      if (!patch.status) {
        throw new Error("updatePrescription requires an explicit status");
      }
      const reviewedAt = new Date().toISOString();
      let snapshot: Prescription | undefined;
      setPrescriptions((prev) =>
        prev.map((rx) => {
          if (rx.id === id) {
            snapshot = rx;
            return { ...rx, ...patch, reviewedAt };
          }
          return rx;
        })
      );
      try {
        await api.adminUpdatePrescription(id, {
          status: patch.status,
          reviewer_note: patch.reviewerNote
        });
      } catch (err) {
        if (snapshot) {
          setPrescriptions((prev) =>
            prev.map((rx) => (rx.id === id ? snapshot! : rx))
          );
        }
        throw err;
      }
    },
    []
  );

  // Pre-compute timestamps once per order/prescription to avoid repeated new Date() in comparisons
  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();

    for (const order of orders) {
      const email = order.customerEmail.toLowerCase();
      const orderTs = new Date(order.createdAt).getTime();
      const existing = map.get(email);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        const joinTs = new Date(existing.joinedAt).getTime();
        if (orderTs < joinTs) existing.joinedAt = order.createdAt;
        const lastTs = existing.lastOrderAt ? new Date(existing.lastOrderAt).getTime() : -Infinity;
        if (orderTs > lastTs) existing.lastOrderAt = order.createdAt;
      } else {
        map.set(email, {
          email: order.customerEmail,
          name: order.customerName || order.customerEmail.split("@")[0],
          joinedAt: order.createdAt,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderAt: order.createdAt
        });
      }
    }

    for (const prescription of prescriptions) {
      const email = prescription.customerEmail.toLowerCase();
      const rxTs = new Date(prescription.uploadedAt).getTime();
      const existing = map.get(email);
      if (existing) {
        const joinTs = new Date(existing.joinedAt).getTime();
        if (rxTs < joinTs) existing.joinedAt = prescription.uploadedAt;
      } else {
        map.set(email, {
          email: prescription.customerEmail,
          name:
            prescription.customerName ||
            prescription.customerEmail.split("@")[0],
          joinedAt: prescription.uploadedAt,
          totalOrders: 0,
          totalSpent: 0
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    );
  }, [orders, prescriptions]);

  const value = useMemo<StoreCtx>(
    () => ({
      inventory,
      inventoryByName,
      orders,
      customers,
      prescriptions,
      loading,
      refreshOrders: loadOrders,
      addProduct,
      updateProduct,
      deleteProduct,
      getStock,
      createOrder,
      cancelOrder,
      updateOrderStatus,
      addPrescription,
      updatePrescription
    }),
    [
      inventory,
      inventoryByName,
      orders,
      customers,
      prescriptions,
      loading,
      loadOrders,
      addProduct,
      updateProduct,
      deleteProduct,
      getStock,
      createOrder,
      cancelOrder,
      updateOrderStatus,
      addPrescription,
      updatePrescription
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
};
