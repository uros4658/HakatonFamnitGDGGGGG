import { ChecklistItem } from "./checklistSchema";

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

export function createNewChecklist(observer: string, routeId?: string): {
  id: string;
  routeId?: string;
  date: string;
  observer: string;
  items: ChecklistItem[];
  completionPercentage: number;
  requiredComplete: boolean;
} {
  return {
    id: `cl-${Date.now()}`,
    routeId,
    date: new Date().toISOString().split("T")[0],
    observer,
    items: DEFAULT_CHECKLIST_ITEMS.map(item => ({
      ...item,
      status: "not_started" as const,
    })),
    completionPercentage: 0,
    requiredComplete: false,
  };
}

export function calculateProgress(items: ChecklistItem[]): { percentage: number; requiredComplete: boolean } {
  const done = items.filter(i => i.status === "captured").length;
  const percentage = Math.round((done / items.length) * 100);
  const requiredItems = items.filter(i => i.required);
  const requiredComplete = requiredItems.every(i => i.status === "captured");
  return { percentage, requiredComplete };
}
