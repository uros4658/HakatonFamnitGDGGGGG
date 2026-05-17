import { Observation } from "./schema";

export const MOCK_OBSERVATIONS: Observation[] = [
  {
    id: "mock-1", observer: "Ana K.", date: "2025-03-15", month: "2025-03",
    routeId: "SO-8-04-0", locationType: "artificial_reef", surveyMethod: "dive",
    visibility: "good", seaCondition: "calm", disturbanceLevel: "none",
    tags: [
      { tag: "fish", abundance: "many", confidence: "high" },
      { tag: "algae", abundance: "dominant", confidence: "high" },
      { tag: "bryozoans", abundance: "few", confidence: "medium" },
    ],
    growthPlateScore: "2", wasteSeverity: "none", damageSeverity: "none",
    followUpNeeded: "none", ethicsConfirmed: true, createdAt: "2025-03-15T10:00:00Z",
  },
  {
    id: "mock-2", observer: "Marko P.", date: "2025-03-22", month: "2025-03",
    routeId: "SO-8-04-0", locationType: "growth_plates", surveyMethod: "dive",
    visibility: "medium", seaCondition: "mild_current", disturbanceLevel: "low",
    tags: [
      { tag: "polychaetes", abundance: "few", confidence: "medium" },
      { tag: "artificial_reef_growth", abundance: "many", confidence: "high" },
      { tag: "molluscs", abundance: "few", confidence: "high" },
    ],
    growthPlateScore: "3", wasteSeverity: "none", damageSeverity: "none",
    followUpNeeded: "none", ethicsConfirmed: true, createdAt: "2025-03-22T09:30:00Z",
  },
  {
    id: "mock-3", observer: "Ana K.", date: "2025-04-05", month: "2025-04",
    routeId: "SO-8-06-1", locationType: "artificial_reef", surveyMethod: "dive",
    visibility: "good", seaCondition: "calm", disturbanceLevel: "none",
    tags: [
      { tag: "fish", abundance: "many", confidence: "high" },
      { tag: "seahorse", abundance: "one", confidence: "low", note: "Possible sighting near growth plate 2" },
      { tag: "algae", abundance: "dominant", confidence: "high" },
      { tag: "juvenile_fish", abundance: "few", confidence: "medium" },
    ],
    growthPlateScore: "2", wasteSeverity: "none", damageSeverity: "none",
    followUpNeeded: "expert_review", notes: "Possible seahorse sighting needs confirmation",
    ethicsConfirmed: true, createdAt: "2025-04-05T11:00:00Z",
  },
  {
    id: "mock-4", observer: "Petra L.", date: "2025-04-12", month: "2025-04",
    locationType: "coastline", surveyMethod: "snorkel",
    visibility: "medium", seaCondition: "mild_current", disturbanceLevel: "low",
    tags: [
      { tag: "waste", abundance: "few", confidence: "high" },
      { tag: "plastic", abundance: "few", confidence: "high" },
      { tag: "fishing_line", abundance: "one", confidence: "high" },
    ],
    wasteSeverity: "medium", damageSeverity: "low",
    followUpNeeded: "cleanup_needed", notes: "Fishing line tangled on rocky outcrop",
    ethicsConfirmed: true, createdAt: "2025-04-12T14:00:00Z",
  },
  {
    id: "mock-5", observer: "Marko P.", date: "2025-04-20", month: "2025-04",
    routeId: "SO-8-04-0", locationType: "growth_plates", surveyMethod: "dive",
    visibility: "good", seaCondition: "calm", disturbanceLevel: "none",
    tags: [
      { tag: "bryozoans", abundance: "many", confidence: "high" },
      { tag: "polychaetes", abundance: "many", confidence: "high" },
      { tag: "artificial_reef_growth", abundance: "dominant", confidence: "high" },
    ],
    growthPlateScore: "3", wasteSeverity: "none", damageSeverity: "none",
    followUpNeeded: "none", ethicsConfirmed: true, createdAt: "2025-04-20T10:00:00Z",
  },
  {
    id: "mock-6", observer: "Ana K.", date: "2025-05-03", month: "2025-05",
    routeId: "SO-8-06-1", locationType: "artificial_reef", surveyMethod: "dive",
    visibility: "good", seaCondition: "calm", disturbanceLevel: "none",
    tags: [
      { tag: "fish", abundance: "dominant", confidence: "high" },
      { tag: "algae", abundance: "many", confidence: "high" },
      { tag: "seagrass", abundance: "few", confidence: "medium" },
      { tag: "lobster", abundance: "one", confidence: "medium" },
    ],
    growthPlateScore: "2", wasteSeverity: "none", damageSeverity: "none",
    followUpNeeded: "none", ethicsConfirmed: true, createdAt: "2025-05-03T09:00:00Z",
  },
  {
    id: "mock-7", observer: "Petra L.", date: "2025-05-10", month: "2025-05",
    locationType: "seagrass_meadow", surveyMethod: "snorkel",
    visibility: "medium", seaCondition: "mild_current", disturbanceLevel: "low",
    tags: [
      { tag: "seagrass", abundance: "dominant", confidence: "high" },
      { tag: "fish", abundance: "many", confidence: "high" },
      { tag: "crab", abundance: "few", confidence: "medium" },
    ],
    growthPlateScore: "unknown", wasteSeverity: "low", damageSeverity: "none",
    followUpNeeded: "none", ethicsConfirmed: true, createdAt: "2025-05-10T15:00:00Z",
  },
];
