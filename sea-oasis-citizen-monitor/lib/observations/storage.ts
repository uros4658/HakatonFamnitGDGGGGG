import { Observation } from "./schema";
import { Checklist } from "../checklist/checklistSchema";
import { MOCK_CHECKLISTS } from "../checklist/mockChecklists";

const OBSERVATIONS_KEY = "seaOasis.observations";
const CHECKLISTS_KEY = "seaOasis.checklists";
const SELECTED_ROUTE_KEY = "seaOasis.routes.selected";

export function getObservations(): Observation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(OBSERVATIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveObservation(obs: Observation): void {
  const all = getObservations();
  all.push(obs);
  localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(all));
}

export function getChecklists(): Checklist[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CHECKLISTS_KEY);
  if (raw) return JSON.parse(raw);
  return MOCK_CHECKLISTS;
}

export function saveChecklist(cl: Checklist): void {
  const all = getChecklists().filter(c => !c.id.startsWith("cl-mock-"));
  const idx = all.findIndex(c => c.id === cl.id);
  if (idx >= 0) all[idx] = cl;
  else all.push(cl);
  localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(all));
}

export function getSelectedRoute(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SELECTED_ROUTE_KEY);
}

export function setSelectedRoute(routeId: string): void {
  localStorage.setItem(SELECTED_ROUTE_KEY, routeId);
}
