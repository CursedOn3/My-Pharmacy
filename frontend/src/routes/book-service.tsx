import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  TestTube,
  Activity,
  Home,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { useAuth } from "@/context/AuthContext";
import { api, type ServiceDto } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/book-service")({
  component: BookServicePage,
  head: () => ({
    meta: [
      { title: "Book a Service — Medicare" },
      {
        name: "description",
        content:
          "Book lab tests and physiotherapy sessions at Medicare. Choose home visit or clinic visit.",
      },
    ],
  }),
});

type Step = "select" | "details" | "confirm";

function BookServicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("select");
  const [filter, setFilter] = useState<"all" | "lab" | "physiotherapy">("all");

  const [selectedService, setSelectedService] = useState<ServiceDto | null>(null);
  const [visitType, setVisitType] = useState<"home" | "clinic">("home");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listServices()
      .then(setServices)
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? services : services.filter((s) => s.type === filter);

  const handleSelect = (svc: ServiceDto) => {
    setSelectedService(svc);
    if (!svc.home_available) setVisitType("clinic");
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to book");
      navigate({ to: "/login" });
      return;
    }
    if (!selectedService || !date || !time || !phone.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.createBooking({
        service_id: selectedService.id,
        visit_type: visitType,
        preferred_date: date,
        preferred_time: time,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: phone.trim(),
        notes: notes.trim() || undefined,
      });
      setStep("confirm");
      toast.success("Booking confirmed!");
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {step === "select" && (
          <>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
                Services
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
                Book a service
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a lab test or physiotherapy session — at home or at our
                clinic.
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              {(
                [
                  ["all", "All"],
                  ["lab", "Lab tests"],
                  ["physiotherapy", "Physiotherapy"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                    filter === val
                      ? "bg-primary-deep text-primary-deep-foreground"
                      : "bg-muted text-primary-deep hover:bg-mint"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading services...
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-cream rounded-3xl p-10 text-center">
                <p className="font-display text-lg font-extrabold text-primary-deep">
                  No services available
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check back later for new services.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((svc) => (
                  <article
                    key={svc.id}
                    className="bg-card border border-border rounded-3xl p-5 shadow-card flex flex-col gap-4 hover:shadow-soft transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                          svc.type === "lab" ? "bg-mint" : "bg-peach"
                        }`}
                      >
                        {svc.type === "lab" ? (
                          <TestTube className="h-6 w-6 text-primary-deep" />
                        ) : (
                          <Activity className="h-6 w-6 text-primary-deep" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-extrabold text-primary-deep">
                          ${svc.price}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {svc.type === "lab" ? "per test" : "per session"}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-extrabold text-primary-deep text-lg leading-tight">
                        {svc.name}
                      </h3>
                      {svc.description && (
                        <p className="text-sm text-muted-foreground mt-1.5">
                          {svc.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-primary-deep/70">
                        {svc.duration && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="h-3.5 w-3.5" />
                            {svc.duration}
                          </span>
                        )}
                        {svc.home_available && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Home className="h-3.5 w-3.5" />
                            Home
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelect(svc)}
                        className="text-xs font-bold bg-primary-deep text-primary-deep-foreground px-3 py-1.5 rounded-full hover:opacity-90"
                      >
                        Book now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {step === "details" && selectedService && (
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep("select")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-deep mb-4 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to services
            </button>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
                  Booking details
                </span>
                <h2 className="font-display text-2xl font-extrabold text-primary-deep">
                  {selectedService.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  ${selectedService.price} ·{" "}
                  {selectedService.type === "lab" ? "Lab test" : "Physiotherapy"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-primary-deep block mb-2">
                    Visit type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisitType("home")}
                      disabled={!selectedService.home_available}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        visitType === "home"
                          ? "border-primary-deep bg-primary-deep/5"
                          : "border-border bg-background hover:border-primary-deep/40"
                      } ${!selectedService.home_available ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2 text-primary-deep">
                        <Home className="h-4 w-4" />
                        <span className="font-semibold text-sm">Home visit</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedService.home_available
                          ? "We come to you"
                          : "Not available for this service"}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisitType("clinic")}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        visitType === "clinic"
                          ? "border-primary-deep bg-primary-deep/5"
                          : "border-border bg-background hover:border-primary-deep/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-primary-deep">
                        <Building2 className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                          Clinic visit
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visit our clinic
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-primary-deep block mb-1">
                      Preferred date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-deep/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-primary-deep block mb-1">
                      Preferred time
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-deep/20"
                    >
                      <option value="">Select time</option>
                      <option value="07:00 AM">7:00 AM</option>
                      <option value="08:00 AM">8:00 AM</option>
                      <option value="09:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="02:00 PM">2:00 PM</option>
                      <option value="03:00 PM">3:00 PM</option>
                      <option value="04:00 PM">4:00 PM</option>
                      <option value="05:00 PM">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-primary-deep block mb-1">
                    Phone number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your contact number"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-deep/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-primary-deep block mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any special requirements or details"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-deep/20"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {submitting ? "Booking..." : "Confirm booking"}
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-mint flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary-deep" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Booking confirmed!
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              We'll contact you at <strong>{phone}</strong> to confirm your{" "}
              {visitType === "home" ? "home visit" : "clinic appointment"} on{" "}
              <strong>{date}</strong> at <strong>{time}</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setStep("select");
                  setSelectedService(null);
                  setDate("");
                  setTime("");
                  setPhone("");
                  setNotes("");
                }}
                className="inline-flex items-center gap-1.5 bg-muted text-primary-deep px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                Book another
              </button>
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="inline-flex items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
