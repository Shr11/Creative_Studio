import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Search, Heart, Bookmark, Filter, TrendingUp, Download, Share2 } from "lucide-react";
import { galleryItems } from "@/lib/mock-data";

export const Route = createFileRoute("/app/gallery")({
  component: GalleryPage,
  head: () => ({ meta: [{ title: "Gallery — 6E Creative Studio" }] }),
});

function GalleryPage() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("All");
  const [audience, setAudience] = useState("All");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const platforms = ["All", ...Array.from(new Set(galleryItems.map(i => i.platform)))];
  const audiences = ["All", ...Array.from(new Set(galleryItems.map(i => i.audience)))];

  const filtered = useMemo(() => galleryItems.filter(i =>
    (platform === "All" || i.platform === platform) &&
    (audience === "All" || i.audience === audience) &&
    (q === "" || i.title.toLowerCase().includes(q.toLowerCase()))
  ), [q, platform, audience]);

  const toggleFav = (id: string, title: string) => setFavs(f => {
    const n = new Set(f);
    if (n.has(id)) { n.delete(id); toast(`Removed ${title} from favorites`); }
    else { n.add(id); toast.success(`Favorited ${title}`); }
    return n;
  });
  const toggleSave = (id: string, title: string) => setSaved(s => {
    const n = new Set(s);
    if (n.has(id)) { n.delete(id); toast(`Unsaved ${title}`); }
    else { n.add(id); toast.success(`Bookmarked ${title}`); }
    return n;
  });
  const download = (src: string, title: string) => {
    const a = document.createElement("a");
    a.href = src; a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    a.click();
    toast.success("Download started");
  };
  const share = (title: string) => {
    navigator.clipboard?.writeText(`${title} — ${typeof window !== "undefined" ? window.location.href : ""}`);
    toast.success("Share link copied");
  };
  const clearFilters = () => { setQ(""); setPlatform("All"); setAudience("All"); };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground">
          <Filter size={12} className="text-primary-glow" /> Library
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Creative <span className="text-gradient">Gallery</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Every campaign you've generated, in one place.</p>
      </div>

      {/* Filter bar */}
      <div className="glass mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full rounded-lg border border-border bg-card/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>
        <FilterSelect label="Platform" value={platform} options={platforms} onChange={setPlatform} />
        <FilterSelect label="Audience" value={audience} options={audiences} onChange={setAudience} />
        {(q || platform !== "All" || audience !== "All") && (
          <button onClick={clearFilters} className="rounded-lg border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground">Clear</button>
        )}
      </div>

      {/* Masonry */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            className="group mb-5 break-inside-avoid"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
              <img src={item.image} alt={item.title} className="w-full transition duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => toggleFav(item.id, item.title)} title="Favorite" className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur transition hover:bg-background">
                  <Heart size={14} className={favs.has(item.id) ? "fill-destructive text-destructive" : ""} />
                </button>
                <button onClick={() => toggleSave(item.id, item.title)} title="Bookmark" className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur transition hover:bg-background">
                  <Bookmark size={14} className={saved.has(item.id) ? "fill-primary-glow text-primary-glow" : ""} />
                </button>
                <button onClick={() => download(item.image, item.title)} title="Download" className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur transition hover:bg-background">
                  <Download size={14} />
                </button>
                <button onClick={() => share(item.title)} title="Share" className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur transition hover:bg-background">
                  <Share2 size={14} />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                <div className="font-display text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-white/80">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 backdrop-blur">{item.platform}</span>
                  <span className="inline-flex items-center gap-1 text-primary-glow">
                    <TrendingUp size={12} /> {item.virality}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span className="truncate">{item.title}</span>
              <span>{item.mood}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-sm text-muted-foreground">No campaigns match those filters.</div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-border bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
      >
        {options.map(o => <option key={o} value={o} className="bg-popover">{o}</option>)}
      </select>
    </div>
  );
}
