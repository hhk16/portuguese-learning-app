/**
 * Unit 6 — "Estás melhor?" (Livro do Aluno pp. 139–159; Caderno Unidade 6, pp. 67–76).
 * The body, symptoms and how you feel (sentir-se, estar com / ter, doer), advice with the
 * imperative (tu) and with dever / ter de, the doctor (formal imperative), the pharmacy,
 * pedir / perder / dormir, para. Also the items for Ponto da Situação 3, O Mundo do Trabalho 3
 * (job ads) and O Mundo do Português 3 (Angola e Timor-Leste).
 * Original wording; paradigms and word lists are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u06", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u06", pages, concept });
const pds = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "pds3", pages, concept });
const trab = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "trab3", pages, concept });
const mundo = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "mundo3", pages, concept });

const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];
const LABEL: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ele", nos: "nós", eles: "eles" };

/* ----------------------------------- Nouns (pp. 140–154) ----------------------------------- */

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: "corpo" | "saude" | "lugar" | "objeto", source: Source];
const NOUNS: N[] = [
  // o corpo (p. 141) — a cabeça, os olhos, o nariz, a boca, a orelha, a mão, o pé are in a1-core
  ["braco", "o", "braço", "arm", "💪", "corpo", src("body", [141])],
  ["perna", "a", "perna", "leg", "🦵", "corpo", src("body", [141])],
  ["barriga", "a", "barriga", "belly / tummy", "🫃", "corpo", src("body", [141, 142])],
  ["dente", "o", "dente", "tooth", "🦷", "corpo", src("body", [142])],
  ["garganta", "a", "garganta", "throat", "🗣️", "corpo", src("body", [142])],
  ["coracao", "o", "coração", "heart", "❤️", "corpo", src("medical-specialties", [142, 143])],
  ["dedo", "o", "dedo", "finger", "👉", "corpo", cad("body", [68, 69])],
  // a saúde (pp. 140–154)
  ["febre", "a", "febre", "fever", "🤒", "saude", src("health-states", [140, 142])],
  ["gripe", "a", "gripe", "flu", "🦠", "saude", src("pharmacy", [154])],
  ["constipacao", "a", "constipação", "cold (illness)", "🤧", "saude", src("pharmacy", [154])],
  ["tosse", "a", "tosse", "cough", "😷", "saude", cad("health-states", [67, 69])],
  ["sono", "o", "sono", "sleepiness", "😴", "saude", cad("health-states", [67, 69])],
  ["comprimido", "o", "comprimido", "tablet / pill", "💊", "saude", src("pharmacy", [153, 154])],
  ["injecao", "a", "injeção", "injection", "💉", "saude", cad("health-states", [68, 69])],
  ["receita", "a", "receita", "prescription", "📝", "saude", src("pharmacy", [153, 154])],
  ["farmacia", "a", "farmácia", "pharmacy", "⚕️", "lugar", src("pharmacy", [153, 154])],
  // O Mundo do Trabalho 3 (pp. 166–167)
  ["anuncio", "o", "anúncio", "job ad / advert", "📰", "objeto", trab("job-ads", [166])],
  ["curriculo", "o", "currículo", "CV / résumé", "🗂️", "objeto", trab("cover-letter", [167])],
  ["empresa", "a", "empresa", "company", "🏢", "lugar", trab("job-ads", [166])],
];

const nouns: KnowledgeItem[] = NOUNS.map(([slug, article, pt, en, emoji, category, source]) => ({
  id: `vocab.noun.${slug}`,
  kind: "noun",
  pt,
  article,
  en,
  emoji,
  category,
  source,
  why: `${article} ${pt} — ${article === "o" ? "masculino" : "feminino"}`,
}));

/* ------------------------------------- Adjectives ------------------------------------- */

/* doente ↔ saudável: an opposite pair (a dial once things.ts has clues for it). */

