"use client";

import { RoutePattern, getBestRoutes } from "@/lib/roots/routePatterns";

export function useSurveyPlanner(params: {
  order: number;
  maxLength: number;
  target: string;
  avoidSector: string;
  currentStrength: string;
  operator: string;
  surveyMode?: string;
}) {
  return getBestRoutes(params);
}

export type { RoutePattern };
