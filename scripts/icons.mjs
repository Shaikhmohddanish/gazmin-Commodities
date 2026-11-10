// Home-screen icons from the site icon (app/icon.png: the logo mark on white in a navy frame).
//   node scripts/icons.mjs
// Phones cut their own shape out of an icon (a circle, a squircle), so these carry the mark alone,
// smaller, on a full white square: app/apple-icon.png (iPhone) and public/icons/maskable-*.png (Android).
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const white = { r: 255, g: 255, b: 255, alpha: 1 };
// The mark inside the frame of the 512px icon.
const mark = await sharp(join(root, "app", "icon.png")).extract({ left: 56, top: 76, width: 400, height: 360 }).toBuffer();

async function icon(size, markWidth, to) {
  const art = await sharp(mark).resize({ width: Math.round(size * markWidth) }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: white } })
    .composite([{ input: art, gravity: "centre" }])
    .flatten({ background: white })
    .png({ compressionLevel: 9 })
    .toFile(join(root, to));
  console.log(to, `${size}x${size}`);
}

await icon(180, 0.66, "app/apple-icon.png");
await icon(192, 0.58, "public/icons/maskable-192.png");
await icon(512, 0.58, "public/icons/maskable-512.png");
