"use client";
import { useState, useEffect } from "react";
import { FileText, Download, AlertTriangle } from "lucide-react";
import { getObservations, getChecklists } from "@/lib/observations/storage";
import { MOCK_OBSERVATIONS } from "@/lib/observations/mockData";
import { Observation } from "@/lib/observations/schema";
import { buildCsv } from "@/lib/report/buildCsv";
import { buildJsonReport } from "@/lib/report/buildJson";
import { downloadBlob } from "@/lib/utils";
import { computeTagFrequency, computeRepeatabilityScore } from "@/lib/observations/stats";

export default function ReportPage() {
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    const stored = getObservations();
    setObservations([...MOCK_OBSERVATIONS, ...stored]);
  }, []);

  const months = [...new Set(observations.map(o => o.month))].sort();
  const observers = [...new Set(observations.map(o => o.observer))];
  const tagFreq = computeTagFrequency(observations);
  const topTags = Object.entries(tagFreq).sort(([, a], [, b]) => b - a).slice(0, 10);
  const wasteObs = observations.filter(o => o.wasteSeverity !== "none");
  const damageObs = observations.filter(o => o.damageSeverity !== "none");
  const followUps = observations.filter(o => o.followUpNeeded !== "none");
  const repeatability = computeRepeatabilityScore(observations);

  function exportCsv() {
    const csv = buildCsv(observations);
    downloadBlob(csv, "seaoasis-report.csv", "text/csv");
  }

  function exportJson() {
    const json = buildJsonReport(observations);
    downloadBlob(json, "seaoasis-report.json", "application/json");
  }

  async function exportPdf() {
    const { buildPdf } = await import("@/lib/report/buildPdf");
    const doc = buildPdf(observations);
    doc.save("seaoasis-report.pdf");
  }

  const warnings: string[] = [];
  const checklists = typeof window !== "undefined" ? getChecklists() : [];
  if (observations.some(o => !o.routeId)) warnings.push("Some observations have no route selected");
  if (observations.some(o => !o.notes)) warnings.push("Some observations have no notes");
  if (checklists.some(c => !c.requiredComplete)) warnings.push("Some checklists have missing required photos");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="text-emerald-400" size={28} />
        <h1 className="text-2xl font-bold">Export Report</h1>
      </div>

      <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800 text-xs text-amber-300">
        Hackathon prototype report. Demo/citizen-science data. Requires expert verification before scientific or conservation decisions.
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <h2 className="font-semibold">SeaOasis Citizen Monitoring Report</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-slate-500">Date range:</span> <span>{months[0] || "-"} to {months[months.length - 1] || "-"}</span></div>
          <div><span className="text-slate-500">Surveys:</span> <span>{observations.length}</span></div>
          <div><span className="text-slate-500">Observers:</span> <span>{observers.length}</span></div>
          <div><span className="text-slate-500">Repeatability:</span> <span>{repeatability}/100</span></div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-1">Top Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/30 text-cyan-300">
                {tag.replace(/_/g, " ")} ({count})
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="text-xs text-slate-500 mb-1">Waste reports</div>
            <div className="font-bold text-amber-400">{wasteObs.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="text-xs text-slate-500 mb-1">Damage reports</div>
            <div className="font-bold text-red-400">{damageObs.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="text-xs text-slate-500 mb-1">Follow-up needed</div>
            <div className="font-bold text-amber-300">{followUps.length}</div>
          </div>
        </div>

        {followUps.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Follow-up Actions</h3>
            <div className="space-y-1">
              {followUps.map(o => (
                <div key={o.id} className="text-xs text-slate-400">
                  {o.date} ({o.observer}): {o.followUpNeeded.replace(/_/g, " ")}
                  {o.notes && ` - ${o.notes}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {checklists.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <h3 className="text-sm font-semibold">Photo Checklist Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checklists.slice(0, 4).map(cl => {
              const captured = cl.items.filter(i => i.status === "captured").length;
              const withPhoto = cl.items.filter(i => i.photoPlaceholder).length;
              return (
                <div key={cl.id} className="p-3 rounded-lg bg-slate-800/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">{cl.observer} - {cl.date}</span>
                    <span className="text-slate-500">{cl.completionPercentage}%</span>
                  </div>
                  <div className="text-slate-400">
                    {captured}/{cl.items.length} captured, {withPhoto} with photo file
                  </div>
                  {cl.items.filter(i => i.photoPlaceholder).slice(0, 3).map(i => (
                    <div key={i.id} className="text-slate-500 font-mono truncate">{i.photoPlaceholder}</div>
                  ))}
                  {withPhoto > 3 && <div className="text-slate-600">+{withPhoto - 3} more files</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
            <AlertTriangle size={12} /> Data Completeness Warnings
          </div>
          {warnings.map((w, i) => (
            <div key={i} className="text-xs text-amber-400/80">- {w}</div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={exportJson} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
          <Download size={14} /> JSON
        </button>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
          <Download size={14} /> CSV
        </button>
        <button onClick={exportPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors">
          <Download size={14} /> PDF
        </button>
      </div>
    </div>
  );
}
