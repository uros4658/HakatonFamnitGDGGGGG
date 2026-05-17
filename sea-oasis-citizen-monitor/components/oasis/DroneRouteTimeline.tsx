import type { DroneRoute3D } from "@/lib/oasis/droneRouteTypes";
import { calculateRouteDuration, getRequiredCaptures } from "@/lib/oasis/routeValidation3D";

export default function DroneRouteTimeline({ route }: { route: DroneRoute3D }) {
  const required = getRequiredCaptures(route);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-4 grid gap-3 text-xs md:grid-cols-3">
        <Stat label="Estimated demo duration" value={`${calculateRouteDuration(route)} s`} />
        <Stat label="Required captures" value={String(required.length)} />
        <Stat label="Main loop" value={route.certifiedHorizontalSegment.directions.join(" -> ")} />
      </div>
      <ol className="space-y-2">
        {route.waypoints.map((waypoint) => (
          <li key={waypoint.id} className="flex gap-3 rounded-lg bg-slate-950/50 p-3 text-xs">
            <span className="font-mono text-cyan-200">{waypoint.id}</span>
            <div>
              <div className="font-medium text-slate-100">{waypoint.label}</div>
              <div className="text-slate-400">
                {waypoint.phase.replaceAll("-", " ")} - depth {waypoint.depthM.toFixed(1)} m -{" "}
                {waypoint.target.replaceAll("-", " ")}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950/70 p-3">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-100">{value}</div>
    </div>
  );
}
