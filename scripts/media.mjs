// Builds the site's media from the client's originals in ../assets/commodities.
//   node scripts/media.mjs
// Photos become WebP at 800w and 1600w; the hero clip becomes an AV1 WebM and an
// H.264 MP4 (each under 2 MB for its 10 s) plus a poster. Unchanged sources are skipped.
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "..", "assets", "commodities");
const out = join(root, "public", "media");
mkdirSync(out, { recursive: true });

const fresh = (from, to) => existsSync(to) && statSync(to).mtimeMs >= statSync(from).mtimeMs;

for (const file of readdirSync(src).filter((f) => f.endsWith(".jpg"))) {
  const from = join(src, file);
  for (const width of [800, 1600]) {
    const to = join(out, file.replace(/\.jpg$/, `-${width}.webp`));
    if (fresh(from, to)) continue;
    await sharp(from).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(to);
  }
}

copyFileSync(join(src, "logo-gazmin.png"), join(out, "logo-gazmin.png"));
copyFileSync(join(src, "site-icon.png"), join(root, "app", "icon.png"));

const clip = join(src, "hero-wheat-harvest.mp4");
const ffmpeg = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", clip, "-an", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.at(-1)}`);
};
const mp4 = join(out, "hero-harvest.mp4");
if (!fresh(clip, mp4)) {
  ffmpeg(["-vf", "scale=1280:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-maxrate", "1400k", "-bufsize", "2800k", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
  // A bitrate target, not CRF: the moving wheat makes CRF spend more than the MP4.
  ffmpeg(["-vf", "scale=1280:-2", "-c:v", "libsvtav1", "-b:v", "1000k", "-preset", "6", join(out, "hero-harvest.webm")]);
  const still = join(out, "hero-harvest-poster.png");
  ffmpeg(["-frames:v", "1", still]);
  await sharp(still).resize({ width: 1600 }).webp({ quality: 72 }).toFile(join(out, "hero-harvest-poster.webp"));
  spawnSync("rm", [still]);
}

for (const f of ["hero-harvest.mp4", "hero-harvest.webm", "hero-harvest-poster.webp"]) {
  console.log(f.padEnd(28), `${(statSync(join(out, f)).size / 1048576).toFixed(2)} MB`);
}
console.log(readdirSync(out).filter((f) => f.endsWith(".webp")).length, "webp files in public/media");
