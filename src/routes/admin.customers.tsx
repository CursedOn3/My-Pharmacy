import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Users, Search, Mail, ShoppingBag, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
  head: () => ({
    meta: [{ title: "Customers — Admin" }],
  }),
});

function AdminCustomersPage() {
  const { customers, orders } = useStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const totals = useMemo(() => {
    const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
    return {
      count: customers.length,
      totalSpent,
      avgOrderValue:
        orders.length === 0
          ? 0
          : orders.reduce((s, o) => s + o.total, 0) / orders.length,
    };
  }, [customers, orders]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat
          icon={Users}
          label="Customers"
          value={String(totals.count)}
          bg="bg-mint"
        />
        <Stat
          icon={DollarSign}
          label="Total spent (all-time)"
          value={`$${totals.totalSpent.toFixed(2)}`}
          bg="bg-sun"
        />
        <Stat
          icon={ShoppingBag}
          label="Average order"
          value={`$${totals.avgOrderValue.toFixed(2)}`}
          bg="bg-peach"
        />
      </div>

      <div className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-lg font-extrabold text-primary-deep">
            All customers
          </h2>
          <div className="flex items-center bg-muted rounded-full px-3 py-2 gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 80))}
              placeholder="Search by name or email…"
              className="bg-transparent flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-cream rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-extrabold text-primary-deep">
              No customers yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Customers are created automatically when an order is placed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold">Customer</th>
                  <th className="text-left py-2 px-2 font-semibold">Email</th>
                  <th className="text-left py-2 px-2 font-semibold">Joined</th>
                  <th className="text-left py-2 px-2 font-semibold">Orders</th>
                  <th className="text-left py-2 px-2 font-semibold">Spent</th>
                  <th className="text-left py-2 px-2 font-semibold">
                    Last order
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.email} className="hover:bg-muted/40">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-mint flex items-center justify-center font-display font-extrabold text-primary-deep">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="font-semibold text-primary-deep">
                          {c.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {c.email}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {new Date(c.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-primary-deep font-semibold">
                      {c.totalOrders}
                    </td>
                    <td className="py-3 px-2 font-bold text-primary-deep">
                      ${c.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {c.lastOrderAt
                        ? new Date(c.lastOrderAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
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
