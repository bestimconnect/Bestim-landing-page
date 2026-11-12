// Fails if the Arabic and English dictionaries don't have exactly the same keys
// (and the same number of items in every list). Run: npm run check
import { readFileSync } from "node:fs";

const load = (lang, prefix = "") => JSON.parse(readFileSync(new URL(`../src/dictionaries/${prefix}${lang}.json`, import.meta.url)));

const shape = (value, path = "") =>
  value && typeof value === "object"
    ? Object.entries(value).flatMap(([key, child]) => shape(child, `${path}/${key}`))
    : [path];

// The site's dictionaries and the dashboard's (dashboard.ar.json / dashboard.en.json) each have to match.
const both = (prefix) => [new Set(shape(load("ar", prefix))), new Set(shape(load("en", prefix)))];
const pairs = [both(""), both("dashboard.")];
const ar = new Set(pairs.flatMap(([a], i) => [...a].map((k) => `${i}${k}`)));
const en = new Set(pairs.flatMap(([, e], i) => [...e].map((k) => `${i}${k}`)));
const onlyAr = [...ar].filter((k) => !en.has(k));
const onlyEn = [...en].filter((k) => !ar.has(k));

if (onlyAr.length || onlyEn.length) {
  if (onlyAr.length) console.error("Missing in en.json:\n  " + onlyAr.join("\n  "));
  if (onlyEn.length) console.error("Missing in ar.json:\n  " + onlyEn.join("\n  "));
  process.exit(1);
}
console.log(`Dictionaries match (${ar.size} strings).`);
