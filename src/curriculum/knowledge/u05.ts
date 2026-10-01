/**
 * Unit 5 — "Como vai estar o tempo?" (Livro do Aluno pp. 115–138; Caderno Unidade 5, pp. 52–66).
 * Weather, seasons and months, clothes and colours, shopping for clothes, ir + infinitivo (future
 * plans), estar a + infinitivo (right now), dar / fazer / trazer / pôr, saber / conhecer / conseguir,
 * há / desde. Original wording; paradigms and word lists are facts of the language, organised as in
 * the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u05", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u05", pages, concept });

const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];
const LABEL: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ele", nos: "nós", eles: "eles" };

/* ----------------------------------- Nouns (pp. 116–123) ----------------------------------- */

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: "tempo" | "natureza" | "roupa", source: Source];
const NOUNS: N[] = [
  // o tempo (pp. 116–119)
  ["vento", "o", "vento", "wind", "🌬️", "tempo", src("weather", [117, 119])],
  ["calor", "o", "calor", "heat", "🥵", "tempo", src("weather", [117, 119])],
  ["frio", "o", "frio", "cold (weather)", "🥶", "tempo", src("weather", [117, 119])],
  ["ceu", "o", "céu", "sky", "🌤️", "natureza", src("weather", [117, 119])],
  // as estações do ano (p. 119)
  ["primavera", "a", "primavera", "spring", "🌷", "tempo", src("seasons-months", [119, 120])],
  ["verao", "o", "verão", "summer", "🏖️", "tempo", src("seasons-months", [119, 120])],
  ["outono", "o", "outono", "autumn", "🍂", "tempo", src("seasons-months", [119, 120])],
  ["inverno", "o", "inverno", "winter", "⛄", "tempo", src("seasons-months", [119, 120])],
  // vestuário e calçado (p. 122) — casaco, camisola, cachecol, meia, chapéu, sapatilha are in a1-core
  ["vestido", "o", "vestido", "dress", "👗", "roupa", src("clothes", [122])],
  ["saia", "a", "saia", "skirt", "💃", "roupa", src("clothes", [122])],
  ["bota", "a", "bota", "boot", "👢", "roupa", src("clothes", [122])],
  ["sandalia", "a", "sandália", "sandal", "🩴", "roupa", src("clothes", [122])],
  ["camisa", "a", "camisa", "shirt", "👔", "roupa", cad("clothes", [53, 54])],
  ["luva", "a", "luva", "glove", "🧤", "roupa", cad("clothes", [53, 54])],
  ["biquini", "o", "biquíni", "bikini", "👙", "roupa", src("clothes", [122])],
  ["bone", "o", "boné", "cap", "🧢", "roupa", src("clothes", [122])],
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
  why:
    category === "tempo" && ["primavera", "verao", "outono", "inverno"].includes(slug)
      ? `${article} ${pt} — ${article === "a" ? "na" : "no"} ${pt} (em + ${article})`
      : `${article} ${pt} — ${article === "o" ? "masculino" : "feminino"}`,
}));

/* ------------------------------- Adjectives: weather, colours, fit ------------------------------- */

/*
 * Natural opposite pairs here (branco ↔ preto, seco ↔ molhado, nublado ↔ solarengo, largo ↔ apertado)
 * are left unlinked for now: a linked pair becomes a Na Mesma Onda spectrum, which needs its own
 * "thing" clues in src/games/wave/things.ts first.
 */
