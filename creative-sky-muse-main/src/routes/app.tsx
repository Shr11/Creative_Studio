import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Settings, Moon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const tabs = [
    { to: "/app/playground", label: "Prompt Playground" },
    { to: "/app/gallery", label: "Gallery" },
  ] as const;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />

      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link to="/"><Logo size="sm" /></Link>
            <nav className="flex items-center gap-1">
              {tabs.map((t) => {
                const active = pathname.startsWith(t.to);
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`relative rounded-lg px-4 py-2 text-sm transition ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && <span className="absolute inset-0 rounded-lg bg-card/60 border border-border" />}
                    <span className="relative">{t.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <IconBtn onClick={() => toast.info("3 new campaign insights", { description: "Virality boost detected on Goa Monsoon." })}><Bell size={16} /></IconBtn>
            <IconBtn onClick={() => toast("Dark mode is on", { description: "Light mode coming soon." })}><Moon size={16} /></IconBtn>
            <IconBtn onClick={() => toast.info("Settings", { description: "Workspace settings panel — coming soon." })}><Settings size={16} /></IconBtn>
            <button
              onClick={() => { toast.success("Signed out"); navigate({ to: "/login" }); }}
              title="Sign out"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-aurora px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:scale-105"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">DM</span>
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-card/60 hover:text-foreground">
      {children}
    </button>
  );
}
