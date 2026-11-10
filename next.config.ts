import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for the client's cPanel host: one index.html per route,
  // with folder-style URLs that match the old WordPress slugs (/the-group/).
  output: "export",
  trailingSlash: true,
  // Static hosting has no image server; images are pre-optimised with ffmpeg.
  images: { unoptimized: true },
  turbopack: {
    // The globe's library (three-globe) imports three.js's WebGPU build for a heatmap layer and a hexagon
    // library for layers this site never draws; stubs in their place take over a megabyte off the globe's
    // file (lib/three-webgpu-stub.ts, lib/h3-stub.ts). Node scripts still get the real packages.
    resolveAlias: {
      "three/webgpu": "./lib/three-webgpu-stub.ts",
      "three/tsl": "./lib/three-webgpu-stub.ts",
      "h3-js": "./lib/h3-stub.ts",
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
