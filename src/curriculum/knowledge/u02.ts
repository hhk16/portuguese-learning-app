/**
 * Unit 2 — "A tua amiga é muito simpática!" (Livro do Aluno pp. 33–51; Caderno Unidade 2, pp. 18–27),
 * plus the sections that follow it: Ponto da Situação 1 (pp. 52–57), O Mundo do Trabalho 1 (pp. 58–59)
 * and O Mundo do Português 1 (pp. 60–62).
 * Original wording; paradigms and word lists are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u02", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u02", pages, concept });
const pds = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "pds1", pages, concept });
const trab = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "trab1", pages, concept });
const mundo = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "mundo1", pages, concept });

/* ------------------------------- Relationships & family (pp. 34–37) ------------------------------- */

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: "familia" | "pessoa" | "escola", source: Source];
const NOUNS: N[] = [
  // relações (p. 35)
  ["marido", "o", "marido", "husband", "🤵", "familia", src("relationships", [34, 35])],
  ["mulher", "a", "mulher", "wife (also: woman)", "👰", "familia", src("relationships", [34, 35])],
  ["namorado", "o", "namorado", "boyfriend", "💑", "pessoa", src("relationships", [34, 35])],
  ["namorada", "a", "namorada", "girlfriend", "💓", "pessoa", src("relationships", [34, 35])],
  ["colega", "o", "colega", "colleague", "👥", "pessoa", src("relationships", [34, 35])],
  ["amigo", "o", "amigo", "friend (male)", "🤝", "pessoa", src("relationships", [34])],
  ["amiga", "a", "amiga", "friend (female)", "👫", "pessoa", src("relationships", [33, 34])],
  ["familia", "a", "família", "family", "👨‍👩‍👧", "familia", src("family", [36, 37])],
  // a família (p. 37)
  ["pai", "o", "pai", "father", "👨", "familia", src("family", [36, 37])],
  ["mae", "a", "mãe", "mother", "👩", "familia", src("family", [36, 37])],
  ["filho", "o", "filho", "son", "👦", "familia", src("family", [37])],
  ["filha", "a", "filha", "daughter", "👧", "familia", src("family", [37])],
  ["irmao", "o", "irmão", "brother", "👬", "familia", src("family", [36, 37])],
  ["irma", "a", "irmã", "sister", "👭", "familia", src("family", [37])],
  ["avo_m", "o", "avô", "grandfather", "👴", "familia", src("family", [36, 37])],
  ["avo_f", "a", "avó", "grandmother", "👵", "familia", src("family", [36, 37])],
  ["neto", "o", "neto", "grandson", "🧒", "familia", src("family", [36, 37])],
  ["neta", "a", "neta", "granddaughter", "👶", "familia", src("family", [37])],
  ["tio", "o", "tio", "uncle", "🧔", "familia", src("family", [37])],
  ["tia", "a", "tia", "aunt", "👱‍♀️", "familia", src("family", [37])],
  // a sala de aula (p. 39)
  ["mesa", "a", "mesa", "table", "🍽️", "escola", src("classroom-objects", [39])],
  ["quadro", "o", "quadro", "board (classroom)", "🟩", "escola", src("classroom-objects", [39])],
  ["caderno", "o", "caderno", "notebook", "📓", "escola", src("classroom-objects", [39])],
  ["borracha", "a", "borracha", "eraser / rubber", "🧽", "escola", src("classroom-objects", [39])],
  ["estojo", "o", "estojo", "pencil case", "🖍️", "escola", src("classroom-objects", [39])],
];

const NOUN_WHY: Record<string, string> = {
  mulher: "o marido → a mulher (não “a marida”)",
  colega: "o colega · a colega — igual, só muda o artigo.",
  avo_m: "o avô (ô fechado) · a avó (ó aberto) · os avós",
  avo_f: "a avó (ó aberto) · o avô (ô fechado) · os avós",
  irmao: "o irmão · a irmã · os irmãos",
  irma: "a irmã · o irmão · as irmãs",
  pai: "o pai + a mãe = os pais",
  mae: "a mãe + o pai = os pais",
  familia: "a família — feminino",
};

