import Link from "next/link";
import { LucideIcon } from "lucide-react";

export function ModuleCard({ href, label, desc, icon: Icon, color }: {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-cyan-700 transition-colors"
    >
      <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{label}</h3>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </Link>
  );
}