type A = [slug: string, m: string, f: string, en: string, emoji: string | undefined, opposite: string | undefined, source: Source, why?: string];
const ADJ: A[] = [
  // o céu e o tempo (pp. 117–119)
  ["nublado", "nublado", "nublada", "cloudy", "☁️", "solarengo", src("weather", [117, 119]), "O céu está nublado. (estar + adjetivo)"],
  ["solarengo", "solarengo", "solarenga", "sunny", "☀️", "nublado", src("weather", [117, 119]), "Um dia solarengo = um dia com sol."],
  ["seco", "seco", "seca", "dry", "🌵", "molhado", cad("weather", [53, 54])],
  ["molhado", "molhado", "molhada", "wet", "💧", "seco", cad("weather", [53, 54])],
  // as cores (p. 123)
  ["vermelho", "vermelho", "vermelha", "red", "🔴", undefined, src("colours", [123])],
  ["branco", "branco", "branca", "white", "⚪", "preto", src("colours", [123])],
  ["preto", "preto", "preta", "black", "⚫", "branco", src("colours", [123])],
  ["amarelo", "amarelo", "amarela", "yellow", "🟡", undefined, src("colours", [123])],
  ["verde", "verde", "verde", "green", "🟢", undefined, src("colours", [123]), "verde: igual no masculino e no feminino; plural verdes."],
  ["azul", "azul", "azul", "blue", "🔵", undefined, src("colours", [123]), "azul: igual no m./f.; plural azuis."],
  ["castanho", "castanho", "castanha", "brown", "🟤", undefined, src("colours", [123])],
  ["cinzento", "cinzento", "cinzenta", "grey", undefined, undefined, src("colours", [123])],
  ["cor_de_rosa", "cor-de-rosa", "cor-de-rosa", "pink", "🌸", undefined, src("colours", [123]), "cor-de-rosa não muda: a saia cor-de-rosa, os ténis cor-de-rosa."],
  ["cor_de_laranja", "cor de laranja", "cor de laranja", "orange (colour)", "🟠", undefined, src("colours", [123]), "cor de laranja não muda: as meias cor de laranja."],
  ["roxo", "roxo", "roxa", "purple", "🟣", undefined, src("colours", [123])],
  // na loja: o tamanho (pp. 128–129)
  ["largo", "largo", "larga", "loose / too big", undefined, "apertado", src("shopping-clothes", [128, 129]), "As calças estão largas. (roupa: estar + adjetivo)"],
  ["apertado", "apertado", "apertada", "tight / too small", undefined, "largo", src("shopping-clothes", [128, 129]), "O casaco está apertado. (roupa: estar + adjetivo)"],
];

const adjectives: KnowledgeItem[] = ADJ.map(([slug, m, f, en, emoji, opposite, source, why]) => ({
  id: `vocab.adjective.${slug}`,
  kind: "adjective",
  m,
  f,
  en,
  emoji,
  opposite: opposite ? `vocab.adjective.${opposite}` : undefined,
  source,
  why: why ?? (m === f ? `${m}: igual no masculino e no feminino.` : `${m} (m.) · ${f} (f.) — concorda com a roupa: o casaco ${m}, a saia ${f}`),
}));

/* ----------------------------------------- Phrases ----------------------------------------- */

