import { ChecklistItem } from "./checklistSchema";
import { SO_PIRAN_STANDARD_3D_DRONE_ROUTE } from "@/lib/oasis/defaultDroneRoutes";
import type { DroneRoute3D, DroneWaypointTarget } from "@/lib/oasis/droneRouteTypes";

export const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, "status" | "visibility" | "disturbanceRisk" | "note" | "photoPlaceholder">[] = [
  { id: "front", label: "Front view", category: "structure", required: true },
  { id: "back", label: "Back view", category: "structure", required: true },
  { id: "top", label: "Top / summit view", category: "structure", required: true },
  { id: "left", label: "Left side", category: "structure", required: false },
  { id: "right", label: "Right side", category: "structure", required: false },
  { id: "lower", label: "Lower side / shaded side", category: "structure", required: false },
  { id: "gp1", label: "Growth plate 1", category: "growth_plate", required: true },
  { id: "gp2", label: "Growth plate 2", category: "growth_plate", required: true },
  { id: "gp3", label: "Growth plate 3", category: "growth_plate", required: false },
  { id: "gp4", label: "Growth plate 4", category: "growth_plate", required: false },
  { id: "gp5", label: "Growth plate 5", category: "growth_plate", required: false },
  { id: "seabed", label: "Surrounding seabed", category: "context", required: false },
  { id: "wide", label: "Wide context shot", category: "context", required: false },
  { id: "waste", label: "Any visible waste/damage", category: "issue", required: false },
  { id: "unusual", label: "Any unusual species/habitat observation", category: "issue", required: false },
];

const ROUTE_CAPTURE_STORAGE_KEY = "seaOasis.animatedRouteCaptures";
const SELECTED_ROUTE_3D_KEY = "seaOasis.routes.selectedRoute3D";

const TARGET_TO_CHECKLIST: Record<DroneWaypointTarget, { id: string; label: string; category: ChecklistItem["category"] }> = {
  "surface-marker": { id: "surface-marker", label: "Surface marker", category: "context" },
  "wide-context": { id: "wide-context", label: "Wide context", category: "context" },
  "front-view": { id: "front-view", label: "Front view", category: "structure" },
  "back-view": { id: "back-view", label: "Back view", category: "structure" },
  "left-side": { id: "left-side", label: "Left side", category: "structure" },
  "right-side": { id: "right-side", label: "Right side", category: "structure" },
  "top-summit": { id: "top-summit", label: "Top / summit view", category: "structure" },
  "lower-side": { id: "lower-side", label: "Lower side", category: "structure" },
  "growth-plate-1": { id: "growth-plate-1", label: "Growth plate 1", category: "growth_plate" },
  "growth-plate-2": { id: "growth-plate-2", label: "Growth plate 2", category: "growth_plate" },
  "growth-plate-3": { id: "growth-plate-3", label: "Growth plate 3", category: "growth_plate" },
  "growth-plate-4": { id: "growth-plate-4", label: "Growth plate 4", category: "growth_plate" },
  "growth-plate-5": { id: "growth-plate-5", label: "Growth plate 5", category: "growth_plate" },
  "surrounding-seabed": { id: "surrounding-seabed", label: "Surrounding seabed", category: "context" },
  "waste-damage-scan": { id: "waste-damage-scan", label: "Waste / damage scan", category: "issue" },
};

function getAnimatedRouteCaptures(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(ROUTE_CAPTURE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function getSelectedDroneRoute(routeId?: string): DroneRoute3D {
  if (typeof window === "undefined") return SO_PIRAN_STANDARD_3D_DRONE_ROUTE;
  const raw = localStorage.getItem(SELECTED_ROUTE_3D_KEY);
  if (!raw) return SO_PIRAN_STANDARD_3D_DRONE_ROUTE;

  try {
    const route = JSON.parse(raw) as DroneRoute3D;
    return route.id === routeId ? route : SO_PIRAN_STANDARD_3D_DRONE_ROUTE;
  } catch {
    return SO_PIRAN_STANDARD_3D_DRONE_ROUTE;
  }
}

function createSeaOasisRouteChecklistItems(routeId?: string): ChecklistItem[] {
  const route = getSelectedDroneRoute(routeId);
  const captures = getAnimatedRouteCaptures();
  const seen = new Set<string>();

  return route.waypoints
    .filter((waypoint) => waypoint.captureRequired)
    .filter((waypoint) => {
      if (seen.has(waypoint.target)) return false;
      seen.add(waypoint.target);
      return true;
    })
    .map((waypoint) => {
      const item = TARGET_TO_CHECKLIST[waypoint.target];
      return {
        id: item.id,
        label: item.label,
        category: item.category,
        required: true,
        status: captures[waypoint.target] ? "captured" : "not_started",
        note: waypoint.instruction,
      };
    });
}

export function createNewChecklist(observer: string, routeId?: string): {
  id: string;
  routeId?: string;
  date: string;
  observer: string;
  items: ChecklistItem[];
  completionPercentage: number;
  requiredComplete: boolean;
} {
  const items =
    routeId?.startsWith("SO-PIRAN-3D-") || routeId === SO_PIRAN_STANDARD_3D_DRONE_ROUTE.id
      ? createSeaOasisRouteChecklistItems(routeId)
      : DEFAULT_CHECKLIST_ITEMS.map(item => ({
          ...item,
          status: "not_started" as const,
        }));
  const progress = calculateProgress(items);

  return {
    id: `cl-${Date.now()}`,
    routeId,
    date: new Date().toISOString().split("T")[0],
    observer,
    items,
    completionPercentage: progress.percentage,
    requiredComplete: progress.requiredComplete,
  };
}

export function calculateProgress(items: ChecklistItem[]): { percentage: number; requiredComplete: boolean } {
  const done = items.filter(i => i.status === "captured").length;
  const percentage = Math.round((done / items.length) * 100);
  const requiredItems = items.filter(i => i.required);
  const requiredComplete = requiredItems.every(i => i.status === "captured");
  return { percentage, requiredComplete };
}
