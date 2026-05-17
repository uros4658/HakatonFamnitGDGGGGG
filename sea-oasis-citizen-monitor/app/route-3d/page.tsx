"use client";

import { useMemo, useState } from "react";
import { Download, ListChecks, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import DepthProfile from "@/components/oasis/DepthProfile";
import DroneRouteAnimator3D from "@/components/oasis/DroneRouteAnimator3D";
import DroneRouteTimeline from "@/components/oasis/DroneRouteTimeline";
import OasisLocationCard from "@/components/oasis/OasisLocationCard";
import OasisMiniMap from "@/components/oasis/OasisMiniMap";
import RouteCertificate3D from "@/components/oasis/RouteCertificate3D";
import WaypointTable from "@/components/oasis/WaypointTable";
import { generateSeaOasisDroneRoutes, type DroneRouteMode } from "@/lib/oasis/droneRouteGenerator";
import { SEA_OASIS_LOCATION } from "@/lib/oasis/seaOasisConstants";
import { setSelectedRoute } from "@/lib/observations/storage";

const TARGETS = ["Artificial reef perimeter", "Growth plates", "Cleanup/trash scan", "General biodiversity scan"];
const ORDERS = [4, 6, 8, 12];
const MODES: { label: string; value: DroneRouteMode }[] = [
  { label: "Quick", value: "quick" },
  { label: "Standard", value: "standard" },
  { label: "Detailed", value: "detailed" },
];
const CURRENTS = ["calm", "mild", "strong"];
const AVOID = ["None", "N", "E", "S", "W", "NE", "SE", "SW", "NW"];

export default function Route3DPage() {
  const router = useRouter();
  const [mode, setMode] = useState<DroneRouteMode>("standard");
  const [order, setOrder] = useState(4);
  const [target, setTarget] = useState(TARGETS[0]);
  const [avoidSector, setAvoidSector] = useState("None");
  const [currentStrength, setCurrentStrength] = useState("calm");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const routes = useMemo(
    () =>
      generateSeaOasisDroneRoutes({
        mode,
        order,
        target,
        avoidSector,
        currentStrength,
        count: 3,
      }),
    [avoidSector, currentStrength, mode, order, target]
  );
  const route = routes[selectedIndex] ?? routes[0];

  function useInChecklist() {
    setSelectedRoute(route.id);
    localStorage.setItem("seaOasis.routes.selectedRoute3D", JSON.stringify(route));
    router.push("/checklist");
  }

  function exportRouteJson() {
    const payload = {
      route,
      sourceConstants: SEA_OASIS_LOCATION,
      generatedAt: new Date().toISOString(),
      disclaimer: SEA_OASIS_LOCATION.disclaimer,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sea-oasis-piran-3d-drone-route.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Navigation className="text-cyan-300" size={28} />
            <h1 className="text-2xl font-bold">Sea Oasis Piran 3D Survey Planner</h1>
          </div>
          <p className="max-w-4xl text-sm text-slate-400">
            Build a repeatable underwater survey route anchored to the public Sea Oasis Piran location.
            Choose a route pattern, preview the drone pass around the structure, and send the required
            photo targets into the checklist.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={useInChecklist}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
          >
            <ListChecks size={16} />
            Use this 3D route in checklist
          </button>
          <button
            onClick={exportRouteJson}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            <Download size={16} />
            Export route JSON
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <OasisLocationCard />
        <OasisMiniMap />
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Build a Route</h2>
          <p className="text-xs text-slate-400">
            Set the survey length, route shape, and priority target. The planner prepares three balanced
            route options and adds the growth-plate and seabed passes automatically.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Survey mode">
            <div className="flex rounded-lg bg-slate-800 p-1">
              {MODES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setMode(item.value);
                    setSelectedIndex(0);
                  }}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
                    mode === item.value ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Route shape">
            <select
              value={order}
              onChange={(event) => {
                setOrder(Number(event.target.value));
                setSelectedIndex(0);
              }}
              className="input-field"
            >
              {ORDERS.map((value) => (
                <option key={value} value={value}>
                  {value} directions
                </option>
              ))}
            </select>
          </Field>
          <Field label="Target">
            <select
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setSelectedIndex(0);
              }}
              className="input-field"
            >
              {TARGETS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Avoid sector">
            <select
              value={avoidSector}
              onChange={(event) => {
                setAvoidSector(event.target.value);
                setSelectedIndex(0);
              }}
              className="input-field"
            >
              {AVOID.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Current">
            <select
              value={currentStrength}
              onChange={(event) => {
                setCurrentStrength(event.target.value);
                setSelectedIndex(0);
              }}
              className="input-field"
            >
              {CURRENTS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {routes.map((candidate, index) => (
            <button
              key={candidate.id}
              onClick={() => setSelectedIndex(index)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                selectedIndex === index
                  ? "border-cyan-500 bg-cyan-950/30"
                  : "border-slate-800 bg-slate-950/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-cyan-200">
                  Option {index + 1}
                </span>
                {candidate.certifiedHorizontalSegment.isMinimal && (
                  <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] text-emerald-200">
                    minimal
                  </span>
                )}
              </div>
              <div className="mt-2 font-mono text-xs text-slate-300">
                {candidate.certifiedHorizontalSegment.directions.join(" -> ")}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Movement pattern: {candidate.certifiedHorizontalSegment.directions.join(" -> ")}
              </div>
            </button>
          ))}
        </div>
      </section>

      <DroneRouteAnimator3D key={route.id} route={route} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <RouteCertificate3D route={route} />
        <DroneRouteTimeline route={route} />
      </div>

      <DepthProfile route={route} />
      <WaypointTable route={route} />
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
