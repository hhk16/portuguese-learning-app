/**
 * Unit 1 — "Olá! Eu sou a Ana." (Livro do Aluno pp. 13–32; Caderno Unidade 1).
 * Original wording; paradigms and word lists are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u01", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u01", pages, concept });

/* ----------------------------- Nationalities (Apêndice p. 30) ----------------------------- */

type Nat = [slug: string, country: string, article: "o" | "a" | "os" | "as" | null, flag: string, ms: string, fs: string, mp: string, fp: string, en: string, optional?: boolean];
const NATS: Nat[] = [
  ["portugal", "Portugal", null, "🇵🇹", "português", "portuguesa", "portugueses", "portuguesas", "Portuguese"],
  ["china", "China", "a", "🇨🇳", "chinês", "chinesa", "chineses", "chinesas", "Chinese"],
  ["japao", "Japão", "o", "🇯🇵", "japonês", "japonesa", "japoneses", "japonesas", "Japanese"],
  ["franca", "França", "a", "🇫🇷", "francês", "francesa", "franceses", "francesas", "French", true],
  ["inglaterra", "Inglaterra", "a", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "inglês", "inglesa", "ingleses", "inglesas", "English", true],
  ["noruega", "Noruega", "a", "🇳🇴", "norueguês", "norueguesa", "noruegueses", "norueguesas", "Norwegian"],
  ["italia", "Itália", "a", "🇮🇹", "italiano", "italiana", "italianos", "italianas", "Italian", true],
  ["angola", "Angola", null, "🇦🇴", "angolano", "angolana", "angolanos", "angolanas", "Angolan"],
  ["russia", "Rússia", "a", "🇷🇺", "russo", "russa", "russos", "russas", "Russian"],
  ["suecia", "Suécia", "a", "🇸🇪", "sueco", "sueca", "suecos", "suecas", "Swedish"],
  ["brasil", "Brasil", "o", "🇧🇷", "brasileiro", "brasileira", "brasileiros", "brasileiras", "Brazilian"],
  ["egito", "Egito", "o", "🇪🇬", "egípcio", "egípcia", "egípcios", "egípcias", "Egyptian"],
  ["canada", "Canadá", "o", "🇨🇦", "canadiano", "canadiana", "canadianos", "canadianas", "Canadian"],
  ["eua", "Estados Unidos", "os", "🇺🇸", "norte-americano", "norte-americana", "norte-americanos", "norte-americanas", "American"],
  ["guine", "Guiné", "a", "🇬🇳", "guineense", "guineense", "guineenses", "guineenses", "Guinean"],
  ["saotome", "São Tomé e Príncipe", null, "🇸🇹", "são-tomense", "são-tomense", "são-tomenses", "são-tomenses", "São Toméan"],
  ["timor", "Timor-Leste", null, "🇹🇱", "timorense", "timorense", "timorenses", "timorenses", "Timorese"],
  ["espanha", "Espanha", "a", "🇪🇸", "espanhol", "espanhola", "espanhóis", "espanholas", "Spanish", true],
  ["alemanha", "Alemanha", "a", "🇩🇪", "alemão", "alemã", "alemães", "alemãs", "German"],
  ["belgica", "Bélgica", "a", "🇧🇪", "belga", "belga", "belgas", "belgas", "Belgian"],
];

const nationalities: KnowledgeItem[] = NATS.map(([slug, country, article, flag, ms, fs, mp, fp, en, optional]) => ({
  id: `vocab.nationality.${slug}`,
  kind: "nationality",
  country,
  article,
  articleOptional: optional,
  flag,
  ms,
  fs,
  mp,
  fp,
  en,
  source: src("nationalities", [20, 21, 30]),
  why: ms.endsWith("ês")
    ? "-ês → -esa (feminino), -eses (plural). O acento cai no feminino."
    : ms.endsWith("ense")
      ? "-ense é igual no masculino e no feminino."
      : ms === "alemão"
        ? "alemão → alemã → alemães / alemãs"
        : ms === "espanhol"
          ? "espanhol → espanhola → espanhóis / espanholas"
          : ms === "belga"
            ? "belga é igual no masculino e no feminino."
            : "-o → -a no feminino; +s no plural.",
}));

