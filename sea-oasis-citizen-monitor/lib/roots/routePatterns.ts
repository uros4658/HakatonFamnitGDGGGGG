import { exponentToDirection, formatCertificate } from "./roots";
import { MINIMAL_VANISHING_TYPE_CATALOG } from "./catalog";
import routeData from "@/data/route_patterns.generated.json";

export type RoutePattern = {
  id: string;
  order: number;
  weight: number;
  exponents: number[];
  directions: string[];
  isMinimal: boolean;
  catalogType: string | null;
  catalogEntryId: string | null;
  certificate: string;
  tags: string[];
  demoOnly: boolean;
};

type RawRoute = {
  id: string;
  order: number;
  weight: number;
  exponents: number[];
  directions: string[];
  isMinimal: boolean;
  certificate: string;
  demoOnly: boolean;
};

function getCatalogType(weight: number, minimal: boolean): string | null {
  if (!minimal) return null;
  const entries = MINIMAL_VANISHING_TYPE_CATALOG[weight];
  if (entries && entries.length > 0) return entries[0].type;
  return null;
}

function getCatalogEntryId(weight: number, minimal: boolean): string | null {
  if (!minimal) return null;
  const entries = MINIMAL_VANISHING_TYPE_CATALOG[weight];
  if (entries && entries.length > 0) return entries[0].id;
  return null;
}

const PRECOMPUTED_ROUTES: RoutePattern[] = (routeData as RawRoute[]).map(raw => ({
  id: raw.id,
  order: raw.order,
  weight: raw.weight,
  exponents: raw.exponents,
  directions: raw.exponents.map(k => exponentToDirection(raw.order, k)),
  isMinimal: raw.isMinimal,
  catalogType: getCatalogType(raw.weight, raw.isMinimal),
  catalogEntryId: getCatalogEntryId(raw.weight, raw.isMinimal),
  certificate: formatCertificate(raw.order, raw.exponents),
  tags: [],
  demoOnly: raw.demoOnly,
}));

export function getRoutePatterns(filters?: {
  order?: number;
  minWeight?: number;
  maxWeight?: number;
  minimalOnly?: boolean;
  avoidSector?: string;
}): RoutePattern[] {
  let routes = [...PRECOMPUTED_ROUTES];

  if (filters?.order) routes = routes.filter(r => r.order === filters.order);
  if (filters?.minWeight) routes = routes.filter(r => r.weight >= filters.minWeight!);
  if (filters?.maxWeight) routes = routes.filter(r => r.weight <= filters.maxWeight!);
  if (filters?.minimalOnly) routes = routes.filter(r => r.isMinimal);

  if (filters?.avoidSector) {
    routes = routes.filter(r => !r.directions.includes(filters.avoidSector!));
  }

  return routes;
}

export function getBestRoutes(params: {
  order: number;
  maxLength: number;
  target: string;
  avoidSector: string;
  currentStrength: string;
  operator: string;
  surveyMode?: string;
  count?: number;
}): RoutePattern[] {
  let candidates = getRoutePatterns({
    order: params.order,
    maxWeight: params.maxLength,
    minimalOnly: true,
    avoidSector: params.avoidSector === "None" ? undefined : params.avoidSector,
  });

  // Adjust count based on survey mode
  const modeMultiplier = params.surveyMode === "quick" ? 0.6 : params.surveyMode === "detailed" ? 1.5 : 1;

  candidates.sort((a, b) => {
    const aScore = scoreRoute(a, params, modeMultiplier);
    const bScore = scoreRoute(b, params, modeMultiplier);
    return bScore - aScore;
  });

  return candidates.slice(0, params.count || 3);
}

function scoreRoute(route: RoutePattern, params: { target: string; currentStrength: string; operator: string; surveyMode?: string }, modeMultiplier: number): number {
  let score = 100;
  if (route.isMinimal) score += 50;

  // Survey mode preferences
  if (params.surveyMode === "quick" && route.weight <= 4) score += 30;
  if (params.surveyMode === "quick" && route.weight > 6) score -= 20;
  if (params.surveyMode === "detailed" && route.weight >= 8) score += 20;
  if (params.surveyMode === "standard" && route.weight >= 4 && route.weight <= 8) score += 15;

  if (params.currentStrength === "strong" && route.weight > 6) score -= 20;
  if (params.currentStrength === "calm" && route.weight >= 4) score += 10;
  if (params.operator === "snorkeler" && route.weight > 8) score -= 30;
  if (params.operator === "underwater drone" && route.weight <= 12) score += 15;

  const targetPrefs: Record<string, number> = {
    "Artificial reef perimeter": route.weight >= 6 ? 20 : 0,
    "Growth plates": route.weight <= 8 ? 20 : 0,
    "Seagrass meadow": route.weight >= 8 ? 15 : 0,
    "Cleanup/trash scan": 10,
    "General biodiversity scan": 10,
  };
  score += targetPrefs[params.target] || 0;

  return score * modeMultiplier;
}

export { PRECOMPUTED_ROUTES };
