import { Observation } from "@/lib/observations/schema";
import { computeTagFrequency } from "@/lib/observations/stats";

export function ReportPreview({ observations }: { observations: Observation[] }) {
  const months = [...new Set(observations.map(o => o.month))].sort();
  const observers = [...new Set(observations.map(o => o.observer))];
  const tagFreq = computeTagFrequency(observations);
  const topTags = Object.entries(tagFreq).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
      <h3 className="font-semibold">Report Preview</h3>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div>Period: {months[0] || "�"} to {months[months.length - 1] || "�"}</div>
        <div>Surveys: {observations.length}</div>
        <div>Observers: {observers.length}</div>
        <div>Top: {topTags.map(([t]) => t.replace(/_/g, " ")).join(", ")}</div>
      </div>
    </div>
  );
}
