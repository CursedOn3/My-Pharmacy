import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  TestTube,
  Activity,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { api, type ServiceDto, type BookingDto } from "@/lib/api";

export const Route = createFileRoute("/admin/services")({
  component: AdminServicesPage,
  head: () => ({
    meta: [{ title: "Services & Bookings — Admin" }],
  }),
});

function AdminServicesPage() {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [tab, setTab] = useState<"services" | "bookings">("services");

  const [name, setName] = useState("");
  const [type, setType] = useState<"lab" | "physiotherapy">("lab");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [homeAvailable, setHomeAvailable] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [svcData, bkData] = await Promise.all([
          api.adminListServices(),
          api.adminListBookings(),
        ]);
        if (!active) return;
        setServices(svcData);
        setBookings(bkData);
      } catch {
        toast.error("Failed to load services data");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const addService = async () => {
    if (!name.trim()) {
      toast.error("Service name is required");
      return;
    }
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      const created = await api.adminCreateService({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        price: p,
        duration: duration.trim() || undefined,
        home_available: homeAvailable,
        active: true,
      });
      setServices((prev) => [created, ...prev]);
      setName("");
      setDescription("");
      setPrice("");
      setDuration("");
      toast.success("Service added");
    } catch {
      toast.error("Failed to add service");
    }
  };

  const labServices = services.filter((s) => s.type === "lab");
  const physioServices = services.filter((s) => s.type === "physiotherapy");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={TestTube}
          label="Lab services"
          value={labServices.length}
          bg="bg-mint"
        />
        <Stat
          icon={Activity}
          label="Physio services"
          value={physioServices.length}
          bg="bg-sun"
        />
        <Stat
          icon={Calendar}
          label="Total bookings"
          value={bookings.length}
          bg="bg-peach"
        />
        <Stat
          icon={Calendar}
          label="Pending bookings"
          value={bookings.filter((b) => b.status === "pending").length}
          bg="bg-rose"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("services")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            tab === "services"
              ? "bg-primary-deep text-primary-deep-foreground"
              : "bg-muted text-primary-deep hover:bg-mint"
          }`}
        >
          Manage services
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            tab === "bookings"
              ? "bg-primary-deep text-primary-deep-foreground"
              : "bg-muted text-primary-deep hover:bg-mint"
          }`}
        >
          Bookings
        </button>
      </div>

      {tab === "services" ? (
        <div className="space-y-4">
          <section className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
            <h2 className="font-display text-lg font-extrabold text-primary-deep">
              Add new service
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Service name"
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              />
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "lab" | "physiotherapy")
                }
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="lab">Lab Service</option>
                <option value="physiotherapy">Physiotherapy</option>
              </select>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min={0}
                placeholder="Price (NPR)"
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              />
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (e.g. 45 min)"
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none sm:col-span-2 lg:col-span-1"
              />
              <label className="flex items-center gap-2 text-sm text-primary-deep">
                <input
                  type="checkbox"
                  checked={homeAvailable}
                  onChange={(e) => setHomeAvailable(e.target.checked)}
                  className="rounded"
                />
                Home visit available
              </label>
            </div>
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
            >
              <Plus className="h-3.5 w-3.5" /> Add service
            </button>
          </section>

          <div className="grid lg:grid-cols-2 gap-4">
            <ServiceList
              title="Lab services"
              icon={TestTube}
              services={labServices}
              onToggle={async (id, active) => {
                try {
                  const updated = await api.adminUpdateService(id, { active });
                  setServices((prev) =>
                    prev.map((s) => (s.id === id ? updated : s))
                  );
                } catch {
                  toast.error("Failed to update");
                }
              }}
              onDelete={async (id) => {
                try {
                  await api.adminDeleteService(id);
                  setServices((prev) => prev.filter((s) => s.id !== id));
                } catch {
                  toast.error("Failed to delete");
                }
              }}
            />
            <ServiceList
              title="Physiotherapy services"
              icon={Activity}
              services={physioServices}
              onToggle={async (id, active) => {
                try {
                  const updated = await api.adminUpdateService(id, { active });
                  setServices((prev) =>
                    prev.map((s) => (s.id === id ? updated : s))
                  );
                } catch {
                  toast.error("Failed to update");
                }
              }}
              onDelete={async (id) => {
                try {
                  await api.adminDeleteService(id);
                  setServices((prev) => prev.filter((s) => s.id !== id));
                } catch {
                  toast.error("Failed to delete");
                }
              }}
            />
          </div>
        </div>
      ) : (
        <BookingsTable
          bookings={bookings}
          services={services}
          onStatusChange={async (id, status) => {
            try {
              const updated = await api.adminUpdateBooking(id, status);
              setBookings((prev) =>
                prev.map((b) => (b.id === id ? updated : b))
              );
              toast.success("Booking updated");
            } catch {
              toast.error("Failed to update booking");
            }
          }}
        />
      )}
    </div>
  );
}

function ServiceList({
  title,
  icon: Icon,
  services,
  onToggle,
  onDelete,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  services: ServiceDto[];
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-3">
      <h3 className="font-display text-base font-extrabold text-primary-deep flex items-center gap-2">
        <Icon className="h-4 w-4" /> {title}
      </h3>
      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services yet.</p>
      ) : (
        services.map((svc) => (
          <div
            key={svc.id}
            className="rounded-2xl border border-border bg-background p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-deep truncate">
                {svc.name}
              </p>
              <p className="text-xs text-muted-foreground">
                NPR {svc.price} · {svc.duration ?? "N/A"} ·{" "}
                {svc.home_available ? "Home visits" : "Clinic only"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggle(svc.id, !svc.active)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                svc.active
                  ? "bg-mint text-primary-deep"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {svc.active ? "Active" : "Paused"}
            </button>
            <button
              type="button"
              onClick={() => onDelete(svc.id)}
              className="h-8 w-8 rounded-full inline-flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))
      )}
    </section>
  );
}

function BookingsTable({
  bookings,
  services,
  onStatusChange,
}: {
  bookings: BookingDto[];
  services: ServiceDto[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

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

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-card">
      <h2 className="font-display text-lg font-extrabold text-primary-deep mb-4">
        All bookings
      </h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-2 font-semibold">Customer</th>
                <th className="text-left py-2 px-2 font-semibold">Service</th>
                <th className="text-left py-2 px-2 font-semibold">Type</th>
                <th className="text-left py-2 px-2 font-semibold">Date/Time</th>
                <th className="text-left py-2 px-2 font-semibold">Visit</th>
                <th className="text-left py-2 px-2 font-semibold">Status</th>
                <th className="text-right py-2 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => {
                const svc = serviceMap.get(b.service_id);
                return (
                  <tr key={b.id} className="hover:bg-muted/40">
                    <td className="py-3 px-2">
                      <div className="text-primary-deep font-medium">
                        {b.customer_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.customer_email}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-primary-deep font-medium">
                      {svc?.name ?? "Unknown"}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs capitalize">
                        {svc?.type ?? "-"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {b.preferred_date} · {b.preferred_time}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs capitalize">{b.visit_type}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(b.status)}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="relative inline-block">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            onStatusChange(b.id, e.target.value)
                          }
                          className="appearance-none bg-muted text-primary-deep text-xs font-semibold rounded-full pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:bg-mint"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-primary-deep" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  value: number;
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
