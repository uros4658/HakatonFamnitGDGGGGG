import { AlertTriangle } from "lucide-react";

export function ResponsibleDiverGuide() {
  return (
    <div className="p-4 rounded-xl border border-amber-800 bg-amber-900/20">
      <h2 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
        <AlertTriangle size={16} /> Responsible Observation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
        <div>Keep minimum distance � do not approach marine life</div>
        <div>Never touch, move, or collect organisms</div>
        <div>Avoid stirring sediment � maintain buoyancy</div>
        <div>Do not use flash if it disturbs animals</div>
        <div>Do not chase, corner, or feed any species</div>
        <div>Report � do not attempt to fix damage yourself</div>
      </div>
    </div>
  );
}
