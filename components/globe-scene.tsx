"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { advance, Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineLoop,
  MeshLambertMaterial,
  Object3D,
  Vector3,
  type Mesh,
  type MeshPhongMaterial,
} from "three";
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
 *   never leave view; it can still be turned by hand: dragged with a mouse, or swiped sideways with a
 *   finger (a swipe up or down still scrolls the page);
 * - the land dots are prepared at build time (scripts/globe.mjs) and placed here as one instanced
 *   mesh; three-globe working them out in the browser held the page still for seconds;
 * - colours come from the site's tokens, read at start, not from literals;
 * - the five places carry the flat map's own labels, placed over the canvas;
 * - it draws 30 frames a second, not 60, each in one animation frame of its own (React Three Fiber's
 *   on-demand mode spends a second, empty one after each), and stops when off screen or when
 *   "Pause motion" is on; a label is only touched when it moves a whole pixel;
 * - three-globe's own animation loops (four, each running every screen refresh) are stopped: the
 *   travelling dashes are moved from this scene's single loop, and the five pulses are its own ten
 *   rings made once and reused, where three-globe makes a new line object for every pulse.
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
const RING_SPEED = 2.5; // degrees a second a pulse widens (three-globe's ringPropagationSpeed in the source)
const RING_PERIOD = 1.5; // seconds between pulses at a place (its ringRepeatPeriod)
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
  };
}
type Paint = ReturnType<typeof readPaint>;

type Route = { startLat: number; startLng: number; endLat: number; endLng: number; order: number; live: boolean };
const live = (d: object) => (d as Route).live;

/** The sea, the glow round it, the routes and the five places: three-globe's own layers, with its own loops stopped. */
function buildGlobe(paint: Paint) {
  const globe = new ThreeGlobe({ animateIn: false });
  // Nothing eases in (that needs three-globe's loop): routes and places are drawn in place at once.
  globe.arcsTransitionDuration(0).pointsTransitionDuration(0);

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

  // Its four loops (one for easing, one each for dashes, paths and pulses) all stop here; Scene moves what moves.
  globe.pauseAnimation();
  return globe;
}

/** A dash travelling a route: three-globe's per-route animation step and the shader value it advances. */
type Dash = { step: number; uniform: { value: number } };

/** The routes' travelling dashes, found once three-globe has built the routes. */
function findDashes(globe: ThreeGlobe): Dash[] {
  const dashes: Dash[] = [];
  globe.traverse((child) => {
    const arc = child as Object3D & { __dashAnimateStep?: number; material?: { uniforms?: { dashTranslate?: { value: number } } } };
    const uniform = arc.material?.uniforms?.dashTranslate;
    if (arc.__dashAnimateStep && uniform) dashes.push({ step: arc.__dashAnimateStep, uniform });
  });
  return dashes;
}

/** The pulses: two rings at each place, widening and fading in turn, made once and reused. */
function buildRings(paint: Paint) {
  const circle = new BufferGeometry().setFromPoints(
    Array.from({ length: 64 }, (_, i) => new Vector3(Math.cos((i / 64) * 2 * Math.PI), Math.sin((i / 64) * 2 * Math.PI), 0)),
  );
  const group = new Group();
  const rings = stops.flatMap((stop) =>
    [0, 1].map((k) => {
      const material = new LineBasicMaterial({ color: new Color(paint.gold), transparent: true, opacity: 0 });
      const line = new LineLoop(circle, material);
      const [x, y, z] = place(stop.lat, stop.lng, 0.0015);
      line.position.set(x, y, z);
      line.lookAt(2 * x, 2 * y, 2 * z); // lying on the surface
      line.visible = false;
      group.add(line);
      return { line, material, widest: stop === hub ? 5 : 3, offset: k * RING_PERIOD };
    }),
  );
  return { group, rings };
}
type Rings = ReturnType<typeof buildRings>;

