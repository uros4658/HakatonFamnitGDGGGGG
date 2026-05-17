"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { Vector3, type Group } from "three";
import type { DroneRoute3D, DroneWaypoint } from "@/lib/oasis/droneRouteTypes";
import RoutePlaybackControls from "./RoutePlaybackControls";

const CAPTURE_STORAGE_KEY = "seaOasis.animatedRouteCaptures";

type TimelineEvent =
  | { type: "dwell"; start: number; end: number; waypoint: DroneWaypoint }
  | {
      type: "travel";
      start: number;
      end: number;
      from: DroneWaypoint;
      to: DroneWaypoint;
      fromPoint: Vector3;
      toPoint: Vector3;
    };

function waypointToVector(waypoint: DroneWaypoint): Vector3 {
  return new Vector3(waypoint.localEastM, -waypoint.depthM, waypoint.localNorthM);
}

function structureFocus(route: DroneRoute3D): Vector3 {
  return new Vector3(0, -(route.structure.summitDepthM + route.structure.heightM / 2), 0);
}

function targetLabel(value: string): string {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildTimeline(route: DroneRoute3D): { events: TimelineEvent[]; total: number } {
  const events: TimelineEvent[] = [];
  let cursor = 0;

  route.waypoints.forEach((waypoint, index) => {
    const dwellEnd = cursor + waypoint.dwellSeconds;
    events.push({ type: "dwell", start: cursor, end: dwellEnd, waypoint });
    cursor = dwellEnd;

    const next = route.waypoints[index + 1];
    if (next) {
      const fromPoint = waypointToVector(waypoint);
      const toPoint = waypointToVector(next);
      const travelSeconds = Math.max(2, fromPoint.distanceTo(toPoint) * 1.8);
      events.push({
        type: "travel",
        start: cursor,
        end: cursor + travelSeconds,
        from: waypoint,
        to: next,
        fromPoint,
        toPoint,
      });
      cursor += travelSeconds;
    }
  });

  return { events, total: cursor };
}

function getAnimationState(route: DroneRoute3D, progress: number) {
  const timeline = buildTimeline(route);
  const time = progress * timeline.total;
  const event = timeline.events.find((item) => time >= item.start && time <= item.end) ?? timeline.events.at(-1);

  if (!event) {
    const waypoint = route.waypoints[0];
    return { position: waypointToVector(waypoint), waypoint, nextWaypoint: route.waypoints[1] };
  }

  if (event.type === "dwell") {
    const nextWaypoint = route.waypoints[route.waypoints.findIndex((item) => item.id === event.waypoint.id) + 1];
    return { position: waypointToVector(event.waypoint), waypoint: event.waypoint, nextWaypoint };
  }

  const t = (time - event.start) / (event.end - event.start);
  return {
    position: event.fromPoint.clone().lerp(event.toPoint, t),
    waypoint: t < 0.5 ? event.from : event.to,
    nextWaypoint: event.to,
  };
}

export default function DroneRouteAnimator3D({ route }: { route: DroneRoute3D }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [captures, setCaptures] = useState<Record<string, boolean>>({});
  const { waypoint } = getAnimationState(route, progress);
  const captureDone = captures[waypoint.target];

  useEffect(() => {
    const raw = localStorage.getItem(CAPTURE_STORAGE_KEY);
    if (raw) setCaptures(JSON.parse(raw));
  }, []);

  function markCaptured() {
    const next = { ...captures, [waypoint.target]: true };
    setCaptures(next);
    localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Route Preview</h2>
          <p className="text-xs text-slate-400">
            Watch the drone descend, circle the structure, inspect the growth plates, and return to the surface.
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
          <div className="font-medium text-cyan-200">{waypoint.label}</div>
          <div>
            Depth {waypoint.depthM.toFixed(1)} m - Target {targetLabel(waypoint.target)}
          </div>
        </div>
      </div>

      <div className="relative h-[520px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <Canvas camera={{ position: [9, -3, 12], fov: 48 }} gl={{ preserveDrawingBuffer: true }}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[8, 8, 8]} intensity={1.1} />
          <SceneCameraTarget route={route} />
          <DroneScene route={route} progress={progress} playing={playing} speed={speed} setProgress={setProgress} />
          <OrbitControls makeDefault target={structureFocus(route).toArray()} minDistance={8} maxDistance={28} />
        </Canvas>

        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-slate-950/85 p-3 text-xs text-slate-200">
          <div className="font-semibold text-cyan-200">Current waypoint</div>
          <div>{waypoint.id} - {waypoint.phase.replaceAll("-", " ")}</div>
          <div>Depth: {waypoint.depthM.toFixed(1)} m</div>
          <div>Photo target: {targetLabel(waypoint.target)}</div>
        </div>

        {waypoint.captureRequired && (
          <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-teal-700 bg-slate-950/90 p-3 text-sm shadow-xl">
            <div className="font-medium text-teal-200">Capture required: {targetLabel(waypoint.target)}</div>
            <p className="mt-1 text-xs text-slate-400">{waypoint.instruction}</p>
            <button
              onClick={markCaptured}
              className="mt-3 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-500"
            >
              {captureDone ? "Captured" : "Mark captured"}
            </button>
          </div>
        )}
      </div>

      <RoutePlaybackControls
        playing={playing}
        progress={progress}
        speed={speed}
        onToggle={() => setPlaying((value) => !value)}
        onRestart={() => {
          setProgress(0);
          setPlaying(true);
        }}
        onProgressChange={setProgress}
        onSpeedChange={setSpeed}
      />
    </section>
  );
}

function DroneScene({
  route,
  progress,
  playing,
  speed,
  setProgress,
}: {
  route: DroneRoute3D;
  progress: number;
  playing: boolean;
  speed: number;
  setProgress: (value: number | ((value: number) => number)) => void;
}) {
  const droneRef = useRef<Group>(null);
  const timeline = useMemo(() => buildTimeline(route), [route]);
  const routePoints = useMemo(() => route.waypoints.map(waypointToVector), [route]);
  const certifiedPoints = useMemo(() => {
    const ids = new Set(route.certifiedHorizontalSegment.waypointIds);
    return route.waypoints.filter((waypoint) => ids.has(waypoint.id)).map(waypointToVector);
  }, [route]);
  const animation = getAnimationState(route, progress);

  useFrame((_, delta) => {
    if (playing) {
      setProgress((current) => (current + (delta * speed) / timeline.total) % 1);
    }

    if (droneRef.current) {
      droneRef.current.position.copy(animation.position);
      droneRef.current.lookAt(structureFocus(route));
    }
  });

  return (
    <>
      <WaterVolume />
      <SeaOasisStructure route={route} />
      <Line points={routePoints} color="#38bdf8" lineWidth={2} transparent opacity={0.35} />
      <Line points={certifiedPoints} color="#2dd4bf" lineWidth={5} />
      {routePoints.map((point, index) => (
        <mesh key={route.waypoints[index].id} position={point}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={route.waypoints[index].captureRequired ? "#f59e0b" : "#94a3b8"} />
        </mesh>
      ))}
      <group ref={droneRef} position={animation.position}>
        <mesh>
          <sphereGeometry args={[0.25, 24, 24]} />
          <meshStandardMaterial color="#f8fafc" emissive="#155e75" emissiveIntensity={0.35} />
        </mesh>
        <Html distanceFactor={8} position={[0, 0.55, 0]}>
          <div className="rounded bg-slate-950/80 px-2 py-1 text-[10px] text-cyan-100">
            {animation.waypoint.id}
          </div>
        </Html>
      </group>
    </>
  );
}

function SceneCameraTarget({ route }: { route: DroneRoute3D }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(structureFocus(route));
    camera.updateProjectionMatrix();
  }, [camera, route]);

  return null;
}

