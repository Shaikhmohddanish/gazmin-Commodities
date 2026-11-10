import type { CSSProperties } from "react";
import map from "@/content/map.json";
import { TradeGlobe } from "./globe";

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

/** A quadratic arc from the hub, bowed upward by a third of its length. */
function arc(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - Math.hypot(to.x - from.x, to.y - from.y) * 0.34;
  return `M ${from.x} ${from.y} Q ${mx.toFixed(2)} ${my.toFixed(2)} ${to.x} ${to.y}`;
}

/** Points along a route's arc, as percentages of the map, for a compositor-only ship animation. */
function shipKeyframes(name: string, from: { x: number; y: number }, to: { x: number; y: number }, w: number, h: number, steps = 12) {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 - Math.hypot(to.x - from.x, to.y - from.y) * 0.34;
  const frames = Array.from({ length: steps + 1 }, (_, k) => {
    const t = k / steps;
    const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
    const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
    return `${((k / steps) * 100).toFixed(1)}%{translate:${pct(x, w)} ${pct(y, h)};opacity:${k === 0 || k === steps ? 0 : 1}}`;
  });
  return `@keyframes ${name}{${frames.join("")}}`;
}

/**
 * The signature: a dotted world map (dots built once by scripts/map.mjs, adapted
 * from Aceternity UI's world-map) with gold routes out of Business Bay to the regions
 * the copy names. The routes grow from the hub, then cargo runs along them and the
 * ports pulse. Ships and pulses are plain elements moved by transform and opacity only,
 * so they run on the compositor (an SVG animation would lay the map out every frame);
 * under reduced motion or the motion switch the map holds still.
 *
 * This flat map is what phones, reduced motion and script-off visitors see, and what everyone
 * sees first; on the desktop layout the globe then fades in over it.
 */
export function TradeMap({ id = "map", caption, className = "" }: { id?: string; caption?: string; className?: string }) {
  const { width: w, height: h, hub, regions } = map;
  const style = { "--hub-x": pct(hub.x, w), "--hub-y": pct(hub.y, h) } as CSSProperties;
  return (
    <figure
      className={`map ${className}`}
      data-reveal
      data-loop
      style={style}
      aria-label={`Map: routes from ${hub.label} to ${regions.map((r) => r.label).join(", ")}`}
    >
      <style>{regions.map((r, i) => shipKeyframes(`${id}-ship-${i}`, hub, r, w, h)).join("")}</style>
      <div className="map__canvas">
        <div className="map__dots" />
        <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          <g className="map__routes">
            {regions.map((r) => (
              <path key={r.label} className="map__route map__route--glow" d={arc(hub, r)} />
            ))}
            {regions.map((r) => (
              <path key={r.label} className="map__route" d={arc(hub, r)} />
            ))}
            {regions.map((r) => (
              <circle key={r.label} className="map__pin" cx={r.x} cy={r.y} r={0.55} />
            ))}
          </g>
          <circle className="map__pin" cx={hub.x} cy={hub.y} r={0.8} />
        </svg>
        <div className="map__motion" aria-hidden="true">
          <span className="map__pulse map__pulse--hub" style={{ left: pct(hub.x, w), top: pct(hub.y, h) }} />
          {regions.map((r, i) => (
            <span key={r.label} className="map__pulse" style={{ left: pct(r.x, w), top: pct(r.y, h), "--i": i } as CSSProperties} />
          ))}
          {regions.map((r, i) => (
            <span
              key={r.label}
              className="map__ship"
              style={{ animationName: `${id}-ship-${i}`, animationDuration: `${(3.4 + i * 0.5).toFixed(1)}s`, animationDelay: `${(2 + i * 0.4).toFixed(1)}s` }}
            >
              <i />
            </span>
          ))}
        </div>
        {regions.map((r) => (
          <span key={r.label} className={`map__label map__label--${r.place}`} style={{ left: pct(r.x, w), top: pct(r.y, h) }}>
            {r.label}
          </span>
        ))}
        <span className={`map__label map__label--${hub.place} map__label--hub`} style={{ left: pct(hub.x, w), top: pct(hub.y, h) }}>
          {hub.label}
        </span>
        {/* On the desktop layout a globe takes this map's place once it has loaded (components/globe.tsx). */}
        <TradeGlobe />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