const nouns: KnowledgeItem[] = NOUNS.map(([slug, article, pt, en, emoji, category, source]) => ({
  id: `vocab.noun.${slug}`,
  kind: "noun",
  pt,
  article,
  en,
  emoji,
  category,
  source,
  why: NOUN_WHY[slug] ?? `${article} ${pt} — ${article === "o" ? "masculino" : "feminino"}`,
}));

/* ------------------------------------ Adjectives (pp. 42, 45) ------------------------------------ */

type A = [slug: string, m: string, f: string, en: string, emoji: string, opposite: string | undefined, source: Source];
const ADJ: A[] = [
  ["alto", "alto", "alta", "tall", "🦒", "baixo", src("physical-description", [42])],
  ["baixo", "baixo", "baixa", "short (height)", "🐜", "alto", src("physical-description", [42])],
  ["magro", "magro", "magra", "slim / thin", "🥢", "gordo", src("physical-description", [42])],
  ["gordo", "gordo", "gorda", "fat", "🍩", "magro", src("physical-description", [42])],
  ["simpatico", "simpático", "simpática", "nice / friendly", "😊", "antipatico", src("personality", [42, 45])],
  ["antipatico", "antipático", "antipática", "unfriendly", "😡", "simpatico", src("personality", [42, 45])],
  ["timido", "tímido", "tímida", "shy", "🙈", "sociavel", src("personality", [42, 45])],
  ["sociavel", "sociável", "sociável", "sociable", "🥳", "timido", src("personality", [42, 45])],
  ["trabalhador", "trabalhador", "trabalhadora", "hard-working", "💪", "preguicoso", src("personality", [45])],
  ["preguicoso", "preguiçoso", "preguiçosa", "lazy", "😴", "trabalhador", src("personality", [45])],
  ["cansado", "cansado", "cansada", "tired", "🥱", "descansado", src("ser-vs-estar", [50])],
  ["descansado", "descansado", "descansada", "rested", "😌", "cansado", cad("ser-vs-estar", [22])],
  ["casado", "casado", "casada", "married", "💍", "solteiro", src("marital-status", [43, 44])],
  ["solteiro", "solteiro", "solteira", "single", "🙋", "casado", src("marital-status", [44, 50])],
  // O Mundo do Trabalho 1 — qualidades para um emprego (p. 59)
  ["organizado", "organizado", "organizada", "organised", "🗂️", "desarrumado", src("personality", [44])],
  ["desarrumado", "desarrumado", "desarrumada", "messy", "🌪️", "organizado", src("personality", [42])],
  ["atento", "atento", "atenta", "attentive", "👀", "distraido", trab("job-qualities", [59])],
  ["distraido", "distraído", "distraída", "absent-minded", "🤪", "atento", trab("job-qualities", [59])],
  ["paciente", "paciente", "paciente", "patient", "🐢", "impaciente", trab("job-qualities", [59])],
  ["impaciente", "impaciente", "impaciente", "impatient", "⏱️", "paciente", trab("job-qualities", [59])],
  ["curioso", "curioso", "curiosa", "curious", "🕵️", undefined, trab("job-qualities", [59])],
  ["comunicativo", "comunicativo", "comunicativa", "outgoing / communicative", "🗣️", undefined, src("personality", [45])],
];

/**
 * Every opposite pair is linked both ways: Batata Quente asks "o contrário de…", and Na Mesma Onda
 * uses a pair as a dial once src/games/wave/things.ts has clue things for it ("<left>|<right>").
 */
const oppositeOf = (slug: string, opposite: string | undefined): string | undefined => (opposite ? `vocab.adjective.${opposite}` : undefined);

const adjectives: KnowledgeItem[] = ADJ.map(([slug, m, f, en, emoji, opposite, source]) => ({
  id: `vocab.adjective.${slug}`,
  kind: "adjective",
  m,
  f,
  en,
  emoji,
  opposite: oppositeOf(slug, opposite),
  source,
  why: m === f ? `${m}: igual no masculino e no feminino.` : m.endsWith("or") ? `-or → -ora: ${m} → ${f}` : `${m} (m.) · ${f} (f.)`,
}));

/* --------------------------- Verbs: -er regular + estar (pp. 35, 50) --------------------------- */

const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];
const PRON = ["eu", "tu", "ele", "nós", "eles"];

