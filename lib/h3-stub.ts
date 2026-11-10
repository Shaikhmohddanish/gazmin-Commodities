// Stands in for "h3-js" in the browser (see turbopack.resolveAlias in next.config.ts).
// three-globe imports the hexagon library for its hexagon layers. This site prepares its hexagons at
// build time (scripts/globe.mjs uses the real h3-js) and never calls those layers, so the library
// would be 200 KB of download for nothing.
const notBundled = (): never => {
  throw new Error("h3-js is not in the browser bundle: the globe's land is prepared by scripts/globe.mjs");
};
export const latLngToCell = notBundled;
export const cellToLatLng = notBundled;
export const cellToBoundary = notBundled;
export const polygonToCells = notBundled;
