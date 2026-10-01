/**
 * Unit 3 — "Vamos almoçar?" (Livro do Aluno pp. 63–84; Caderno Unidade 3 pp. 28–39).
 * Meals and food, ordering in a café / restaurant, telling the time, days of the week, daily
 * routine (reflexive verbs), -ir verbs, the irregulars ver / ler / ouvir / ir / sair, free time.
 * Original wording; paradigms and word lists are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u03", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u03", pages, concept });

/* ------------------------------- Nouns: meals, food, restaurant, free time ------------------------------- */

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: "comida" | "bebida" | "objeto" | "lugar" | "lazer" | "tempo", source: Source];
const NOUNS: N[] = [
  // As refeições (p. 64)
  ["pequeno_almoco", "o", "pequeno-almoço", "breakfast", "🥞", "tempo", src("meals", [64])],
  ["almoco", "o", "almoço", "lunch", "🍛", "tempo", src("meals", [64])],
  ["lanche", "o", "lanche", "afternoon snack", "🥨", "tempo", src("meals", [64])],
  ["jantar", "o", "jantar", "dinner", "🍽️", "tempo", src("meals", [64])],
  // Alimentos (p. 66)
  ["massa", "a", "massa", "pasta", "🍝", "comida", src("food", [66])],
  ["batata_frita", "a", "batata frita", "chip (French fry)", "🍟", "comida", src("food", [66])],
  ["mel", "o", "mel", "honey", "🍯", "comida", src("food", [66])],
  ["legume", "o", "legume", "vegetable", "🥦", "comida", src("food", [66])],
  // No restaurante (pp. 69–70)
  ["restaurante", "o", "restaurante", "restaurant", "🍴", "lugar", src("restaurant", [68, 69])],
  ["ementa", "a", "ementa", "menu", "📋", "objeto", src("restaurant-menu", [70])],
  ["conta", "a", "conta", "bill", "🧾", "objeto", cad("restaurant", [28])],
  ["sobremesa", "a", "sobremesa", "dessert", "🍰", "comida", src("restaurant-menu", [70])],
  ["refrigerante", "o", "refrigerante", "soft drink", "🥤", "bebida", src("restaurant-menu", [69])],
  ["colher", "a", "colher", "spoon", "🥄", "objeto", cad("restaurant", [28])],
  // Tempos livres (p. 78)
  ["ginasio", "o", "ginásio", "gym", "🏋️", "lugar", src("leisure", [73, 78])],
  ["parque", "o", "parque", "park", "🏞️", "lugar", src("leisure", [78])],
  ["concerto", "o", "concerto", "concert", "🎤", "lazer", src("leisure", [78])],
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

/* ------------------------------------ Adjectives (taste) ------------------------------------ */
// doce ↔ salgado is an opposite pair, but `opposite` is left unset until Na Mesma Onda has
// "thing" clues for it (src/games/wave/things.ts): every linked pair becomes a dial spectrum.

const adjectives: KnowledgeItem[] = [
  { id: "vocab.adjective.doce", kind: "adjective", m: "doce", f: "doce", en: "sweet", emoji: "🍭", opposite: "vocab.adjective.salgado", source: cad("food", [29]), why: "doce: igual no masculino e no feminino." },
  { id: "vocab.adjective.salgado", kind: "adjective", m: "salgado", f: "salgada", en: "salty", emoji: "🧂", opposite: "vocab.adjective.doce", source: cad("food", [29]), why: "salgado (m.) · salgada (f.)" },
];

/* ------------------------------------------- Phrases ------------------------------------------- */

type Fn = "greeting" | "farewell" | "courtesy" | "question" | "answer" | "statement" | "order" | "opinion" | "plan" | "time";
type Ph = [slug: string, pt: string, en: string, fn: Fn, situation: string, source: Source];
const PHRASES: Ph[] = [
  // Pedir no restaurante (pp. 64, 68–70)
  ["vamos_almocar", "Vamos almoçar?", "Shall we have lunch?", "plan", "🍽️", src("invite-lunch", [68])],
  ["queriamos_mesa", "Queríamos uma mesa para dois, por favor.", "We'd like a table for two, please.", "order", "🍴", cad("restaurant", [28])],
  ["trazer_ementa", "Pode trazer a ementa, por favor?", "Could you bring the menu, please?", "order", "📋", src("restaurant", [70])],
  ["queria_galao", "Queria um galão, por favor.", "I'd like a milky coffee, please.", "order", "☕", src("polite-order", [64, 69])],
  ["para_beber", "E para beber?", "And to drink?", "question", "🥤", src("restaurant", [69])],
  ["prato_do_dia", "Qual é o prato do dia?", "What's the dish of the day?", "question", "🍲", src("restaurant-menu", [69])],
  ["a_conta", "A conta, por favor.", "The bill, please.", "order", "🧾", cad("restaurant", [28])],
  ["bom_apetite", "Bom apetite!", "Enjoy your meal!", "courtesy", "😋", src("restaurant", [69])],
  // As horas (pp. 70–71)
  ["que_horas", "Que horas são?", "What time is it?", "question", "⏰", src("telling-time", [70])],
  ["e_uma_hora", "É uma hora.", "It's one o'clock.", "time", "⌚", src("telling-time", [70])],
  ["meio_dia", "É meio-dia.", "It's noon.", "time", "☀️", src("telling-time", [70, 71])],
  ["e_um_quarto", "São oito e um quarto.", "It's quarter past eight.", "time", "⏰", src("telling-time", [71])],
  ["e_meia", "São três e meia.", "It's half past three.", "time", "⌚", src("telling-time", [71])],
  ["menos_vinte", "São onze menos vinte.", "It's twenty to eleven.", "time", "⏱️", src("telling-time", [71])],
  // Os dias da semana (p. 73)
  ["segunda", "segunda-feira", "Monday", "time", "📅", src("days-of-week", [73, 84])],
  ["terca", "terça-feira", "Tuesday", "time", "📅", src("days-of-week", [73, 84])],
  ["quarta", "quarta-feira", "Wednesday", "time", "📅", src("days-of-week", [73, 84])],
  ["quinta", "quinta-feira", "Thursday", "time", "📅", src("days-of-week", [73, 84])],
  ["sexta", "sexta-feira", "Friday", "time", "📅", src("days-of-week", [73, 84])],
  ["sabado", "sábado", "Saturday", "time", "📅", src("days-of-week", [73, 84])],
  ["domingo", "domingo", "Sunday", "time", "📅", src("days-of-week", [73, 84])],
  ["fim_de_semana", "o fim de semana", "the weekend", "time", "🎉", src("days-of-week", [73])],
  // Convites (p. 79)
  ["queres_ir", "Queres ir ao cinema hoje?", "Do you want to go to the cinema today?", "question", "🎬", src("invitations", [79])],
  ["boa_ideia", "Boa ideia! Vamos!", "Good idea! Let's go!", "answer", "💡", src("invitations", [79])],
  ["nao_posso", "Desculpa, hoje não posso.", "Sorry, I can't today.", "answer", "😬", src("invitations", [79])],
];

const phrases: KnowledgeItem[] = PHRASES.map(([slug, pt, en, fn, situation, source]) => ({
  id: `function.u03.${slug}`,
  kind: "phrase",
  pt,
  en,
  fn,
  situation,
  source,
}));

/* --------------------------------------------- Verbs --------------------------------------------- */

const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];
const LABEL: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ele", nos: "nós", eles: "eles" };

