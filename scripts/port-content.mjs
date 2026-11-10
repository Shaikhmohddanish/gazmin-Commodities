// Ports the client's copy from the WordPress build's manifest (the docx-verified
// source of truth) into content/commodities.json, verbatim.
//   node scripts/port-content.mjs
// The manifest is a function of Elementor builder helpers; each call is recorded
// as { t: <helper>, a: <arguments> } instead of being built into Elementor JSON.
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const manifest = require(join(root, "..", "templates", "data", "commodities", "manifest.js"));

const record = (t, a) => {
  const call = { t, a };
  // Some helpers are spread into the section list (...h.iconGrid()).
  Object.defineProperty(call, Symbol.iterator, { value: function* () { yield call; } });
  return call;
};
const h = new Proxy({}, { get: (_, t) => (...a) => record(String(t), a) });

const data = manifest(h);
mkdirSync(join(root, "content"), { recursive: true });
writeFileSync(join(root, "content", "commodities.json"), JSON.stringify(data, null, 2) + "\n");
console.log(data.pages.map((p) => `${p.slug}: ${p.sections.length} sections`).join("\n"));
