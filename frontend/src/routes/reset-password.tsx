import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { KeyRound, ShieldCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Header from "@/components/pharmacy/Header";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Set new password — Medicare" },
      {
        name: "description",
        content: "Set a new password for your Medicare Pharmacy account.",
      },
    ],
  }),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .max(100),
    confirm: z.string().min(6).max(100),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type PageState = "loading" | "ready" | "done" | "invalid";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Supabase puts the recovery tokens in the URL hash after the magic link click.
  // onAuthStateChange fires a PASSWORD_RECOVERY event which establishes a
  // temporary session, after which we can call updateUser.
  useEffect(() => {
    // Handle the hash fragment that Supabase appends to the redirect URL.
    // The fragment looks like: #access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash;

    if (!hash) {
      // No hash — user navigated here directly without a magic link
      setPageState("invalid");
      return;
    }

    // Let Supabase process the hash and establish the recovery session
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      } else if (event === "SIGNED_OUT") {
        // Session expired or invalid token
        setPageState("invalid");
      }
    });

    // Also try exchanging the code from hash directly
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setPageState("ready");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = passwordSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      setSubmitting(true);
      const { error: sbError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });
      if (sbError) throw sbError;
      // Sign out the recovery session — user logs in fresh with new password
      await supabase.auth.signOut();
      setPageState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-center">

        {/* Left panel */}
        <div className="hidden md:block bg-mint rounded-[2rem] p-10 space-y-5">
          <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
            Account security
          </span>
          <h1 className="font-display text-4xl font-extrabold text-primary-deep leading-tight">
            Almost there — <br /> set your new password.
          </h1>
          <p className="text-primary-deep/70 text-sm">
            Choose a strong password of at least 6 characters to secure your
            Medicare account.
          </p>
          <div className="flex items-center gap-2 text-xs text-primary-deep">
            <ShieldCheck className="h-4 w-4" /> HIPAA-grade data protection
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft max-w-md w-full mx-auto">

          {/* ── Loading ── */}
          {pageState === "loading" && (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
            </div>
          )}

          {/* ── Invalid / expired ── */}
          {pageState === "invalid" && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-primary-deep">
                Link invalid or expired
              </h2>
              <p className="text-sm text-muted-foreground">
                This password reset link is no longer valid. Reset links expire
                after 1 hour and can only be used once.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full px-6 py-3 font-semibold text-sm hover:scale-[1.02] transition-transform"
              >
                Request a new link
              </Link>
            </div>
          )}

          {/* ── New password form ── */}
          {pageState === "ready" && (
            <>
              <div className="space-y-1 mb-6">
                <h2 className="font-display text-2xl font-extrabold text-primary-deep">
                  Set a new password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password of at least 6 characters.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="text-xs font-semibold text-primary-deep">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      maxLength={100}
                      autoComplete="new-password"
                      className="w-full bg-muted rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-deep transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="text-xs font-semibold text-primary-deep">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••"
                      maxLength={100}
                      autoComplete="new-password"
                      className="w-full bg-muted rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-deep transition-colors"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-60"
                >
                  <KeyRound className="h-4 w-4" />
                  {submitting ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}

          {/* ── Done ── */}
          {pageState === "done" && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-primary-deep">
                Password updated!
              </h2>
              <p className="text-sm text-muted-foreground">
                Your password has been changed successfully. Sign in with your
                new password.
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform"
              >
                Go to sign in
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
