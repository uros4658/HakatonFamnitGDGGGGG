"use client";
import { useState } from "react";
import { Compass, Copy, Check, ArrowRight, Camera } from "lucide-react";
import { getBestRoutes, RoutePattern } from "@/lib/roots/routePatterns";
import { setSelectedRoute } from "@/lib/observations/storage";
import { useRouter } from "next/navigation";

const MODES = ["Quick", "Standard", "Detailed"];
const TARGETS = ["Artificial reef perimeter", "Growth plates", "Seagrass meadow", "Cleanup/trash scan", "General biodiversity scan"];
const ORDERS = [4, 6, 8, 12];
const AVOID = ["None", "N", "E", "S", "W", "NE", "SE", "SW", "NW"];
const CURRENTS = ["calm", "mild", "strong"];
const OPERATORS = ["snorkeler", "diver", "underwater drone"];

const PHOTO_STOPS = ["front", "back", "top", "left", "right", "lower side", "growth plates"];

export default function PlannerPage() {
  const router = useRouter();
  const [mode, setMode] = useState("Standard");
  const [order, setOrder] = useState(8);
  const [maxLength, setMaxLength] = useState(8);
  const [target, setTarget] = useState(TARGETS[0]);
  const [avoid, setAvoid] = useState("None");
  const [current, setCurrent] = useState("calm");
  const [operator, setOperator] = useState("diver");
  const [routes, setRoutes] = useState<RoutePattern[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  function generate() {
    const results = getBestRoutes({
      order,
      maxLength,
      target,
      avoidSector: avoid,
      currentStrength: current,
      operator,
      surveyMode: mode.toLowerCase(),
    });
    setRoutes(results);
  }

  function useRoute(route: RoutePattern) {
    setSelectedRoute(route.id);
    router.push("/checklist");
  }

  function copyCode(id: string) {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Compass className="text-cyan-400" size={28} />
        <h1 className="text-2xl font-bold">Survey Route Planner</h1>
      </div>
      <p className="text-sm text-slate-400">
        Generate balanced primitive survey routes using roots-of-unity vanishing sums.
        A balanced route has direction vectors that sum to zero � eliminating directional bias.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
        <Field label="Survey mode">
          <div className="flex gap-1">
            {MODES.map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${mode === m ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Target">
          <select value={target} onChange={e => setTarget(e.target.value)} className="input-field">
            {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Direction resolution">
          <select value={order} onChange={e => setOrder(Number(e.target.value))} className="input-field">
            {ORDERS.map(o => <option key={o} value={o}>{o} directions</option>)}
          </select>
        </Field>
        <Field label="Max route length">
          <input type="range" min={4} max={21} value={maxLength} onChange={e => setMaxLength(Number(e.target.value))} className="w-full" />
          <span className="text-xs text-slate-400">{maxLength} steps</span>
        </Field>
        <Field label="Avoid sector">
          <select value={avoid} onChange={e => setAvoid(e.target.value)} className="input-field">
            {AVOID.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Current strength">
          <select value={current} onChange={e => setCurrent(e.target.value)} className="input-field">
            {CURRENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Operator">
          <select value={operator} onChange={e => setOperator(e.target.value)} className="input-field">
            {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <button onClick={generate} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors">
        Generate Routes
      </button>

      {routes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Best {routes.length} Route Candidates</h2>
          {routes.map((route, i) => (
            <div key={route.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">{route.id}</span>
                  <button onClick={() => copyCode(route.id)} className="text-slate-400 hover:text-white" title="Copy route code">
                    {copied === route.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  {route.isMinimal && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300">primitive</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-300">balanced</span>
                </div>
                <span className="text-xs text-slate-500">#{i + 1}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Route:</span>
                <span className="font-mono text-cyan-300">
                  {route.directions.join(" ? ")}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <Stat label="Length" value={`${route.weight} steps`} />
                <Stat label="Order N" value={String(route.order)} />
                <Stat label="Type" value={route.catalogType || "�"} />
                <Stat label="Target suitability" value={target} />
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 font-mono text-xs text-slate-300">
                <div>{route.certificate}</div>
                <div className="mt-1 text-slate-500">
                  Minimality: {route.isMinimal ? "primitive / minimal" : "composite"}
                  {route.catalogType && ` � Catalog type: ${route.catalogType}`}
                  {route.catalogEntryId && ` (${route.catalogEntryId})`}
                </div>
              </div>

              <p className="text-xs text-slate-400">
                This route is balanced (sum of direction vectors = 0), so repeated surveys
                are less directionally biased. {route.isMinimal ? "It is primitive (minimal vanishing sum) � not decomposable into smaller balanced sub-routes." : ""}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Camera size={12} />
                <span>Suggested photo stops: {PHOTO_STOPS.join(", ")}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => useRoute(route)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Use this route for checklist <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {routes.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Compass size={48} className="mx-auto mb-3 opacity-30" />
          <p>Configure parameters and click Generate Routes.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className="font-medium text-white">{value}</div>
    </div>
  );
}
