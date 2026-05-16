import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Sparkles, Wand2, Image as ImageIcon, Type, Hash,
  Sparkle, Loader2, Download, Share2, Copy as CopyIcon,
} from "lucide-react";
import { sampleImages, hashtagsFor } from "@/lib/mock-data";

const copy = (text: string, label = "Copied to clipboard") => {
  navigator.clipboard?.writeText(text).then(
    () => toast.success(label, { description: text.length > 80 ? text.slice(0, 80) + "…" : text }),
    () => toast.error("Couldn't copy"),
  );
};

export const Route = createFileRoute("/app/playground")({
  component: Playground,
  head: () => ({ meta: [{ title: "Prompt Playground — 6E Creative Studio" }] }),
});

type Tab = "social" | "copy" | "banner";

function Playground() {
  const [tab, setTab] = useState<Tab>("social");

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Sparkle size={12} className="text-primary-glow" /> AI Studio
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Prompt <span className="text-gradient">Playground</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate campaigns, copy and banners across every channel.
          </p>
        </div>

        <div className="flex rounded-xl border border-border bg-card/40 p-1 backdrop-blur">
          {([
            { id: "social", label: "Social Media", icon: ImageIcon },
            { id: "copy", label: "Copywriting", icon: Type },
            { id: "banner", label: "Banner Studio", icon: Wand2 },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-aurora glow"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <t.icon size={14} className="relative" />
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "social" && <SocialMediaStudio />}
          {tab === "copy" && <CopyStudio />}
          {tab === "banner" && <BannerStudio />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------- shared primitives ------- */

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`glass rounded-2xl ${className}`}>{children}</section>;
}

function PanelTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
      {icon && <span className="text-primary-glow">{icon}</span>}
      <h2 className="text-sm font-semibold tracking-wide uppercase">{children}</h2>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-border bg-card/40 px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/60 ${props.className ?? ""}`}
    />
  );
}

function Select({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-lg border border-border bg-card/40 px-3 py-2 text-sm outline-none transition focus:border-primary/60"
    >
      {options.map((o) => <option key={o} value={o} className="bg-popover">{o}</option>)}
    </select>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-transparent bg-aurora text-primary-foreground glow"
          : "border-border bg-card/30 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function GenerateButton({ onClick, loading, label = "Generate Campaign" }: { onClick: () => void; loading: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-aurora py-3 text-sm font-medium text-primary-foreground glow transition hover:scale-[1.01] disabled:opacity-70"
    >
      {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> {label}</>}
    </button>
  );
}

function ActionBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/40 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
    >
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ------- SOCIAL MEDIA STUDIO ------- */

const PLATFORMS = ["Instagram", "LinkedIn", "Twitter/X", "Facebook", "YouTube", "WhatsApp"];
const CAMPAIGN_TYPES = ["Summer Travel", "Festival Campaign", "Weekend Escape", "Flash Sale", "Business Travel", "Student Offer", "Family Vacation", "Luxury Travel"];
const AUDIENCES = ["Gen Z", "Families", "Business Travelers", "Luxury Audience", "Budget Travelers", "Solo Travelers"];
const MOODS = ["Exciting", "Luxury", "Minimal", "Fun", "Professional", "Emotional"];

function SocialMediaStudio() {
  const [form, setForm] = useState({
    name: "Goa Monsoon Escape",
    campaign: CAMPAIGN_TYPES[2],
    audience: "Gen Z",
    mood: "Exciting",
    prompt: "Monsoon getaway to Goa with friends — vibrant, cinematic, full of energy.",
  });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  // Per-platform image map — populated by API. Empty until user generates.
  const [images, setImages] = useState<Record<string, string>>({});
  const [activePlatform, setActivePlatform] = useState<string>("Instagram");

  const generate = () => {
    setState("loading");
    toast.info("Composing your campaigns…", { description: `Generating for ${PLATFORMS.length} platforms` });
    setTimeout(() => {
      // Mock: assign a random sample image per platform (replace with API result).
      const next: Record<string, string> = {};
      PLATFORMS.forEach((p, i) => {
        next[p] = sampleImages[(i + Math.floor(Math.random() * sampleImages.length)) % sampleImages.length];
      });
      setImages(next);
      setState("done");
      toast.success("Campaigns ready", { description: `${form.name} generated for all platforms` });
    }, 1400);
  };

  const currentImage = images[activePlatform];

  const download = () => {
    if (!currentImage) return;
    const a = document.createElement("a");
    a.href = currentImage; a.download = `${form.name.replace(/\s+/g, "-").toLowerCase()}-${activePlatform}.jpg`;
    a.click();
    toast.success("Download started");
  };
  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    copy(url, "Share link copied");
  };
  const saveToGallery = () => toast.success("Saved to Gallery", { description: form.name });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr_320px]">
      {/* LEFT — Inputs */}
      <Panel>
        <PanelTitle icon={<Wand2 size={14} />}>Inputs</PanelTitle>
        <div className="space-y-4 p-5">
          <div><Label>Campaign Name</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
          <div><Label>Campaign Type</Label><Select options={CAMPAIGN_TYPES} value={form.campaign} onChange={(v) => update("campaign", v)} /></div>
          <div><Label>Audience</Label>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCES.map((a) => <Chip key={a} active={form.audience === a} onClick={() => update("audience", a)}>{a}</Chip>)}
            </div>
          </div>
          <div><Label>Mood</Label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => <Chip key={m} active={form.mood === m} onClick={() => update("mood", m)}>{m}</Chip>)}
            </div>
          </div>
          <div><Label>Prompt</Label>
            <textarea
              value={form.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <GenerateButton onClick={generate} loading={state === "loading"} />
        </div>
      </Panel>

      {/* CENTER — Output for active platform */}
      <div className="space-y-5">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-primary-glow"><ImageIcon size={14} /></span>
              <h2 className="text-sm font-semibold uppercase tracking-wide">Generated Creative · {activePlatform}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <ActionBtn onClick={download} icon={<Download size={14} />} label="Download" />
              <ActionBtn onClick={share} icon={<Share2 size={14} />} label="Share" />
              <ActionBtn onClick={saveToGallery} icon={<Sparkles size={14} />} label="Save" />
            </div>
          </div>
          <div className="p-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card">
              <AnimatePresence mode="wait">
                {state === "loading" ? (
                  <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center">
                    <div className="absolute inset-0 shimmer" />
                    <div className="relative flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-aurora glow animate-pulse-glow">
                        <Sparkles size={22} className="text-primary-foreground" />
                      </div>
                      <div className="text-sm">Composing your campaigns…</div>
                    </div>
                  </motion.div>
                ) : currentImage ? (
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt=""
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div key="empty" className="absolute inset-0 grid place-items-center text-center text-sm text-muted-foreground">
                    <div>
                      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-border">
                        <ImageIcon size={18} />
                      </div>
                      Select a platform on the right and hit Generate to preview the creative.
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Panel>

        {/* Hashtags */}
        <Panel>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-primary-glow"><Hash size={14} /></span>
              <h2 className="text-sm font-semibold uppercase tracking-wide">Suggested Hashtags · {activePlatform}</h2>
            </div>
            <button
              onClick={() => copy(hashtagsFor(activePlatform).join(" "), "All hashtags copied")}
              className="text-xs text-primary-glow hover:text-foreground"
            >
              Copy all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-5">
            {hashtagsFor(activePlatform).map((h) => (
              <button
                key={h}
                onClick={() => copy(h, `${h} copied`)}
                className="rounded-full border border-border bg-card/30 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {h}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* RIGHT — Platform selector + API placeholder */}
      <div className="space-y-5">
        <PlatformSelector
          platforms={PLATFORMS}
          active={activePlatform}
          onSelect={setActivePlatform}
          ready={images}
        />
        <ApiPlaceholder title="Insights" lines={4} />
        <ApiPlaceholder title="Performance" lines={3} />
      </div>
    </div>
  );
}

function PlatformSelector({
  platforms, active, onSelect, ready,
}: { platforms: string[]; active: string; onSelect: (p: string) => void; ready: Record<string, string> }) {
  return (
    <Panel>
      <PanelTitle icon={<ImageIcon size={14} />}>Platform</PanelTitle>
      <div className="grid gap-2 p-4">
        {platforms.map((p) => {
          const isActive = p === active;
          const has = Boolean(ready[p]);
          return (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                isActive
                  ? "border-transparent bg-aurora text-primary-foreground glow"
                  : "border-border bg-card/30 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <span>{p}</span>
              <span className={`text-[10px] uppercase tracking-widest ${isActive ? "opacity-80" : has ? "text-primary-glow" : "text-muted-foreground/60"}`}>
                {has ? "Ready" : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function ApiPlaceholder({ title, lines = 3 }: { title: string; lines?: number }) {
  return (
    <Panel>
      <PanelTitle>{title}</PanelTitle>
      <div className="space-y-2 p-5">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 w-full overflow-hidden rounded bg-card/40">
            <div className="h-full w-full shimmer opacity-30" />
          </div>
        ))}
        <div className="pt-1 text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Awaiting API response
        </div>
      </div>
    </Panel>
  );
}

/* ------- COPY STUDIO ------- */

function CopyStudio() {
  const [tone, setTone] = useState("Exciting");
  const [loading, setLoading] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string>("Instagram");
  // Per-platform copy variants — populated by API.
  const [copyByPlatform, setCopyByPlatform] = useState<Record<string, { type: string; text: string }[]>>({});

  const generate = () => {
    setLoading(true);
    toast.info("Generating copy for all platforms…");
    setTimeout(() => {
      const base = [
        { type: "Headline", text: "The monsoon is calling — answer at ₹1,999." },
        { type: "Caption", text: "Skip the queue, not the season. Goa from ₹1,999, only on 6E." },
        { type: "CTA", text: "Book Now · Limited seats" },
        { type: "Email Subject", text: "✈️ 48 hours left: Monsoon escapes from ₹1,999" },
        { type: "Promo", text: "Pack lighter, fly faster. IndiGo's monsoon fares end Sunday." },
        { type: "Ad Copy", text: "Some weekends deserve wings. Fly 6E to Goa from ₹1,999." },
      ];
      const next: Record<string, { type: string; text: string }[]> = {};
      PLATFORMS.forEach((p) => {
        next[p] = base.map((b) => ({ ...b, text: `[${p}] ${b.text}` }));
      });
      setCopyByPlatform(next);
      setLoading(false);
      toast.success("Copy generated for all platforms");
    }, 900);
  };

  const variants = copyByPlatform[activePlatform];

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr_320px]">
      {/* LEFT — Inputs */}
      <Panel>
        <PanelTitle icon={<Wand2 size={14} />}>Inputs</PanelTitle>
        <div className="space-y-4 p-5">
          <div><Label>Campaign Goal</Label><Input defaultValue="Drive monsoon weekend bookings" /></div>
          <div><Label>Tone</Label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => <Chip key={m} active={tone === m} onClick={() => setTone(m)}>{m}</Chip>)}
            </div>
          </div>
          <div><Label>Audience</Label><Select options={AUDIENCES} value="Gen Z" onChange={() => {}} /></div>
          <div><Label>Word Count</Label><Input type="number" defaultValue={40} /></div>
          <div><Label>Prompt</Label>
            <textarea rows={3} defaultValue="Generate scroll-stopping copy for a monsoon Goa flash sale." className="w-full resize-none rounded-lg border border-border bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          </div>
          <GenerateButton onClick={generate} loading={loading} label="Generate Copy" />
        </div>
      </Panel>

      {/* CENTER — Active platform copy */}
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Copy · {activePlatform}
        </div>
        {variants ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {variants.map((v, i) => (
              <motion.div
                key={`${activePlatform}-${v.type}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5"
              >
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-primary-glow">
                  {v.type}
                </div>
                <p className="font-display text-xl leading-snug">{v.text}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tone} · {v.text.split(" ").length} words</span>
                  <button onClick={() => copy(v.text, `${v.type} copied`)} className="inline-flex items-center gap-1 text-primary-glow hover:text-foreground"><CopyIcon size={12} /> Copy</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass grid place-items-center rounded-2xl p-10 text-center text-sm text-muted-foreground">
            <div>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-border">
                <Type size={18} />
              </div>
              Select a platform on the right and hit Generate Copy.
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Platform selector + API placeholder */}
      <div className="space-y-5">
        <PlatformSelector
          platforms={PLATFORMS}
          active={activePlatform}
          onSelect={setActivePlatform}
          ready={Object.fromEntries(Object.keys(copyByPlatform).map((k) => [k, "ready"]))}
        />
        <ApiPlaceholder title="Copy Insights" lines={4} />
      </div>
    </div>
  );
}