function verb(slug: string, forms: [string, string, string, string, string], en: [string, string, string, string, string], source: Source, whyFor?: Partial<Record<Person, string>>): KnowledgeItem[] {
  return PERSONS.map((person, i) => ({
    id: `grammar.${slug}.${person}`,
    kind: "conjugation" as const,
    verb: slug,
    tense: "presente" as const,
    person,
    form: forms[i]!,
    en: en[i]!,
    source,
    why: whyFor?.[person] ?? `${slug}: ${PRON.map((p, j) => `${p} ${forms[j]}`).join(", ")}`,
  }));
}

const ER_WHY: Partial<Record<Person, string>> = { nos: "-er: nós → -emos (não -amos!)", eles: "-er: eles → -em (comem, bebem, vivem)" };

const verbs: KnowledgeItem[] = [
  ...verb("comer", ["como", "comes", "come", "comemos", "comem"], ["I eat", "you eat", "he / she eats", "we eat", "they eat"], src("verbs-er", [35, 50]), ER_WHY),
  ...verb("beber", ["bebo", "bebes", "bebe", "bebemos", "bebem"], ["I drink", "you drink", "he / she drinks", "we drink", "they drink"], src("verbs-er", [34, 35, 50]), ER_WHY),
  ...verb("viver", ["vivo", "vives", "vive", "vivemos", "vivem"], ["I live", "you live", "he / she lives", "we live", "they live"], src("verbs-er", [35, 50]), { ...ER_WHY, eu: "viver = morar: vivo em Lisboa = moro em Lisboa." }),
  ...verb("aprender", ["aprendo", "aprendes", "aprende", "aprendemos", "aprendem"], ["I learn", "you learn", "he / she learns", "we learn", "they learn"], src("verbs-er", [35]), ER_WHY),
  ...verb("perceber", ["percebo", "percebes", "percebe", "percebemos", "percebem"], ["I understand", "you understand", "he / she understands", "we understand", "they understand"], cad("verbs-er", [20, 21]), {
    ...ER_WHY,
    eu: "Não percebo! — perceber = compreender (mais usado em Portugal).",
  }),
  ...verb("estar", ["estou", "estás", "está", "estamos", "estão"], ["I am (now / there)", "you are (now / there)", "he / she is (now / there)", "we are (now / there)", "they are (now / there)"], src("verb-estar", [39, 50]), {
    eu: "estar = agora / onde: Hoje estou cansado. Estou em casa.",
    ele: "está — com acento (esta, sem acento, é “this”).",
    eles: "eles / elas / vocês estão — com til.",
  }),
];

/* ------------------------------------- Phrases (functions) ------------------------------------- */

