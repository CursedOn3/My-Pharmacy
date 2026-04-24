import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { LogIn, ShieldCheck } from "lucide-react";
import Header from "@/components/pharmacy/Header";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Medicare" },
      { name: "description", content: "Sign in to your Medicare Pharmacy account." },
    ],
  }),
});

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    login(parsed.data.email, parsed.data.password);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block bg-mint rounded-[2rem] p-10 space-y-5">
          <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
            Welcome back
          </span>
          <h1 className="font-display text-4xl font-extrabold text-primary-deep leading-tight">
            Your health, <br /> always within reach.
          </h1>
          <p className="text-primary-deep/70 text-sm">
            Track orders, manage prescriptions and reorder essentials in seconds.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary-deep">
            <ShieldCheck className="h-4 w-4" /> HIPAA-grade security
          </div>
          <div className="bg-background rounded-2xl p-4 text-xs text-primary-deep/70 border border-border">
            <span className="font-semibold text-primary-deep">Demo tip:</span> use any
            email containing the word{" "}
            <span className="font-mono bg-mint px-1.5 py-0.5 rounded">admin</span> to sign
            in as an admin.
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft max-w-md w-full mx-auto">
          <div className="space-y-1 mb-6">
            <h2 className="font-display text-2xl font-extrabold text-primary-deep">
              Sign in
            </h2>
            <p className="text-sm text-muted-foreground">
              No account needed — this is a mock login for the demo.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            New here?{" "}
            <Link to="/login" className="font-semibold text-primary-deep">
              Create account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
