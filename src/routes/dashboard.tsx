import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  Package,
  FileText,
  Heart,
  CreditCard,
  Users,
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Medicare" },
      { name: "description", content: "Manage your orders, prescriptions and account." },
    ],
  }),
});

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
              {user.role === "admin" ? "Admin Dashboard" : "Welcome back"}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
              Hello, {user.name} 👋
            </h1>
          </div>
          <div className="bg-mint px-4 py-2 rounded-full text-xs font-bold uppercase text-primary-deep">
            {user.role}
          </div>
        </header>

        {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------- USER ---------------------------------- */

const recentOrders = [
  { id: "MED-10238", date: "Apr 18, 2026", items: 3, total: "$42.97", status: "Delivered" },
  { id: "MED-10219", date: "Apr 09, 2026", items: 1, total: "$8.49", status: "Delivered" },
  { id: "MED-10204", date: "Mar 30, 2026", items: 5, total: "$67.45", status: "Delivered" },
];

const prescriptions = [
  { id: "RX-2204", uploaded: "Apr 19, 2026", status: "Approved", note: "Refill ready" },
  { id: "RX-2187", uploaded: "Apr 02, 2026", status: "Pending", note: "Awaiting pharmacist" },
];

function UserDashboard() {
  const { count, subtotal } = useCart();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Active orders" value="1" bg="bg-mint" />
        <StatCard icon={FileText} label="Prescriptions" value={String(prescriptions.length)} bg="bg-sun" />
        <StatCard icon={ShoppingBag} label="Cart items" value={String(count)} bg="bg-peach" />
        <StatCard icon={CreditCard} label="Cart value" value={`$${subtotal.toFixed(2)}`} bg="bg-rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent orders" cta={<Link to="/orders" className="text-xs font-bold text-primary-deep">View all →</Link>} />
          <div className="divide-y divide-border">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-mint flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep">{o.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.date} · {o.items} item{o.items === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary-deep">{o.total}</span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase bg-mint text-primary-deep px-2 py-1 rounded-full">
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Prescriptions" cta={<Link to="/prescription" className="text-xs font-bold text-primary-deep">Upload →</Link>} />
          <div className="space-y-2">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="rounded-xl border border-border p-3 flex items-start gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-sun flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep">{rx.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {rx.uploaded} · {rx.note}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    rx.status === "Approved"
                      ? "bg-mint text-primary-deep"
                      : "bg-peach text-primary-deep"
                  }`}
                >
                  {rx.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Quick actions" />
          <div className="grid sm:grid-cols-3 gap-3">
            <QuickAction to="/prescription" icon={FileText} label="Upload prescription" desc="Send a new Rx" bg="bg-mint" />
            <QuickAction to="/cart" icon={ShoppingBag} label="View cart" desc="Continue checkout" bg="bg-sun" />
            <QuickAction to="/reorder-favorites" icon={Heart} label="Reorder favorites" desc="Buy again in 1 click" bg="bg-peach" />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------- ADMIN --------------------------------- */

const adminOrders = [
  { id: "MED-10301", customer: "Sara M.", total: "$54.20", status: "Pending", time: "5 min ago" },
  { id: "MED-10300", customer: "Liam K.", total: "$22.99", status: "Processing", time: "12 min ago" },
  { id: "MED-10299", customer: "Priya R.", total: "$132.45", status: "Shipped", time: "32 min ago" },
  { id: "MED-10298", customer: "Marcus T.", total: "$8.49", status: "Delivered", time: "1 hr ago" },
];

const pendingRx = [
  { id: "RX-3402", customer: "Elena V.", uploaded: "Today, 09:14", urgent: true },
  { id: "RX-3401", customer: "Hassan B.", uploaded: "Today, 08:47", urgent: false },
  { id: "RX-3400", customer: "Mia C.", uploaded: "Yesterday", urgent: false },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Revenue today" value="$3,420" bg="bg-mint" />
        <StatCard icon={Package} label="Orders today" value="68" bg="bg-sun" />
        <StatCard icon={FileText} label="Pending Rx" value="12" bg="bg-peach" />
        <StatCard icon={Users} label="Customers" value="2,189" bg="bg-rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            cta={<span className="text-xs font-bold text-primary-deep">Manage →</span>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2 font-semibold">Order</th>
                  <th className="text-left py-2 font-semibold">Customer</th>
                  <th className="text-left py-2 font-semibold">Total</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                  <th className="text-right py-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adminOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-semibold text-primary-deep">{o.id}</td>
                    <td className="py-3 text-primary-deep/80">{o.customer}</td>
                    <td className="py-3 font-bold text-primary-deep">{o.total}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground text-right">
                      {o.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Prescriptions queue" />
          <div className="space-y-2">
            {pendingRx.map((rx) => (
              <div
                key={rx.id}
                className="rounded-xl border border-border p-3 flex items-start gap-3"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    rx.urgent ? "bg-destructive/15" : "bg-sun"
                  }`}
                >
                  {rx.urgent ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Clock className="h-4 w-4 text-primary-deep" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep">{rx.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {rx.customer} · {rx.uploaded}
                  </p>
                </div>
                <button className="p-1.5 rounded-full hover:bg-muted" aria-label="Review">
                  <Eye className="h-4 w-4 text-primary-deep" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Quick admin actions" />
          <div className="grid sm:grid-cols-4 gap-3">
            <QuickAction to="/admin/orders" icon={Package} label="All orders" desc="Manage shipments" bg="bg-mint" />
            <QuickAction to="/admin/prescriptions" icon={FileText} label="Review Rx" desc="Approve / reject" bg="bg-sun" />
            <QuickAction to="/admin/customers" icon={Users} label="Customers" desc="Manage accounts" bg="bg-peach" />
            <QuickAction to="/admin/inventory" icon={CheckCircle2} label="Inventory" desc="Stock & catalog" bg="bg-rose" />
          </div>
        </Card>
      </div>
    </div>
  );
}

const statusColor = (s: string) => {
  switch (s) {
    case "Pending":
      return "bg-peach text-primary-deep";
    case "Processing":
      return "bg-sun text-primary-deep";
    case "Shipped":
      return "bg-mint text-primary-deep";
    default:
      return "bg-cream text-primary-deep";
  }
};

/* --------------------------- shared bits ------------------------------- */

function StatCard({
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
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
          {label}
        </div>
        <div className="font-display text-2xl font-extrabold text-primary-deep">{value}</div>
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-3xl p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  cta,
}: {
  title: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-lg font-extrabold text-primary-deep">{title}</h2>
      {cta}
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  desc,
  bg,
}: {
  to:
    | "/orders"
    | "/cart"
    | "/prescription"
    | "/reorder-favorites"
    | "/admin/orders"
    | "/admin/prescriptions"
    | "/admin/customers"
    | "/admin/inventory";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  bg: string;
}) {
  return (
    <Link
      to={to}
      className={`${bg} rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform`}
    >
      <div className="h-10 w-10 rounded-xl bg-background/70 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary-deep" />
      </div>
      <div className="min-w-0">
        <div className="font-display font-extrabold text-primary-deep text-sm">{label}</div>
        <div className="text-xs text-primary-deep/70">{desc}</div>
      </div>
    </Link>
  );
}
