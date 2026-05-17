import { Observation } from "@/lib/observations/schema";
import { computeTagFrequency } from "@/lib/observations/stats";

export function BiodiversityTimeline({ observations }: { observations: Observation[] }) {
  const months = [...new Set(observations.map(o => o.month))].sort();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Biodiversity Timeline</h3>
      <div className="space-y-1">
        {months.map(month => {
          const monthObs = observations.filter(o => o.month === month);
          const freq = computeTagFrequency(monthObs);
          const topTags = Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, 3);
          return (
            <div key={month} className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 w-16">{month}</span>
              <span className="text-slate-400">{monthObs.length} surveys</span>
              <div className="flex gap-1">
                {topTags.map(([tag]) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{tag.replace(/_/g, " ")}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
