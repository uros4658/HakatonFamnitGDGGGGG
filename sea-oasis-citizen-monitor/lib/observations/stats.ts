import { Observation } from "./schema";

export function computeTagFrequency(observations: Observation[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const obs of observations) {
    for (const t of obs.tags) {
      freq[t.tag] = (freq[t.tag] || 0) + 1;
    }
  }
  return freq;
}

export function computeMonthlyStats(observations: Observation[]) {
  const months: Record<string, { surveys: number; tags: Record<string, number>; growthScores: number[]; waste: number; damage: number }> = {};

  for (const obs of observations) {
    if (!months[obs.month]) {
      months[obs.month] = { surveys: 0, tags: {}, growthScores: [], waste: 0, damage: 0 };
    }
    const m = months[obs.month];
    m.surveys++;
    for (const t of obs.tags) {
      m.tags[t.tag] = (m.tags[t.tag] || 0) + 1;
    }
    if (obs.growthPlateScore && obs.growthPlateScore !== "unknown") {
      m.growthScores.push(parseInt(obs.growthPlateScore));
    }
    if (obs.wasteSeverity !== "none") m.waste++;
    if (obs.damageSeverity !== "none") m.damage++;
  }

  return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({
    month,
    surveys: data.surveys,
    avgGrowth: data.growthScores.length ? data.growthScores.reduce((a, b) => a + b, 0) / data.growthScores.length : null,
    waste: data.waste,
    damage: data.damage,
    topTags: Object.entries(data.tags).sort(([, a], [, b]) => b - a).slice(0, 5),
  }));
}

export function computeRepeatabilityScore(observations: Observation[]): number {
  if (observations.length === 0) return 0;
  const withRoute = observations.filter(o => o.routeId).length;
  const withEthics = observations.filter(o => o.ethicsConfirmed).length;

  const routeScore = (withRoute / observations.length) * 35;
  const ethicsScore = (withEthics / observations.length) * 15;
  const baseScore = Math.min(observations.length * 5, 25);
  const notesScore = observations.filter(o => o.notes).length / observations.length * 10;

  return Math.min(100, Math.round(routeScore + ethicsScore + baseScore + notesScore + 15));
}
