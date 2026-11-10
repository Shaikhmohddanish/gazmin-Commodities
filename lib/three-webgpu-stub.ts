// Stands in for "three/webgpu" and "three/tsl" (see turbopack.resolveAlias in next.config.ts).
// three-globe imports three.js's WebGPU renderer and its shader language for one layer alone, its
// heatmaps, and reaches for them only inside that layer's functions. The globe on this site has no
// heatmap, and left in, those two modules add about a megabyte to the file a visitor downloads.
// If a heatmap is ever wanted, remove the alias.
export class WebGPURenderer {}
export class StorageInstancedBufferAttribute {}
