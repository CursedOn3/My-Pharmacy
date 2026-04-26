import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type OrderStatus } from "@/context/StoreContext";
import {
  Package,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
  head: () => ({
    meta: [{ title: "Orders — Admin" }],
  }),
});

const STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusColor = (s: OrderStatus) => {
  switch (s) {
    case "Pending":
      return "bg-peach text-primary-deep";
    case "Processing":
      return "bg-sun text-primary-deep";
    case "Shipped":
      return "bg-mint text-primary-deep";
    case "Delivered":
      return "bg-primary-deep text-primary-deep-foreground";
    case "Cancelled":
      return "bg-destructive/15 text-destructive";
  }
};

function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "All" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((s, o) => s + o.total, 0);
    const pending = orders.filter(
      (o) => o.status === "Pending" || o.status === "Processing",
    ).length;
    const today = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === new Date().toDateString(),
    ).length;
    return { total, revenue, pending, today };
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Package} label="Total orders" value={String(stats.total)} bg="bg-mint" />
        <Stat icon={Calendar} label="Today" value={String(stats.today)} bg="bg-sun" />
        <Stat icon={TrendingUp} label="Pending / processing" value={String(stats.pending)} bg="bg-peach" />
        <Stat
          icon={DollarSign}
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          bg="bg-rose"
        />
      </div>

      <div className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-primary-deep">
            All orders
          </h2>
          <div className="flex items-center bg-muted rounded-full px-3 py-2 gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 80))}
              placeholder="Search order, customer, email…"
              className="bg-transparent flex-1 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["All", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === s
                  ? "bg-primary-deep text-primary-deep-foreground"
                  : "bg-muted text-primary-deep hover:bg-mint"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No orders to show"
            desc="Orders placed from the storefront will appear here."
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold">Order</th>
                  <th className="text-left py-2 px-2 font-semibold">Customer</th>
                  <th className="text-left py-2 px-2 font-semibold">Date</th>
                  <th className="text-left py-2 px-2 font-semibold">Items</th>
                  <th className="text-left py-2 px-2 font-semibold">Total</th>
                  <th className="text-left py-2 px-2 font-semibold">Status</th>
                  <th className="text-right py-2 px-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => (
                  <>
                    <tr
                      key={o.id}
                      className="hover:bg-muted/40 cursor-pointer"
                      onClick={() =>
                        setExpanded((e) => (e === o.id ? null : o.id))
                      }
                    >
                      <td className="py-3 px-2 font-semibold text-primary-deep">
                        {o.id}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-primary-deep font-medium">
                          {o.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {o.customerEmail}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-primary-deep">
                        {o.lines.reduce((s, l) => s + l.qty, 0)}
                      </td>
                      <td className="py-3 px-2 font-bold text-primary-deep">
                        ${o.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(
                            o.status,
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td
                        className="py-3 px-2 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block">
                          <select
                            value={o.status}
                            onChange={async (e) => {
                              try {
                                await updateOrderStatus(
                                  o.id,
                                  e.target.value as OrderStatus,
                                );
                                toast.success(`${o.id} → ${e.target.value}`);
                              } catch (err) {
                                toast.error("Failed to update order");
                              }
                            }}
                            className="appearance-none bg-muted text-primary-deep text-xs font-semibold rounded-full pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:bg-mint"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-primary-deep" />
                        </div>
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr key={`${o.id}-detail`} className="bg-cream/40">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
                              Items
                            </div>
                            <div className="space-y-2">
                              {o.lines.map((l) => (
                                <div
                                  key={l.productId}
                                  className="flex items-center gap-3 bg-background rounded-xl p-2 border border-border"
                                >
                                  <img
                                    src={l.image}
                                    alt={l.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-primary-deep truncate">
                                      {l.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      ${l.unitPrice.toFixed(2)} × {l.qty}
                                    </div>
                                  </div>
                                  <div className="text-sm font-bold text-primary-deep">
                                    ${(l.unitPrice * l.qty).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end text-xs text-muted-foreground gap-6 pt-2">
                              <span>
                                Subtotal:{" "}
                                <span className="font-semibold text-primary-deep">
                                  ${o.subtotal.toFixed(2)}
                                </span>
                              </span>
                              <span>
                                Shipping:{" "}
                                <span className="font-semibold text-primary-deep">
                                  ${o.shipping.toFixed(2)}
                                </span>
                              </span>
                              <span>
                                Total:{" "}
                                <span className="font-bold text-primary-deep">
                                  ${o.total.toFixed(2)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 space-y-2`}>
      <div className="h-9 w-9 rounded-xl bg-background/70 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary-deep" />
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
        {label}
      </div>
      <div className="font-display text-2xl font-extrabold text-primary-deep">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-cream rounded-2xl p-10 text-center">
      <p className="font-display text-lg font-extrabold text-primary-deep">
        {title}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
