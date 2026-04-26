import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ALL, CATEGORIES, type Product } from "@/lib/products";
import { api, type OrderDto, type PrescriptionDto, type ProductDto } from "@/lib/api";
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
  orders: Order[];
  customers: Customer[];
  prescriptions: Prescription[];
  loading: boolean;

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
  }) => Promise<Order | null>;
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

const parsePrice = (price: string) =>
  Number(String(price).replace(/[^0-9.]/g, "")) || 0;

const toPrice = (value: number) => `$${value.toFixed(2)}`;

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

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

/* ============================== PROVIDER =============================== */

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const inventoryById = useMemo(() => {
    return new Map(inventory.map((i) => [i.id, i]));
  }, [inventory]);

  const inventoryByName = useMemo(() => {
    return new Map(inventory.map((i) => [i.name, i]));
  }, [inventory]);

  const mapOrder = useCallback(
    (dto: OrderDto): Order => {
      const lines = dto.items.map((line) => {
        const product = inventoryById.get(line.product_id);
        return {
          productId: line.product_id,
          name: product?.name ?? "Unknown item",
          image: product?.image ?? "",
          qty: line.quantity,
          unitPrice: product ? parsePrice(product.price) : 0
        };
      });
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
      const shipping = lines.length > 0 ? 4.99 : 0;
      return {
        id: dto.id,
        customerEmail: dto.customer_email,
        customerName: dto.customer_name,
        lines,
        subtotal,
        shipping,
        total: subtotal + shipping,
        status: toTitle(dto.status) as OrderStatus,
        createdAt: dto.created_at
      };
    },
    [inventoryById]
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
      status: toTitle(dto.status) as PrescriptionStatus,
      uploadedAt: dto.created_at,
      reviewedAt: dto.reviewer_note ? new Date().toISOString() : undefined,
      reviewerNote: dto.reviewer_note ?? undefined
    };
  }, []);

  const loadInventory = useCallback(async () => {
    const data = await api.listProducts();
    setInventory(data.map(fromDto));
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

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      try {
        await loadInventory();
        if (active) {
          await Promise.all([loadOrders(), loadPrescriptions()]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, [loadInventory, loadOrders, loadPrescriptions]);

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

  const getStock: StoreCtx["getStock"] = useCallback(
    (idOrName) => {
      const item =
        inventory.find((i) => i.id === idOrName) ??
        inventory.find((i) => i.name === idOrName);
      return item?.stock ?? 0;
    },
    [inventory]
  );

  /* ------------------------------ orders ------------------------------ */

  const createOrder: StoreCtx["createOrder"] = useCallback(
    async ({ customerEmail, customerName, lines, shipping }) => {
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
        customer_name: customerName
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

  const updateOrderStatus: StoreCtx["updateOrderStatus"] = useCallback(
    async (id, status) => {
      await api.adminUpdateOrder(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    []
  );

  /* --------------------------- prescriptions -------------------------- */

  const addPrescription: StoreCtx["addPrescription"] = useCallback((p) => {
    setPrescriptions((prev) => [p, ...prev]);
  }, []);

  const updatePrescription: StoreCtx["updatePrescription"] = useCallback(
    async (id, patch) => {
      await api.adminUpdatePrescription(id, {
        status: patch.status ?? "Pending",
        reviewer_note: patch.reviewerNote
      });
      setPrescriptions((prev) =>
        prev.map((rx) =>
          rx.id === id
            ? {
                ...rx,
                ...patch,
                reviewedAt: new Date().toISOString()
              }
            : rx
        )
      );
    },
    []
  );

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const order of orders) {
      const email = order.customerEmail.toLowerCase();
      const existing = map.get(email);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.total;
        existing.lastOrderAt = order.createdAt;
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
    return Array.from(map.values());
  }, [orders]);

  const value = useMemo<StoreCtx>(
    () => ({
      inventory,
      orders,
      customers,
      prescriptions,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getStock,
      createOrder,
      updateOrderStatus,
      addPrescription,
      updatePrescription
    }),
    [
      inventory,
      orders,
      customers,
      prescriptions,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getStock,
      createOrder,
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
