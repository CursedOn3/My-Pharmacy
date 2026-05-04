import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { UserPlus, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Header from "@/components/pharmacy/Header";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create account — Medicare" },
      {
        name: "description",
        content:
          "Create your Medicare Pharmacy account to track orders, manage prescriptions and reorder essentials in seconds.",
      },
    ],
  }),
});

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(80, { message: "Name must be less than 80 characters" }),
    email: z
      .string()
      .trim()
      .email({ message: "Enter a valid email" })
      .max(255),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(100),
    confirm: z.string().min(6).max(100),
    agree: z.literal(true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ name, email, password, confirm, agree });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    try {
      setSubmitting(true);
      await api.signup({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      await login(parsed.data.email, parsed.data.password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message === "too_many_signup_attempts" ||
          err.message === "too_many_requests" ||
          err.message === "Request failed (429)"
        ) {
          setError("Too many attempts right now. Please wait a few minutes and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Signup failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block bg-mint rounded-[2rem] p-10 space-y-5">
          <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
            Join Medicare
          </span>
          <h1 className="font-display text-4xl font-extrabold text-primary-deep leading-tight">
            Care that comes <br /> right to your door.
          </h1>
          <p className="text-primary-deep/70 text-sm">
            Create an account to unlock faster checkout, prescription tracking and exclusive
            member savings.
          </p>
          <ul className="space-y-3 text-sm text-primary-deep">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Free same-day delivery on first order
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Personalised health recommendations
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> HIPAA-grade data protection
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft max-w-md w-full mx-auto">
          <div className="space-y-1 mb-6">
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              It only takes a minute — no credit card required.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                maxLength={80}
                className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary-deep">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  maxLength={100}
                  className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary-deep">
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••"
                  maxLength={100}
                  className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-primary-deep"
              />
              <span>
                I agree to the{" "}
                <span className="font-semibold text-primary-deep">Terms of Service</span>{" "}
                and{" "}
                <span className="font-semibold text-primary-deep">Privacy Policy</span>.
              </span>
            </label>
            {error && (
              <p className="text-xs font-semibold text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform"
            >
              <UserPlus className="h-4 w-4" /> {submitting ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-deep">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
