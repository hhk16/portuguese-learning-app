/**
 * Curriculum content check (CI): schema, unique ids, provenance, PT-PT lint, every lesson builds a
 * solvable session, and the book-coverage audit against the curriculum source map.
 *   npm run content:check
 */
import { readFileSync } from "node:fs";
import { ALL_ITEMS, LESSONS } from "../src/curriculum/index.ts";
import { buildSession, cardOf, lessonCards } from "../src/curriculum/learn.ts";
import { KnowledgeItem } from "../src/curriculum/schema.ts";
import { lintPtPt } from "../src/curriculum/pt-pt-lint.ts";
import { Rng } from "../src/shared/rng.ts";

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error("✗", msg);
};

const ids = new Set<string>();
for (const item of ALL_ITEMS) {
  const r = KnowledgeItem.safeParse(item);
  if (!r.success) fail(`${item.id}: schema — ${r.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")}`);
  if (ids.has(item.id)) fail(`duplicate id ${item.id}`);
  ids.add(item.id);
  for (const hit of lintPtPt(JSON.stringify(item))) fail(`${item.id}: PT-PT lint "${hit.match}" → ${hit.suggestion}`);
}

const kinds: Record<string, number> = {};
for (const l of LESSONS) {
  for (const id of l.itemIds) if (!ids.has(id)) fail(`lesson ${l.id} references unknown item ${id}`);
  const cards = lessonCards(l);
  if (cards.length < 4) fail(`lesson ${l.id}: only ${cards.length} teachable cards`);
  const session = buildSession(l, () => undefined, new Rng(1));
  if (session.length < 10) fail(`lesson ${l.id}: session has only ${session.length} steps`);
  for (const ex of session) kinds[ex.kind] = (kinds[ex.kind] ?? 0) + 1;
}

// Book coverage: which source-map sections already have game items (by unit).
const map = JSON.parse(readFileSync("src/curriculum/source/source-map.json", "utf8")) as { sections: { sectionId: string; source: string; lessons: unknown[] }[] };
const unitsWithItems = new Set(ALL_ITEMS.map((i) => i.source.unit).filter(Boolean));
const book = map.sections.filter((s) => s.source === "pav1-student");
const covered = book.filter((s) => unitsWithItems.has(s.sectionId));
console.log(`items: ${ALL_ITEMS.length} (${ALL_ITEMS.map(cardOf).filter(Boolean).length} playable cards) · lessons: ${LESSONS.length}`);
console.log(`exercise kinds across all lessons: ${JSON.stringify(kinds)}`);
console.log(`book coverage: ${covered.length}/${book.length} sections have game items (${covered.map((s) => s.sectionId).join(", ")})`);
console.log(`not yet covered: ${book.filter((s) => !unitsWithItems.has(s.sectionId)).map((s) => s.sectionId).join(", ")}`);
if (failures) {
  console.error(`\n${failures} problem(s)`);
  process.exit(1);
}
console.log("content OK ✓");