type Fn = "question" | "answer" | "statement" | "order" | "opinion" | "plan" | "time" | "weather" | "courtesy";
type Ph = [slug: string, pt: string, en: string, fn: Fn, situation: string, source: Source];
const PHRASES: Ph[] = [
  // o tempo (pp. 116–119)
  ["como_esta_tempo", "Como está o tempo?", "What's the weather like?", "weather", "🌤️", src("weather", [116, 117])],
  ["esta_sol", "Está sol.", "It's sunny.", "weather", "☀️", src("weather", [117, 119])],
  ["esta_calor", "Está muito calor.", "It's very hot.", "weather", "🥵", src("weather", [119])],
  ["esta_frio", "Está frio.", "It's cold.", "weather", "🥶", src("weather", [119])],
  ["esta_a_chover", "Está a chover.", "It's raining.", "weather", "🌧️", src("weather", [117, 119])],
  ["esta_a_nevar", "Está a nevar na serra.", "It's snowing in the mountains.", "weather", "❄️", src("weather", [119, 120])],
  ["esta_vento", "Está vento.", "It's windy.", "weather", "🌬️", src("weather", [119])],
  ["ceu_nublado", "O céu está nublado.", "The sky is cloudy.", "weather", "☁️", src("weather", [119])],
  // a previsão e os planos (pp. 116–118)
  ["como_vai_estar", "Como vai estar o tempo amanhã?", "What will the weather be like tomorrow?", "weather", "📅", src("weather-forecast", [116, 117])],
  ["vai_chover", "Amanhã vai chover.", "It's going to rain tomorrow.", "weather", "☂️", src("weather-forecast", [117, 118])],
  ["vai_estar_sol", "No sábado vai estar sol.", "It's going to be sunny on Saturday.", "weather", "🏖️", src("weather-forecast", [117, 118])],
  ["o_que_vais_fazer", "O que vais fazer no fim de semana?", "What are you going to do at the weekend?", "plan", "🤔", src("ir-infinitivo", [118, 136])],
  // os meses (p. 119) — escrevem-se com minúscula
  ["janeiro", "em janeiro", "in January", "time", "⛄", src("months", [119, 136])],
  ["fevereiro", "em fevereiro", "in February", "time", "❄️", src("months", [119, 136])],
  ["marco", "em março", "in March", "time", "🌧️", src("months", [119, 136])],
  ["abril", "em abril", "in April", "time", "☂️", src("months", [119, 136])],
  ["maio", "em maio", "in May", "time", "🌷", src("months", [119, 136])],
  ["junho", "em junho", "in June", "time", "🌅", src("months", [119, 136])],
  ["julho", "em julho", "in July", "time", "🏖️", src("months", [119, 136])],
  ["agosto", "em agosto", "in August", "time", "☀️", src("months", [119, 136])],
  ["setembro", "em setembro", "in September", "time", "🎒", src("months", [119, 136])],
  ["outubro", "em outubro", "in October", "time", "🍂", src("months", [119, 136])],
  ["novembro", "em novembro", "in November", "time", "☁️", src("months", [119, 136])],
  ["dezembro", "em dezembro", "in December", "time", "🎄", src("months", [119, 136])],
  // na loja de roupa (pp. 128–130)
  ["queria_ver", "Queria ver aquele casaco, por favor.", "I'd like to see that coat, please.", "order", "🧥", src("shopping-clothes", [128, 129])],
  ["que_tamanho", "Que tamanho veste?", "What size do you wear?", "question", "👕", src("shopping-clothes", [128, 129])],
  ["que_numero", "Que número calça?", "What shoe size do you take?", "question", "👟", src("shopping-clothes", [128, 129])],
  ["posso_experimentar", "Posso experimentar?", "Can I try it on?", "question", "🚪", src("shopping-clothes", [128, 129])],
  ["provador", "Onde é o provador?", "Where is the fitting room?", "question", "🚪", src("shopping-clothes", [128, 129])],
  ["tem_noutra_cor", "Tem noutra cor?", "Do you have it in another colour?", "question", "🎨", src("shopping-clothes", [128, 129])],
  ["estou_so_a_ver", "Estou só a ver, obrigada.", "I'm just looking, thanks.", "courtesy", "👀", cad("shopping-clothes", [52, 54])],
  // tempos livres, saber / conhecer, há / desde (pp. 124–127, 131–133)
  ["sabes_nadar", "Sabes nadar?", "Can you swim?", "question", "🌊", src("saber-conhecer", [131, 133])],
  ["nao_sei_esquiar", "Não sei esquiar.", "I can't ski. (I never learned)", "statement", "❄️", src("saber-conhecer", [131, 133])],
  ["conheces_evora", "Conheces Évora?", "Have you been to Évora? (Do you know it?)", "question", "🏛️", src("saber-conhecer", [116, 133])],
  ["nao_consigo_dormir", "Não consigo dormir com este calor.", "I can't sleep in this heat.", "statement", "😴", src("saber-conhecer", [133])],
  ["podes_vir", "Podes vir jantar no sábado?", "Can you come for dinner on Saturday?", "question", "🍽️", src("saber-conhecer", [133])],
  ["faco_surf_desde", "Faço surf desde 2019.", "I've been surfing since 2019.", "statement", "🌊", src("ha-desde", [125, 127])],
  ["ha_quanto_tempo", "Há quanto tempo estudas português?", "How long have you been studying Portuguese?", "question", "⏱️", src("ha-desde", [125, 127])],
  ["moro_ha", "Moro no Porto há três anos.", "I've lived in Porto for three years.", "statement", "🏙️", src("ha-desde", [125, 127])],
];