/** Presente do Indicativo, ids grammar.<slug>.<person>, each with its own English. */
function verb(
  slug: string,
  verbName: string,
  forms: [string, string, string, string, string],
  en: [string, string, string, string, string],
  source: Source,
  whyFor?: Partial<Record<Person, string>>,
): KnowledgeItem[] {
  return PERSONS.map((person, i) => ({
    id: `grammar.${slug}.${person}`,
    kind: "conjugation" as const,
    verb: verbName,
    tense: "presente" as const,
    person,
    form: forms[i]!,
    en: en[i]!,
    source,
    why: whyFor?.[person] ?? `${verbName}: ${PERSONS.map((p, j) => `${LABEL[p]} ${forms[j]}`).join(", ")}`,
  }));
}

const en3 = (base: string, third: string): [string, string, string, string, string] => [`I ${base}`, `you ${base}`, `he / she ${third}`, `we ${base}`, `they ${base}`];

const verbs: KnowledgeItem[] = [
  // Costumar + infinitivo (hábitos, p. 65)
  ...verb("costumar", "costumar", ["costumo", "costumas", "costuma", "costumamos", "costumam"], en3("usually …", "usually …"), src("costumar-infinitive", [65]), {
    eu: "Hábito: costumo + infinitivo (costumo almoçar em casa).",
  }),
  // -ir regulares (pp. 74, 83)
  ...verb("decidir", "decidir", ["decido", "decides", "decide", "decidimos", "decidem"], en3("decide", "decides"), src("verbs-ir", [74, 83])),
  ...verb("preferir", "preferir", ["prefiro", "preferes", "prefere", "preferimos", "preferem"], en3("prefer", "prefers"), src("verbs-ir", [69, 83]), {
    eu: "preferir: e → i só no eu — prefiro.",
  }),
  ...verb("partir", "partir", ["parto", "partes", "parte", "partimos", "partem"], en3("leave", "leaves"), cad("verbs-ir", [30, 31]), {
    nos: "-ir: nós partimos (-imos, não -emos).",
  }),
  // Verbos reflexos (pp. 74, 83)
  ...verb("levantarse", "levantar-se", ["levanto-me", "levantas-te", "levanta-se", "levantamo-nos", "levantam-se"], en3("get up", "gets up"), src("reflexive-verbs", [74, 83]), {
    nos: "levantamo-nos — o -s cai antes de -nos.",
  }),
  ...verb("deitarse", "deitar-se", ["deito-me", "deitas-te", "deita-se", "deitamo-nos", "deitam-se"], en3("go to bed", "goes to bed"), src("reflexive-verbs", [74, 83]), {
    eu: "Com não / nunca / a que horas: o pronome vem antes — não me deito.",
  }),
  ...verb("vestirse", "vestir-se", ["visto-me", "vestes-te", "veste-se", "vestimo-nos", "vestem-se"], en3("get dressed", "gets dressed"), src("reflexive-verbs", [83]), {
    eu: "vestir-se: e → i no eu — visto-me.",
  }),
  // Irregulares (pp. 75, 84)
  ...verb("ver", "ver", ["vejo", "vês", "vê", "vemos", "veem"], en3("see / watch", "sees / watches"), src("irregular-ver-ler-ouvir", [75, 84]), {
    eles: "eles veem — dois e, sem acento (≠ vêm, de vir).",
  }),
  ...verb("ler", "ler", ["leio", "lês", "lê", "lemos", "leem"], en3("read", "reads"), src("irregular-ver-ler-ouvir", [75, 84])),
  ...verb("ouvir", "ouvir", ["ouço", "ouves", "ouve", "ouvimos", "ouvem"], en3("hear / listen", "hears / listens"), src("irregular-ver-ler-ouvir", [75, 84]), {
    eu: "ouvir: eu ouço — com ç.",
  }),
  ...verb("ir", "ir", ["vou", "vais", "vai", "vamos", "vão"], en3("go", "goes"), src("irregular-ir-sair", [75, 84]), {
    eles: "eles vão — com til.",
  }),
  ...verb("sair", "sair", ["saio", "sais", "sai", "saímos", "saem"], en3("go out / leave", "goes out / leaves"), src("irregular-ir-sair", [75, 84]), {
    nos: "nós saímos — com acento no í.",
  }),
];