/* ---------------------------------- Professions (pp. 22–24) --------------------------------- */

type Prof = [slug: string, m: string, f: string, en: string, emoji: string, workplace?: string];
const PROFS: Prof[] = [
  ["professor", "professor", "professora", "teacher", "🧑‍🏫", "a escola"],
  ["medico", "médico", "médica", "doctor", "🧑‍⚕️", "o hospital"],
  ["enfermeiro", "enfermeiro", "enfermeira", "nurse", "💉", "o hospital"],
  ["engenheiro", "engenheiro", "engenheira", "engineer", "👷"],
  ["advogado", "advogado", "advogada", "lawyer", "⚖️", "o tribunal"],
  ["arquiteto", "arquiteto", "arquiteta", "architect", "📐"],
  ["cozinheiro", "cozinheiro", "cozinheira", "cook", "🧑‍🍳", "a cozinha"],
  ["empregado_mesa", "empregado de mesa", "empregada de mesa", "waiter", "🍽️", "o restaurante"],
  ["cabeleireiro", "cabeleireiro", "cabeleireira", "hairdresser", "💇"],
  ["jardineiro", "jardineiro", "jardineira", "gardener", "🌷", "o jardim"],
  ["secretario", "secretário", "secretária", "secretary", "🗂️"],
  ["escritor", "escritor", "escritora", "writer", "✍️"],
  ["gestor", "gestor", "gestora", "manager", "📊", "a empresa"],
  ["jornalista", "jornalista", "jornalista", "journalist", "📰"],
  ["estudante", "estudante", "estudante", "student", "🎓", "a universidade"],
  ["dentista", "dentista", "dentista", "dentist", "🦷"],
  ["motorista", "motorista", "motorista", "driver", "🚌", "o autocarro"],
  ["taxista", "taxista", "taxista", "taxi driver", "🚕", "o táxi"],
  ["pianista", "pianista", "pianista", "pianist", "🎹"],
  ["florista", "florista", "florista", "florist", "💐"],
  ["piloto", "piloto", "piloto", "pilot", "✈️", "o avião"],
  ["economista", "economista", "economista", "economist", "📈"],
];

const professions: KnowledgeItem[] = PROFS.map(([slug, m, f, en, emoji, workplace]) => ({
  id: `vocab.profession.${slug}`,
  kind: "profession",
  m,
  f,
  en,
  emoji,
  workplace,
  source: src("professions", [22, 23, 24]),
  why: m === f ? `${m}: igual no masculino e no feminino.` : m.endsWith("or") ? `-or → -ora: ${m} → ${f}` : `-o → -a: ${m} → ${f}`,
}));

/* ---------------------------------- Verbs (Apêndice p. 31) ---------------------------------- */

const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];

function verb(slug: string, verbName: string, forms: [string, string, string, string, string], concept: string, pages: number[], en?: string, whyFor?: Partial<Record<Person, string>>): KnowledgeItem[] {
  return PERSONS.map((person, i) => ({
    id: `grammar.${slug}.${person}`,
    kind: "conjugation" as const,
    verb: verbName,
    tense: "presente" as const,
    person,
    form: forms[i]!,
    en,
    source: src(concept, pages),
    why: whyFor?.[person] ?? `${verbName}: ${PERSONS.map((p, j) => `${p === "ele" ? "ele" : p === "nos" ? "nós" : p} ${forms[j]}`).join(", ")}`,
  }));
}