function WaterVolume() {
  return (
    <>
      <mesh position={[0, -6, 0]}>
        <boxGeometry args={[13, 12, 13]} />
        <meshStandardMaterial color="#075985" transparent opacity={0.13} wireframe />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[13, 0.03, 13]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -10, 0]}>
        <boxGeometry args={[14, 0.05, 14]} />
        <meshStandardMaterial color="#78350f" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, -11, 0]}>
        <boxGeometry args={[14, 2, 14]} />
        <meshStandardMaterial color="#92400e" transparent opacity={0.12} />
      </mesh>
      <gridHelper args={[14, 14, "#155e75", "#0f172a"]} position={[0, -10, 0]} />
    </>
  );
}

function SeaOasisStructure({ route }: { route: DroneRoute3D }) {
  const centerY = -(route.structure.summitDepthM + route.structure.heightM / 2);
  const platePositions: [number, number][] = [
    [-1.8, -1],
    [1.8, -1],
    [1.8, 1],
    [-1.8, 1],
    [0, 0],
  ];

  return (
    <group>
      <mesh position={[0, centerY, 0]}>
        <boxGeometry args={[route.structure.lengthM, route.structure.heightM, route.structure.widthM]} />
        <meshStandardMaterial color="#64748b" transparent opacity={0.58} />
      </mesh>
      <mesh position={[0, -route.structure.summitDepthM + 0.03, 0]}>
        <boxGeometry args={[route.structure.lengthM, 0.08, route.structure.widthM]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.45} />
      </mesh>
      {platePositions.map(([east, north], index) => (
        <mesh key={`${east}-${north}`} position={[east, -7.2 - index * 0.1, north]}>
          <boxGeometry args={[0.75, 0.05, 0.45]} />
          <meshStandardMaterial color="#fde68a" emissive="#713f12" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}