type Fn = "greeting" | "courtesy" | "introduce" | "question" | "answer" | "statement" | "opinion" | "direction";
type Ph = [slug: string, pt: string, en: string, fn: Fn, situation: string, source: Source, why?: string];
const PHRASES: Ph[] = [
  // apresentar pessoas (p. 34; Caderno p. 18)
  ["apresento_te", "Apresento-te a minha irmã.", "Let me introduce my sister.", "introduce", "🤝", src("introduce-someone", [34]), "tu: apresento-te · você: apresento-lhe"],
  ["esta_e_colega", "Esta é a Rita, uma nova colega.", "This is Rita, a new colleague.", "introduce", "👥", src("introduce-someone", [34]), "Para apresentar: Este é… / Esta é…"],
  ["muito_prazer", "Muito prazer!", "Pleased to meet you!", "courtesy", "😊", src("introduce-someone", [34])],
  ["bem_vinda", "Bem-vinda!", "Welcome! (to a woman)", "greeting", "🎉", src("introduce-someone", [34]), "Bem-vindo (a um homem) · Bem-vinda (a uma mulher)"],
  ["ja_conheces", "Já conheces o Hadi?", "Have you met Hadi yet?", "question", "🤔", src("introduce-someone", [34, 41]), "conhecer: eu conheço (com ç), tu conheces"],
  ["que_giro", "Que giro!", "How cool!", "opinion", "😀", src("social-expressions", [34])],
  ["bebes_cafe", "Bebes um café?", "Will you have a coffee?", "question", "☕", src("offer-food-drink", [34]), "Para oferecer: Bebes…? Comes…? — Resposta: Bebo, sim."],
  // descrever pessoas (p. 42)
  ["cabelo_curto", "Tem cabelo curto.", "He / She has short hair.", "statement", "💇", src("physical-description", [42]), "O cabelo é com TER: tem cabelo curto / comprido."],
  ["usa_oculos", "Usa óculos.", "He / She wears glasses.", "statement", "👓", src("physical-description", [42])],
  // passatempos (p. 42)
  ["o_que_gostas", "O que gostas de fazer?", "What do you like doing?", "question", "🤔", src("hobbies", [42])],
  ["gosto_ler", "Gosto de ler.", "I like reading.", "statement", "📚", src("hobbies", [42])],
  ["gosto_pintar", "Gosto de pintar.", "I like painting.", "statement", "🎨", src("hobbies", [42])],
  ["gosto_futebol", "Gosto de jogar futebol.", "I like playing football.", "statement", "⚽", src("hobbies", [42])],
  ["gosto_cinema", "Gosto de ir ao cinema.", "I like going to the cinema.", "statement", "🎬", src("hobbies", [42])],
  ["gosto_dancar", "Gosto de dançar.", "I like dancing.", "statement", "💃", src("hobbies", [42])],
  // expressões de lugar (pp. 39, 50)
  ["em_cima_de", "em cima de", "on (top of)", "direction", "⬆️", src("place-expressions", [39, 50]), "em cima de + a mesa = em cima da mesa"],
  ["debaixo_de", "debaixo de", "under", "direction", "⬇️", src("place-expressions", [39, 50]), "debaixo de + a cadeira = debaixo da cadeira"],
  ["dentro_de", "dentro de", "inside", "direction", "📦", src("place-expressions", [39, 50]), "dentro de + o estojo = dentro do estojo"],
  ["ao_lado_de", "ao lado de", "next to", "direction", "↔️", src("place-expressions", [39, 50]), "ao lado de + o computador = ao lado do computador"],
  ["em_frente_de", "em frente de", "in front of / opposite", "direction", "➡️", src("place-expressions", [39, 50]), "em frente de + a escola = em frente da escola"],
  ["atras_de", "atrás de", "behind", "direction", "🔙", src("place-expressions", [39, 50]), "atrás de + a porta = atrás da porta"],
  ["entre", "entre", "between", "direction", "↕️", src("place-expressions", [39, 50]), "entre a porta e a janela"],
];

const phraseItem = ([slug, pt, en, fn, situation, source, why]: Ph, unit: string): KnowledgeItem => ({ id: `function.${unit}.${slug}`, kind: "phrase", pt, en, fn, situation, source, why });
const phrases: KnowledgeItem[] = PHRASES.map((p) => phraseItem(p, "u02"));

/* ---------------------------------- Numbers 21–199 (p. 41) ---------------------------------- */

type Num = [value: number, pt: string, fem?: string, why?: string];
const NUMS: Num[] = [
  [21, "vinte e um", "vinte e uma", "Dezenas + unidades com “e”: vinte e um."],
  [22, "vinte e dois", "vinte e duas", "vinte e dois livros · vinte e duas canetas"],
  [30, "trinta"],
  [38, "trinta e oito"],
  [40, "quarenta"],
  [50, "cinquenta", undefined, "cinquenta — com “qu” (cin-kuen-ta)."],
  [60, "sessenta", undefined, "sessenta (60) ≠ setenta (70): ss vs t."],
  [70, "setenta", undefined, "setenta (70) ≠ sessenta (60)."],
  [80, "oitenta"],
  [90, "noventa", undefined, "noventa (90) ≠ nove (9) ≠ dezanove (19)."],
  [100, "cem", undefined, "100 sozinho = cem."],
  [101, "cento e um", "cento e uma", "101–199: cento e…"],
  [120, "cento e vinte"],
  [150, "cento e cinquenta"],
  [199, "cento e noventa e nove", undefined, "Põe “e” entre todas as partes: cento e noventa e nove."],
];
const numbers: KnowledgeItem[] = NUMS.map(([value, pt, fem, why]) => ({
  id: `vocab.number.n${value}`,
  kind: "number",
  value,
  pt,
  fem,
  source: src("numbers-to-199", [41]),
  why,
}));