const verbs: KnowledgeItem[] = [
  ...verb("ser", "ser", ["sou", "és", "é", "somos", "são"], "verb-ser", [17, 31], "to be (identity)", {
    eles: "eles/elas/vocês são — com til!",
  }),
  ...verb("ter", "ter", ["tenho", "tens", "tem", "temos", "têm"], "verb-ter", [19, 31], "to have", {
    ele: "ele/ela tem — sem acento.",
    eles: "eles/elas têm — com acento circunflexo (plural).",
  }),
  ...verb("falar", "falar", ["falo", "falas", "fala", "falamos", "falam"], "verbs-ar", [20, 32], "to speak"),
  ...verb("morar", "morar", ["moro", "moras", "mora", "moramos", "moram"], "verbs-ar", [14, 32], "to live (reside)"),
  ...verb("trabalhar", "trabalhar", ["trabalho", "trabalhas", "trabalha", "trabalhamos", "trabalham"], "verbs-ar", [32], "to work"),
  ...verb("estudar", "estudar", ["estudo", "estudas", "estuda", "estudamos", "estudam"], "verbs-ar", [32], "to study"),
  ...verb("gostar", "gostar (de)", ["gosto", "gostas", "gosta", "gostamos", "gostam"], "verbs-ar", [19, 32], "to like"),
  ...verb("chamarse", "chamar-se", ["chamo-me", "chamas-te", "chama-se", "chamamo-nos", "chamam-se"], "verb-chamar-se", [14, 17], "to be called", {
    eu: "Eu chamo-me… (o pronome vem depois do verbo).",
    nos: "chamamo-nos — o -s cai antes de -nos.",
  }).map((it) => (it.kind === "conjugation" && (it.person === "nos" || it.person === "eles") ? { ...it, source: cad("verb-chamar-se", [8]) } : it)),
];

/* ------------------------------- Contractions (Apêndice pp. 31–32) ------------------------------- */

const contractions: KnowledgeItem[] = (
  [
    ["de", "o", "do"],
    ["de", "a", "da"],
    ["de", "os", "dos"],
    ["de", "as", "das"],
    ["em", "o", "no"],
    ["em", "a", "na"],
    ["em", "os", "nos"],
    ["em", "as", "nas"],
  ] as const
).map(([prep, article, form]) => ({
  id: `grammar.contraction.${prep}_${article}`,
  kind: "contraction" as const,
  prep,
  article,
  form,
  source: src(prep === "de" ? "preposition-de" : "preposition-em", prep === "de" ? [22, 31] : [32]),
  why: `${prep} + ${article} = ${form}`,
}));

/* ----------------------------------- Origin: de ± article (p. 22) ----------------------------------- */

type Orig = [slug: string, place: string, type: "city" | "country", article: "o" | "a" | "os" | "as" | null, emoji?: string];
const ORIGINS: Orig[] = [
  ["lisboa", "Lisboa", "city", null, "🏙️"],
  ["porto", "Porto", "city", "o", "🍷"],
  ["braga", "Braga", "city", null],
  ["coimbra", "Coimbra", "city", null],
  ["faro", "Faro", "city", null, "🏖️"],
  ["madrid", "Madrid", "city", null],
  ["paris", "Paris", "city", null, "🗼"],
  ["rio", "Rio de Janeiro", "city", "o", "🏝️"],
  ["brasil", "Brasil", "country", "o", "🇧🇷"],
  ["japao", "Japão", "country", "o", "🇯🇵"],
  ["alemanha", "Alemanha", "country", "a", "🇩🇪"],
  ["china", "China", "country", "a", "🇨🇳"],
  ["suecia", "Suécia", "country", "a", "🇸🇪"],
  ["eua", "Estados Unidos", "country", "os", "🇺🇸"],
  ["portugal", "Portugal", "country", null, "🇵🇹"],
  ["angola", "Angola", "country", null, "🇦🇴"],
  ["mocambique", "Moçambique", "country", null, "🇲🇿"],
  ["maldivas", "Maldivas", "country", "as", "🏝️"],
];
const formOf = (a: Orig[3], place: string) => (a === null ? `de ${place}` : `${{ o: "do", a: "da", os: "dos", as: "das" }[a]} ${place}`);

const origins: KnowledgeItem[] = ORIGINS.map(([slug, place, placeType, article, emoji]) => ({
  id: `grammar.origin.${slug}`,
  kind: "origin",
  place,
  placeType,
  article,
  form: formOf(article, place),
  emoji,
  source: src("preposition-de-places", [22, 31]),
  why:
    placeType === "city"
      ? article
        ? `${place} é exceção: tem artigo (o ${place}) → ${formOf(article, place)}.`
        : "Cidades: sem artigo → de + cidade."
      : article
        ? `${article} ${place} → de + ${article} = ${formOf(article, place).split(" ")[0]}`
        : `${place} não leva artigo → de ${place}.`,
}));

