"use client";
import { useState } from "react";
import { Camera, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { createNewChecklist, calculateProgress } from "@/lib/checklist/checklistData";
import { ChecklistItem, Checklist } from "@/lib/checklist/checklistSchema";
import { saveChecklist, getSelectedRoute } from "@/lib/observations/storage";
import { PhotoGrid } from "@/components/PhotoPlaceholder";
import { useRouter } from "next/navigation";

export default function ChecklistPage() {
  const router = useRouter();
  const [observer, setObserver] = useState("");
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  function startChecklist() {
    if (!observer.trim()) return;
    const routeId = getSelectedRoute() || undefined;
    const cl = createNewChecklist(observer, routeId);
    setChecklist(cl);
  }

  function updateItem(id: string, updates: Partial<ChecklistItem>) {
    if (!checklist) return;
    const items = checklist.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    const { percentage, requiredComplete } = calculateProgress(items);
    const updated = { ...checklist, items, completionPercentage: percentage, requiredComplete };
    setChecklist(updated);
  }

  function save() {
    if (!checklist) return;
    saveChecklist(checklist);
    alert("Checklist saved!");
  }

  function continueToObs() {
    if (!checklist) return;
    if (!checklist.requiredComplete) {
      setShowWarning(true);
      return;
    }
    saveChecklist(checklist);
    router.push("/observations");
  }

  if (!checklist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Camera className="text-teal-400" size={28} />
          <h1 className="text-2xl font-bold">Photo Checklist</h1>
        </div>
        <p className="text-sm text-slate-400">
          Complete structured photo captures to make citizen-science data repeatable and comparable.
        </p>
        <div className="max-w-sm space-y-3">
          <label className="text-sm text-slate-400">Observer name</label>
          <input
            value={observer}
            onChange={e => setObserver(e.target.value)}
            placeholder="Your name"
            className="input-field w-full"
          />
          <button onClick={startChecklist} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg font-medium transition-colors">
            Start Checklist
          </button>
        </div>
        <ReminderBox />
      </div>
    );
  }

  const { percentage, requiredComplete } = calculateProgress(checklist.items);
  const missingRequired = checklist.items.filter(i => i.required && i.status !== "captured");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="text-teal-400" size={28} />
          <h1 className="text-2xl font-bold">Photo Checklist</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-teal-400">{percentage}%</div>
          <div className="text-xs text-slate-400">complete</div>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2">
        <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>

      {!requiredComplete && missingRequired.length > 0 && (
        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-900/20 px-3 py-2 rounded-lg">
          <AlertTriangle size={14} />
          Missing required: {missingRequired.map(i => i.label).join(", ")}
        </div>
      )}

      <div className="space-y-2">
        {checklist.items.map(item => (
          <ItemRow key={item.id} item={item} onUpdate={updates => updateItem(item.id, updates)} />
        ))}
      </div>

      {checklist.items.some(i => i.status === "captured" && i.photoPlaceholder) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300">Captured Photos</h3>
          <PhotoGrid items={checklist.items} />
        </div>
      )}

      {showWarning && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-800 text-sm text-red-300">
          Required photos (front, back, top, growth plates) are not all captured. Complete them or mark as skipped before continuing.
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={save} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
          Save Checklist
        </button>
        <button onClick={continueToObs} className="px-5 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium transition-colors">
          Continue to Observations
        </button>
      </div>
    </div>
  );
}

function ItemRow({ item, onUpdate }: { item: ChecklistItem; onUpdate: (u: Partial<ChecklistItem>) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => onUpdate({ status: item.status === "captured" ? "not_started" : "captured" })}
          className={item.status === "captured" ? "text-emerald-400" : "text-slate-600"}
        >
          <CheckCircle size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{item.label}</span>
            {item.required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-300">required</span>}
            {item.status === "skipped" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">skipped</span>}
            {item.status === "captured" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">captured</span>}
          </div>
        </div>
        <select
          value={item.visibility || ""}
          onChange={e => onUpdate({ visibility: (e.target.value || undefined) as ChecklistItem["visibility"] })}
          className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300"
        >
          <option value="">visibility</option>
          <option value="poor">poor</option>
          <option value="medium">medium</option>
          <option value="good">good</option>
        </select>
        <select
          value={item.disturbanceRisk || ""}
          onChange={e => onUpdate({ disturbanceRisk: (e.target.value || undefined) as ChecklistItem["disturbanceRisk"] })}
          className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300"
        >
          <option value="">risk</option>
          <option value="none">none</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button
          onClick={() => onUpdate({ status: "skipped" })}
          className="text-slate-600 hover:text-amber-400"
          title="Skip"
        >
          <XCircle size={16} />
        </button>
        <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-white">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Photo filename / placeholder</label>
              <input
                value={item.photoPlaceholder || ""}
                onChange={e => onUpdate({ photoPlaceholder: e.target.value || undefined })}
                placeholder="e.g. IMG_2045.jpg"
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-300 mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Note</label>
              <input
                value={item.note || ""}
                onChange={e => onUpdate({ note: e.target.value || undefined })}
                placeholder="Optional note..."
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-300 mt-0.5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReminderBox() {
  return (
    <div className="mt-8 p-4 rounded-xl border border-slate-800 bg-slate-900/50 max-w-md">
      <h3 className="font-semibold text-sm text-amber-300 mb-2">Low-Disturbance Reminder</h3>
      <ul className="text-xs text-slate-400 space-y-1">
        <li>Keep distance from marine life</li>
        <li>Do not touch or move organisms</li>
        <li>Avoid stirring sediment</li>
        <li>Avoid flash if disturbing</li>
        <li>Do not collect shells or animals</li>
      </ul>
    </div>
  );
}
