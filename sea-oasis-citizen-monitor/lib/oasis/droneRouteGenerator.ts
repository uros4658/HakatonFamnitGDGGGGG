import { getBestRoutes, type RoutePattern } from "@/lib/roots/routePatterns";
import { isVanishing } from "@/lib/roots/roots";
import { SEA_OASIS_LOCATION } from "./seaOasisConstants";
import type { DroneRoute3D, DroneWaypoint, DroneWaypointTarget } from "./droneRouteTypes";

export type DroneRouteMode = "quick" | "standard" | "detailed";

type GenerateDroneRoutesParams = {
  order: number;
  mode: DroneRouteMode;
  target: string;
  avoidSector: string;
  currentStrength: string;
  count?: number;
};

const HORIZONTAL_TARGETS: DroneWaypointTarget[] = [
  "front-view",
  "right-side",
  "back-view",
  "left-side",
  "lower-side",
  "surrounding-seabed",
];

const REQUIRED_SIDE_TARGETS: DroneWaypointTarget[] = [
  "front-view",
  "back-view",
  "left-side",
  "right-side",
];

const SIDE_TARGET_POINTS: Record<
  DroneWaypointTarget,
  { label: string; eastM: number; northM: number; depthM: number; instruction: string }
> = {
  "front-view": {
    label: "Front view coverage",
    eastM: 0,
    northM: -4.5,
    depthM: 8.2,
    instruction: "Capture the front face and nearby growth.",
  },
  "back-view": {
    label: "Back view coverage",
    eastM: 0,
    northM: 4.5,
    depthM: 9.2,
    instruction: "Capture the back face and lower-side coverage.",
  },
  "left-side": {
    label: "Left side coverage",
    eastM: -4.5,
    northM: 0,
    depthM: 8.4,
    instruction: "Capture the left side of the structure.",
  },
  "right-side": {
    label: "Right side coverage",
    eastM: 4.5,
    northM: 0,
    depthM: 8.4,
    instruction: "Capture the right side of the structure.",
  },
  "surface-marker": {
    label: "Surface marker",
    eastM: 0,
    northM: 0,
    depthM: 0,
    instruction: "Surface marker.",
  },
  "wide-context": {
    label: "Wide context",
    eastM: -4,
    northM: -4,
    depthM: 6.4,
    instruction: "Wide context.",
  },
  "top-summit": {
    label: "Top summit",
    eastM: 0,
    northM: 0,
    depthM: 6.3,
    instruction: "Top summit.",
  },
  "lower-side": {
    label: "Lower side",
    eastM: 0,
    northM: 5,
    depthM: 9.8,
    instruction: "Lower side.",
  },
  "growth-plate-1": {
    label: "Growth plate 1",
    eastM: -1.8,
    northM: -1,
    depthM: 7.4,
    instruction: "Growth plate 1.",
  },
  "growth-plate-2": {
    label: "Growth plate 2",
    eastM: 1.8,
    northM: -1,
    depthM: 7.4,
    instruction: "Growth plate 2.",
  },
  "growth-plate-3": {
    label: "Growth plate 3",
    eastM: 1.8,
    northM: 1,
    depthM: 7.8,
    instruction: "Growth plate 3.",
  },
  "growth-plate-4": {
    label: "Growth plate 4",
    eastM: -1.8,
    northM: 1,
    depthM: 7.8,
    instruction: "Growth plate 4.",
  },
  "growth-plate-5": {
    label: "Growth plate 5",
    eastM: 0,
    northM: 0,
    depthM: 8,
    instruction: "Growth plate 5.",
  },
  "surrounding-seabed": {
    label: "Surrounding seabed",
    eastM: 0,
    northM: -5.5,
    depthM: 10.2,
    instruction: "Surrounding seabed.",
  },
  "waste-damage-scan": {
    label: "Waste / damage scan",
    eastM: 0,
    northM: -5.5,
    depthM: 10.2,
    instruction: "Waste / damage scan.",
  },
};

function exponentToUnit(order: number, exponent: number): { eastM: number; northM: number } {
  const angle = (2 * Math.PI * exponent) / order;
  return {
    eastM: Math.cos(angle),
    northM: Math.sin(angle),
  };
}

function toTenths(value: number): number {
  return Math.round(value * 10);
}

function makeBalancedDepths(moveCount: number): number[] {
  const start = toTenths(6.4);
  if (moveCount === 4) return [6.4, 8.2, 8.4, 9.8, 6.4];

  const depths = [start];
  for (let index = 1; index < moveCount; index += 1) {
    const wave = index % 4;
    const depthTenths = [82, 90, 78, 96][wave];
    depths.push(depthTenths);
  }
  depths.push(start);
  return depths.map((depth) => depth / 10);
}

