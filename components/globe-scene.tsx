"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CircleGeometry, Color, DoubleSide, InstancedMesh, MeshLambertMaterial, Object3D, Vector3, type Group, type Mesh, type MeshPhongMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobe from "three-globe";
import land from "@/content/globe-dots.json";
import map from "@/content/map.json";

/**
 * The trade map as a globe: Aceternity UI's Globe (three-globe on React Three Fiber), set in the
 * brand's navy and gold. Land is a field of hexagonal dots; gold routes leave Business Bay for
 * the four regions the copy names, a dash of light travelling each in turn; the five places pulse.
 *
 * What differs from Aceternity's version, and why:
 * - its forty sample routes between world cities are gone: only the client's own routes are drawn,
 *   each as a faint standing line plus the travelling dash, so a route never disappears;
 * - it turns gently to and fro about Dubai instead of spinning all the way round, so the routes
 *   never leave view (with a mouse it can still be dragged round);
 * - the land dots are prepared at build time (scripts/globe.mjs) and placed here as one instanced
 *   mesh; three-globe working them out in the browser held the page still for seconds;
 * - colours come from the site's tokens, read at start, not from literals;
 * - the five places carry the flat map's own labels, placed over the canvas;
 * - it draws 30 frames a second, not 60, and stops when off screen or when "Pause motion" is on.
 * This file is heavy (three.js) and is only ever loaded on demand, by components/globe.tsx.
 */

const { hub, regions } = map;
const stops = [hub, ...regions];

const RADIUS = 100; // three-globe's own globe radius
const CAMERA_DISTANCE = 260;
const CAMERA_LATITUDE = 0; // degrees: the view looks level at the equator, the routes in the upper half
const FACING = 52; // degrees east: the longitude turned toward the viewer, midway between Europe and Asia
const SWAY = 0.2; // radians either side of FACING
const FRAMES_A_SECOND = 30; // its motion is slow: 30 looks the same as 60 and asks half as much of the machine
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A place on the globe, in three-globe's own coordinates (longitude 0 faces +z, east is +x). */
function place(lat: number, lng: number, altitude = 0): [number, number, number] {
  const phi = rad(90 - lat);
  const theta = rad(90 - lng);
  const r = RADIUS * (1 + altitude);
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

/** The site's colour tokens, as three.js can take them (it does not read oklch): painted to a pixel and read back. */
function readPaint() {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const tokens = getComputedStyle(document.documentElement);
  const rgb = (token: string) => {
    ctx.fillStyle = tokens.getPropertyValue(token).trim();
    ctx.fillRect(0, 0, 1, 1);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)).join(", ");
  };
  const gold = rgb("--color-accent");
  return {
    sea: `rgb(${rgb("--color-field")})`,
    land: `rgb(${rgb("--color-ink")})`,
    light: `rgb(${rgb("--color-ink")})`,
    shade: `rgb(${rgb("--color-ink-2")})`,
    glow: `rgb(${rgb("--color-gold-hi")})`,
    gold: `rgb(${gold})`,
    goldFaint: `rgba(${gold}, 0.35)`,
    ring: (t: number) => `rgba(${gold}, ${1 - t})`,
  };
}
type Paint = ReturnType<typeof readPaint>;

type Route = { startLat: number; startLng: number; endLat: number; endLng: number; order: number; live: boolean };
const live = (d: object) => (d as Route).live;

/** The sea, the glow round it, the routes, the five places and their pulses: three-globe's own layers. */
function buildGlobe(paint: Paint) {
  const globe = new ThreeGlobe({ animateIn: false });

  const surface = globe.globeMaterial() as MeshPhongMaterial;
  surface.color = new Color(paint.sea);
  surface.emissive = new Color(paint.sea);
  surface.emissiveIntensity = 0.1;
  surface.shininess = 0.9;
  globe.showAtmosphere(true).atmosphereColor(paint.glow).atmosphereAltitude(0.1);

  // Each route twice: a faint line that is always there, and a dash of light that travels it in turn.
  const routes: Route[] = regions.flatMap((r, order) =>
    [false, true].map((isLive) => ({ startLat: hub.lat, startLng: hub.lng, endLat: r.lat, endLng: r.lng, order, live: isLive })),
  );
  globe
    .arcsData(routes)
    .arcColor((d: object) => (live(d) ? paint.gold : paint.goldFaint))
    .arcStroke((d: object) => (live(d) ? 0.45 : 0.2))
    .arcDashLength((d: object) => (live(d) ? 0.5 : 1))
    .arcDashGap((d: object) => (live(d) ? 1.5 : 0))
    .arcDashInitialGap((d: object) => (live(d) ? (d as Route).order * 0.5 : 0))
    .arcDashAnimateTime((d: object) => (live(d) ? 2600 : 0));

  globe
    .pointsData(stops)
    .pointColor(() => paint.gold)
    .pointsMerge(true)
    .pointAltitude(0)
    .pointRadius((d: object) => (d === hub ? 1.5 : 1));

  globe
    .ringsData(stops)
    .ringColor(() => paint.ring)
    .ringMaxRadius((d: object) => (d === hub ? 5 : 3))
    .ringPropagationSpeed(2.5)
    .ringRepeatPeriod(1500);

  return globe;
}