const adjectives: KnowledgeItem[] = [
  { id: "vocab.adjective.doente", kind: "adjective", m: "doente", f: "doente", en: "ill / sick", emoji: "🤒", opposite: "vocab.adjective.saudavel", source: src("health-states", [140, 142]), why: "Estar doente (agora). doente: igual no m./f." },
  { id: "vocab.adjective.saudavel", kind: "adjective", m: "saudável", f: "saudável", en: "healthy", emoji: "💪", opposite: "vocab.adjective.doente", source: src("healthy-habits", [148, 150]), why: "saudável → saudáveis (plural)." },
];

/* ------------------------------------- Professions: especialidades médicas (pp. 142–143) ------------------------------------- */

const professions: KnowledgeItem[] = (
  [
    ["cardiologista", "cardiologist", "❤️"],
    ["oftalmologista", "ophthalmologist (eye doctor)", "👀"],
    ["pediatra", "paediatrician", "👶"],
  ] as const
).map(([slug, en, emoji]) => ({
  id: `vocab.profession.${slug}`,
  kind: "profession" as const,
  m: slug,
  f: slug,
  en,
  emoji,
  workplace: "o hospital",
  source: src("medical-specialties", [142, 143]),
  why: `o/a ${slug}: igual no masculino e no feminino — só muda o artigo.`,
}));

/* ----------------------------------------- Phrases ----------------------------------------- */

type Fn = "question" | "answer" | "statement" | "order" | "plan" | "health" | "courtesy";
type Ph = [slug: string, pt: string, en: string, fn: Fn, situation: string, source: Source];
const PHRASES: Ph[] = [
  // estados de saúde (pp. 140–142)
  ["nao_me_sinto_bem", "Não me sinto bem.", "I don't feel well.", "health", "🤒", src("health-states", [140, 142])],
  ["estou_com_febre", "Estou com febre.", "I have a temperature.", "health", "🤒", src("health-states", [140, 142])],
  ["tenho_dores_cabeca", "Tenho dores de cabeça.", "I have a headache.", "health", "🤯", src("health-states", [140, 142])],
  ["estou_constipado", "Estou constipado.", "I've got a cold.", "health", "🤧", src("health-states", [140, 142])],
  ["ando_cansada", "Ando muito cansada.", "I've been very tired lately.", "health", "😴", src("health-states", [140, 142])],
  ["estas_melhor", "Estás melhor?", "Are you feeling better?", "question", "😊", src("health-states", [139, 140])],
  ["as_melhoras", "As melhoras!", "Get well soon!", "courtesy", "💐", cad("health-states", [67])],
  // doer (pp. 142, 158)
  ["doi_me_cabeca", "Dói-me a cabeça.", "My head hurts.", "health", "🧠", src("verb-doer", [142, 158])],
  ["doem_me_pes", "Doem-me os pés.", "My feet hurt.", "health", "🦶", src("verb-doer", [142, 158])],
  ["doi_me_garganta", "Dói-me a garganta.", "I have a sore throat.", "health", "🗣️", src("verb-doer", [142, 158])],
  ["doi_me_barriga", "Dói-me a barriga.", "I have a stomach ache.", "health", "🤢", src("verb-doer", [142, 158])],
  ["doem_me_costas", "Doem-me as costas.", "My back hurts.", "health", "🏋️", src("verb-doer", [141, 158])],
  ["doi_lhe_dente", "Dói-lhe um dente.", "He has toothache.", "health", "🦷", src("verb-doer", [142, 158])],
  ["o_que_te_doi", "O que é que te dói?", "What hurts?", "question", "👉", src("verb-doer", [142, 158])],
  ["onde_lhe_doi", "Onde é que lhe dói?", "Where does it hurt? (formal)", "question", "🧑‍⚕️", cad("verb-doer", [67])],
  // conselhos: imperativo (tu), dever, ter de (pp. 143–150)
  ["deves_descansar", "Deves descansar mais.", "You should rest more.", "health", "😌", src("dever-ter-de", [148, 150, 159])],
  ["tens_de_ir", "Tens de ir ao médico.", "You have to go to the doctor.", "health", "🏥", src("dever-ter-de", [148, 159])],
  ["nao_trabalhes", "Não trabalhes ao fim de semana!", "Don't work at the weekend!", "health", "💻", src("imperative-informal", [143, 145])],
  ["nao_bebas_cafe", "Não bebas café à noite!", "Don't drink coffee at night!", "health", "☕", src("imperative-informal", [143, 145])],
  // no médico: imperativo formal (pp. 150–152)
  ["tome_comprimido", "Tome um comprimido de oito em oito horas.", "Take one tablet every eight hours.", "health", "💊", src("imperative-formal", [150, 152])],
  ["beba_agua", "Beba muita água.", "Drink plenty of water.", "health", "💧", src("imperative-formal", [150, 152])],
  ["descanse", "Descanse uns dias em casa.", "Rest at home for a few days.", "health", "🛏️", src("imperative-formal", [150, 152])],
  ["nao_fume", "Não fume!", "Don't smoke!", "health", "❌", src("imperative-formal", [151, 152])],
  ["faca_desporto", "Faça desporto três vezes por semana.", "Do sport three times a week.", "health", "⚽", src("imperative-formal", [150, 152])],
  ["volte", "Volte daqui a uma semana.", "Come back in a week.", "health", "📅", src("imperative-formal", [150, 152])],
  // marcar uma consulta (pp. 145–147, 153)
  ["marcar_consulta", "Queria marcar uma consulta, por favor.", "I'd like to make an appointment, please.", "order", "📅", src("appointment", [145, 147, 153])],
  ["primeira_vez", "É a primeira vez que vem cá?", "Is this your first visit?", "question", "🏥", src("appointment", [145, 147])],
  ["pode_ser_quinta", "Pode ser na quinta-feira às dez?", "Could it be on Thursday at ten?", "question", "⏰", src("appointment", [145, 153])],
  // na farmácia (pp. 153–154)
  ["queria_comprimidos", "Queria uns comprimidos para a garganta.", "I'd like some tablets for my throat.", "order", "💊", src("pharmacy", [153, 154])],
  ["precisa_receita", "Precisa de receita médica?", "Do you need a prescription?", "question", "📝", src("pharmacy", [153, 154])],
  ["vais_apanhar", "Leva o casaco, senão apanhas uma constipação!", "Take your coat, or you'll catch a cold!", "health", "🥶", src("tomar-apanhar", [154])],
];

