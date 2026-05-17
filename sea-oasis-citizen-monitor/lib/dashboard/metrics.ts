import { Observation } from "../observations/schema";
import { Checklist } from "../checklist/checklistSchema";

export function computeSurveyQualityScore(obs: Observation, checklist?: Checklist): number {
  let score = 0;
  if (obs.routeId) score += 25;
  if (checklist) {
    const required = checklist.items.filter(i => i.required);
    const done = required.filter(i => i.status === "captured");
    score += Math.round((done.length / Math.max(required.length, 1)) * 35);
  } else {
    score += 15;
  }
  if (obs.visibility === "good") score += 15;
  else if (obs.visibility === "medium") score += 10;
  if (obs.ethicsConfirmed) score += 15;
  if (obs.notes) score += 10;
  return Math.min(100, score);
}

export function getQualityLabel(score: number): string {
  if (score >= 71) return "strong";
  if (score >= 41) return "usable";
  return "weak";
}

export function getCleanupPriority(obs: Observation): "high" | "medium" | "low" | "none" {
  const severityScore = { none: 0, low: 1, medium: 2, high: 3 };
  const total = severityScore[obs.wasteSeverity] + severityScore[obs.damageSeverity];
  if (obs.followUpNeeded === "cleanup_needed") total + 2;
  if (total >= 4) return "high";
  if (total >= 2) return "medium";
  if (total >= 1) return "low";
  return "none";
}
