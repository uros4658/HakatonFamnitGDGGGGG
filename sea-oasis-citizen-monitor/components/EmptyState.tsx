import { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="text-center py-12 text-slate-500">
      <Icon size={48} className="mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