/* --------------------------------------------- Frames --------------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], targets: string[], en: string, why: string, source: Source];
const FRAMES: Fr[] = [
  // Refeições e hábitos
  ["costumo_almocar", "Eu ___ almoçar em casa.", "costumo", ["costuma", "costumas", "costumam"], ["grammar.costumar.eu"], "I usually have lunch at home.", "eu → costumo + infinitivo", src("costumar-infinitive", [65])],
  ["costumam_jantar", "Eles ___ jantar tarde.", "costumam", ["costuma", "costumamos", "costumo"], ["grammar.costumar.eles"], "They usually have dinner late.", "eles → costumam", src("costumar-infinitive", [65])],
  ["de_manha_cafe", "___ manhã, bebo um café.", "De", ["À", "Na", "Ao"], [], "In the morning, I drink a coffee.", "Partes do dia: de manhã · à / de tarde · à / de noite", src("parts-of-day", [64, 84])],
  // Restaurante
  ["queria_cafe", "Eu ___ um café, por favor.", "queria", ["queres", "quer", "queriam"], [], "I'd like a coffee, please.", "Para pedir com delicadeza: Queria…", src("polite-order", [69])],
  ["queriamos_menus", "Nós ___ dois menus do dia.", "queríamos", ["queria", "queriam", "queres"], [], "We'd like two set menus.", "nós → Queríamos…", src("polite-order", [69])],
  ["e_para_beber", "E ___ beber?", "para", ["por", "de", "a"], [], "And to drink?", "para + infinitivo: para beber, para comer", src("restaurant", [69])],
  // Horas e dias
  ["e_uma_hora", "___ uma hora.", "É", ["São", "Está", "Tem"], ["function.u03.e_uma_hora"], "It's one o'clock.", "1 hora, meio-dia, meia-noite → É; as outras → São", src("telling-time", [70])],
  ["as_nove", "A aula começa ___ nove horas.", "às", ["à", "ao", "as"], [], "The class starts at nine.", "a + as = às: às nove horas", src("time-prepositions", [84])],
  ["ao_meio_dia", "Almoçamos ___ meio-dia.", "ao", ["à", "às", "no"], [], "We have lunch at noon.", "o meio-dia → ao meio-dia", src("time-prepositions", [84])],
  ["aos_sabados", "___ sábados, vou ao mercado.", "Aos", ["Às", "Das", "Nas"], [], "On Saturdays, I go to the market.", "Hábito: aos sábados, às segundas-feiras", src("days-prepositions", [73, 84])],
  ["na_segunda", "Tenho um exame ___ segunda-feira.", "na", ["no", "ao", "às"], [], "I have an exam on Monday.", "Uma vez só: na segunda-feira, no sábado", src("days-prepositions", [73, 84])],
  // -ir
  ["eu_decido", "Hoje eu ___ onde jantamos.", "decido", ["decide", "decides", "decidem"], ["grammar.decidir.eu"], "Today I decide where we have dinner.", "eu → decido", src("verbs-ir", [83])],
  ["tu_preferes", "Tu ___ chá ou café?", "preferes", ["prefere", "prefiro", "preferem"], ["grammar.preferir.tu"], "Do you prefer tea or coffee?", "tu → preferes", src("verbs-ir", [83])],
  ["nos_partimos", "Nós ___ amanhã para o Porto.", "partimos", ["partem", "parte", "partemos"], ["grammar.partir.nos"], "We leave for Porto tomorrow.", "nós → partimos (-imos)", cad("verbs-ir", [30])],
  // Reflexos
  ["levanto_me", "Eu ___ às sete.", "levanto-me", ["levanta-se", "levantas-te", "levantam-se"], ["grammar.levantarse.eu"], "I get up at seven.", "eu → levanto-me", src("reflexive-verbs", [83])],
  ["nao_me_levanto", "Ao domingo, não ___ cedo.", "me levanto", ["levanto-me", "se levanta", "te levantas"], ["grammar.levantarse.eu"], "On Sundays, I don't get up early.", "Depois de não, o pronome vem antes: não me levanto.", src("reflexive-verbs", [83])],
  ["deitamo_nos", "Nós ___ às onze.", "deitamo-nos", ["deitamos-nos", "deitam-se", "deito-me"], ["grammar.deitarse.nos"], "We go to bed at eleven.", "nós → deitamo-nos (o -s cai)", src("reflexive-verbs", [83])],
  ["a_que_horas_te_deitas", "A que horas te ___ ?", "deitas", ["deita", "deito", "deitam"], ["grammar.deitarse.tu"], "What time do you go to bed?", "Pergunta com 'a que horas': o pronome vem antes — te deitas.", src("reflexive-verbs", [83])],
  // ver / ler / ouvir
  ["vemos_televisao", "À noite, nós ___ televisão.", "vemos", ["veem", "vê", "vejo"], ["grammar.ver.nos"], "In the evening, we watch TV.", "nós → vemos", src("irregular-ver-ler-ouvir", [84])],
  ["eu_leio", "Eu ___ o jornal ao pequeno-almoço.", "leio", ["lê", "leem", "lês"], ["grammar.ler.eu"], "I read the newspaper at breakfast.", "eu → leio", src("irregular-ver-ler-ouvir", [84])],
  ["ouco_musica", "Quando corro, ___ música.", "ouço", ["ouve", "ouves", "ouvo"], ["grammar.ouvir.eu"], "When I run, I listen to music.", "eu → ouço", src("irregular-ver-ler-ouvir", [84])],
  // ir / sair
  ["vou_ao_cinema", "Hoje à noite, vou ___ cinema.", "ao", ["à", "no", "o"], ["grammar.ir.eu"], "Tonight I'm going to the cinema.", "a + o = ao: vou ao cinema", src("ir-a-article", [78, 79])],
  ["vamos_a_praia", "No sábado, vamos ___ praia?", "à", ["ao", "na", "as"], ["grammar.ir.nos"], "Shall we go to the beach on Saturday?", "a + a = à: vamos à praia", src("ir-a-article", [78, 79])],
  ["ela_sai", "A Rita ___ de casa às oito.", "sai", ["saio", "saem", "sais"], ["grammar.sair.ele"], "Rita leaves home at eight.", "ela → sai", src("irregular-ir-sair", [84])],
  ["eles_vao_ginasio", "Eles ___ ao ginásio de manhã.", "vão", ["vai", "vamos", "vou"], ["grammar.ir.eles"], "They go to the gym in the morning.", "eles → vão", src("irregular-ir-sair", [84])],
];

const frames: KnowledgeItem[] = FRAMES.map(([slug, text, answer, distractors, targets, en, why, source]) => ({
  id: `grammar.frame.${slug}`,
  kind: "frame",
  text,
  answer,
  distractors,
  targets,
  en,
  why,
  source,
}));

/* --------------------------------------------- Errors --------------------------------------------- */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string, en: string, source: Source];
const ERRORS: Err[] = [
  ["costumo_almocar", ["Eu", "costumo", "almoço", "na", "cantina."], 2, "almoçar", "costumar + infinitivo: costumo almoçar.", "I usually have lunch in the canteen.", src("costumar-infinitive", [65])],
  ["de_manha", ["Na", "manhã,", "tomo", "um", "galão."], 0, "De", "Partes do dia: de manhã.", "In the morning, I have a milky coffee.", src("parts-of-day", [64])],
  ["queria_sopa", ["Eu", "queres", "uma", "sopa,", "por", "favor."], 1, "queria", "Para pedir com delicadeza: eu queria…", "I'd like a soup, please.", src("polite-order", [69])],
  ["uma_garrafa", ["Um", "garrafa", "de", "água,", "por", "favor."], 0, "Uma", "a garrafa → uma garrafa (feminino).", "A bottle of water, please.", cad("restaurant", [28])],
  ["e_uma_hora", ["São", "uma", "hora."], 0, "É", "Uma hora é singular: É uma hora.", "It's one o'clock.", src("telling-time", [70])],
  ["prefiro", ["Eu", "prefero", "peixe."], 1, "prefiro", "preferir: e → i no eu — prefiro.", "I prefer fish.", src("verbs-ir", [83])],
  ["partimos", ["Nós", "partemos", "às", "dez."], 1, "partimos", "-ir: nós partimos (não -emos).", "We leave at ten.", cad("verbs-ir", [30])],
  ["nao_me_deito", ["Eu", "não", "deito-me", "tarde."], 2, "me deito", "Depois de não, o pronome vem antes: não me deito.", "I don't go to bed late.", src("reflexive-verbs", [83])],
  ["levantamo_nos", ["Nós", "levantamos-nos", "cedo."], 1, "levantamo-nos", "nós: o -s cai antes de -nos.", "We get up early.", src("reflexive-verbs", [83])],
  ["ouco", ["Eu", "ouvo", "rádio", "de", "manhã."], 1, "ouço", "ouvir: eu ouço.", "I listen to the radio in the morning.", cad("irregular-1", [33])],
  ["veem", ["Eles", "vem", "um", "filme."], 1, "veem", "ver: eles veem (vem é do verbo vir).", "They watch a film.", cad("irregular-1", [33])],
];

const errors: KnowledgeItem[] = ERRORS.map(([slug, tokens, wrongIndex, fix, why, en, source]) => ({
  id: `grammar.error.${slug}`,
  kind: "error",
  tokens,
  wrongIndex,
  fix,
  why,
  en,
  source,
}));

export const U03_ITEMS: KnowledgeItem[] = [...nouns, ...adjectives, ...phrases, ...verbs, ...frames, ...errors];