const phrases: KnowledgeItem[] = PHRASES.map(([slug, pt, en, fn, situation, source]) => ({
  id: `function.u06.${slug}`,
  kind: "phrase",
  pt,
  en,
  fn,
  situation,
  source,
  why: slug.startsWith("doi")
    ? "doer: dói + uma coisa (a cabeça)."
    : slug.startsWith("doem")
      ? "doer: doem + várias coisas (os pés, as costas)."
      : undefined,
}));

/* --------------------------------------- Verbs --------------------------------------- */

type Forms = [string, string, string, string, string];

function presente(slug: string, verbName: string, forms: Forms, en: Forms, concept: string, pages: number[], whyFor: Partial<Record<Person, string>> = {}): KnowledgeItem[] {
  const table = PERSONS.map((p, j) => `${LABEL[p]} ${forms[j]}`).join(", ");
  return PERSONS.map((person, i) => ({
    id: `grammar.${slug}.${person}`,
    kind: "conjugation" as const,
    verb: verbName,
    tense: "presente" as const,
    person,
    form: forms[i]!,
    en: en[i],
    source: src(concept, pages),
    why: whyFor[person] ?? `${verbName}: ${table}`,
  }));
}

/** Imperativo informal afirmativo (tu) = ele/ela no Presente: bebe!, descansa! (p. 159). */
type Imp = [slug: string, infinitive: string, form: string, en: string, why?: string];
const IMPERATIVES: Imp[] = [
  ["beber", "beber", "bebe", "drink! (to a friend)"],
  ["descansar", "descansar", "descansa", "rest! (to a friend)"],
  ["dormir", "dormir", "dorme", "sleep! (to a friend)"],
  ["comer", "comer", "come", "eat! (to a friend)"],
  ["tomar", "tomar", "toma", "take! (to a friend)"],
  ["ficar", "ficar", "fica", "stay! (to a friend)"],
  ["ir", "ir", "vai", "go! (to a friend)", "ir: ele vai → Vai ao médico! (imperativo tu)"],
  ["fazer", "fazer", "faz", "do! (to a friend)", "fazer: ele faz → Faz exercício! (imperativo tu)"],
];
const imperatives: KnowledgeItem[] = IMPERATIVES.map(([slug, infinitive, form, en, why]) => ({
  id: `grammar.${slug}.imperativo.tu`,
  kind: "conjugation" as const,
  verb: infinitive,
  tense: "imperativo" as const,
  person: "tu" as const,
  form,
  en,
  source: src("imperative-informal", [143, 145, 159]),
  why: why ?? `Imperativo (tu) = presente de ele: ele ${form} → ${form[0]!.toUpperCase()}${form.slice(1)}!`,
}));

