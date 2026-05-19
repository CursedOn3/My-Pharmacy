import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { Mail, ShieldCheck, KeyRound, ExternalLink } from "lucide-react";
import Header from "@/components/pharmacy/Header";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Forgot password — Medicare" },
      {
        name: "description",
        content: "Request a password reset link for your Medicare Pharmacy account.",
      },
    ],
  }),
});

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  // Dev-only: the actual magic link returned by the backend in development
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      setSubmitting(true);
      const result = await api.forgotPassword(parsed.data.email);
      if (result.devLink) {
        setDevLink(result.devLink);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
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
            Reset your <br /> password securely.
          </h1>
          <p className="text-primary-deep/70 text-sm">
            Enter your registered email address and we'll send you a secure
            link to reset your password.
          </p>
          <ul className="space-y-3 text-sm text-primary-deep">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Magic link sent to your email
            </li>
            <li className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Link expires in 1 hour
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> HIPAA-grade data protection
            </li>
          </ul>
        </div>

        {/* Right panel */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft max-w-md w-full mx-auto">

          {!sent ? (
            <>
              <div className="space-y-1 mb-6">
                <h2 className="font-display text-2xl font-extrabold text-primary-deep">
                  Forgot your password?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your account email and we'll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="forgot-email" className="text-xs font-semibold text-primary-deep">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                    autoComplete="email"
                    className="w-full bg-muted rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" />
                  {submitting ? "Sending link…" : "Send reset link"}
                </button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-6">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-primary-deep">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="space-y-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="font-display text-2xl font-extrabold text-primary-deep">
                  Check your email
                </h2>
                <p className="text-sm text-muted-foreground">
                  If <span className="font-semibold text-primary-deep">{email}</span> is
                  registered, you'll receive a password reset link shortly. The link
                  expires in 1 hour.
                </p>
              </div>

              {/* ── Development helper ── */}
              {devLink && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Development mode — magic link
                  </p>
                  <p className="text-xs text-amber-700">
                    Email delivery is skipped in development. Click the link below to
                    reset your password:
                  </p>
                  <a
                    href={devLink}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 underline break-all hover:text-amber-900 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    {devLink}
                  </a>
                </div>
              )}

              <div className="text-center space-y-2 pt-1">
                <p className="text-xs text-muted-foreground">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setDevLink(null);
                    }}
                    className="font-semibold text-primary-deep hover:underline"
                  >
                    Try again
                  </button>
                </p>
                <Link
                  to="/login"
                  className="text-xs text-muted-foreground hover:text-primary-deep transition-colors"
                >
                  ← Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
