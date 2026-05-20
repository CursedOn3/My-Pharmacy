import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  FileText,
  Boxes,
  BadgePercent,
  Stethoscope,
  CalendarCheck,
  Users,
  Image,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const QUICK_ACTIONS = [
  {
    to: "/admin/orders",
    icon: Package,
    label: "Manage Orders",
    desc: "View & update order statuses",
    bg: "bg-sun",
  },
  {
    to: "/admin/prescriptions",
    icon: FileText,
    label: "Prescriptions",
    desc: "Review uploads",
    bg: "bg-peach",
  },
  {
    to: "/admin/inventory",
    icon: Boxes,
    label: "Inventory",
    desc: "Add & edit products",
    bg: "bg-cream",
  },
  {
    to: "/admin/banners",
    icon: Image,
    label: "Banners",
    desc: "Change banner info & images",
    bg: "bg-lavender",
  },
  {
    to: "/admin/marketing",
    icon: BadgePercent,
    label: "Discounts & Banners",
    desc: "Promotions & marketing",
    bg: "bg-rose",
  },
  {
    to: "/admin/customers",
    icon: Users,
    label: "Customers",
    desc: "View customer activity",
    bg: "bg-mint",
  },
  {
    to: "/admin/services",
    icon: Stethoscope,
    label: "Health Services",
    desc: "Manage bookings & staff",
    bg: "bg-lavender",
  },
  {
    to: "/admin/bookings",
    icon: CalendarCheck,
    label: "Service Bookings",
    desc: "View & manage service orders",
    bg: "bg-sun",
  }
] as const;

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
          Quick actions
        </span>
        <h2 className="font-display text-2xl font-extrabold text-primary-deep">
          What would you like to do?
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-soft transition-shadow group"
          >
            <div
              className={`h-11 w-11 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
            >
              <action.icon className="h-5 w-5 text-primary-deep" />
            </div>
            <h3 className="font-display font-extrabold text-primary-deep text-base">
              {action.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {action.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
