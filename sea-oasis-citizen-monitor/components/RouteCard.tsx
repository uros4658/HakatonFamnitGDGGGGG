import { RoutePattern } from "@/lib/roots/routePatterns";

export function RouteCard({ route, onUse }: { route: RoutePattern; onUse?: () => void }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">{route.id}</span>
        {route.isMinimal && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300">primitive</span>}
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-300">balanced</span>
      </div>
      <div className="font-mono text-sm text-cyan-300">{route.directions.join(" ? ")}</div>
      <div className="text-xs font-mono text-slate-400">{route.certificate}</div>
      {onUse && (
        <button onClick={onUse} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-medium transition-colors">
          Use this route
        </button>
      )}
    </div>
  );
}