const phrases: KnowledgeItem[] = PHRASES.map(([slug, pt, en, fn, situation, source]) => ({
  id: `function.u05.${slug}`,
  kind: "phrase",
  pt,
  en,
  fn,
  situation,
  source,
  why: fn === "time" ? "Meses: em + mês, sem artigo, com letra minúscula." : undefined,
}));

/* --------------------------------------- Verbs --------------------------------------- */

type Forms = [string, string, string, string, string];
const EN_PERSON: Forms = ["I", "you", "he / she", "we", "they"];

/** Presente of an irregular verb (Apêndice p. 136): ids grammar.<verb>.<person>, like Unit 1. */
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

/** ir + infinitivo: vou viajar, vais viajar… (p. 136). */
const IR: Forms = ["vou", "vais", "vai", "vamos", "vão"];
function irFuturo(slug: string, infinitive: string, enVerb: string): KnowledgeItem[] {
  return PERSONS.map((person, i) => ({
    id: `grammar.${slug}.ir_futuro.${person}`,
    kind: "conjugation" as const,
    verb: infinitive,
    tense: "ir_futuro" as const,
    person,
    form: `${IR[i]} ${infinitive}`,
    en: `${EN_PERSON[i]} ${i === 2 ? "is" : i === 0 ? "am" : "are"} going to ${enVerb}`.replace(/^I am/, "I'm").replace(/^(you|we|they) are/, "$1're"),
    source: src("ir-infinitivo", [116, 118, 136]),
    why: `ir + infinitivo = futuro próximo: ${IR[i]} ${infinitive}. Só o verbo ir muda.`,
  }));
}

/** estar a + infinitivo (PT-PT): estou a experimentar — a ação está a acontecer agora. */
const ESTAR: Forms = ["estou", "estás", "está", "estamos", "estão"];
function estarA(slug: string, infinitive: string, enIng: string, persons: Person[], pages: number[]): KnowledgeItem[] {
  return persons.map((person) => {
    const i = PERSONS.indexOf(person);
    return {
      id: `grammar.${slug}.estar_a.${person}`,
      kind: "conjugation" as const,
      verb: infinitive,
      tense: "estar_a" as const,
      person,
      form: `${ESTAR[i]} a ${infinitive}`,
      en: `${["I'm", "you're", "he / she is", "we're", "they're"][i]} ${enIng}`,
      source: src("estar-a-infinitivo", pages),
      why: `Agora: estar a + infinitivo → ${ESTAR[i]} a ${infinitive}. (Em Portugal não se usa o gerúndio.)`,
    };
  });
}