/* ------------------------------ Near-identical sentences (p. 27, ex. 16 pattern) ------------------------------ */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string];
const ERRORS: Err[] = [
  ["chamo_me", ["Eu", "chama-me", "Rui."], 1, "chamo-me", "eu → chamo-me"],
  ["tenho_anos", ["Eu", "sou", "trinta", "anos."], 1, "tenho", "A idade usa TER: tenho 30 anos."],
  ["como_estas", ["Olá!", "Como", "és?"], 2, "estás", "Como estás? pergunta como a pessoa está."],
  ["tu_falas", ["Tu", "fala", "inglês?"], 1, "falas", "tu → falas"],
  ["eles_moram", ["Eles", "mora", "em", "Coimbra."], 1, "moram", "eles → moram"],
  ["nos_somos", ["Nós", "são", "estudantes."], 1, "somos", "nós → somos"],
  ["eles_tem", ["Eles", "tem", "dois", "filhos."], 1, "têm", "eles têm — plural com acento."],
  ["ela_tem", ["A", "Ana", "têm", "um", "gato."], 2, "tem", "ela tem — singular sem acento."],
  ["do_brasil", ["O", "Pedro", "é", "de", "Brasil."], 3, "do", "o Brasil → do Brasil"],
  ["de_lisboa", ["Sou", "da", "Lisboa."], 1, "de", "Cidades sem artigo: de Lisboa."],
  ["no_porto", ["Moro", "em", "Porto."], 1, "no", "o Porto → no Porto"],
  ["na_alemanha", ["Ela", "trabalha", "no", "Alemanha."], 2, "na", "a Alemanha → na Alemanha"],
  ["ela_e", ["A", "Christine", "és", "jornalista."], 2, "é", "ela → é"],
  ["alema", ["A", "Christine", "é", "alemão."], 3, "alemã", "feminino: alemã"],
  ["japonesa", ["A", "Yuki", "é", "japonês."], 3, "japonesa", "feminino: japonesa"],
  ["nao_me_chamo", ["Eu", "não", "chamo-me", "Paulo."], 2, "me chamo", "Depois de não, o pronome vem antes: não me chamo."],
];

const errors: KnowledgeItem[] = ERRORS.map(([slug, tokens, wrongIndex, fix, why]) => ({
  id: `grammar.error.${slug}`,
  kind: "error",
  tokens,
  wrongIndex,
  fix,
  why,
  source: src("sentence-correction", [27]),
}));

