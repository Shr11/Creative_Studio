import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import loginBg from "@/assets/login-bg.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — 6E Creative Studio" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/app/playground" }), 700);
  };

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* left: visual */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={loginBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/40 to-background/80" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Welcome back to the <span className="text-gradient">cockpit.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Generate campaigns, copy and creatives across every channel — from one place.
            </p>
          </div>
        </div>
      </div>

      {/* right: form */}
      <div className="relative flex items-center justify-center bg-background px-6 py-16">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 lg:hidden"><Logo /></div>
          <div className="glass elevated rounded-3xl p-8">
            <h1 className="font-display text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Continue to your studio</p>

            <form className="mt-7 space-y-4" onSubmit={handleLogin}>
              <Field icon={<Mail size={16} />} type="email" placeholder="you@indigo.in" defaultValue="demo@indigo.in" />
              <Field icon={<Lock size={16} />} type="password" placeholder="Password" defaultValue="••••••••" />

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-aurora py-3 text-sm font-medium text-primary-foreground glow transition hover:scale-[1.01] disabled:opacity-70"
              >
                {loading ? "Boarding..." : "Continue"}
                {!loading && <ArrowRight size={16} className="transition group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleLogin()}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card/30 py-3 text-sm transition hover:bg-card/60"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <button
                onClick={() => handleLogin()}
                className="w-full rounded-xl border border-border bg-card/30 py-3 text-sm text-muted-foreground transition hover:bg-card/60 hover:text-foreground"
              >
                Continue as Guest
              </button>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to the IndiGo Creative Studio terms.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function Field({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-card/30 py-3 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-card/60"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.8-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.8 4.9l6.2 5.2c-.4.4 6.6-4.8 6.6-14.1 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
