import { Observation } from "@/lib/observations/schema";

export function WasteDamagePanel({ observations }: { observations: Observation[] }) {
  const wasteObs = observations.filter(o => o.wasteSeverity !== "none");
  const damageObs = observations.filter(o => o.damageSeverity !== "none");

  const prioritized = [...wasteObs, ...damageObs]
    .sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1, none: 0 };
      const aScore = (severityOrder[a.wasteSeverity] || 0) + (severityOrder[a.damageSeverity] || 0);
      const bScore = (severityOrder[b.wasteSeverity] || 0) + (severityOrder[b.damageSeverity] || 0);
      return bScore - aScore;
    })
    .slice(0, 10);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Waste & Damage Reports</h3>
      {prioritized.length === 0 ? (
        <p className="text-xs text-slate-500">No waste or damage reported.</p>
      ) : (
        <div className="space-y-1">
          {prioritized.map(o => (
            <div key={o.id} className="flex items-center gap-2 text-xs">
              {o.wasteSeverity !== "none" && <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">waste: {o.wasteSeverity}</span>}
              {o.damageSeverity !== "none" && <span className="px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">damage: {o.damageSeverity}</span>}
              <span className="text-slate-400">{o.date} � {o.observer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
