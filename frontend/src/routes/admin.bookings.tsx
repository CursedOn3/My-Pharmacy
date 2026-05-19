import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Phone,
  Mail,
  Home,
  Building2,
  Clock,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { api, type ServiceDto, type BookingDto } from "@/lib/api";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookingsPage,
  head: () => ({
    meta: [{ title: "Service Bookings — Admin" }],
  }),
});

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [bkData, svcData] = await Promise.all([
          api.adminListBookings(),
          api.adminListServices(),
        ]);
        if (!active) return;
        setBookings(bkData);
        setServices(svcData);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const serviceMap = new Map(services.map((s) => [s.id, s]));

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (typeFilter !== "all") {
      const svc = serviceMap.get(b.service_id);
      if (svc && svc.type !== typeFilter) return false;
    }
    return true;
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-peach text-primary-deep";
      case "confirmed":
        return "bg-sun text-primary-deep";
      case "completed":
        return "bg-mint text-primary-deep";
      case "cancelled":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-primary-deep";
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const prev = bookings.find((b) => b.id === id);
    if (!prev || prev.status === status) return;

    setBookings((old) =>
      old.map((b) => (b.id === id ? { ...b, status: status as BookingDto["status"] } : b))
    );
    try {
      const updated = await api.adminUpdateBooking(id, status);
      setBookings((old) => old.map((b) => (b.id === id ? updated : b)));
      toast.success("Booking status updated");
    } catch {
      setBookings((old) => old.map((b) => (b.id === id ? prev : b)));
      toast.error("Failed to update booking");
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
          Service orders
        </span>
        <h2 className="font-display text-2xl font-extrabold text-primary-deep">
          Customer bookings
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and manage all lab test and physiotherapy bookings placed by customers.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={bookings.length} bg="bg-cream" />
        <StatCard label="Pending" value={pendingCount} bg="bg-peach" />
        <StatCard label="Confirmed" value={confirmedCount} bg="bg-sun" />
        <StatCard label="Completed" value={completedCount} bg="bg-mint" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-primary-deep/60" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-muted text-primary-deep text-xs font-semibold rounded-full px-3 py-2 outline-none"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-muted text-primary-deep text-xs font-semibold rounded-full px-3 py-2 outline-none"
        >
          <option value="all">All types</option>
          <option value="lab">Lab tests</option>
          <option value="physiotherapy">Physiotherapy</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream rounded-3xl p-10 text-center">
          <Calendar className="h-10 w-10 mx-auto text-primary-deep/40 mb-3" />
          <p className="font-display text-lg font-extrabold text-primary-deep">
            No bookings found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters."
              : "Bookings will appear here when customers place service orders."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const svc = serviceMap.get(b.service_id);
            return (
              <div
                key={b.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-extrabold text-primary-deep text-base">
                        {svc?.name ?? "Unknown service"}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(b.status)}`}
                      >
                        {b.status}
                      </span>
                      {svc && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-primary-deep/70">
                          {svc.type === "lab" ? "Lab" : "Physio"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary-deep">
                        {b.customer_name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {b.customer_email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {b.customer_phone}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-deep/70">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3" /> {b.preferred_date}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Clock className="h-3 w-3" /> {b.preferred_time}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        {b.visit_type === "home" ? (
                          <Home className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {b.visit_type === "home" ? "Home visit" : "Clinic visit"}
                      </span>
                      {svc && (
                        <span className="font-semibold">NPR {svc.price}</span>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2 mt-1">
                        <span className="font-semibold text-primary-deep">Note:</span>{" "}
                        {b.notes}
                      </p>
                    )}
                  </div>

                  <div className="relative shrink-0">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="appearance-none bg-muted text-primary-deep text-xs font-semibold rounded-full pl-3 pr-7 py-2 outline-none cursor-pointer hover:bg-mint transition-colors"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-deep" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  bg,
}: {
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
        {label}
      </div>
      <div className="font-display text-2xl font-extrabold text-primary-deep mt-1">
        {value}
      </div>
    </div>
  );
}