function makeCertifiedOffsets(pattern: RoutePattern): { eastM: number; northM: number }[] {
  const raw = [{ eastM: 0, northM: 0 }];
  let eastM = 0;
  let northM = 0;

  pattern.exponents.forEach((exponent) => {
    const unit = exponentToUnit(pattern.order, exponent);
    eastM += unit.eastM;
    northM += unit.northM;
    raw.push({ eastM, northM });
  });

  raw[raw.length - 1] = { ...raw[0] };

  const minEast = Math.min(...raw.map((point) => point.eastM));
  const maxEast = Math.max(...raw.map((point) => point.eastM));
  const minNorth = Math.min(...raw.map((point) => point.northM));
  const maxNorth = Math.max(...raw.map((point) => point.northM));
  const width = Math.max(1, maxEast - minEast);
  const height = Math.max(1, maxNorth - minNorth);
  const scale = Math.min(8 / width, 8 / height);
  const centerEast = (minEast + maxEast) / 2;
  const centerNorth = (minNorth + maxNorth) / 2;

  return raw.map((point) => ({
    eastM: Number(((point.eastM - centerEast) * scale).toFixed(2)),
    northM: Number(((point.northM - centerNorth) * scale).toFixed(2)),
  }));
}

function makeInspectionAddOns(startIndex: number): DroneWaypoint[] {
  return [
    {
      id: `WP-${String(startIndex).padStart(2, "0")}`,
      label: "Top and growth plate overview",
      phase: "growth-plate-inspection",
      localEastM: 0,
      localNorthM: 0,
      depthM: 6.3,
      yawDeg: 0,
      pitchDeg: -70,
      target: "top-summit",
      captureRequired: true,
      dwellSeconds: 6,
      instruction: "Move above the structure. Capture top/summit view and the five growth plate zones.",
    },
    ...[
      ["growth-plate-1", -1.8, -1.0, 7.4, 45],
      ["growth-plate-2", 1.8, -1.0, 7.4, 315],
      ["growth-plate-3", 1.8, 1.0, 7.8, 225],
      ["growth-plate-4", -1.8, 1.0, 7.8, 135],
      ["growth-plate-5", 0, 0, 8.0, 0],
    ].map(([target, eastM, northM, depthM, yawDeg], index) => ({
      id: `WP-${String(startIndex + index + 1).padStart(2, "0")}`,
      label:
        target === "growth-plate-5"
          ? "Growth plate 5 / centre"
          : `Growth plate ${index + 1}`,
      phase: "growth-plate-inspection" as const,
      localEastM: eastM as number,
      localNorthM: northM as number,
      depthM: depthM as number,
      yawDeg: yawDeg as number,
      pitchDeg: target === "growth-plate-5" ? -45 : -30,
      target: target as DroneWaypointTarget,
      captureRequired: true,
      dwellSeconds: 4,
      instruction:
        target === "growth-plate-5"
          ? "Capture central growth plate / centre zone."
          : `Capture growth plate ${index + 1} from a stable distance.`,
    })),
    {
      id: `WP-${String(startIndex + 6).padStart(2, "0")}`,
      label: "Lower side and seabed scan",
      phase: "seabed-scan",
      localEastM: 0,
      localNorthM: -5.5,
      depthM: 10.2,
      yawDeg: 0,
      pitchDeg: -20,
      target: "waste-damage-scan",
      captureRequired: true,
      dwellSeconds: 6,
      instruction:
        "Scan surrounding seabed for waste, fishing line, sediment disturbance, or visible damage.",
    },
    {
      id: `WP-${String(startIndex + 7).padStart(2, "0")}`,
      label: "Ascent point",
      phase: "ascent",
      localEastM: 0,
      localNorthM: 0,
      depthM: 0,
      yawDeg: 0,
      pitchDeg: 90,
      target: "surface-marker",
      captureRequired: false,
      dwellSeconds: 2,
      instruction: "Return to the surface marker. End of planning route.",
    },
  ];
}

function makeSupplementalSideCoverage(startIndex: number, existingTargets: Set<DroneWaypointTarget>): DroneWaypoint[] {
  return REQUIRED_SIDE_TARGETS.filter((target) => !existingTargets.has(target)).map((target, index) => {
    const point = SIDE_TARGET_POINTS[target];
    return {
      id: `WP-${String(startIndex + index).padStart(2, "0")}`,
      label: point.label,
      phase: "growth-plate-inspection",
      localEastM: point.eastM,
      localNorthM: point.northM,
      depthM: point.depthM,
      yawDeg: 0,
      pitchDeg: -12,
      target,
      captureRequired: true,
      dwellSeconds: 4,
      instruction: `${point.instruction} This is an extra coverage pass outside the balanced loop.`,
    };
  });
}

