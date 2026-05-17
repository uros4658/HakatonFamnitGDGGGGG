"use client";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { getObservations, getChecklists } from "@/lib/observations/storage";
import { MOCK_OBSERVATIONS } from "@/lib/observations/mockData";
import { Observation } from "@/lib/observations/schema";
import { Checklist } from "@/lib/checklist/checklistSchema";
import { computeMonthlyStats, computeTagFrequency, computeRepeatabilityScore } from "@/lib/observations/stats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [targetFilter, setTargetFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    const stored = getObservations();
    setObservations([...MOCK_OBSERVATIONS, ...stored]);
    setChecklists(getChecklists());
  }, []);

  const allMonths = [...new Set(observations.map(o => o.month))].sort();

  const filtered = observations
    .filter(o => targetFilter === "all" || o.locationType === targetFilter)
    .filter(o => monthFilter === "all" || o.month === monthFilter);

  const monthlyStats = computeMonthlyStats(filtered);
  const tagFreq = computeTagFrequency(filtered);
  const repeatability = computeRepeatabilityScore(filtered);
  const topTags = Object.entries(tagFreq).sort(([, a], [, b]) => b - a).slice(0, 8);

  // Visibility distribution
  const visibilityDist = [
    { name: "poor", value: filtered.filter(o => o.visibility === "poor").length },
    { name: "medium", value: filtered.filter(o => o.visibility === "medium").length },
    { name: "good", value: filtered.filter(o => o.visibility === "good").length },
  ].filter(d => d.value > 0);

  // Disturbance distribution
  const disturbanceDist = [
    { name: "none", value: filtered.filter(o => o.disturbanceLevel === "none").length },
    { name: "low", value: filtered.filter(o => o.disturbanceLevel === "low").length },
    { name: "medium", value: filtered.filter(o => o.disturbanceLevel === "medium").length },
    { name: "high", value: filtered.filter(o => o.disturbanceLevel === "high").length },
  ].filter(d => d.value > 0);

  // Checklist completion rate over time
  const checklistByMonth = allMonths.map(month => {
    const monthChecklists = checklists.filter(c => c.date.startsWith(month));
    const completed = monthChecklists.filter(c => c.requiredComplete).length;
    const total = monthChecklists.length;
    return { month, rate: total > 0 ? Math.round((completed / total) * 100) : null, total };
  }).filter(m => m.total > 0);

  const PIE_COLORS = ["#06b6d4", "#14b8a6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-400" size={28} />
          <h1 className="text-2xl font-bold">Monthly Dashboard</h1>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-900/50 text-amber-300">demo data</span>
      </div>

      <p className="text-xs text-slate-500">
        Trends are based on citizen observations and should be reviewed by experts.
      </p>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-slate-500 w-12">Target:</span>
          {["all", "artificial_reef", "growth_plates", "seagrass_meadow", "cleanup_area"].map(f => (
            <button
              key={f}
              onClick={() => setTargetFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg ${targetFilter === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-slate-500 w-12">Month:</span>
          <button
            onClick={() => setMonthFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-lg ${monthFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
          >
            all
          </button>
          {allMonths.map(m => (
            <button
              key={m}
              onClick={() => setMonthFilter(m)}
              className={`text-xs px-3 py-1.5 rounded-lg ${monthFilter === m ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Surveys this month" value={String(monthFilter === "all" ? filtered.length : filtered.filter(o => o.month === monthFilter).length)} />
        <StatCard label="Total Observations" value={String(filtered.length)} />
        <StatCard label="Completed Checklists" value={String(checklists.filter(c => c.requiredComplete).length)} />
        <StatCard label="Waste Reports" value={String(filtered.filter(o => o.wasteSeverity !== "none").length)} />
        <StatCard label="Repeatability" value={`${repeatability}/100`} color={repeatability >= 70 ? "text-emerald-400" : "text-amber-400"} />
      </div>

      {/* Most common tags */}
      {topTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Top tags:</span>
          {topTags.map(([tag, count]) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
              {tag.replace(/_/g, " ")} ({count})
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Surveys">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="surveys" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tag Frequency">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topTags.map(([tag, count]) => ({ tag: tag.replace(/_/g, " "), count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis type="category" dataKey="tag" tick={{ fill: "#94a3b8", fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Growth Plate Score Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyStats.filter(m => m.avgGrowth !== null)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis domain={[0, 3]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Line type="monotone" dataKey="avgGrowth" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waste & Damage Reports Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="waste" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="damage" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Visibility Quality Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={visibilityDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                {visibilityDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Disturbance Level Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={disturbanceDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                {disturbanceDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {checklistByMonth.length > 0 && (
          <ChartCard title="Checklist Completion Rate Over Time">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={checklistByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Route repeatability breakdown */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-semibold mb-2">Route Repeatability Score: {repeatability}/100</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-400">
          <div>Balanced route used: {filtered.filter(o => o.routeId).length}/{filtered.length} surveys</div>
          <div>Ethics confirmed: {filtered.filter(o => o.ethicsConfirmed).length}/{filtered.length} surveys</div>
          <div>Notes included: {filtered.filter(o => o.notes).length}/{filtered.length} surveys</div>
        </div>
      </div>

      {/* Expert Review Queue */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-semibold mb-2">Expert Review Queue</h3>
        {filtered.filter(o => o.followUpNeeded !== "none").length === 0 ? (
          <p className="text-xs text-slate-500">No items needing review.</p>
        ) : (
          <div className="space-y-1">
            {filtered.filter(o => o.followUpNeeded !== "none").map(o => (
              <div key={o.id} className="flex items-center gap-2 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">{o.followUpNeeded.replace(/_/g, " ")}</span>
                <span className="text-slate-400">{o.date} � {o.observer}</span>
                {o.notes && <span className="text-slate-500 truncate max-w-[200px]">{o.notes}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color || "text-white"}`}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
      <h3 className="text-sm font-semibold mb-3 text-slate-300">{title}</h3>
      {children}
    </div>
  );
}
