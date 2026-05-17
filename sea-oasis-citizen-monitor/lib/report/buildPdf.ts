import { jsPDF } from "jspdf";
import { Observation } from "../observations/schema";
import { computeTagFrequency, computeRepeatabilityScore } from "../observations/stats";

export function buildPdf(observations: Observation[]): jsPDF {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("SeaOasis Citizen Monitoring Report", 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Hackathon prototype report. Demo/citizen-science data. Requires expert verification.", 20, y);
  doc.setTextColor(0);
  y += 12;

  doc.setFontSize(12);
  doc.text("Summary", 20, y);
  y += 8;

  doc.setFontSize(10);
  const months = [...new Set(observations.map(o => o.month))].sort();
  const observers = [...new Set(observations.map(o => o.observer))];
  doc.text(`Date range: ${months[0] || "N/A"} to ${months[months.length - 1] || "N/A"}`, 20, y); y += 6;
  doc.text(`Total surveys: ${observations.length}`, 20, y); y += 6;
  doc.text(`Observers: ${observers.join(", ")}`, 20, y); y += 6;
  doc.text(`Repeatability score: ${computeRepeatabilityScore(observations)}/100`, 20, y); y += 10;

  doc.setFontSize(12);
  doc.text("Top Tags", 20, y);
  y += 8;

  doc.setFontSize(10);
  const freq = computeTagFrequency(observations);
  const topTags = Object.entries(freq).sort(([, a], [, b]) => b - a).slice(0, 10);
  for (const [tag, count] of topTags) {
    doc.text(`- ${tag}: ${count}`, 25, y); y += 5;
    if (y > 270) { doc.addPage(); y = 20; }
  }
  y += 5;

  const wasteObs = observations.filter(o => o.wasteSeverity !== "none");
  const damageObs = observations.filter(o => o.damageSeverity !== "none");
  if (wasteObs.length > 0 || damageObs.length > 0) {
    doc.setFontSize(12);
    doc.text("Waste & Damage", 20, y); y += 8;
    doc.setFontSize(10);
    doc.text(`Waste reports: ${wasteObs.length}`, 25, y); y += 5;
    doc.text(`Damage reports: ${damageObs.length}`, 25, y); y += 5;
  }
  y += 5;

  const followUps = observations.filter(o => o.followUpNeeded !== "none");
  if (followUps.length > 0) {
    doc.setFontSize(12);
    doc.text("Follow-up Actions", 20, y); y += 8;
    doc.setFontSize(10);
    for (const obs of followUps) {
      doc.text(`- ${obs.date} (${obs.observer}): ${obs.followUpNeeded}`, 25, y); y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    }
  }

  return doc;
}
