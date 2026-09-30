/**
 * Collect every Portuguese text the app may speak aloud and print it as JSON.
 *
 *   node scripts/audio/collect.ts                 # JSON array on stdout
 *   node scripts/audio/collect.ts --out texts.json
 *
 * Consumed by scripts/audio/render.py.
 */
import { writeFileSync } from "node:fs";
import { allSpokenTexts } from "../../src/curriculum/spoken.ts";

const texts = allSpokenTexts();
const json = JSON.stringify(texts, null, 1);
const i = process.argv.indexOf("--out");
const out = i >= 0 ? process.argv[i + 1] : undefined;
if (out) {
  writeFileSync(out, json + "\n");
  console.error(`collect: wrote ${texts.length} texts to ${out}`);
} else {
  process.stdout.write(json + "\n");
}
