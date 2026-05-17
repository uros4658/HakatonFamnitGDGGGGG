import { Observation } from "@/lib/observations/schema";

export function GrowthPlateTracker({ observations }: { observations: Observation[] }) {
  const plates = [1, 2, 3, 4, 5];
  const byMonth = [...new Set(observations.map(o => o.month))].sort();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Growth Plate Tracking</h3>
      <div className="grid grid-cols-5 gap-2 text-xs">
        {plates.map(p => {
          const plateObs = observations.filter(o => o.growthPlateScore && o.growthPlateScore !== "unknown");
          const scores = byMonth.map(m => {
            const monthObs = plateObs.filter(o => o.month === m);
            if (monthObs.length === 0) return null;
            return Math.round(monthObs.reduce((sum, o) => sum + parseInt(o.growthPlateScore || "0"), 0) / monthObs.length);
          });
          const trend = scores.filter(s => s !== null).length >= 2
            ? scores[scores.length - 1]! >= scores[scores.length - 2]! ? "improving" : "declining"
            : "not enough data";

          return (
            <div key={p} className="p-2 rounded-lg border border-slate-800 bg-slate-900/50 text-center">
              <div className="font-medium">Plate {p}</div>
              <div className="text-slate-400 mt-1">{trend}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
