"use client";

import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DroneRoute3D } from "@/lib/oasis/droneRouteTypes";

const PHASE_COLORS: Record<string, string> = {
  surface: "#94a3b8",
  descent: "#38bdf8",
  "certified-survey-loop": "#14b8a6",
  "growth-plate-inspection": "#a78bfa",
  "seabed-scan": "#f59e0b",
  ascent: "#22c55e",
};

export default function DepthProfile({ route }: { route: DroneRoute3D }) {
  const [mounted, setMounted] = useState(false);
  const data = route.waypoints.map((waypoint, index) => ({
    index,
    label: waypoint.id,
    depth: waypoint.depthM,
    phase: waypoint.phase,
    summit: route.structure.summitDepthM,
    seabed: route.structure.seabedDepthM,
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-3 text-lg font-semibold">Depth Over The Route</h2>
      <div className="h-72 min-h-72 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis
                reversed
                domain={[0, 12]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                label={{ value: "Depth (m)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{ background: "#020617", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <ReferenceLine y={0} stroke="#e0f2fe" strokeDasharray="3 3" label="surface" />
              <ReferenceLine y={route.structure.summitDepthM} stroke="#a78bfa" strokeDasharray="4 4" />
              <ReferenceArea y1={10} y2={12} fill="#78350f" fillOpacity={0.18} />
              <Area dataKey="seabed" fill="#475569" stroke="none" fillOpacity={0.08} />
              <Line
                type="monotone"
                dataKey="depth"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={({ cx, cy, payload }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={PHASE_COLORS[payload.phase] ?? "#22d3ee"}
                    stroke="#020617"
                    strokeWidth={1}
                  />
                )}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-950/60 text-xs text-slate-500">
            Loading depth chart...
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <span key={phase} className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {phase.replaceAll("-", " ")}
          </span>
        ))}
      </div>
    </section>
  );
}
