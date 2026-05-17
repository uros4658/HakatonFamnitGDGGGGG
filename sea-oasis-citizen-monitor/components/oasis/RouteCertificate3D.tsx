import { CheckCircle, Sigma, TriangleAlert } from "lucide-react";
import type { DroneRoute3D } from "@/lib/oasis/droneRouteTypes";
import {
  validateCertifiedHorizontalSegment,
  validateRouteCaptures,
  validateVerticalBalance,
} from "@/lib/oasis/routeValidation3D";

export default function RouteCertificate3D({ route }: { route: DroneRoute3D }) {
  const horizontal = validateCertifiedHorizontalSegment(route);
  const vertical = validateVerticalBalance(route);
  const captures = validateRouteCaptures(route);
  const warnings = [
    ...horizontal.warnings,
    ...(vertical.valid ? [] : [`Vertical depth deltas sum to ${vertical.sum} m.`]),
    ...(captures.valid ? [] : [`Missing required targets: ${captures.missingTargets.join(", ")}`]),
  ];

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sigma className="text-teal-300" size={20} />
        <h2 className="text-lg font-semibold">Route Checks</h2>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-800 bg-amber-950/40 p-3 text-xs text-amber-200">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <TriangleAlert size={14} /> Validation warning
          </div>
          <ul className="list-disc pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <CertificateBlock
          title="Balanced Movement"
          expression={route.certifiedHorizontalSegment.certificate}
          meaning={`The survey loop follows ${route.certifiedHorizontalSegment.directions.join(", ")} and returns to its starting horizontal position.`}
        />
        <CertificateBlock
          title="Depth Return"
          expression={route.verticalCertificate}
          meaning="The main loop also returns to its starting depth."
        />
      </div>

      <div className="grid gap-2 text-xs text-slate-300 md:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 p-3">
          <CheckCircle size={14} className="text-teal-300" />
          Horizontal route check: validates the balanced survey loop.
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-950/60 p-3">
          <CheckCircle size={14} className="text-cyan-300" />
          Depth profile: checked separately.
        </div>
      </div>
    </section>
  );
}

function CertificateBlock({
  title,
  expression,
  meaning,
}: {
  title: string;
  expression: string;
  meaning: string;
}) {
  return (
    <div className="rounded-lg bg-slate-950/60 p-4">
      <div className="text-xs font-medium uppercase text-slate-500">{title}</div>
      <div className="mt-2 font-mono text-sm text-cyan-200">{expression}</div>
      <p className="mt-2 text-xs text-slate-400">{meaning}</p>
    </div>
  );
}