const verbs: KnowledgeItem[] = [
  ...presente("sentirse", "sentir-se", ["sinto-me", "sentes-te", "sente-se", "sentimo-nos", "sentem-se"], ["I feel", "you feel", "he / she feels", "we feel", "they feel"], "verb-sentir-se", [140, 142], {
    eu: "sentir → eu sinto (i). Sinto-me bem. Não me sinto bem.",
    nos: "sentimo-nos — o -s cai antes de -nos.",
  }),
  ...presente("pedir", "pedir", ["peço", "pedes", "pede", "pedimos", "pedem"], ["I ask for", "you ask for", "he / she asks for", "we ask for", "they ask for"], "verbs-pedir-perder-dormir", [146, 147, 158], {
    eu: "pedir → eu peço (só o eu é irregular).",
  }),
  ...presente("perder", "perder", ["perco", "perdes", "perde", "perdemos", "perdem"], ["I lose", "you lose", "he / she loses", "we lose", "they lose"], "verbs-pedir-perder-dormir", [146, 147, 158], {
    eu: "perder → eu perco (só o eu é irregular).",
  }),
  ...presente("dormir", "dormir", ["durmo", "dormes", "dorme", "dormimos", "dormem"], ["I sleep", "you sleep", "he / she sleeps", "we sleep", "they sleep"], "verbs-pedir-perder-dormir", [146, 147, 158], {
    eu: "dormir → eu durmo (com u; só o eu é irregular).",
  }),
  ...imperatives,
];