export function buildSeaOasisDroneRoute(pattern: RoutePattern, variantLabel = "Generated"): DroneRoute3D {
  const offsets = makeCertifiedOffsets(pattern);
  const depths = makeBalancedDepths(pattern.exponents.length);
  const certifiedWaypoints: DroneWaypoint[] = offsets.map((offset, index) => {
    const target = index === 0 ? "wide-context" : HORIZONTAL_TARGETS[(index - 1) % HORIZONTAL_TARGETS.length];
    return {
      id: `WP-${String(index + 1).padStart(2, "0")}`,
      label: index === 0 ? "Descent staging point" : `${pattern.directions[index - 1]} certified pass`,
      phase: index === 0 ? "descent" : "certified-survey-loop",
      localEastM: offset.eastM,
      localNorthM: offset.northM,
      depthM: depths[index],
      yawDeg: 0,
      pitchDeg: index === 0 ? -20 : -12,
      target,
      captureRequired: true,
      dwellSeconds: index === 0 ? 4 : 5,
      instruction:
        index === 0
          ? "Descend to just above the structure summit depth. Capture a wide context shot."
          : `Move ${pattern.directions[index - 1]} as part of the balanced horizontal survey loop.`,
    };
  });
  const supplementalCoverage = makeSupplementalSideCoverage(
    certifiedWaypoints.length + 1,
    new Set(certifiedWaypoints.map((waypoint) => waypoint.target))
  );

  const waypoints: DroneWaypoint[] = [
    {
      id: "WP-00",
      label: "Surface marker above Sea Oasis",
      phase: "surface",
      localEastM: 0,
      localNorthM: 0,
      depthM: 0,
      yawDeg: 0,
      pitchDeg: -90,
      target: "surface-marker",
      captureRequired: false,
      dwellSeconds: 2,
      instruction: "Start at the surface above the Sea Oasis map location.",
    },
    ...certifiedWaypoints,
    ...supplementalCoverage,
    ...makeInspectionAddOns(certifiedWaypoints.length + supplementalCoverage.length + 1),
  ];

  const verticalDeltas = depths.slice(1).map((depth, index) => {
    const delta = toTenths(depth) - toTenths(depths[index]);
    return delta / 10;
  });
  const verticalExpression = `${verticalDeltas.map((delta) => (delta > 0 ? `+${delta}` : String(delta))).join(" ")} = 0`;

  return {
    id: `SO-PIRAN-3D-${pattern.id}`,
    name: `Sea Oasis Piran ${variantLabel} ${pattern.order}-direction 3D route`,
    description:
      "Planning route based on public Sea Oasis dimensions and approximate local coordinate frame.",
    location: {
      latitude: SEA_OASIS_LOCATION.latitude,
      longitude: SEA_OASIS_LOCATION.longitude,
      dms: SEA_OASIS_LOCATION.dms,
    },
    structure: {
      lengthM: SEA_OASIS_LOCATION.structureLengthM,
      widthM: SEA_OASIS_LOCATION.structureWidthM,
      heightM: SEA_OASIS_LOCATION.structureHeightM,
      summitDepthM: SEA_OASIS_LOCATION.structureSummitDepthM,
      seabedDepthM: SEA_OASIS_LOCATION.modelSeabedDepthM,
      growthPlateCount: SEA_OASIS_LOCATION.growthPlateCount,
    },
    waypoints,
    certifiedHorizontalSegment: {
      id: `${pattern.id}-3D-HORIZONTAL-LOOP`,
      order: pattern.order as 4 | 6 | 8 | 12,
      exponents: pattern.exponents,
      directions: pattern.directions,
      waypointIds: certifiedWaypoints.map((waypoint) => waypoint.id),
      certificate: pattern.certificate,
      catalogType: pattern.catalogType ?? undefined,
      isMinimal: pattern.isMinimal,
    },
    verticalCertificate: verticalExpression,
    isHorizontallyBalanced: isVanishing(pattern.order, pattern.exponents),
    isVerticallyBalanced: verticalDeltas.reduce((total, delta) => total + toTenths(delta), 0) === 0,
    isDemoRoute: true,
  };
}

export function generateSeaOasisDroneRoutes(params: GenerateDroneRoutesParams): DroneRoute3D[] {
  let patterns = getBestRoutes({
    order: params.order,
    maxLength: params.mode === "quick" ? 6 : params.mode === "detailed" ? 12 : 8,
    target: params.target,
    avoidSector: params.avoidSector,
    currentStrength: params.currentStrength,
    operator: "underwater drone",
    surveyMode: params.mode,
    count: params.count ?? 3,
  });

  if (patterns.length === 0) {
    patterns = getBestRoutes({
      order: params.order,
      maxLength: 12,
      target: params.target,
      avoidSector: "None",
      currentStrength: params.currentStrength,
      operator: "underwater drone",
      surveyMode: "detailed",
      count: params.count ?? 3,
    });
  }

  return patterns.map((pattern, index) => buildSeaOasisDroneRoute(pattern, `Option ${index + 1}`));
}
