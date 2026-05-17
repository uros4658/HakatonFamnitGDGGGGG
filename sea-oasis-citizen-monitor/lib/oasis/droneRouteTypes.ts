export type RoutePhase =
  | "surface"
  | "descent"
  | "certified-survey-loop"
  | "growth-plate-inspection"
  | "seabed-scan"
  | "ascent";

export type DroneWaypointTarget =
  | "surface-marker"
  | "wide-context"
  | "front-view"
  | "back-view"
  | "left-side"
  | "right-side"
  | "top-summit"
  | "lower-side"
  | "growth-plate-1"
  | "growth-plate-2"
  | "growth-plate-3"
  | "growth-plate-4"
  | "growth-plate-5"
  | "surrounding-seabed"
  | "waste-damage-scan";

export type DroneWaypoint = {
  id: string;
  label: string;
  phase: RoutePhase;
  localEastM: number;
  localNorthM: number;
  depthM: number;
  yawDeg: number;
  pitchDeg: number;
  target: DroneWaypointTarget;
  captureRequired: boolean;
  dwellSeconds: number;
  instruction: string;
  safetyNote?: string;
};

export type CertifiedHorizontalSegment = {
  id: string;
  order: 4 | 6 | 8 | 12;
  exponents: number[];
  directions: string[];
  waypointIds: string[];
  certificate: string;
  catalogType?: string;
  isMinimal: boolean;
};

export type DroneRoute3D = {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    dms: string;
  };
  structure: {
    lengthM: number;
    widthM: number;
    heightM: number;
    summitDepthM: number;
    seabedDepthM: number;
    growthPlateCount: number;
  };
  waypoints: DroneWaypoint[];
  certifiedHorizontalSegment: CertifiedHorizontalSegment;
  verticalCertificate: string;
  isHorizontallyBalanced: boolean;
  isVerticallyBalanced: boolean;
  isDemoRoute: boolean;
};

