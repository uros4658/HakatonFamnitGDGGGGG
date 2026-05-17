import type { DroneRoute3D } from "@/lib/oasis/droneRouteTypes";
import { offsetToLatLng } from "@/lib/oasis/localFrame";

export default function WaypointTable({ route }: { route: DroneRoute3D }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Waypoint Details</h2>
          <p className="text-xs text-slate-400">
            Approximate lat/lng is derived from local offsets for display only.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="py-2 pr-3">Waypoint</th>
              <th className="py-2 pr-3">Phase</th>
              <th className="py-2 pr-3">Local offset</th>
              <th className="py-2 pr-3">Approx. lat/lng</th>
              <th className="py-2 pr-3">Depth</th>
              <th className="py-2 pr-3">Target</th>
              <th className="py-2 pr-3">Required</th>
              <th className="py-2 pr-3">Instruction</th>
            </tr>
          </thead>
          <tbody>
            {route.waypoints.map((waypoint) => {
              const latLng = offsetToLatLng(
                route.location.latitude,
                route.location.longitude,
                waypoint.localEastM,
                waypoint.localNorthM
              );

              return (
                <tr key={waypoint.id} className="border-b border-slate-800/70 align-top">
                  <td className="py-3 pr-3 font-mono text-cyan-200">
                    {waypoint.id}
                    <div className="font-sans text-slate-300">{waypoint.label}</div>
                  </td>
                  <td className="py-3 pr-3 text-slate-300">{waypoint.phase.replaceAll("-", " ")}</td>
                  <td className="py-3 pr-3 font-mono text-slate-300">
                    E {waypoint.localEastM.toFixed(1)} m, N {waypoint.localNorthM.toFixed(1)} m
                  </td>
                  <td className="py-3 pr-3 font-mono text-slate-300">
                    {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                  </td>
                  <td className="py-3 pr-3 font-mono text-slate-300">{waypoint.depthM.toFixed(1)} m</td>
                  <td className="py-3 pr-3 text-slate-300">{waypoint.target.replaceAll("-", " ")}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        waypoint.captureRequired
                          ? "bg-teal-900/60 text-teal-200"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {waypoint.captureRequired ? "yes" : "no"}
                    </span>
                  </td>
                  <td className="max-w-sm py-3 pr-3 text-slate-400">{waypoint.instruction}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
