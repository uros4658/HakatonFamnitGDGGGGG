import type { DroneRoute3D, DroneWaypoint, DroneWaypointTarget } from "./droneRouteTypes";
import { isVanishing } from "@/lib/roots/roots";

const REQUIRED_CAPTURE_TARGETS: DroneWaypointTarget[] = [
  "front-view",
  "back-view",
  "left-side",
  "right-side",
  "top-summit",
  "growth-plate-1",
  "growth-plate-2",
  "growth-plate-3",
  "growth-plate-4",
  "growth-plate-5",
  "waste-damage-scan",
];

export type CaptureChecklist = Partial<Record<DroneWaypointTarget, boolean>>;

function toTenths(value: number): number {
  return Math.round(value * 10);
}

export function getCertifiedSegmentWaypoints(route: DroneRoute3D): DroneWaypoint[] {
  return route.certifiedHorizontalSegment.waypointIds
    .map((id) => route.waypoints.find((waypoint) => waypoint.id === id))
    .filter((waypoint): waypoint is DroneWaypoint => Boolean(waypoint));
}

export function calculateDepthDeltas(waypoints: DroneWaypoint[]): number[] {
  const deltas: number[] = [];
  for (let index = 1; index < waypoints.length; index += 1) {
    deltas.push((toTenths(waypoints[index].depthM) - toTenths(waypoints[index - 1].depthM)) / 10);
  }
  return deltas;
}

export function validateCertifiedHorizontalSegment(route: DroneRoute3D): {
  valid: boolean;
  warnings: string[];
} {
  const segment = route.certifiedHorizontalSegment;
  const waypoints = getCertifiedSegmentWaypoints(route);
  const warnings: string[] = [];

  if (!isVanishing(segment.order, segment.exponents)) {
    warnings.push("Certified horizontal segment is not an exact symbolic vanishing sum.");
  }

  if (waypoints.length !== segment.exponents.length + 1) {
    warnings.push("Certified segment must include one more waypoint than movement exponents.");
  }

  if (segment.directions.length !== segment.exponents.length) {
    warnings.push("Certified segment directions must match the root exponent count.");
  }

  return { valid: warnings.length === 0, warnings };
}

export function validateVerticalBalance(route: DroneRoute3D): {
  valid: boolean;
  deltas: number[];
  sum: number;
} {
  const deltas = calculateDepthDeltas(getCertifiedSegmentWaypoints(route));
  const sumTenths = deltas.reduce((total, delta) => total + toTenths(delta), 0);
  return { valid: sumTenths === 0, deltas, sum: sumTenths / 10 };
}

export function calculateRouteDuration(route: DroneRoute3D): number {
  const travelSeconds = route.waypoints.slice(1).reduce((total, waypoint, index) => {
    const previous = route.waypoints[index];
    const distance = Math.hypot(
      waypoint.localEastM - previous.localEastM,
      waypoint.localNorthM - previous.localNorthM,
      waypoint.depthM - previous.depthM
    );
    return total + Math.max(2, distance * 1.8);
  }, 0);

  return Math.round(
    travelSeconds + route.waypoints.reduce((total, waypoint) => total + waypoint.dwellSeconds, 0)
  );
}

export function getRequiredCaptures(route: DroneRoute3D): DroneWaypoint[] {
  return route.waypoints.filter((waypoint) => waypoint.captureRequired);
}

export function getMissingCaptures(checklist: CaptureChecklist): DroneWaypointTarget[] {
  return REQUIRED_CAPTURE_TARGETS.filter((target) => !checklist[target]);
}

export function validateRouteCaptures(route: DroneRoute3D): {
  valid: boolean;
  missingTargets: DroneWaypointTarget[];
} {
  const present = new Set(
    route.waypoints.filter((waypoint) => waypoint.captureRequired).map((waypoint) => waypoint.target)
  );
  const missingTargets = REQUIRED_CAPTURE_TARGETS.filter((target) => !present.has(target));
  return { valid: missingTargets.length === 0, missingTargets };
}
