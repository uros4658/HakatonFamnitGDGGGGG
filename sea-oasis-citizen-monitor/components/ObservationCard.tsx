import { Observation } from "@/lib/observations/schema";

export function ObservationCard({ obs }: { obs: Observation }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{obs.observer}</span>
        <span className="text-xs text-slate-500">{obs.date}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {obs.tags.map((t, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {t.tag.replace(/_/g, " ")}
            {t.abundance && t.abundance !== "unknown" ? ` (${t.abundance})` : ""}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
        <span>{obs.locationType.replace(/_/g, " ")}</span>
        <span>{obs.visibility} vis.</span>
        <span>growth: {obs.growthPlateScore || "�"}</span>
      </div>
    </div>
  );
}
