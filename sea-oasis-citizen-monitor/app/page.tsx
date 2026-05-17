import Link from "next/link";
import { Compass, Camera, ClipboardList, BarChart3, Trash2, FileText } from "lucide-react";

const MODULES = [
  { href: "/planner", label: "Plan balanced survey route", desc: "Generate primitive routes from roots-of-unity vanishing sums", icon: Compass, color: "bg-cyan-600" },
  { href: "/checklist", label: "Complete photo checklist", desc: "Structured repeatable photo captures for comparability", icon: Camera, color: "bg-teal-600" },
  { href: "/observations", label: "Record biodiversity observations", desc: "Species, habitat, growth plates, and condition tags", icon: ClipboardList, color: "bg-blue-600" },
  { href: "/dashboard", label: "Track monthly changes", desc: "Biodiversity trends, growth plates, waste reports", icon: BarChart3, color: "bg-indigo-600" },
  { href: "/report", label: "Report waste or damage", desc: "Document environmental issues for cleanup prioritization", icon: Trash2, color: "bg-amber-600" },
  { href: "/report", label: "Export NGO report", desc: "CSV, JSON, or PDF for researchers and conservation groups", icon: FileText, color: "bg-emerald-600" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          SeaOasis Citizen Monitor
        </h1>
        <p className="mt-3 text-lg text-slate-300">
          Repeatable citizen-science monitoring for marine biodiversity.
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-sm text-slate-400">
          The app helps volunteers and researchers collect structured observations around a marine
          habitat. It combines balanced survey-route planning, photo checklists, species/habitat
          tags, monthly monitoring dashboards, and exportable reports.
        </p>
        <div className="mt-4 inline-block px-3 py-1 rounded-full bg-amber-900/50 text-amber-300 text-xs font-medium">
          Hackathon prototype � Demo data only � Not an official YouSea product
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => (
          <Link
            key={mod.label}
            href={mod.href}
            className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-cyan-700 transition-colors"
          >
            <div className={`inline-flex p-2 rounded-lg ${mod.color} mb-3`}>
              <mod.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {mod.label}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{mod.desc}</p>
          </Link>
        ))}
      </section>

      <section className="text-center text-sm text-slate-500 py-6">
        <p>
          Marine conservation needs repeatable observations. This app turns citizen photos and
          notes into structured monitoring data.
        </p>
      </section>
    </div>
  );
}