function moveRings({ rings }: Rings, time: number) {
  for (const ring of rings) {
    const spread = RING_SPEED * ((time + ring.offset) % (2 * RING_PERIOD)); // degrees
    const t = spread / ring.widest;
    ring.line.visible = t > 0 && t < 1;
    ring.line.scale.setScalar(Math.max(RADIUS * rad(spread), 0.01));
    ring.material.opacity = 1 - t;
  }
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
  const pulses = useMemo(() => buildRings(paint), [paint]);
  const dashes = useRef<Dash[]>([]);
  const turning = useRef<Group>(null);
  const clock = useRef({ time: 0, frames: 0, paused });
  const placed = useRef<string[]>([]);
  const { camera, gl, size, get } = useThree();
  const point = useMemo(() => new Vector3(), []);

  // One frame, drawn in the next animation frame (several requests before then make one frame).
  const pending = useRef(0);
  const draw = useCallback(() => {
    if (pending.current) return;
    pending.current = requestAnimationFrame((ms) => {
      pending.current = 0;
      advance(ms / 1000, false, get());
    });
  }, [get]);
  useEffect(() => () => cancelAnimationFrame(pending.current), []);

  // Running, it is drawn on a timer; paused, once (so it shows, or settles), then only when turned by hand.
  useEffect(() => {
    clock.current.paused = paused;
    draw();
    if (paused) return;
    const timer = setInterval(draw, 1000 / FRAMES_A_SECOND);
    return () => clearInterval(timer);
  }, [paused, draw]);

  // The routes are built a moment after the globe: a paused globe draws again shortly, so they are on it.
  useEffect(() => {
    const timers = [250, 1000].map((ms) => setTimeout(draw, ms));
    return () => timers.forEach(clearTimeout);
  }, [draw]);

  // Resized or moved on the page: draw it again at its new size.
  useEffect(draw, [size, draw]);

  // It can be turned by hand (no zoom, no pan), as in Aceternity's version: dragged with a mouse, or
  // swiped sideways with a finger. A finger moving up or down still scrolls the page, and two fingers
  // still zoom it: the browser keeps those gestures, and only a sideways swipe reaches the globe.
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    if (controls.domElement) controls.domElement.style.touchAction = "pan-y pinch-zoom"; // after the controls, which set "none"
    // Zoom is off, so the controls' wheel listener does nothing; left in, it is one that may cancel the scroll,
    // and the browser then waits for script before every wheel scroll over the globe.
    controls.domElement?.removeEventListener("wheel", (controls as unknown as { _onMouseWheel: EventListener })._onMouseWheel);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.5; // at the default, a short swipe on a phone spun it half a turn, routes and all out of sight
    controls.minDistance = controls.maxDistance = CAMERA_DISTANCE;
    // A mouse may tilt it a little, as in the source; a finger only spins it. The browser hands an up-down
    // swipe to the page only after the first few pixels, and those would otherwise tilt the globe.
    const limit = (e: Event) => {
      const fingers = (e as PointerEvent).pointerType === "touch";
      controls.minPolarAngle = fingers ? controls.getPolarAngle() : Math.PI / 3.5;
      controls.maxPolarAngle = fingers ? controls.getPolarAngle() : Math.PI - Math.PI / 3;
    };
    limit(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    controls.domElement?.addEventListener("pointerdown", limit, { capture: true }); // before the controls' own handler
    controls.addEventListener("change", draw);
    return () => {
      controls.domElement?.removeEventListener("pointerdown", limit, { capture: true });
      controls.removeEventListener("change", draw);
      controls.dispose();
    };
  }, [camera, gl, draw]);

  // Leaving the page: hand the geometry back.
  useEffect(
    () => () => {
      for (const root of [globe, dots, pulses.group]) {
        root.traverse((child) => {
          const mesh = child as Mesh;
          mesh.geometry?.dispose();
          for (const material of [mesh.material].flat()) material?.dispose();
        });
      }
    },
    [globe, dots, pulses],
  );

  useFrame((_, delta) => {
    const now = clock.current;
    const group = turning.current;
    if (!group) return;
    const step = now.paused ? 0 : Math.min(delta, 0.05);
    now.time += step;
    group.rotation.y = rad(-FACING) + Math.sin(now.time * 0.3) * SWAY;
    // The dashes travel and the pulses widen from this one loop (three-globe's own are stopped).
    if (!dashes.current.length) dashes.current = findDashes(globe);
    for (const dash of dashes.current) dash.uniform.value = (dash.uniform.value % 1e9) + dash.step * step;
    moveRings(pulses, now.time);
    group.updateMatrixWorld();
    // Each label follows its place across the canvas, and shows only while that place is on the near side.
    // The camera's matrices are otherwise brought up to date only by the render after this, which left the
    // labels a step behind a turn by hand once the globe stopped redrawing.
    camera.updateMatrixWorld();
    stops.forEach((stop, i) => {
      const label = labels.current?.[i];
      if (!label) return;
      point.set(...place(stop.lat, stop.lng, 0.01)).applyMatrix4(group.matrixWorld);
      const near = point.dot(camera.position) > RADIUS * RADIUS * 1.02; // past the horizon it is on the far side
      point.project(camera);
      const transform = `translate3d(${Math.round(((point.x + 1) * size.width) / 2)}px, ${Math.round(((1 - point.y) * size.height) / 2)}px, 0)`;
      const visibility = near ? "visible" : "hidden";
      if (placed.current[i] === transform + visibility) return; // unchanged: leave the page alone
      placed.current[i] = transform + visibility;
      label.style.transform = transform;
      label.style.visibility = visibility;
    });
    if (++now.frames === 2) onReady();
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
        <primitive object={pulses.group} />
      </group>
    </>
  );
}

export default function GlobeScene({ paused, onReady }: { paused: boolean; onReady: () => void }) {
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const eye = place(CAMERA_LATITUDE, 0, CAMERA_DISTANCE / RADIUS - 1);
  return (
    <>
      {/* Drawn only by the scene itself ("never" leaves every frame to it): on its timer while it runs, when turned while it is paused. */}
      <Canvas frameloop="never" dpr={[1, 2]} camera={{ fov: 50, near: 100, far: 1800, position: eye }}>
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
