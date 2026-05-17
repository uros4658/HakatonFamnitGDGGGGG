import { AlertTriangle } from "lucide-react";

export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-900/20 border border-amber-800 text-xs text-amber-300">
      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