/* ------- BANNER STUDIO ------- */

function BannerStudio() {
  const [type, setType] = useState("Hero Banner");
  const [palette, setPalette] = useState("Indigo Aurora");
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(sampleImages[1]);

  const [brandAligned, setBrandAligned] = useState(true);
  const [bannerMood, setBannerMood] = useState("Exciting");

  const generate = () => {
    setLoading(true);
    toast.info("Designing banner…", { description: `${type} · ${palette}` });
    setTimeout(() => {
      setImg(sampleImages[Math.floor(Math.random() * sampleImages.length)]);
      setLoading(false);
      toast.success("Banner ready", { description: type });
    }, 1200);
  };
  const downloadBanner = () => {
    const a = document.createElement("a");
    a.href = img; a.download = `${type.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    a.click();
    toast.success("Download started");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Panel>
        <PanelTitle icon={<Wand2 size={14} />}>Inputs</PanelTitle>
        <div className="space-y-4 p-5">
          <div><Label>Banner Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {["Hero Banner", "Offer Banner", "Story Banner", "Website Banner", "App Promotion"].map(t => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}
            </div>
          </div>
          <div><Label>Resolution</Label><Select options={["1920×1080", "1080×1080", "1080×1920", "1600×400"]} value="1920×1080" onChange={() => {}} /></div>
          <div><Label>Aspect Ratio</Label><Select options={["16:9", "1:1", "9:16", "4:1"]} value="16:9" onChange={() => {}} /></div>
          <div><Label>Typography</Label><Select options={["Display Serif", "Modern Sans", "Editorial", "Geometric"]} value="Modern Sans" onChange={() => {}} /></div>
          <div><Label>Color Palette</Label>
            <div className="flex flex-wrap gap-1.5">
              {["Indigo Aurora", "Sunset Amber", "Monsoon Teal", "Noir Gold"].map(p => <Chip key={p} active={palette === p} onClick={() => setPalette(p)}>{p}</Chip>)}
            </div>
          </div>
          <div><Label>Mood</Label>
            <div className="flex flex-wrap gap-1.5">{MOODS.map(m => <Chip key={m} active={bannerMood === m} onClick={() => setBannerMood(m)}>{m}</Chip>)}</div>
          </div>
          <button
            type="button"
            onClick={() => { setBrandAligned(b => !b); toast.success(`Brand alignment ${!brandAligned ? "on" : "off"}`); }}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card/30 px-3 py-2 text-sm transition hover:border-primary/40"
          >
            <span>Brand Alignment</span>
            <span className={`h-5 w-9 rounded-full p-0.5 transition ${brandAligned ? "bg-aurora glow" : "bg-muted"}`}>
              <span className={`block h-4 w-4 rounded-full bg-white transition ${brandAligned ? "translate-x-4" : "translate-x-0"}`} />
            </span>
          </button>
          <div><Label>Prompt</Label>
            <textarea rows={3} defaultValue="Hero banner for IndiGo's monsoon Goa sale — cinematic, vibrant, scroll-stopping." className="w-full resize-none rounded-lg border border-border bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          </div>
          <GenerateButton onClick={generate} loading={loading} label="Generate Banner" />
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-primary-glow"><ImageIcon size={14} /></span>
              <h2 className="text-sm font-semibold uppercase tracking-wide">{type} · {palette}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <ActionBtn onClick={downloadBanner} icon={<Download size={14} />} label="Download" />
              <ActionBtn onClick={() => copy(typeof window !== "undefined" ? window.location.href : "", "Share link copied")} icon={<Share2 size={14} />} label="Share" />
              <ActionBtn onClick={() => toast.success("Banner saved to Gallery")} icon={<Sparkles size={14} />} label="Save" />
            </div>
          </div>
          <div className="p-5">
            <div className="relative aspect-[16/8] overflow-hidden rounded-xl border border-border">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="absolute inset-0 shimmer" />
                    <Loader2 className="relative animate-spin text-primary-glow" />
                  </div>
                ) : (
                  <motion.img key={img} src={img} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} alt="" className="h-full w-full object-cover" />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-tr from-black/80 via-black/20 to-transparent p-8">
                <div className="text-xs uppercase tracking-widest text-white/70">Monsoon Sale · 48hrs left</div>
                <h3 className="mt-1 font-display text-4xl font-semibold text-white">Goa from <span className="text-gradient">₹1,999</span></h3>
                <button
                  onClick={() => toast.success("Book Now clicked", { description: "Mock booking flow" })}
                  className="mt-3 w-fit rounded-full bg-white px-5 py-2 text-xs font-medium text-background transition hover:scale-105"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-5 md:grid-cols-3">
          {[{ l: "Alternate", a: "aspect-[16/8]" }, { l: "Mobile", a: "aspect-[9/12]" }, { l: "Story", a: "aspect-[9/16]" }].map((v) => (
            <Panel key={v.l} className="overflow-hidden">
              <div className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">{v.l} Adaptation</div>
              <button
                onClick={() => { setImg(sampleImages[(sampleImages.indexOf(img) + 2) % sampleImages.length]); toast.success(`${v.l} adaptation promoted`); }}
                className={`relative ${v.a} mx-4 mb-4 block w-[calc(100%-2rem)] overflow-hidden rounded-lg transition hover:ring-2 hover:ring-primary/40`}
              >
                <img src={sampleImages[(sampleImages.indexOf(img) + 2) % sampleImages.length]} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <div className="text-[10px] uppercase tracking-widest opacity-70">Monsoon Sale</div>
                  <div className="font-display text-lg leading-tight">Goa ₹1,999</div>
                </div>
              </button>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
