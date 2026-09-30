/** Lessons (Mini Aula units). R0 ships one full Mini Aula: de/do/da/dos/das. */
import type { Lesson } from "./schema.ts";

export const LESSONS: Lesson[] = [
  {
    id: "u01.de_origin",
    unit: "u01",
    title: "De onde és? — de, do, da, dos, das",
    source: { sourceId: "pav1-student", unit: "u01", pages: [22, 31], concept: "preposition-de-places" },
    itemIds: [
      "grammar.contraction.de_o",
      "grammar.contraction.de_a",
      "grammar.contraction.de_os",
      "grammar.contraction.de_as",
      "grammar.origin.lisboa",
      "grammar.origin.porto",
      "grammar.origin.brasil",
      "grammar.origin.alemanha",
      "grammar.origin.eua",
      "grammar.origin.portugal",
    ],
    canDo: ["cd01.introduce-self", "cd02.personal-info"],
  },
];
