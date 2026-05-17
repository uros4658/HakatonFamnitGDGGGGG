import { z } from "zod";

export const ChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(["structure", "growth_plate", "context", "issue"]),
  required: z.boolean(),
  status: z.enum(["not_started", "captured", "skipped"]),
  visibility: z.enum(["poor", "medium", "good"]).optional(),
  disturbanceRisk: z.enum(["none", "low", "medium", "high"]).optional(),
  note: z.string().optional(),
  photoPlaceholder: z.string().optional(),
});

export const ChecklistSchema = z.object({
  id: z.string(),
  routeId: z.string().optional(),
  date: z.string(),
  observer: z.string(),
  items: z.array(ChecklistItemSchema),
  completionPercentage: z.number(),
  requiredComplete: z.boolean(),
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Checklist = z.infer<typeof ChecklistSchema>;