/* ----------------------------------------- Gap frames ----------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], targets: string[], en: string, why: string, source: Source];
const FRAMES: Fr[] = [
  // apresentar (demonstrativos este / esta, conhecer)
  ["esta_namorada", "___ é a minha namorada, a Sofia.", "Esta", ["Este", "Isto", "Estes"], ["vocab.noun.namorada"], "This is my girlfriend, Sofia.", "a namorada (f.) → esta", src("demonstratives", [34, 51])],
  ["nosso_colega", "Este é o ___ colega João.", "nosso", ["nossa", "nossos", "nossas"], ["vocab.noun.colega"], "This is our colleague João.", "o colega (m. sing.) → o nosso", src("possessives", [34, 51])],
  ["eu_conheco", "Eu já ___ a Maria.", "conheço", ["conhece", "conheces", "conhecemos"], [], "I already know Maria.", "conhecer: eu conheço — com ç.", src("verbs-er", [41, 50])],
  // verbos em -er
  ["tu_comes", "Tu ___ um pastel de nata?", "comes", ["come", "como", "comem"], ["grammar.comer.tu"], "Are you having a custard tart?", "tu → -es: comes", src("verbs-er", [34, 35])],
  ["nos_vivemos", "Nós ___ no centro de Lisboa.", "vivemos", ["vivem", "vivamos", "vivo"], ["grammar.viver.nos"], "We live in the centre of Lisbon.", "nós → -emos: vivemos", src("verbs-er", [35])],
  ["eles_comem", "Os meus pais ___ muita fruta.", "comem", ["come", "comemos", "comes"], ["grammar.comer.eles"], "My parents eat a lot of fruit.", "eles → -em: comem", src("verbs-er", [35, 50])],
  ["bebo_sim", "— Bebes um café? — ___, sim.", "Bebo", ["Bebe", "Bebes", "Sou"], ["grammar.beber.eu"], "— Will you have a coffee? — Yes, I will.", "Resposta curta: repete o verbo (Bebo, sim.)", src("offer-food-drink", [34, 35])],
  ["eu_aprendo", "Eu ___ português numa escola em Lisboa.", "aprendo", ["aprende", "aprendes", "aprendemos"], ["grammar.aprender.eu"], "I learn Portuguese at a school in Lisbon.", "eu → -o: aprendo", src("verbs-er", [35])],
  ["voces_percebem", "Vocês ___ inglês?", "percebem", ["percebe", "percebemos", "percebes"], ["grammar.perceber.eles"], "Do you (all) understand English?", "vocês → -em: percebem", cad("verbs-er", [20, 21])],
  ["gosto_de", "Gosto ___ ver televisão à noite.", "de", ["a", "em", "do"], [], "I like watching TV at night.", "gostar DE + infinitivo: gosto de ver…", src("hobbies", [42, 43])],
  // possessivos (família)
  ["a_minha_mae", "Esta é ___ mãe.", "a minha", ["o meu", "as minhas", "os meus"], ["vocab.noun.mae"], "This is my mother.", "O possessivo concorda com a coisa: a mãe → a minha.", src("possessives", [36, 51])],
  ["os_meus_avos", "Estes são ___ avós.", "os meus", ["o meu", "as minhas", "a minha"], ["vocab.noun.avo_m"], "These are my grandparents.", "os avós (m. pl.) → os meus", src("possessives", [36, 51])],
  ["carro_dele", "O Rui tem um carro novo. O carro ___ é azul.", "dele", ["dela", "deles", "delas"], [], "Rui has a new car. His car is blue.", "ele → dele · ela → dela (depois da coisa)", src("possessives", [51])],
  // sala de aula, estar, lugar
  ["livro_esta", "O livro ___ em cima da mesa.", "está", ["é", "estão", "estou"], ["grammar.estar.ele"], "The book is on the table.", "Localização de um objeto → estar.", src("verb-estar", [39, 50])],
  ["dentro_do_estojo", "As canetas estão dentro ___ estojo.", "do", ["da", "de", "no"], ["grammar.contraction.de_o", "vocab.noun.estojo"], "The pens are inside the pencil case.", "dentro de + o = dentro do", src("place-expressions", [39, 50])],
  ["debaixo_da_cadeira", "A mochila está debaixo ___ cadeira.", "da", ["do", "de", "na"], ["grammar.contraction.de_a"], "The backpack is under the chair.", "debaixo de + a = debaixo da", src("place-expressions", [39, 50])],
  ["o_que_e_isto", "— O que é ___? — É um caderno.", "isto", ["este", "esta", "aquele"], ["vocab.noun.caderno"], "— What is this? — It's a notebook.", "Coisa sem nome → isto / isso / aquilo (invariáveis).", src("demonstratives", [40, 51])],
  // ser vs estar / adjetivos
  ["hoje_estou", "Hoje ___ muito cansada.", "estou", ["sou", "está", "é"], ["grammar.estar.eu", "vocab.adjective.cansado"], "Today I'm very tired.", "Estado de agora (hoje) → estar.", src("ser-vs-estar", [50])],
  ["irmao_e_alto", "O meu irmão ___ alto e magro.", "é", ["está", "são", "tem"], ["grammar.ser.ele", "vocab.adjective.alto"], "My brother is tall and slim.", "Característica permanente → ser.", src("ser-vs-estar", [42, 50])],
  ["amigas_simpaticas", "As minhas amigas são muito ___.", "simpáticas", ["simpáticos", "simpática", "simpático"], ["vocab.adjective.simpatico"], "My friends are very nice.", "Adjetivo concorda: amigas (f. pl.) → simpáticas", src("adjective-agreement", [42, 51])],
  // números
  ["avo_noventa", "O meu avô tem ___ anos.", "noventa", ["nove", "dezanove", "novecentos"], ["vocab.number.n90"], "My grandfather is ninety.", "90 = noventa", src("numbers-to-199", [41])],
  ["mae_sessenta", "A minha mãe tem ___ anos.", "sessenta", ["setenta", "seis", "dezasseis"], ["vocab.number.n60"], "My mother is sixty.", "60 = sessenta · 70 = setenta", src("numbers-to-199", [41])],
  // Ponto da Situação 1
  ["falamos", "— Vocês falam português? — Sim, ___.", "falamos", ["falam", "falo", "fala"], [], "— Do you (all) speak Portuguese? — Yes, we do.", "Resposta curta: repete o verbo na pessoa certa.", pds("short-answers", [52, 53, 54, 55, 56, 57])],
  ["esta_sim", "— A Ana está em casa? — ___, sim.", "Está", ["É", "Estou", "Tem"], ["grammar.estar.ele"], "— Is Ana at home? — Yes, she is.", "Pergunta com estar → resposta com estar.", pds("short-answers", [52, 53, 54, 55, 56, 57])],
  ["quantos_anos", "___ anos tem a tua avó?", "Quantos", ["Quantas", "Onde", "Como"], [], "How old is your grandmother?", "o ano (m.) → quantos anos", pds("question-words", [52, 53, 54, 55, 56, 57])],
  ["uma_irma", "Tenho ___ irmã e dois irmãos.", "uma", ["um", "a", "uns"], ["vocab.noun.irma"], "I have one sister and two brothers.", "Artigo indefinido: um (m.) · uma (f.)", pds("indefinite-articles", [52, 53, 54, 55, 56, 57])],
  // O Mundo do Trabalho 1
  ["aquele_senhor", "Boa tarde. ___ senhor ali é o Dr. Pereira?", "Aquele", ["Aquilo", "Isto", "Esta"], [], "Good afternoon. Is that man over there Dr Pereira?", "Longe (ali) → aquele / aquela", trab("demonstrative-far", [59])],
  ["prazer_conhecer_te", "Olá, Cátia! Prazer em ___!", "conhecer-te", ["conhecer-se", "conheço-te", "conhecer-me"], [], "Hi, Cátia! Nice to meet you!", "Informal (tu): prazer em conhecer-te.", trab("formal-informal", [58])],
  // O Mundo do Português 1
  ["de_cabo_verde", "O Nelson é ___ Cabo Verde.", "de", ["do", "da", "em"], ["grammar.origin.cabo_verde"], "Nelson is from Cape Verde.", "Cabo Verde não leva artigo → de Cabo Verde.", mundo("lusophone-countries", [60])],
  ["cabo_verdiana", "A Joana é de Cabo Verde. É ___.", "cabo-verdiana", ["cabo-verdiano", "cabo-verdianos", "cabo-verdianas"], ["vocab.nationality.cabo_verde"], "Joana is from Cape Verde. She's Cape Verdean.", "feminino: cabo-verdiana", mundo("lusophone-countries", [60, 62])],
  ["angola_portugues", "Em Angola fala-se ___.", "português", ["portuguesa", "Portugal", "portugueses"], ["vocab.nationality.angola"], "In Angola, Portuguese is spoken.", "A língua: o português (como o adjetivo masculino).", mundo("lusophone-countries", [60])],
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

/* ------------------------------------ Near-identical sentences ------------------------------------ */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string, en: string, source: Source];
const ERRORS: Err[] = [
  ["o_namorado", ["O", "Hadi", "é", "o", "namorada", "da", "Ana."], 4, "namorado", "Ele → o namorado · ela → a namorada", "Hadi is Ana's boyfriend.", src("relationships", [35])],
  ["nos_bebemos", ["Nós", "bebamos", "chá", "à", "tarde."], 1, "bebemos", "-er: nós → -emos (bebemos), não -amos.", "We drink tea in the afternoon.", cad("verbs-er", [20, 21])],
  ["eles_vivem", ["Eles", "vive", "no", "Porto."], 1, "vivem", "eles → vivem", "They live in Porto.", src("verbs-er", [35, 50])],
  ["ela_aprende", ["A", "Rita", "aprendes", "a", "dançar."], 2, "aprende", "ela → aprende", "Rita is learning to dance.", src("verbs-er", [35, 42])],
  ["esta_irma", ["Este", "é", "a", "minha", "irmã."], 0, "Esta", "a irmã (f.) → esta", "This is my sister.", src("demonstratives", [36, 51])],
  ["meu_pai", ["O", "minha", "pai", "é", "médico."], 1, "meu", "o pai (m.) → o meu", "My father is a doctor.", src("possessives", [36, 51])],
  ["pais_dela", ["A", "Rita", "mora", "com", "os", "pais", "dele."], 6, "dela", "A Rita é ela → dela.", "Rita lives with her parents.", src("possessives", [51])],
  ["oculos_estao", ["Os", "óculos", "está", "em", "cima", "da", "mesa."], 2, "estão", "os óculos (plural) → estão", "The glasses are on the table.", src("verb-estar", [40, 50])],
  ["atras_da_porta", ["O", "gato", "está", "atrás", "do", "porta."], 4, "da", "a porta → atrás da porta", "The cat is behind the door.", src("place-expressions", [39, 50])],
  ["sou_solteira", ["Eu", "estou", "solteira."], 1, "sou", "Estado civil → ser: sou solteira.", "I'm single.", src("ser-vs-estar", [50])],
  ["ana_alta", ["A", "Ana", "é", "alto."], 3, "alta", "Ana (f.) → alta", "Ana is tall.", src("adjective-agreement", [42, 51])],
  ["cem_livros", ["Tenho", "cento", "livros."], 1, "cem", "100 sozinho = cem · 101–199 = cento e…", "I have a hundred books.", src("numbers-to-199", [41])],
  // Ponto da Situação 1
  ["irmaos_altos", ["Os", "meus", "irmão", "são", "altos."], 2, "irmãos", "Plural: os meus irmãos.", "My brothers are tall.", pds("plural", [52, 53, 54, 55, 56, 57])],
  ["ana_esta_casa", ["A", "Ana", "é", "em", "casa", "agora."], 2, "está", "Agora, em casa (lugar temporário) → está.", "Ana is at home now.", pds("ser-vs-estar", [52, 53, 54, 55, 56, 57])],
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

/* ------------------------------ O Mundo do Trabalho 1 (pp. 58–59) ------------------------------ */

const TRAB_PHRASES: Ph[] = [
  ["muito_gosto", "Muito gosto.", "Pleased to meet you. (formal)", "courtesy", "🤝", trab("formal-informal", [58])],
  ["igualmente", "Igualmente.", "Likewise.", "courtesy", "🙏", trab("formal-informal", [58])],
  ["nova_colega", "É a nossa nova colega.", "She's our new colleague.", "introduce", "👥", trab("formal-informal", [58])],
  ["um_momento", "Um momento, por favor.", "One moment, please.", "courtesy", "⏱️", trab("office-reception", [59])],
  ["o_sr_esta", "O Sr. Costa está?", "Is Mr Costa in?", "question", "🏢", trab("office-reception", [59]), "Formal: o Sr. / a Sra. / a Dra. + apelido"],
  ["procura_se", "Procura-se rececionista.", "Receptionist wanted.", "statement", "📰", trab("job-ads", [59])],
];

type Prof = [slug: string, m: string, f: string, en: string, emoji: string, workplace?: string];
const TRAB_PROFS: Prof[] = [
  ["contabilista", "contabilista", "contabilista", "accountant", "🧮", "a empresa"],
  ["rececionista", "rececionista", "rececionista", "receptionist", "🛎️", "o hotel"],
  ["diretor", "diretor", "diretora", "director / manager", "👔", "o escritório"],
];
const trabItems: KnowledgeItem[] = [
  ...TRAB_PHRASES.map((p) => phraseItem(p, "trab1")),
  ...TRAB_PROFS.map(([slug, m, f, en, emoji, workplace]) => ({
    id: `vocab.profession.${slug}`,
    kind: "profession" as const,
    m,
    f,
    en,
    emoji,
    workplace,
    source: trab("workplace-jobs", [59]),
    why: m === f ? `${m}: igual no masculino e no feminino.` : `-or → -ora: ${m} → ${f}`,
  })),
];

/* ------------------------------ O Mundo do Português 1 (pp. 60–62) ------------------------------ */

type Nat = [slug: string, country: string, flag: string, ms: string, fs: string, mp: string, fp: string, en: string];
const MUNDO_NATS: Nat[] = [
  ["mocambique", "Moçambique", "🇲🇿", "moçambicano", "moçambicana", "moçambicanos", "moçambicanas", "Mozambican"],
  ["cabo_verde", "Cabo Verde", "🇨🇻", "cabo-verdiano", "cabo-verdiana", "cabo-verdianos", "cabo-verdianas", "Cape Verdean"],
];
const MUNDO_PHRASES: Ph[] = [
  ["onde_se_fala", "Onde se fala português?", "Where is Portuguese spoken?", "question", "🌍", mundo("lusophone-countries", [60])],
  ["cplp", "A CPLP tem nove países.", "The CPLP has nine member countries.", "statement", "🤝", mundo("language-facts", [60]), "CPLP = Comunidade dos Países de Língua Portuguesa"],
  ["dia_lingua", "O Dia Mundial da Língua Portuguesa é a 5 de maio.", "World Portuguese Language Day is on 5 May.", "statement", "📅", mundo("language-facts", [60])],
  ["macau", "Em Macau também se fala português.", "Portuguese is also spoken in Macau.", "statement", "💬", mundo("lusophone-countries", [60])],
];
const mundoItems: KnowledgeItem[] = [
  ...MUNDO_NATS.map(([slug, country, flag, ms, fs, mp, fp, en]) => ({
    id: `vocab.nationality.${slug}`,
    kind: "nationality" as const,
    country,
    article: null,
    flag,
    ms,
    fs,
    mp,
    fp,
    en,
    source: mundo("lusophone-countries", [60, 62]),
    why: "-o → -a no feminino; +s no plural.",
  })),
  ...MUNDO_PHRASES.map((p) => phraseItem(p, "mundo1")),
  {
    id: "grammar.origin.cabo_verde",
    kind: "origin",
    place: "Cabo Verde",
    placeType: "country",
    article: null,
    form: "de Cabo Verde",
    emoji: "🇨🇻",
    source: mundo("lusophone-countries", [60]),
    why: "Cabo Verde não leva artigo → de Cabo Verde.",
  },
];

export const U02_ITEMS: KnowledgeItem[] = [...nouns, ...adjectives, ...verbs, ...phrases, ...numbers, ...frames, ...errors, ...trabItems, ...mundoItems];