/** The land: every prepared dot as a small hexagon lying on the surface, drawn in one call. */
function buildLand(paint: Paint) {
  const count = land.dots.length / 2;
  const hexagon = new CircleGeometry(RADIUS * rad(land.radius), 6);
  const material = new MeshLambertMaterial({ color: paint.land, transparent: true, opacity: 0.7, side: DoubleSide });
  const mesh = new InstancedMesh(hexagon, material, count);
  const dot = new Object3D();
  for (let i = 0; i < count; i++) {
    const [x, y, z] = place(land.dots[2 * i], land.dots[2 * i + 1], 0.001);
    dot.position.set(x, y, z);
    dot.lookAt(2 * x, 2 * y, 2 * z); // its face turned outward
    dot.updateMatrix();
    mesh.setMatrixAt(i, dot.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false; // its bounds are one hexagon's, not the globe's
  return mesh;
}

function Scene({ paused, onReady, labels }: { paused: boolean; onReady: () => void; labels: RefObject<(HTMLSpanElement | null)[]> }) {
  const paint = useMemo(() => readPaint(), []);
  const globe = useMemo(() => buildGlobe(paint), [paint]);
  const dots = useMemo(() => buildLand(paint), [paint]);
  const turning = useRef<Group>(null);
  const clock = useRef({ time: 0, frames: 0, paused });
  const { camera, gl, size, invalidate } = useThree();
  const point = useMemo(() => new Vector3(), []);

  // Running, it is redrawn on a timer; paused, only when dragged.
  useEffect(() => {
    clock.current.paused = paused;
    if (paused) {
      globe.pauseAnimation();
      return;
    }
    globe.resumeAnimation();
    const timer = setInterval(() => invalidate(), 1000 / FRAMES_A_SECOND);
    return () => clearInterval(timer);
  }, [paused, globe, invalidate]);

  // With a mouse the globe can be dragged round (no zoom, no pan), as in Aceternity's version.
  // A finger scrolls the page instead: the layer takes no touches (app/globals.css).
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = controls.maxDistance = CAMERA_DISTANCE;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI - Math.PI / 3;
    const redraw = () => invalidate();
    controls.addEventListener("change", redraw);
    return () => {
      controls.removeEventListener("change", redraw);
      controls.dispose();
    };
  }, [camera, gl, invalidate]);

  // Leaving the page: stop the globe's own ticker and hand the geometry back.
  useEffect(
    () => () => {
      globe.pauseAnimation();
      for (const root of [globe, dots]) {
        root.traverse((child) => {
          const mesh = child as Mesh;
          mesh.geometry?.dispose();
          for (const material of [mesh.material].flat()) material?.dispose();
        });
      }
    },
    [globe, dots],
  );

  useFrame((_, delta) => {
    const now = clock.current;
    const group = turning.current;
    if (!group) return;
    if (!now.paused) now.time += Math.min(delta, 0.05);
    group.rotation.y = rad(-FACING) + Math.sin(now.time * 0.3) * SWAY;
    group.updateMatrixWorld();
    // Each label follows its place across the canvas, and shows only while that place is on the near side.
    stops.forEach((stop, i) => {
      const label = labels.current?.[i];
      if (!label) return;
      point.set(...place(stop.lat, stop.lng, 0.01)).applyMatrix4(group.matrixWorld);
      const near = point.dot(camera.position) > RADIUS * RADIUS * 1.02; // past the horizon it is on the far side
      point.project(camera);
      label.style.transform = `translate3d(${(((point.x + 1) * size.width) / 2).toFixed(1)}px, ${(((1 - point.y) * size.height) / 2).toFixed(1)}px, 0)`;
      label.style.visibility = near ? "visible" : "hidden";
    });
    if (++now.frames === 3) onReady();
  });

  return (
    <>
      <ambientLight color={paint.shade} intensity={0.6} />
      <directionalLight color={paint.light} position={[-400, 100, 400]} />
      <directionalLight color={paint.light} position={[-200, 500, 200]} />
      <pointLight color={paint.light} position={[-200, 500, 200]} intensity={0.8} />
      <group ref={turning}>
        <primitive object={globe} />
        <primitive object={dots} />
      </group>
    </>
  );
}

export default function GlobeScene({ paused, onReady }: { paused: boolean; onReady: () => void }) {
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const eye = place(CAMERA_LATITUDE, 0, CAMERA_DISTANCE / RADIUS - 1);
  return (
    <>
      {/* Drawn only when asked ("demand"): by the scene's own timer while it runs, by a drag while it is paused. */}
      <Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: 50, near: 100, far: 1800, position: eye }}>
        <Scene paused={paused} onReady={onReady} labels={labels} />
      </Canvas>
      {stops.map((stop, i) => (
        <span
          key={stop.label}
          ref={(el) => {
            labels.current[i] = el;
          }}
          className="map__globe-label"
        >
          <span className={`map__label map__label--${"globe" in stop ? stop.globe : stop.place}${stop === hub ? " map__label--hub" : ""}`}>{stop.label}</span>
        </span>
      ))}
    </>
  );
}