/* ----------------------------------------- Gap frames ----------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], targets: string[], en: string, why: string | undefined, source: Source];
const FRAMES: Fr[] = [
  // sentir-se, estar com
  ["nao_me_sinto", "Hoje não ___ bem.", "me sinto", ["sinto-me", "se sente", "te sentes"], ["grammar.sentirse.eu"], "I don't feel well today.", "Com não, o pronome vai para antes: não me sinto.", src("verb-sentir-se", [140, 142])],
  ["te_sentes", "Como é que te ___ hoje?", "sentes", ["sente", "sinto", "sentem"], ["grammar.sentirse.tu"], "How are you feeling today?", "tu → (te) sentes", src("verb-sentir-se", [140, 142])],
  ["ela_sente", "A Rita ___ muito cansada.", "sente-se", ["sinto-me", "sentes-te", "sentem-se"], ["grammar.sentirse.ele"], "Rita feels very tired.", "ela → sente-se", src("verb-sentir-se", [140, 142])],
  ["com_febre", "O Hadi está ___ febre.", "com", ["de", "a", "em"], ["function.u06.estou_com_febre"], "Hadi has a temperature.", "estar com febre = ter febre", src("health-states", [140, 142])],
  // o corpo e as especialidades
  ["cardiologista", "O cardiologista trata do ___.", "coração", ["dente", "pé"], ["vocab.noun.coracao", "vocab.profession.cardiologista"], "The cardiologist treats the heart.", undefined, src("medical-specialties", [142, 143])],
  ["lavo_maos", "Lavo as ___ antes de comer.", "mãos", ["mão", "pés"], ["vocab.noun.mao"], "I wash my hands before eating.", "a mão → as mãos (plural com til)", cad("body", [68, 69])],
  // doer
  ["doi_cabeca", "Hoje ___ a cabeça.", "dói-me", ["doem-me", "dóis-me", "doo"], ["function.u06.doi_me_cabeca"], "My head hurts today.", "Uma coisa (a cabeça) → dói-me.", src("verb-doer", [142, 158])],
  ["doem_pernas", "___ as pernas depois do jogo.", "Doem-me", ["Dói-me", "Doem", "Dói"], ["function.u06.doem_me_pes"], "My legs hurt after the match.", "Várias coisas (as pernas) → doem-me.", src("verb-doer", [142, 158])],
  ["te_doi", "O que é que ___ dói?", "te", ["tu", "ti", "se"], ["function.u06.o_que_te_doi"], "What hurts?", "doer usa me, te, lhe, nos, vos, lhes.", src("verb-doer", [142, 158])],
  // conselhos: imperativo tu, dever
  ["bebe", "Estás com febre: ___ muita água!", "bebe", ["bebes", "beba"], ["grammar.beber.imperativo.tu"], "You have a temperature: drink lots of water!", "Imperativo (tu) = ele bebe → Bebe!", src("imperative-informal", [143, 145])],
  ["nao_bebas", "Não ___ café antes de dormir!", "bebas", ["bebes", "bebe"], ["function.u06.nao_bebas_cafe"], "Don't drink coffee before bed!", "Negativa (tu): eu bebo → não bebas.", src("imperative-informal", [144, 159])],
  ["nao_trabalhes", "Não ___ ao domingo!", "trabalhes", ["trabalhas", "trabalha"], ["function.u06.nao_trabalhes"], "Don't work on Sundays!", "-ar: eu trabalho → não trabalhes.", src("imperative-informal", [144, 159])],
  ["deves", "Tu ___ comer mais fruta.", "deves", ["deve", "tens", "precisas"], ["function.u06.deves_descansar"], "You should eat more fruit.", "dever + infinitivo = conselho (sem de).", src("dever-ter-de", [148, 159])],
  // pedir, perder, dormir
  ["peco", "No restaurante, eu ___ sempre peixe.", "peço", ["pido", "pedo", "pede"], ["grammar.pedir.eu"], "At the restaurant I always order fish.", "pedir → eu peço", src("verbs-pedir-perder-dormir", [146, 147])],
  ["perco", "Eu ___ sempre as chaves!", "perco", ["perdo", "perde", "perdes"], ["grammar.perder.eu"], "I always lose my keys!", "perder → eu perco", src("verbs-pedir-perder-dormir", [146, 147])],
  ["durmo", "Eu ___ oito horas por noite.", "durmo", ["dormo", "dorme", "dormes"], ["grammar.dormir.eu"], "I sleep eight hours a night.", "dormir → eu durmo", src("verbs-pedir-perder-dormir", [146, 147])],
  ["perdes", "Tu ___ o autocarro todos os dias?", "perdes", ["perde", "perco", "perdem"], ["grammar.perder.tu"], "Do you miss the bus every day?", "perder o autocarro = to miss the bus", cad("verbs-pedir-perder-dormir", [70])],
  // no médico: imperativo formal
  ["tome", "Senhor Silva, ___ este xarope três vezes por dia.", "tome", ["toma", "tomes", "tomam"], ["function.u06.tome_comprimido"], "Mr Silva, take this syrup three times a day.", "Formal (você): eu tomo → tome.", src("imperative-formal", [150, 152])],
  ["bebam", "Meninos, ___ muita água!", "bebam", ["bebem", "bebe", "beba"], ["function.u06.beba_agua"], "Kids, drink lots of water!", "vocês: eu bebo → bebam.", src("imperative-formal", [150, 152])],
  ["nao_fume", "Não ___ aqui, por favor.", "fume", ["fuma", "fumas", "fumes"], ["function.u06.nao_fume"], "Please don't smoke here.", "Formal: eu fumo → não fume.", src("imperative-formal", [151, 152])],
  ["faca", "Senhora Ana, ___ exercício todos os dias.", "faça", ["faz", "fazes", "faço"], ["function.u06.faca_desporto"], "Mrs Ana, do some exercise every day.", "Formal: eu faço → faça.", cad("imperative", [72, 73])],
  // na farmácia: tomar, apanhar, fazer; para
  ["tomar", "Tens de ___ um comprimido à noite.", "tomar", ["apanhar", "fazer"], ["vocab.noun.comprimido"], "You have to take a tablet at night.", "tomar um comprimido / um xarope", src("tomar-apanhar", [154])],
  ["apanhar", "No inverno é fácil ___ uma gripe.", "apanhar", ["tomar", "fazer"], ["vocab.noun.gripe"], "In winter it's easy to catch the flu.", "apanhar uma gripe / uma constipação", src("tomar-apanhar", [154])],
  ["fazer_analises", "Amanhã vou ___ análises ao sangue.", "fazer", ["tomar", "apanhar"], [], "Tomorrow I'm going to have blood tests.", "fazer análises / um exame", src("tomar-apanhar", [154])],
  ["para_garganta", "Estes comprimidos são ___ a garganta.", "para", ["por", "de"], ["function.u06.queria_comprimidos"], "These tablets are for the throat.", "para = objetivo (para a garganta).", src("para-por", [158])],
];

/* --------------------------------------- Sentence errors --------------------------------------- */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string, en: string, source: Source];
const ERRORS: Err[] = [
  ["tenho_com", ["Tenho", "com", "febre."], 0, "Estou", "estar com febre / ter febre", "I have a temperature.", src("health-states", [140, 142])],
  ["perna_o", ["Dói-me", "o", "perna."], 1, "a", "a perna — feminino.", "My leg hurts.", src("body", [141])],
  ["oftalmologista", ["O", "oftalmologista", "trata", "dos", "dentes."], 4, "olhos", "O oftalmologista trata dos olhos; o dentista trata dos dentes.", "The ophthalmologist treats eyes.", src("medical-specialties", [142, 143])],
  ["doi_os_pes", ["Dói-me", "os", "pés."], 0, "Doem-me", "os pés (plural) → doem.", "My feet hurt.", src("verb-doer", [142, 158])],
  ["doem_garganta", ["Doem-me", "a", "garganta."], 0, "Dói-me", "a garganta (singular) → dói.", "My throat hurts.", src("verb-doer", [142, 158])],
  ["nao_bebes", ["Não", "bebes", "tanto", "café!"], 1, "bebas", "Imperativo negativo (tu): não bebas.", "Don't drink so much coffee!", src("imperative-informal", [144, 159])],
  ["fica_descanses", ["Fica", "na", "cama", "e", "descanses!"], 4, "descansa", "Afirmativo (tu) = ele descansa → Descansa!", "Stay in bed and rest!", src("imperative-informal", [143, 145])],
  ["dormo", ["Eu", "dormo", "muito", "mal."], 1, "durmo", "dormir → eu durmo", "I sleep very badly.", src("verbs-pedir-perder-dormir", [146, 147])],
  ["toma_formal", ["Senhor", "Costa,", "toma", "este", "comprimido."], 2, "tome", "Formal (você): tome.", "Mr Costa, take this tablet.", src("imperative-formal", [150, 152])],
];

