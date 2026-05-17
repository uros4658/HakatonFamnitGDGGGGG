import { z } from "zod";

export const ObservationTagSchema = z.object({
  tag: z.string(),
  abundance: z.enum(["one", "few", "many", "dominant", "unknown"]).optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
  note: z.string().optional(),
});

export const ObservationSchema = z.object({
  id: z.string(),
  observer: z.string(),
  date: z.string(),
  month: z.string(),
  routeId: z.string().optional(),
  checklistId: z.string().optional(),
  locationType: z.enum(["artificial_reef", "growth_plates", "seagrass_meadow", "coastline", "cleanup_area"]),
  surveyMethod: z.enum(["snorkel", "dive", "underwater_drone", "shore_observation"]),
  visibility: z.enum(["poor", "medium", "good"]),
  seaCondition: z.enum(["calm", "mild_current", "strong_current"]),
  disturbanceLevel: z.enum(["none", "low", "medium", "high"]),
  tags: z.array(ObservationTagSchema),
  growthPlateScore: z.enum(["0", "1", "2", "3", "unknown"]).optional(),
  wasteSeverity: z.enum(["none", "low", "medium", "high"]),
  damageSeverity: z.enum(["none", "low", "medium", "high"]),
  followUpNeeded: z.enum(["none", "expert_review", "cleanup_needed", "damage_inspection", "repeat_survey"]),
  notes: z.string().optional(),
  ethicsConfirmed: z.boolean(),
  createdAt: z.string(),
});

export type ObservationTag = z.infer<typeof ObservationTagSchema>;
export type Observation = z.infer<typeof ObservationSchema>;

export const ALL_TAGS = [
  "fish", "algae", "bryozoans", "polychaetes", "seahorse", "lobster",
  "crab", "molluscs", "juvenile_fish", "seagrass", "artificial_reef_growth",
  "eggs_larvae", "unknown_organism", "waste", "fishing_line", "plastic",
  "anchor_damage", "broken_structure", "invasive_species", "dead_organism",
  "unusual_behaviour",
] as const;
