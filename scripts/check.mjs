// Fails if the Arabic and English dictionaries don't have exactly the same keys
// (and the same number of items in every list). Run: npm run check
import { readFileSync } from "node:fs";

const load = (lang) => JSON.parse(readFileSync(new URL(`../src/dictionaries/${lang}.json`, import.meta.url)));

const shape = (value, path = "") =>
  value && typeof value === "object"
    ? Object.entries(value).flatMap(([key, child]) => shape(child, `${path}/${key}`))
    : [path];

const ar = new Set(shape(load("ar")));
const en = new Set(shape(load("en")));
const onlyAr = [...ar].filter((k) => !en.has(k));
const onlyEn = [...en].filter((k) => !ar.has(k));

if (onlyAr.length || onlyEn.length) {
  if (onlyAr.length) console.error("Missing in en.json:\n  " + onlyAr.join("\n  "));
  if (onlyEn.length) console.error("Missing in ar.json:\n  " + onlyEn.join("\n  "));
  process.exit(1);
}
console.log(`Dictionaries match (${ar.size} strings).`);
