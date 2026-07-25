"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/api";
import { ArrowRight, Loader2, Shield, Zap, Users, BarChart3, Lock } from "lucide-react";

const MODULES = [
  "Project Management",
  "Task Tracking",
  "Daily Updates",
  "CRM Pipeline",
  "Finance & Invoices",
  "HR & Payroll",
  "GitHub Integration",
  "Client Portal",
  "Knowledge Base",
  "Team Analytics",
  "AI Assistant",
  "Performance Points",
];

const FEATURES = [
  { icon: Zap, label: "Daily Update Points System" },
  { icon: Users, label: "14 Role-Based Access Levels" },
  { icon: BarChart3, label: "Real-Time CEO Dashboard" },
  { icon: Shield, label: "RBAC + 2FA Security" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await api.login(email, password);
      setAccessToken(accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px]">
      {/* ── Brand Panel ─────────────────────────────────────────────────── */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between px-16 py-14"
        style={{
          background: "linear-gradient(135deg, #0B0D12 0%, #13162B 50%, #0B0D12 100%)",
        }}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4F46E5, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 pointer-events-none"
          style={{ background: "radial-gradient(circle, #818CF8, transparent 70%)" }}
        />

        {/* Top — Logo + headline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">P</span>
            </div>
            <div>
              <p className="font-display text-white font-semibold text-sm leading-tight">Prozync Innovations</p>
              <p className="text-white/30 text-[10px] tracking-widest uppercase">OfficeOS</p>
            </div>
          </div>

          <h1 className="font-display text-5xl xl:text-6xl text-white leading-[1.06] tracking-tight">
            One operating
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              system
            </span>{" "}
            for
            <br />
            how the company
            <br />
            runs.
          </h1>

          <p className="mt-6 text-white/40 text-sm leading-relaxed max-w-xs">
            Projects, tasks, people, finances, clients — everything in one secure internal platform.
          </p>
        </div>

        {/* Middle — Module ticker */}
        <div className="relative z-10 my-8">
          <p className="text-white/20 text-[10px] font-semibold tracking-[0.2em] uppercase mb-4">
            What&apos;s inside
          </p>
          <div className="relative h-40 overflow-hidden">
            <div className="module-ticker flex flex-col gap-3">
              {[...MODULES, ...MODULES].map((mod, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500/50 flex-shrink-0" />
                  <span className="font-display text-base text-white/25">{mod}</span>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#0B0D12] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0B0D12] to-transparent" />
          </div>
        </div>

        {/* Bottom — Feature pills */}
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5"
              >
                <Icon size={11} className="text-indigo-400 flex-shrink-0" />
                <span className="text-white/50 text-[11px] font-medium">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-white/20 text-xs">
            OfficeOS · Internal use only · Prozync Innovations
          </p>
        </div>
      </div>

      {/* ── Login Form Panel ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center bg-surface px-6 py-16">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold font-display">P</span>
            </div>
            <span className="font-display font-semibold text-ink">Prozync OfficeOS</span>
          </div>

          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-semibold text-ink tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted">
              Sign in with your Prozync work account. Not registered yet?{" "}
              <span className="text-accent font-medium">Ask your admin for an invite.</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 animate-fade-in stagger-1">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className="form-input mt-1"
                placeholder="you@prozync.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="form-label mb-0">Password</label>
                <button type="button" className="text-xs text-accent hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger rounded-lg px-3 py-2.5 animate-fade-in">
                <Lock size={13} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-snug" role="alert">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth (placeholder — will be wired in Phase 9) */}
          <button
            type="button"
            disabled
            className="btn w-full border border-border bg-white text-ink hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed gap-2"
            title="Google OAuth coming soon"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Workspace
          </button>

          <p className="mt-8 text-center text-[11px] text-muted/60">
            By signing in you agree to Prozync&apos;s internal use policies.
            <br />
            All activity is logged and monitored.
          </p>
        </div>
      </div>
    </main>
  );
}
