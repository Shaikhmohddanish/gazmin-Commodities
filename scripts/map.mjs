// Builds the trade map's dot field and route endpoints (adapted from Aceternity UI's
// world-map, which builds the same map in the browser on every render).
//   node scripts/map.mjs
// Writes public/media/world-dots.svg (used as a CSS mask, so the dots take a token
// colour) and content/map.json (viewBox, the snapped hub and region points, and their
// latitude and longitude for the globe).
// Regions are the four the copy names; no city, port or office is implied.
import DottedMap from "dotted-map";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const map = new DottedMap({ height: 60, grid: "diagonal" });

const svg = map
  .getSVG({ radius: 0.24, color: "black", shape: "circle" })
  .replace(/\s*\n\s*/g, "")
  .replace(/ style="[^"]*"/, "");
writeFileSync(join(root, "public", "media", "world-dots.svg"), svg);

const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
// x and y place a point on the flat map; lat and lng place the same point on the globe (components/globe-scene.tsx).
const pin = (lat, lng) => {
  const { x, y } = map.getPin({ lat, lng });
  return { x, y: Math.round(y * 100) / 100, lat, lng };
};
const data = {
  width: Number(viewBox[1]),
  height: Number(viewBox[2]),
  // place: where the label sits against its pin, chosen so no label crosses a route.
  hub: { label: "Business Bay, Dubai", place: "below-right", ...pin(25.1858, 55.2655) },
  regions: [
    { label: "Middle East", place: "left", ...pin(31.5, 42) },
    { label: "Europe", place: "above", ...pin(50, 10) },
    // globe: where the label sits on the globe when the flat map's side would not do (there, below Africa is where the globe fades out).
    { label: "Africa", place: "below", globe: "left", ...pin(4, 22) },
    { label: "Asia", place: "above", ...pin(30, 95) },
  ],
};
writeFileSync(join(root, "content", "map.json"), JSON.stringify(data, null, 2) + "\n");
console.log(`world-dots.svg ${(svg.length / 1024).toFixed(0)} KB, ${data.regions.length} regions, viewBox ${data.width}x${data.height}`);
