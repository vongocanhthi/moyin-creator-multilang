/**
 * Merges director-{en,zh,vi}.json into src/locales/{en,zh,vi}.json (director namespace).
 * Run from repo root: node scripts/merge-director-locale.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

for (const locale of ["en", "zh", "vi"]) {
  const mainPath = path.join(root, `src/locales/${locale}.json`);
  const fragPath = path.join(root, `scripts/director-locale-${locale}.json`);
  const main = JSON.parse(fs.readFileSync(mainPath, "utf8"));
  const director = JSON.parse(fs.readFileSync(fragPath, "utf8"));
  main.director = director;
  fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + "\n");
  console.log("merged director →", locale + ".json");
}
