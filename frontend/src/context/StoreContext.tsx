import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ALL, type Product } from "@/lib/products";

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

  // inventory
  addProduct: (p: Omit<InventoryItem, "id">) => InventoryItem;
  updateProduct: (id: string, patch: Partial<InventoryItem>) => void;
  deleteProduct: (id: string) => void;
  getStock: (idOrName: string) => number;

  // orders / customers
  createOrder: (input: {
    customerEmail: string;
    customerName: string;
    lines: { productName: string; qty: number }[];
    shipping: number;
  }) => Order | null;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // prescriptions
  addPrescription: (
    p: Omit<Prescription, "id" | "uploadedAt" | "status">,
  ) => Prescription;
  updatePrescription: (
    id: string,
    patch: Partial<Pick<Prescription, "status" | "reviewerNote">>,
  ) => void;
};

const StoreContext = createContext<StoreCtx | null>(null);

/* =============================== HELPERS =============================== */

const STORAGE = {
  inventory: "medicare.inventory.v1",
  orders: "medicare.orders.v1",
  customers: "medicare.customers.v1",
  prescriptions: "medicare.prescriptions.v1",
};

const parsePrice = (price: string) =>
  Number(String(price).replace(/[^0-9.]/g, "")) || 0;

const slugId = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
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

/** Seed inventory from the static product catalog (one entry per unique name). */
const seedInventory = (): InventoryItem[] => {
  const seen = new Set<string>();
  const items: InventoryItem[] = [];
  for (const p of ALL) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    items.push({
      ...p,
      id: slugId(p.name),
      stock: 25,
      description:
        p.description ??
        "Pharmacist-approved formula, manufactured in certified facilities.",
    });
  }
  return items;
};

/* ============================== PROVIDER =============================== */

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Hydrate from localStorage on mount (browser only)
  useEffect(() => {
    const inv = safeRead<InventoryItem[]>(STORAGE.inventory, []);
    setInventory(inv.length > 0 ? inv : seedInventory());
    setOrders(safeRead<Order[]>(STORAGE.orders, []));
    setCustomers(safeRead<Customer[]>(STORAGE.customers, []));
    setPrescriptions(safeRead<Prescription[]>(STORAGE.prescriptions, []));
  }, []);

  // Persist
  useEffect(() => {
    if (inventory.length) safeWrite(STORAGE.inventory, inventory);
  }, [inventory]);
  useEffect(() => {
    safeWrite(STORAGE.orders, orders);
  }, [orders]);
  useEffect(() => {
    safeWrite(STORAGE.customers, customers);
  }, [customers]);
  useEffect(() => {
    safeWrite(STORAGE.prescriptions, prescriptions);
  }, [prescriptions]);

  /* ----------------------------- inventory ---------------------------- */

  const addProduct: StoreCtx["addProduct"] = useCallback((p) => {
    const item: InventoryItem = {
      ...p,
      id: newId("prd"),
    };
    setInventory((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateProduct: StoreCtx["updateProduct"] = useCallback((id, patch) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }, []);

  const deleteProduct: StoreCtx["deleteProduct"] = useCallback((id) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const getStock: StoreCtx["getStock"] = useCallback(
    (idOrName) => {
      const item =
        inventory.find((i) => i.id === idOrName) ??
        inventory.find((i) => i.name === idOrName);
      return item?.stock ?? 0;
    },
    [inventory],
  );

  /* ------------------------------ orders ------------------------------ */

  const upsertCustomer = useCallback(
    (email: string, name: string, orderTotal: number, when: string) => {
      setCustomers((prev) => {
        const existing = prev.find((c) => c.email === email);
        if (existing) {
          return prev.map((c) =>
            c.email === email
              ? {
                  ...c,
                  name: name || c.name,
                  totalOrders: c.totalOrders + 1,
                  totalSpent: c.totalSpent + orderTotal,
                  lastOrderAt: when,
                }
              : c,
          );
        }
        return [
          {
            email,
            name: name || email.split("@")[0],
            joinedAt: when,
            totalOrders: 1,
            totalSpent: orderTotal,
            lastOrderAt: when,
          },
          ...prev,
        ];
      });
    },
    [],
  );

  const createOrder: StoreCtx["createOrder"] = useCallback(
    ({ customerEmail, customerName, lines, shipping }) => {
      // Resolve lines against current inventory + check stock
      const resolved: OrderLine[] = [];
      const stockUpdates: { id: string; newStock: number }[] = [];

      for (const l of lines) {
        const item = inventory.find((i) => i.name === l.productName);
        if (!item) return null;
        if (item.stock < l.qty) return null;
        resolved.push({
          productId: item.id,
          name: item.name,
          image: item.image,
          qty: l.qty,
          unitPrice: parsePrice(item.price),
        });
        stockUpdates.push({ id: item.id, newStock: item.stock - l.qty });
      }

      const subtotal = resolved.reduce((s, l) => s + l.unitPrice * l.qty, 0);
      const total = subtotal + shipping;
      const when = new Date().toISOString();
      const order: Order = {
        id: `MED-${Math.floor(10000 + Math.random() * 90000)}`,
        customerEmail,
        customerName,
        lines: resolved,
        subtotal,
        shipping,
        total,
        status: "Pending",
        createdAt: when,
      };

      // Apply stock decrement
      setInventory((prev) =>
        prev.map((i) => {
          const u = stockUpdates.find((x) => x.id === i.id);
          return u ? { ...i, stock: u.newStock } : i;
        }),
      );
      setOrders((prev) => [order, ...prev]);
      upsertCustomer(customerEmail, customerName, total, when);
      return order;
    },
    [inventory, upsertCustomer],
  );

  const updateOrderStatus: StoreCtx["updateOrderStatus"] = useCallback(
    (id, status) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    [],
  );

  /* --------------------------- prescriptions -------------------------- */

  const addPrescription: StoreCtx["addPrescription"] = useCallback((p) => {
    const rx: Prescription = {
      ...p,
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      uploadedAt: new Date().toISOString(),
      status: "Pending",
    };
    setPrescriptions((prev) => [rx, ...prev]);
    return rx;
  }, []);

  const updatePrescription: StoreCtx["updatePrescription"] = useCallback(
    (id, patch) => {
      setPrescriptions((prev) =>
        prev.map((rx) =>
          rx.id === id
            ? {
                ...rx,
                ...patch,
                reviewedAt: new Date().toISOString(),
              }
            : rx,
        ),
      );
    },
    [],
  );

  const value = useMemo<StoreCtx>(
    () => ({
      inventory,
      orders,
      customers,
      prescriptions,
      addProduct,
      updateProduct,
      deleteProduct,
      getStock,
      createOrder,
      updateOrderStatus,
      addPrescription,
      updatePrescription,
    }),
    [
      inventory,
      orders,
      customers,
      prescriptions,
      addProduct,
      updateProduct,
      deleteProduct,
      getStock,
      createOrder,
      updateOrderStatus,
      addPrescription,
      updatePrescription,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
};
