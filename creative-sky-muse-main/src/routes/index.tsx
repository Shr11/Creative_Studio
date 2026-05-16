import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import splashBg from "@/assets/splash-bg.jpg";

export const Route = createFileRoute("/")({
  component: Splash,
  head: () => ({
    meta: [
      { title: "6E Creative Studio — AI-powered airline campaigns" },
      { name: "description", content: "Create AI-powered airline campaigns at the speed of travel. IndiGo's marketing cockpit." },
    ],
  }),
});

function Splash() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* background */}
      <img src={splashBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* glowing orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl"
        style={{ background: "var(--gradient-aurora)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent opacity-30 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* aircraft trail */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
        <motion.path
          d="M -50 600 Q 400 200 1250 100"
          stroke="url(#trail)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 275)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.72 0.2 290)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 200)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition">Sign in</Link>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-32 text-center md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur"
        >
          <Sparkles size={14} className="text-primary-glow" />
          AI Marketing Cockpit for IndiGo
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
        >
          Create campaigns
          <br />
          at the <span className="text-gradient">speed of travel.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-7 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          6E Creative Studio is the AI command center for airline marketing —
          generate social campaigns, copy, and banners in seconds, ready to fly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-aurora px-7 py-3.5 text-sm font-medium text-primary-foreground glow transition hover:scale-[1.02]"
          >
            Get Started
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/app/playground"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 text-sm font-medium backdrop-blur transition hover:bg-card/70"
          >
            Explore Demo
          </Link>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-24 grid w-full grid-cols-3 gap-4 md:gap-12"
        >
          {[
            { v: "12s", l: "Avg generation time" },
            { v: "47+", l: "Campaign templates" },
            { v: "98%", l: "Brand alignment" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl px-4 py-5">
              <div className="font-display text-2xl font-semibold text-gradient md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
