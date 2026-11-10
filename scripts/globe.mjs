// Builds the globe's land: one dot for every H3 cell (resolution 3) that lies on land.
//   node scripts/globe.mjs
// Aceternity UI's Globe has three-globe work this out in the visitor's browser (hexPolygonsData at
// resolution 3 with a margin of 0.7). On the office Mac that held the page still for about seven
// seconds, and one outline made the library throw. Worked out once here instead, the browser only
// has to place the dots (components/globe-scene.tsx), and the hexagon library stays out of the download.
// Source: Natural Earth's 1:110m countries (public domain), the copy shipped with three-globe's examples.
// Writes content/globe-dots.json: { radius, dots }. radius is a dot's size in degrees (the margin of
// 0.7 leaves 30% of a cell); dots is a flat list of latitude, longitude, latitude, longitude...
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cellToBoundary, cellToLatLng, greatCircleDistance, polygonToCells, UNITS } from "h3-js";

const RESOLUTION = 3;
const MARGIN = 0.7;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "three-globe", "example", "country-polygons", "ne_110m_admin_0_countries.geojson");
const { features } = JSON.parse(readFileSync(source, "utf8"));

const cells = new Set();
let skipped = 0;
for (const { geometry } of features) {
  for (const polygon of geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates) {
    try {
      for (const cell of polygonToCells(polygon, RESOLUTION, true)) cells.add(cell);
    } catch {
      skipped++; // an outline the library cannot fill
    }
  }
}

const deg = (radians) => (radians * 180) / Math.PI;
let reach = 0;
const dots = [];
for (const cell of cells) {
  const centre = cellToLatLng(cell);
  const corners = cellToBoundary(cell);
  reach += corners.reduce((sum, corner) => sum + greatCircleDistance(centre, corner, UNITS.rads), 0) / corners.length;
  dots.push(Math.round(centre[0] * 100) / 100, Math.round(centre[1] * 100) / 100);
}
const radius = Math.round(deg(reach / cells.size) * (1 - MARGIN) * 1000) / 1000;

const out = JSON.stringify({ radius, dots });
writeFileSync(join(root, "content", "globe-dots.json"), out + "\n");
console.log(`globe-dots.json ${(out.length / 1024).toFixed(0)} KB, ${cells.size} dots of ${radius} degrees, ${skipped} outlines skipped`);