/* ----------------------------------- Gap frames ----------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], targets: string[], en?: string];
const FRAMES: Fr[] = [
  ["nos_somos", "Nós ___ portugueses.", "somos", ["são", "é", "sou"], ["grammar.ser.nos"], "We are Portuguese."],
  ["eu_sou", "Eu ___ engenheiro.", "sou", ["é", "és", "somos"], ["grammar.ser.eu"]],
  ["tu_es", "Tu ___ de Lisboa?", "és", ["é", "estás", "são"], ["grammar.ser.tu"]],
  ["eles_sao", "Eles ___ espanhóis.", "são", ["é", "somos", "sou"], ["grammar.ser.eles"]],
  ["eu_tenho", "Eu ___ 25 anos.", "tenho", ["sou", "tem", "tens"], ["grammar.ter.eu"]],
  ["ela_tem", "Ela ___ dois filhos.", "tem", ["têm", "tens", "é"], ["grammar.ter.ele"]],
  ["eles_tem", "Eles ___ muitos amigos.", "têm", ["tem", "temos", "são"], ["grammar.ter.eles"]],
  ["nos_temos", "Nós ___ um gato.", "temos", ["têm", "tem", "somos"], ["grammar.ter.nos"]],
  ["tu_tens", "Quantos anos ___ ?", "tens", ["tem", "és", "têm"], ["grammar.ter.tu"]],
  ["nos_moramos", "Nós ___ no Porto.", "moramos", ["moram", "mora", "moro"], ["grammar.morar.nos"]],
  ["eu_falo", "Eu ___ inglês e português.", "falo", ["fala", "falas", "falam"], ["grammar.falar.eu"]],
  ["eles_estudam", "Eles ___ na universidade.", "estudam", ["estuda", "estudamos", "estudas"], ["grammar.estudar.eles"]],
  ["ela_trabalha", "Ela ___ num hospital.", "trabalha", ["trabalho", "trabalham", "trabalhas"], ["grammar.trabalhar.ele"]],
  ["tu_gostas", "Tu ___ de viajar?", "gostas", ["gosta", "gosto", "gostam"], ["grammar.gostar.tu"]],
  ["eu_chamo", "Eu ___ Sofia.", "chamo-me", ["chama-se", "chamas-te", "chamam-se"], ["grammar.chamarse.eu"]],
  ["ele_chama", "Ele ___ Tomás.", "chama-se", ["chamo-me", "chamas-te", "chamam-se"], ["grammar.chamarse.ele"]],
  ["de_porto", "O Rui é ___ Porto.", "do", ["de", "da", "no"], ["grammar.origin.porto"]],
  ["de_lisboa", "A Ana é ___ Lisboa.", "de", ["da", "do", "na"], ["grammar.origin.lisboa"]],
  ["de_alemanha", "A Christine é ___ Alemanha.", "da", ["de", "do", "na"], ["grammar.origin.alemanha"]],
  ["de_eua", "A Emily é ___ Estados Unidos.", "dos", ["das", "de", "do"], ["grammar.origin.eua"]],
  ["em_porto", "A Natalie mora ___ Porto.", "no", ["em", "na", "do"], ["grammar.contraction.em_o"]],
  ["em_lisboa", "Eu moro ___ Lisboa.", "em", ["no", "na", "de"], []],
  ["em_suecia", "Ele estuda ___ Suécia.", "na", ["no", "em", "da"], ["grammar.contraction.em_a"]],
  ["em_eua", "Elas trabalham ___ Estados Unidos.", "nos", ["nas", "no", "em"], ["grammar.contraction.em_os"]],
];

const frames: KnowledgeItem[] = FRAMES.map(([slug, text, answer, distractors, targets, en]) => ({
  id: `grammar.frame.${slug}`,
  kind: "frame",
  text,
  answer,
  distractors,
  targets,
  en,
  source: src("gap-fill", [21, 22, 31, 32]),
}));

/* ----------------------------------- Pronunciation (p. 29) ----------------------------------- */

type Mp = [slug: string, target: string, contrast: string, feature: string, hint: string];
const PAIRS: Mp[] = [
  ["esta_esta", "está", "esta", "stress/accent", "está: o acento puxa a força para o fim."],
  ["tres_treze", "três", "treze", "vowel/syllables", "três: uma sílaba. treze: duas."],
  ["dois_doze", "doze", "dois", "diphthong", "doze: 'dô-ze'. dois: 'doish'."],
  ["sou_sao", "são", "sou", "nasal", "são: nasal, com til."],
  ["tem_tem", "têm", "tem", "nasal plural", "têm: plural, som mais longo."],
  ["mora_moro", "moro", "mora", "final vowel", "moro: termina em 'u'."],
  ["fala_falar", "falar", "fala", "final r", "falar: termina com r."],
  ["estuda_estudar", "estudar", "estuda", "final r", "estudar: termina com r."],
  ["suecia_suica", "Suíça", "Suécia", "vowel", "Suíça: 'su-í-ça'."],
];
const pairs: KnowledgeItem[] = PAIRS.map(([slug, target, contrast, feature, hint]) => ({
  id: `pron.u01.${slug}`,
  kind: "minimalPair",
  target,
  contrast,
  feature,
  hint,
  source: src("pronunciation-vowels", [29]),
}));

/* --------------------------------------- Numbers 0–20 (p. 18) --------------------------------------- */

const NUMS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezasseis", "dezassete", "dezoito", "dezanove", "vinte"];
const numbers: KnowledgeItem[] = NUMS.map((pt, value) => ({
  id: `vocab.number.n${value}`,
  kind: "number",
  value,
  pt,
  fem: value === 1 ? "uma" : value === 2 ? "duas" : undefined,
  source: src("numbers-0-50", [18]),
  why: value >= 16 && value <= 19 ? "PT-PT: dezasseis, dezassete, dezanove — com 'a'." : undefined,
}));

export const U01_ITEMS: KnowledgeItem[] = [
  ...nationalities,
  ...professions,
  ...verbs,
  ...contractions,
  ...origins,
  ...errors,
  ...frames,
  ...pairs,
  ...numbers,
];