/* ---------------------------------- Ponto da Situação 3 (pp. 160–165) ---------------------------------- */

const PDS_FRAMES: Fr[] = [
  ["pds3_agora", "Neste momento, a Ana ___ a experimentar um vestido.", "está", ["vai", "é"], ["grammar.experimentar.estar_a.ele"], "Right now Ana is trying on a dress.", "Agora → estar a + infinitivo.", pds("tense-by-time-expression", [161, 162])],
  ["pds3_proximo", "No próximo sábado, nós ___ jantar fora.", "vamos", ["estamos", "somos"], ["grammar.fazer.ir_futuro.nos"], "Next Saturday we're going to have dinner out.", "Futuro → ir + infinitivo.", pds("tense-by-time-expression", [161, 162])],
  ["pds3_normalmente", "Normalmente, eu ___ às sete.", "acordo", ["vou acordar", "estou a acordar"], [], "I usually wake up at seven.", "Hábito (normalmente) → Presente.", pds("tense-by-time-expression", [161, 162])],
];
const PDS_ERRORS: Err[] = [["pds3_sei_ana", ["Eu", "sei", "a", "Ana", "há", "muito", "tempo."], 1, "conheço", "Pessoas: conhecer. Eu conheço a Ana.", "I've known Ana for a long time.", pds("error-correction", [164, 165])]];

