export function ChecklistProgress({ percentage, requiredComplete }: { percentage: number; requiredComplete: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Progress</span>
        <span className="text-sm font-bold text-teal-400">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
      {!requiredComplete && (
        <p className="text-xs text-amber-400">Required photos incomplete</p>
      )}
    </div>
  );
}
