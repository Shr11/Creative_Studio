import { Plane } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  const icon = size === "lg" ? 32 : size === "sm" ? 16 : 22;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-aurora glow">
        <Plane size={icon} className="text-primary-foreground -rotate-45" strokeWidth={2.5} />
      </div>
      <div className={`font-display font-semibold ${s} tracking-tight`}>
        6E <span className="text-gradient">Creative Studio</span>
      </div>
    </div>
  );
}
