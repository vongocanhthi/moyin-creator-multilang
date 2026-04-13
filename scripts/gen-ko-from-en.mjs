import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const enPath = path.join(root, "src", "locales", "en.json");
const koPath = path.join(root, "src", "locales", "ko.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const ko = JSON.parse(fs.readFileSync(koPath, "utf8"));

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

const merged = deepMerge(en, ko);
fs.writeFileSync(koPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log("Generated full ko.json (en base + ko overrides).");

