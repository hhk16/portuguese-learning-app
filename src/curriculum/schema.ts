/**
 * Curriculum knowledge items: atomic, individually tracked pieces of Portuguese.
 *
 * Every item carries provenance (`source`) so we can always answer "why is this here?" and audit
 * that every book section has been turned into game material. Content is original wording
 * modelled on the book's skills — never copied passages.
 */
import { z } from "zod";

export const SourceId = z.enum(["pav1-student", "pav1-caderno", "camoes-a1", "cefr"]);
export const Source = z.object({
  sourceId: SourceId,
  unit: z.string().regex(/^(u0\d|pds\d|trab\d|mundo\d|surv\d\d)$/).optional(),
  pages: z.array(z.number().int().positive()).max(12).optional(),
  concept: z.string().min(2).max(80),
});
export type Source = z.infer<typeof Source>;

/** Hierarchical dot ids, e.g. "grammar.ter.eles", "vocab.nationality.alemanha". */
export const ItemId = z.string().regex(/^[a-z0-9]+(\.[a-z0-9_]+)+$/);

const common = {
  id: ItemId,
  source: Source,
  /** One-line "why" shown on mistakes. PT with an English gloss is fine. */
  why: z.string().max(160).optional(),
  /** Common confusions (other item ids or free text) — used for distractors & feedback. */
  confusions: z.array(z.string()).max(8).optional(),
  canDo: z.array(z.string()).max(4).optional(),
};

const Article = z.enum(["o", "a", "os", "as"]).nullable();

export const NationalityItem = z.object({
  ...common,
  kind: z.literal("nationality"),
  country: z.string(),
  /** Article used with the country; null = none (Portugal, Angola…). */
  article: Article,
  /** True when the article is optional, e.g. "(a) França". */
  articleOptional: z.boolean().optional(),
  flag: z.string(),
  ms: z.string(),
  fs: z.string(),
  mp: z.string(),
  fp: z.string(),
  en: z.string(),
});

export const ProfessionItem = z.object({
  ...common,
  kind: z.literal("profession"),
  m: z.string(),
  f: z.string(),
  en: z.string(),
  emoji: z.string(),
  workplace: z.string().optional(),
});

export const Person = z.enum(["eu", "tu", "ele", "nos", "eles"]);
export type Person = z.infer<typeof Person>;
export const PERSON_LABEL: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ele / ela / você", nos: "nós", eles: "eles / elas / vocês" };
export const PERSON_SHORT: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ela", nos: "nós", eles: "eles" };

export const ConjugationItem = z.object({
  ...common,
  kind: z.literal("conjugation"),
  verb: z.string(),
  tense: z.enum(["presente"]),
  person: Person,
  form: z.string(),
  en: z.string().optional(),
});

export const ContractionItem = z.object({
  ...common,
  kind: z.literal("contraction"),
  prep: z.enum(["de", "em"]),
  article: z.enum(["o", "a", "os", "as"]),
  form: z.string(),
});

/** "Sou de Lisboa" / "Sou do Brasil": origin with de ± article. */
export const OriginItem = z.object({
  ...common,
  kind: z.literal("origin"),
  place: z.string(),
  placeType: z.enum(["city", "country"]),
  article: Article,
  /** Full answer, e.g. "do Porto". */
  form: z.string(),
  emoji: z.string().optional(),
});

/** A sentence with one wrong word. `tokens[wrongIndex]` should be `fix`. */
export const ErrorItem = z.object({
  ...common,
  kind: z.literal("error"),
  tokens: z.array(z.string()).min(2).max(10),
  wrongIndex: z.number().int().nonnegative(),
  fix: z.string(),
  /** English meaning of the corrected sentence. */
  en: z.string().optional(),
});

/** Gap sentence: "Nós ___ portugueses." */
export const FrameItem = z.object({
  ...common,
  kind: z.literal("frame"),
  text: z.string().includes("___"),
  answer: z.string(),
  distractors: z.array(z.string()).min(1).max(5),
  en: z.string().optional(),
  /** Knowledge item this frame exercises (e.g. the conjugation). Evidence is recorded on both. */
  targets: z.array(ItemId).max(3).optional(),
});

export const MinimalPairItem = z.object({
  ...common,
  kind: z.literal("minimalPair"),
  target: z.string(),
  contrast: z.string(),
  feature: z.string(),
  hint: z.string().optional(),
});

export const PhraseItem = z.object({
  ...common,
  kind: z.literal("phrase"),
  pt: z.string(),
  en: z.string(),
  fn: z.enum(["greeting", "farewell", "courtesy", "repair", "introduce", "question", "answer"]),
  situation: z.string().optional(),
});

export const NumberItem = z.object({
  ...common,
  kind: z.literal("number"),
  value: z.number().int().min(0).max(1000),
  pt: z.string(),
  fem: z.string().optional(),
});

export const KnowledgeItem = z.discriminatedUnion("kind", [
  NationalityItem,
  ProfessionItem,
  ConjugationItem,
  ContractionItem,
  OriginItem,
  ErrorItem,
  FrameItem,
  MinimalPairItem,
  PhraseItem,
  NumberItem,
]);
export type KnowledgeItem = z.infer<typeof KnowledgeItem>;
export type ItemKind = KnowledgeItem["kind"];
export type ItemOf<K extends ItemKind> = Extract<KnowledgeItem, { kind: K }>;

/** A lesson groups items and has a Mini Aula. Stages: teach → recognise → produce → use. */
export const Lesson = z.object({
  id: z.string().regex(/^u\d\d\.[a-z0-9_]+$/),
  unit: z.string(),
  title: z.string(),
  source: Source,
  itemIds: z.array(ItemId).min(1),
  canDo: z.array(z.string()).max(6),
});
export type Lesson = z.infer<typeof Lesson>;