const verbs: KnowledgeItem[] = [
  ...presente("dar", "dar", ["dou", "dás", "dá", "damos", "dão"], ["I give", "you give", "he / she gives", "we give", "they give"], "verbs-irregular-dar-fazer-trazer-por", [129, 130, 136]),
  ...presente("fazer", "fazer", ["faço", "fazes", "faz", "fazemos", "fazem"], ["I do / make", "you do / make", "he / she does / makes", "we do / make", "they do / make"], "verbs-irregular-dar-fazer-trazer-por", [129, 130, 136], {
    eu: "fazer → eu faço (com ç).",
    ele: "fazer → ele/ela faz (sem -e).",
  }),
  ...presente("trazer", "trazer", ["trago", "trazes", "traz", "trazemos", "trazem"], ["I bring", "you bring", "he / she brings", "we bring", "they bring"], "verbs-irregular-dar-fazer-trazer-por", [129, 130, 136], {
    eu: "trazer → eu trago (com g!).",
    ele: "trazer → ele/ela traz (sem -e).",
  }),
  ...presente("por", "pôr", ["ponho", "pões", "põe", "pomos", "põem"], ["I put (on)", "you put (on)", "he / she puts (on)", "we put (on)", "they put (on)"], "verbs-irregular-dar-fazer-trazer-por", [129, 130, 136], {
    eu: "pôr → eu ponho. Ponho o casaco = I put my coat on.",
    eles: "pôr → eles põem (com til).",
  }),
  ...irFuturo("viajar", "viajar", "travel"),
  ...irFuturo("fazer", "fazer", "do"),
  ...estarA("experimentar", "experimentar", "trying on", ["eu", "tu", "ele", "eles"], [128, 129]),
  ...estarA("procurar", "procurar", "looking for", ["eu", "nos"], [128, 129]),
];

