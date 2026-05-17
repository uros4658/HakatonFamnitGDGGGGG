import { Observation } from "../observations/schema";
import { PRECOMPUTED_ROUTES } from "../roots/routePatterns";

export function buildCsv(observations: Observation[]): string {
  const headers = [
    "observationId", "observer", "date", "month", "routeId", "routeCertificate",
    "locationType", "surveyMethod", "visibility", "seaCondition", "disturbanceLevel",
    "tags", "growthPlateScore", "wasteSeverity", "damageSeverity", "followUpNeeded", "notes",
  ];

  const rows = observations.map(obs => {
    const route = obs.routeId ? PRECOMPUTED_ROUTES.find(r => r.id === obs.routeId) : null;
    return [
      obs.id,
      obs.observer,
      obs.date,
      obs.month,
      obs.routeId || "",
      route ? route.certificate : "",
      obs.locationType,
      obs.surveyMethod,
      obs.visibility,
      obs.seaCondition,
      obs.disturbanceLevel,
      obs.tags.map(t => t.tag).join(";"),
      obs.growthPlateScore || "",
      obs.wasteSeverity,
      obs.damageSeverity,
      obs.followUpNeeded,
      (obs.notes || "").replace(/,/g, ";"),
    ];
  });

  return [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
}