/* ---------------------------------- O Mundo do Trabalho 3 (pp. 166–167) ---------------------------------- */

const TRAB_PHRASES: Ph[] = [
  ["precisa_se", "Precisa-se de cozinheiro.", "Cook wanted.", "statement", "🧑‍🍳", trab("job-ads", [166])],
  ["tempo_inteiro", "É um trabalho a tempo inteiro.", "It's a full-time job.", "statement", "⏰", trab("job-ads", [166])],
  ["disponibilidade", "Disponibilidade imediata.", "Available to start immediately.", "statement", "✅", trab("job-ads", [166])],
  ["por_turnos", "Trabalho por turnos no hospital.", "I work shifts at the hospital.", "statement", "🌙", trab("job-requirements", [166])],
  ["em_equipa", "Gosto de trabalhar em equipa.", "I like working in a team.", "statement", "🤝", trab("job-requirements", [166])],
  ["experiencia", "Tenho três anos de experiência.", "I have three years' experience.", "answer", "📈", trab("phone-interview", [167])],
  ["falo_linguas", "Falo português, inglês e árabe.", "I speak Portuguese, English and Arabic.", "answer", "💬", trab("phone-interview", [167])],
  ["envie_cv", "Envie o seu currículo para este e-mail.", "Send your CV to this email address.", "order", "💻", trab("job-ads", [166])],
  ["entrevista", "Tenho uma entrevista amanhã às dez.", "I have an interview tomorrow at ten.", "plan", "🤝", trab("phone-interview", [167])],
  ["melhores_cumprimentos", "Com os melhores cumprimentos,", "Kind regards,", "courtesy", "✍️", trab("cover-letter", [167])],
];
const TRAB_FRAMES: Fr[] = [
  ["trab3_precisa_de", "Precisa-se ___ empregado de mesa.", "de", ["a", "em", "para"], ["function.trab3.precisa_se"], "Waiter wanted.", "Precisa-se DE + profissão.", trab("job-ads", [166])],
  ["trab3_tempo_inteiro", "Trabalho a tempo ___ num hotel.", "inteiro", ["inteira", "todo"], ["function.trab3.tempo_inteiro"], "I work full-time in a hotel.", "a tempo inteiro / a tempo parcial", trab("job-ads", [166])],
  ["trab3_para", "Envie o currículo ___ este endereço.", "para", ["por", "de"], ["vocab.noun.curriculo"], "Send your CV to this address.", "para = destino.", trab("job-ads", [166])],
];
const TRAB_ERRORS: Err[] = [["trab3_na_equipa", ["Gosto", "de", "trabalhar", "na", "equipa."], 3, "em", "trabalhar em equipa (sem artigo).", "I like working in a team.", trab("job-requirements", [166])]];

/* ------------------------------ O Mundo do Português 3: Angola e Timor-Leste (pp. 168–170) ------------------------------ */