/* ----------------------------------------- Gap frames ----------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], targets: string[], en: string, why: string | undefined, source: Source];
const FRAMES: Fr[] = [
  // o tempo
  ["esta_sol", "Hoje ___ sol.", "está", ["é", "tem", "são"], ["function.u05.esta_sol"], "It's sunny today.", "O tempo: está sol, está frio, está calor.", src("weather", [117, 119])],
  ["muito_calor", "Está ___ calor hoje!", "muito", ["muita", "muitos", "muitas"], ["vocab.noun.calor"], "It's very hot today!", "o calor (masculino) → muito calor", src("weather", [119])],
  ["tao_como", "Hoje está ___ frio como ontem.", "tão", ["tanto", "mais", "muito"], [], "Today it's as cold as yesterday.", "Comparativo de igualdade: tão + adjetivo + como.", cad("comparativo-igualdade", [60])],
  // meses e estações
  ["em_agosto", "___ agosto vamos para o Algarve.", "Em", ["No", "Na", "De"], ["function.u05.agosto"], "In August we're going to the Algarve.", "Meses: em, sem artigo.", src("time-prepositions", [119, 136])],
  ["no_inverno", "___ inverno chove muito no Porto.", "No", ["Em", "Na", "Ao"], ["vocab.noun.inverno"], "In winter it rains a lot in Porto.", "Estações: em + artigo → no inverno, no verão, no outono.", src("time-prepositions", [119, 136])],
  ["na_primavera", "___ primavera há muitas flores.", "Na", ["No", "Em", "A"], ["vocab.noun.primavera"], "In spring there are lots of flowers.", "a primavera → na primavera", src("time-prepositions", [119, 136])],
  // ir + infinitivo
  ["vou_viajar", "Amanhã eu ___ viajar para Évora.", "vou", ["vai", "vamos", "vão"], ["grammar.viajar.ir_futuro.eu"], "Tomorrow I'm going to travel to Évora.", "eu → vou + infinitivo", src("ir-infinitivo", [116, 118])],
  ["vais_fazer", "O que é que tu ___ fazer no sábado?", "vais", ["vai", "vou", "vão"], ["grammar.fazer.ir_futuro.tu"], "What are you going to do on Saturday?", "tu → vais + infinitivo", src("ir-infinitivo", [118, 136])],
  ["vao_fazer", "Eles ___ fazer surf no Algarve.", "vão", ["vai", "vamos", "vou"], ["grammar.fazer.ir_futuro.eles"], "They're going to go surfing in the Algarve.", "eles → vão + infinitivo", src("ir-infinitivo", [118, 136])],
  ["vai_chover", "Leva o guarda-chuva: amanhã ___ chover.", "vai", ["vão", "está", "é"], ["function.u05.vai_chover"], "Take the umbrella: it's going to rain tomorrow.", "O tempo amanhã: vai chover, vai estar sol.", src("weather-forecast", [117, 118])],
  // roupa e cores
  ["saia_vermelha", "A saia é ___.", "vermelha", ["vermelho", "vermelhos", "vermelhas"], ["vocab.adjective.vermelho"], "The skirt is red.", "a saia (f.) → vermelha", src("colours", [123])],
  ["tenis_azuis", "Os ténis são ___.", "azuis", ["azul", "azuls", "azules"], ["vocab.adjective.azul"], "The trainers are blue.", "azul → azuis no plural", src("colours", [123])],
  ["tem_vestido", "A Ana tem ___ um vestido verde.", "vestido", ["vestida", "veste", "vestir"], ["vocab.noun.vestido"], "Ana is wearing a green dress.", "ter vestido = estar com esta roupa agora (vestido não muda).", src("clothes", [123, 124])],
  // na loja: estar a + infinitivo
  ["estou_a_experimentar", "Espera, eu estou ___ experimentar as calças.", "a", ["de", "o", "em"], ["grammar.experimentar.estar_a.eu"], "Wait, I'm trying on the trousers.", "estar A + infinitivo", src("estar-a-infinitivo", [128, 129])],
  ["estamos_a_procurar", "Nós ___ a procurar umas botas pretas.", "estamos", ["estão", "está", "somos"], ["grammar.procurar.estar_a.nos"], "We're looking for some black boots.", "nós → estamos a + infinitivo", src("estar-a-infinitivo", [128, 129])],
  ["apertadas", "As calças estão ___, preciso de um tamanho maior.", "apertadas", ["apertados", "apertada", "largas"], ["vocab.adjective.apertado"], "The trousers are tight, I need a bigger size.", "as calças (f. pl.) → apertadas", src("shopping-clothes", [128, 129])],
  // dar, fazer, trazer, pôr
  ["faco", "Ao sábado eu ___ o jantar.", "faço", ["fazo", "faz", "fazes"], ["grammar.fazer.eu"], "On Saturdays I make dinner.", "fazer → eu faço", src("verbs-irregular-dar-fazer-trazer-por", [130, 136])],
  ["ponho", "Hoje eu ___ as botas porque está a chover.", "ponho", ["pono", "põe", "pões"], ["grammar.por.eu"], "Today I'm putting my boots on because it's raining.", "pôr → eu ponho", src("verbs-irregular-dar-fazer-trazer-por", [130, 136])],
  ["trazes", "Tu ___ as sandálias para a praia?", "trazes", ["traz", "trago", "trazem"], ["grammar.trazer.tu"], "Are you bringing your sandals to the beach?", "trazer → tu trazes", src("verbs-irregular-dar-fazer-trazer-por", [130, 136])],
  ["poem", "Eles ___ a mesa para o jantar.", "põem", ["põe", "pomos", "ponhem"], ["grammar.por.eles"], "They set the table for dinner.", "pôr → eles põem (com til)", cad("verbs-irregular-dar-fazer-trazer-por", [56, 57])],
  // saber, conhecer, conseguir; há / desde
  ["conheces", "___ o Algarve?", "Conheces", ["Sabes", "Consegues"], ["function.u05.conheces_evora"], "Have you been to the Algarve?", "conhecer: pessoas e lugares.", src("saber-conhecer", [133])],
  ["sabes", "Tu ___ nadar?", "sabes", ["conheces", "conhece"], ["function.u05.sabes_nadar"], "Can you swim?", "saber + infinitivo: uma coisa que aprendemos.", src("saber-conhecer", [133])],
  ["consigo", "Com este barulho, não ___ dormir.", "consigo", ["sei", "conheço"], ["function.u05.nao_consigo_dormir"], "I can't sleep with this noise.", "conseguir: ser capaz (agora, nesta situação).", cad("saber-conhecer", [58])],
  ["ha", "Estudo português ___ dois anos.", "há", ["desde", "em"], ["function.u05.moro_ha"], "I've been studying Portuguese for two years.", "há + período (dois anos, uma semana).", src("ha-desde", [125, 127])],
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

/* --------------------------------------- Sentence errors --------------------------------------- */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string, en: string, source: Source];
const ERRORS: Err[] = [
  ["e_calor", ["Hoje", "é", "muito", "calor."], 1, "está", "O tempo: está calor, está frio.", "It's very hot today.", src("weather", [119])],
  ["muita_frio", ["Está", "muita", "frio", "hoje."], 1, "muito", "o frio (masculino) → muito frio", "It's very cold today.", src("weather", [119])],
  ["no_marco", ["O", "meu", "aniversário", "é", "no", "março."], 4, "em", "Meses sem artigo: em março.", "My birthday is in March.", cad("em-months-seasons", [63])],
  ["janeiro_minuscula", ["Em", "Janeiro", "neva", "na", "serra."], 1, "janeiro", "Os meses escrevem-se com letra minúscula.", "In January it snows in the mountains.", src("months", [119])],
  ["vou_viajo", ["Amanhã", "vou", "viajo", "para", "Faro."], 2, "viajar", "ir + INFINITIVO: vou viajar.", "Tomorrow I'm going to travel to Faro.", src("ir-infinitivo", [118, 136])],
  ["nos_vai", ["Nós", "vai", "jantar", "fora", "hoje."], 1, "vamos", "nós → vamos + infinitivo", "We're going to eat out tonight.", cad("ir-infinitivo", [55])],
  ["camisa_branco", ["A", "camisa", "é", "branco."], 3, "branca", "a camisa (f.) → branca", "The shirt is white.", src("colours", [123])],
  ["estou_de", ["Estou", "de", "experimentar", "o", "casaco."], 1, "a", "estar A + infinitivo", "I'm trying on the coat.", src("estar-a-infinitivo", [128, 129])],
  ["fazo", ["Eu", "fazo", "ginástica", "ao", "domingo."], 1, "faço", "fazer → eu faço", "I do exercise on Sundays.", cad("verbs-irregular-dar-fazer-trazer-por", [56, 57])],
  ["trazo", ["Eu", "trazo", "o", "vinho", "para", "o", "jantar."], 1, "trago", "trazer → eu trago", "I'm bringing the wine for dinner.", cad("verbs-irregular-dar-fazer-trazer-por", [56, 57])],
  ["sabes_ana", ["Sabes", "a", "Ana?"], 0, "Conheces", "Pessoas: conhecer (conheces a Ana?).", "Do you know Ana?", src("saber-conhecer", [133])],
  ["desde_tres", ["Trabalho", "aqui", "desde", "três", "anos."], 2, "há", "há + período; desde + momento (desde 2020).", "I've worked here for three years.", cad("ha-desde", [59])],
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

/* --------------------------------- Pronunciation: r / rr (p. 135) --------------------------------- */

const pairs: KnowledgeItem[] = (
  [
    ["caro_carro", "carro", "caro", "r / rr", "carro: R forte (rr). caro: r fraco, entre vogais."],
    ["moro_morro", "morro", "moro", "r / rr", "morro: R forte. moro (morar): r fraco."],
  ] as const
).map(([slug, target, contrast, feature, hint]) => ({
  id: `pron.u05.${slug}`,
  kind: "minimalPair" as const,
  target,
  contrast,
  feature,
  hint,
  source: src("pronunciation-r", [135]),
}));

export const U05_ITEMS: KnowledgeItem[] = [...nouns, ...adjectives, ...phrases, ...verbs, ...frames, ...errors, ...pairs];
