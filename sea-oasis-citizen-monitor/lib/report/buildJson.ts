import { Observation } from "../observations/schema";
import { computeTagFrequency, computeRepeatabilityScore } from "../observations/stats";

export function buildJsonReport(observations: Observation[]): string {
  const months = [...new Set(observations.map(o => o.month))].sort();
  const observers = [...new Set(observations.map(o => o.observer))];

  const report = {
    title: "SeaOasis Citizen Monitoring Report",
    disclaimer: "Hackathon prototype. Demo/citizen-science data. Requires expert verification.",
    generatedAt: new Date().toISOString(),
    summary: {
      dateRange: { from: months[0] || null, to: months[months.length - 1] || null },
      totalSurveys: observations.length,
      observers,
      repeatabilityScore: computeRepeatabilityScore(observations),
    },
    tagFrequency: computeTagFrequency(observations),
    wasteReports: observations.filter(o => o.wasteSeverity !== "none").length,
    damageReports: observations.filter(o => o.damageSeverity !== "none").length,
    followUpActions: observations.filter(o => o.followUpNeeded !== "none").map(o => ({
      date: o.date, observer: o.observer, action: o.followUpNeeded, notes: o.notes,
    })),
    observations,
  };

  return JSON.stringify(report, null, 2);
}