const MUNDO_PHRASES: Ph[] = [
  ["capital_angola", "A capital de Angola é Luanda.", "The capital of Angola is Luanda.", "statement", "🇦🇴", mundo("country-facts", [168])],
  ["moeda_angola", "A moeda de Angola é o kwanza.", "Angola's currency is the kwanza.", "statement", "💶", mundo("country-facts", [168])],
  ["angola_africa", "Angola fica em África.", "Angola is in Africa.", "statement", "🌍", mundo("country-facts", [168])],
  ["capital_timor", "A capital de Timor-Leste é Díli.", "The capital of East Timor is Dili.", "statement", "🇹🇱", mundo("country-facts", [168])],
  ["linguas_timor", "Em Timor-Leste fala-se português e tétum.", "In East Timor people speak Portuguese and Tetum.", "statement", "🗣️", mundo("country-facts", [168])],
  ["clima_tropical", "O clima é tropical, quente e húmido.", "The climate is tropical, hot and humid.", "statement", "🏝️", mundo("country-facts", [168])],
  ["quando_ir_angola", "A melhor altura para ir a Angola é de junho a agosto.", "The best time to go to Angola is June to August.", "statement", "📅", mundo("tourism", [170])],
  ["mata_bicho", "Em Angola, o pequeno-almoço é o mata-bicho.", "In Angola, breakfast is called “mata-bicho”.", "statement", "☕", mundo("angolan-portuguese", [170])],
  ["maka", "Em Angola, um problema é uma maka.", "In Angola, a problem is called a “maka”.", "statement", "🤔", mundo("angolan-portuguese", [170])],
];
const MUNDO_FRAMES: Fr[] = [
  ["mundo3_desde", "Timor-Leste é independente ___ 2002.", "desde", ["há", "em"], ["function.mundo3.capital_timor"], "East Timor has been independent since 2002.", "desde + momento (um ano, uma data).", mundo("country-facts", [168])],
  ["mundo3_em_africa", "Angola fica ___ África.", "em", ["na", "no", "de"], ["function.mundo3.angola_africa"], "Angola is in Africa.", "Em português europeu diz-se “em África”.", mundo("country-facts", [168])],
  ["mundo3_linguas", "Em Angola, fala-se português e outras ___ nacionais.", "línguas", ["língua", "linguagens"], ["vocab.nationality.angola"], "In Angola, people speak Portuguese and other national languages.", "a língua → as línguas", mundo("country-facts", [168])],
];

/* -------------------------------------------- Build -------------------------------------------- */

const frameItems = (rows: Fr[]): KnowledgeItem[] =>
  rows.map(([slug, text, answer, distractors, targets, en, why, source]) => ({ id: `grammar.frame.${slug}`, kind: "frame", text, answer, distractors, targets, en, why, source }));
const errorItems = (rows: Err[]): KnowledgeItem[] =>
  rows.map(([slug, tokens, wrongIndex, fix, why, en, source]) => ({ id: `grammar.error.${slug}`, kind: "error", tokens, wrongIndex, fix, why, en, source }));
const phraseItems = (unit: string, rows: Ph[]): KnowledgeItem[] =>
  rows.map(([slug, pt, en, fn, situation, source]) => ({ id: `function.${unit}.${slug}`, kind: "phrase", pt, en, fn, situation, source }));

export const U06_ITEMS: KnowledgeItem[] = [
  ...nouns,
  ...adjectives,
  ...professions,
  ...phrases,
  ...verbs,
  ...frameItems(FRAMES),
  ...errorItems(ERRORS),
  ...frameItems(PDS_FRAMES),
  ...errorItems(PDS_ERRORS),
  ...phraseItems("trab3", TRAB_PHRASES),
  ...frameItems(TRAB_FRAMES),
  ...errorItems(TRAB_ERRORS),
  ...phraseItems("mundo3", MUNDO_PHRASES),
  ...frameItems(MUNDO_FRAMES),
];
