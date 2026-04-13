import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const enPath = path.join(root, "src", "locales", "en.json");
const jaPath = path.join(root, "src", "locales", "ja.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override;
  }
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base[k], override[k]);
  }
  return out;
}

const merged = deepMerge(en, ja);
fs.writeFileSync(jaPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log("Generated full ja.json (en base + ja overrides).");

