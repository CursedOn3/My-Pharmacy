import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Stethoscope, Video, Calendar, Clock } from "lucide-react";
import doctor from "@/assets/doctor.jpg";

const SPECIALTIES = ["General Physician", "Pediatrician", "Dermatologist", "Cardiologist", "Nutritionist"];
const SLOTS = ["09:00", "11:30", "14:00", "16:30", "18:00"];

const schema = z.object({
  name: z.string().trim().nonempty({ message: "Please enter your name" }).max(80, { message: "Name too long" }),
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  specialty: z.string().nonempty({ message: "Pick a specialty" }),
  date: z.string().nonempty({ message: "Pick a date" }),
  slot: z.string().nonempty({ message: "Pick a time slot" }),
  reason: z.string().trim().max(500, { message: "Reason must be under 500 characters" }).optional(),
});

type FormState = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormState, string>>;

const today = new Date().toISOString().split("T")[0];

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-primary-deep">{label}</label>
    {children}
    {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
  </div>
);

const inputCls =
  "w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none text-primary-deep border border-transparent transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

const Consultation = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    specialty: "",
    date: "",
    slot: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [confirmed, setConfirmed] = useState<FormState | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof FormState] = issue.message;
      }
      setErrors(next);
      return;
    }
    setConfirmed(result.data);
    toast.success("Consultation booked", {
      description: `${result.data.specialty} · ${result.data.date} at ${result.data.slot}`,
    });
  };

  const reset = () => {
    setForm({ name: "", email: "", specialty: "", date: "", slot: "", reason: "" });
    setErrors({});
    setConfirmed(null);
  };

  return (
    <section id="consult" className="container mx-auto px-4 py-10">
      <div className="bg-mint rounded-[2rem] overflow-hidden grid md:grid-cols-5">
        <div className="md:col-span-2 p-8 md:p-10 space-y-5 relative">
          <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
            24/7 telehealth
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep leading-tight">
            Talk to a licensed doctor
          </h2>
          <p className="text-primary-deep/70 text-sm">
            Book a video consultation with a board-certified doctor — average wait time under 5 minutes.
          </p>
          <div className="flex items-center gap-3">
            <img
              src={doctor}
              alt="Doctor"
              loading="lazy"
              width={768}
              height={768}
              className="h-20 w-20 rounded-2xl object-cover object-top"
            />
            <div className="text-xs">
              <div className="font-bold text-primary-deep">Dr. Amelia Chen</div>
              <div className="text-muted-foreground">General Physician · 4.9 ★</div>
              <div className="flex items-center gap-1 mt-1 text-primary-deep">
                <Video className="h-3 w-3" /> Video · 15 min
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 bg-background p-6 md:p-8">
          {confirmed ? (
            <div className="text-center py-10 space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-mint flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-primary-deep" />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-primary-deep">
                You're booked!
              </h3>
              <p className="text-sm text-muted-foreground">
                A confirmation has been sent to{" "}
                <span className="font-semibold text-primary-deep">{confirmed.email}</span>.
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-mint rounded-2xl px-4 py-3 text-xs font-semibold text-primary-deep">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {confirmed.specialty}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {confirmed.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {confirmed.slot}
                </span>
              </div>
              <div>
                <button
                  onClick={reset}
                  className="text-xs font-semibold text-primary-deep underline underline-offset-4"
                >
                  Book another consultation
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="font-display text-xl font-extrabold text-primary-deep">
                Book your appointment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Full name" error={errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    maxLength={80}
                    placeholder="Jane Doe"
                    className={inputCls}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={255}
                    placeholder="jane@example.com"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Specialty" error={errors.specialty}>
                <select
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select a specialty</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Date" error={errors.date}>
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Time slot" error={errors.slot}>
                  <div className="flex flex-wrap gap-1.5">
                    {SLOTS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => update("slot", s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          form.slot === s
                            ? "bg-primary-deep text-primary-deep-foreground"
                            : "bg-muted text-primary-deep hover:bg-mint"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Reason for visit (optional)" error={errors.reason}>
                <textarea
                  value={form.reason}
                  onChange={(e) => update("reason", e.target.value.slice(0, 500))}
                  rows={2}
                  maxLength={500}
                  placeholder="Briefly describe your symptoms..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-3 rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform"
              >
                <Calendar className="h-4 w-4" /> Confirm appointment
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Consultation;
