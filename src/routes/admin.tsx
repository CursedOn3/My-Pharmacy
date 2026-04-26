import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/pharmacy/Header";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Boxes,
  BadgePercent,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — Medicare" },
      { name: "description", content: "Administer the Medicare pharmacy." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const NAV = [
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/prescriptions", label: "Prescriptions", icon: FileText },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/marketing", label: "Discounts & banners", icon: BadgePercent },
] as const;

function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <AdminBlocked reason="signin" />;
  }
  if (user.role !== "admin") {
    return <AdminBlocked reason="role" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
              Admin console
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
              Manage MediBuddy
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-mint text-primary-deep px-3 py-2 rounded-full hover:bg-primary transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {NAV.map((n) => {
            const active = location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary-deep text-primary-deep-foreground"
                    : "bg-muted text-primary-deep hover:bg-mint"
                }`}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}

function AdminBlocked({ reason }: { reason: "signin" | "role" }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-soft space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-peach flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-primary-deep" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-primary-deep">
            {reason === "signin" ? "Admin sign-in required" : "Admins only"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {reason === "signin"
              ? "You need to sign in with an admin account to view this page."
              : "Your account doesn't have admin privileges. Sign in with an admin email to continue."}
          </p>
          <div className="text-xs text-primary-deep/70 bg-mint rounded-xl p-3">
            <span className="font-semibold">Demo tip:</span> sign in with any
            email containing the word{" "}
            <span className="font-mono bg-background px-1.5 py-0.5 rounded">
              admin
            </span>{" "}
            (e.g. <span className="font-mono">admin@medicare.app</span>).
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.01] transition-transform"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
