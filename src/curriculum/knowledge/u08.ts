/**
 * Unit 8 — "Passei férias em Cabo Verde." (Livro do Aluno pp. 189–205; Caderno Unidade 8 pp. 90–100),
 * plus Ponto da Situação 4 (pp. 206–211), O Mundo do Trabalho 4 (pp. 212–213) and
 * O Mundo do Português 4 — Cabo Verde (pp. 214–216).
 * Holidays and travel, the Pretérito Perfeito Simples (regular -ar/-er/-ir and irregular ir/ser,
 * estar, ter, fazer, ver), past time markers (ontem, na semana passada, há dois anos, já / ainda não /
 * nunca), hotels and airports, CVs and job interviews, Cabo Verde.
 * Original wording; paradigms and word lists are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

type Unit = "u08" | "pds4" | "trab4" | "mundo4";
const at = (unit: Unit) => (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit, pages, concept });
const src = at("u08");
const pds = at("pds4");
const trab = at("trab4");
const mundo = at("mundo4");
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u08", pages, concept });

/* ------------------------- Pretérito Perfeito Simples (pp. 194–199, 205) ------------------------- */

const PERSONS: Person[] = ["eu", "tu", "ele", "nos", "eles"];
const LABEL: Record<Person, string> = { eu: "eu", tu: "tu", ele: "ele", nos: "nós", eles: "eles" };
const SUBJ = ["I", "you", "he / she", "we", "they"];

/**
 * One PPS paradigm. `en` is the English past ("travelled"), or five person-specific strings when the
 * verb needs them (ser / estar both give "was / were").
 */
function pps(slug: string, verbName: string, forms: [string, string, string, string, string], en: string | [string, string, string, string, string], source: Source, whyFor?: Partial<Record<Person, string>>): KnowledgeItem[] {
  const table = PERSONS.map((p, j) => `${LABEL[p]} ${forms[j]}`).join(", ");
  return PERSONS.map((person, i) => ({
    id: `grammar.${slug}.pps.${person}`,
    kind: "conjugation" as const,
    verb: verbName,
    tense: "pps" as const,
    person,
    form: forms[i]!,
    en: typeof en === "string" ? `${SUBJ[i]} ${en}` : en[i],
    source,
    why: whyFor?.[person] ?? `${verbName} (passado): ${table}`,
  }));
}

const NOS_AR = "nós -ámos: com acento no passado (no presente: -amos).";
const NOS_ER_IR = "nós -emos / -imos: igual ao presente — o contexto (ontem…) decide.";
const IR_SER = "ir e ser têm o mesmo passado: fui, foste, foi, fomos, foram.";

const conjugations: KnowledgeItem[] = [
  ...pps("viajar", "viajar", ["viajei", "viajaste", "viajou", "viajámos", "viajaram"], "travelled", src("pps-regular-ar", [194, 195, 205]), { nos: NOS_AR }),
  ...pps("visitar", "visitar", ["visitei", "visitaste", "visitou", "visitámos", "visitaram"], "visited", src("pps-regular-ar", [194, 195, 205]), { nos: NOS_AR }),
  ...pps("ficar", "ficar", ["fiquei", "ficaste", "ficou", "ficámos", "ficaram"], "stayed", cad("pps-regular-ar", [92, 93]), {
    eu: "ficar → fiquei: c passa a qu antes de e.",
    nos: NOS_AR,
  }),
  ...pps("comer", "comer", ["comi", "comeste", "comeu", "comemos", "comeram"], "ate", src("pps-regular-er", [194, 195, 205]), { nos: NOS_ER_IR }),
  ...pps("conhecer", "conhecer", ["conheci", "conheceste", "conheceu", "conhecemos", "conheceram"], "met / got to know", src("pps-regular-er", [194, 195, 205]), { nos: NOS_ER_IR }),
  ...pps("partir", "partir", ["parti", "partiste", "partiu", "partimos", "partiram"], "left (set off)", src("pps-regular-ir", [194, 195, 205]), { nos: NOS_ER_IR }),
  ...pps("ir", "ir", ["fui", "foste", "foi", "fomos", "foram"], "went", src("pps-irregular-ir-ser", [196, 205]), { eu: IR_SER }),
  ...pps("ser", "ser", ["fui", "foste", "foi", "fomos", "foram"], ["I was (ser)", "you were (ser)", "he / she / it was (ser)", "we were (ser)", "they were (ser)"], src("pps-irregular-ir-ser", [196, 205]), {
    ele: "Foi ótimo! — ser no passado = foi. (Igual a ir.)",
  }),
  ...pps("estar", "estar", ["estive", "estiveste", "esteve", "estivemos", "estiveram"], ["I was (estar)", "you were (estar)", "he / she / it was (estar)", "we were (estar)", "they were (estar)"], src("pps-irregular-estar", [196, 205]), {
    ele: "O tempo esteve ótimo. — estar no passado = esteve.",
  }),
  ...pps("ter", "ter", ["tive", "tiveste", "teve", "tivemos", "tiveram"], "had", src("pps-irregular-ter", [196, 205]), {
    ele: "ele teve (passado) ≠ ele tem (presente).",
  }),
  ...pps("fazer", "fazer", ["fiz", "fizeste", "fez", "fizemos", "fizeram"], "did / made", cad("pps-irregular", [97, 99])),
  ...pps("ver", "ver", ["vi", "viste", "viu", "vimos", "viram"], "saw", pds("pps-irregular", [206, 207])),
];

/* ------------------------------------------- Phrases ------------------------------------------- */

type Fn = "courtesy" | "question" | "answer" | "statement" | "order" | "opinion" | "plan" | "time" | "weather";
type Ph = [slug: string, pt: string, en: string, fn: Fn, situation: string, source: Source];

const U08_PHRASES: Ph[] = [
  // Férias e preferências (pp. 190–193)
  ["aonde_vais_ferias", "Já sabes aonde vais nas férias?", "Do you know where you're going on holiday yet?", "question", "🏖️", src("holiday-talk", [190])],
  ["vou_passar_ferias", "Vou passar as férias nos Açores.", "I'm spending my holidays in the Azores.", "plan", "🏝️", src("holiday-talk", [190])],
  ["prefiro_praia", "Prefiro a praia à montanha.", "I prefer the beach to the mountains.", "opinion", "🏖️", src("holiday-preferences", [191, 192])],
  ["gosto_mais_campo", "Gosto mais de ficar no campo.", "I prefer staying in the countryside.", "opinion", "🏞️", src("holiday-preferences", [191, 192])],
  ["viajo_de_comboio", "Gosto de andar de comboio.", "I like travelling by train.", "opinion", "🚂", src("holiday-preferences", [191, 192])],
  ["ja_experimentaste", "Já experimentaste mergulho?", "Have you ever tried diving?", "question", "🌊", src("adventure-activities", [193])],
  ["ainda_nao_interessada", "Ainda não, mas estou interessada.", "Not yet, but I'm interested.", "answer", "🤔", src("adventure-activities", [193])],
  ["ja_e_adorei", "Já, e adorei!", "Yes, and I loved it!", "answer", "😀", src("adventure-activities", [193])],
  ["nunca_sem_interesse", "Nunca, e não tenho interesse.", "Never, and I'm not interested.", "answer", "👎", src("adventure-activities", [193])],
  ["ouvi_dizer", "Ouvi dizer que Cabo Verde é lindo.", "I heard that Cape Verde is beautiful.", "statement", "🗣️", src("holiday-talk", [190])],
  ["tens_de_voltar", "Tens de lá voltar!", "You have to go back there!", "opinion", "🔁", src("holiday-talk", [190])],
  // O passado: perguntar e contar (pp. 194–199; Caderno pp. 90, 98)
  ["onde_estiveste", "Onde estiveste no fim de semana?", "Where were you at the weekend?", "question", "📅", cad("past-events", [90])],
  ["o_que_fizeste", "O que fizeste ontem?", "What did you do yesterday?", "question", "🤔", cad("past-events", [90])],
  ["como_correram", "Como correram as férias?", "How did your holidays go?", "question", "🏖️", cad("past-events", [90])],
  ["foram_otimas", "Foram ótimas, obrigada!", "They were great, thanks!", "answer", "😀", cad("past-events", [90])],
  ["foi_divertido", "Foi muito divertido!", "It was great fun!", "answer", "🥳", src("holiday-accounts", [200])],
  ["ja_estiveste_cv", "Já estiveste em Cabo Verde?", "Have you ever been to Cape Verde?", "question", "🏝️", cad("pps-markers", [98])],
  ["ainda_nao_fui", "Ainda não fui, mas quero ir.", "I haven't been yet, but I want to go.", "answer", "⏰", cad("pps-markers", [98])],
  ["nunca_fui_acores", "Nunca fui aos Açores.", "I've never been to the Azores.", "answer", "🌍", cad("pps-markers", [98])],
  ["choveu_um_pouco", "Choveu um pouco, mas esteve calor.", "It rained a bit, but it was hot.", "weather", "🌧️", src("weather-past", [197, 198])],
  ["nasci_em", "Nasci em mil novecentos e noventa.", "I was born in 1990.", "answer", "📅", cad("pps-markers", [98])],
  // Expressões de tempo (passado)
  ["ontem", "ontem", "yesterday", "time", "📅", src("past-time-expressions", [194, 197])],
  ["anteontem", "anteontem", "the day before yesterday", "time", "📅", src("past-time-expressions", [194, 197])],
  ["na_semana_passada", "na semana passada", "last week", "time", "📅", src("past-time-expressions", [194, 197])],
  ["no_fim_de_semana_passado", "no fim de semana passado", "last weekend", "time", "📅", src("past-time-expressions", [194, 197])],
  ["no_ano_passado", "no ano passado", "last year", "time", "📅", src("past-time-expressions", [194, 197])],
  ["ha_dois_anos", "há dois anos", "two years ago", "time", "⏰", src("past-time-expressions", [194, 197])],
  ["em_2019", "em dois mil e dezanove", "in 2019", "time", "📅", cad("pps-markers", [98])],
  // Hotel e aeroporto (pp. 194–202, 211; Caderno p. 91)
  ["tenho_uma_reserva", "Boa tarde, tenho uma reserva em nome de Costa.", "Good afternoon, I have a booking under Costa.", "statement", "🔑", src("hotel", [197, 198])],
  ["queria_quarto_duplo", "Queria um quarto duplo para três noites.", "I'd like a double room for three nights.", "order", "🛏️", src("hotel", [197, 198])],
  ["pequeno_almoco_incluido", "O pequeno-almoço está incluído?", "Is breakfast included?", "question", "🥐", src("hotel", [197, 198])],
  ["deixar_as_malas", "Posso deixar as malas na receção?", "Can I leave my bags at reception?", "question", "🧳", src("hotel", [197, 198])],
  ["a_que_horas_check_out", "A que horas é o check-out?", "What time is check-out?", "question", "⏰", src("hotel", [197, 198])],
  ["o_seu_passaporte", "O seu passaporte, por favor.", "Your passport, please.", "order", "🪪", pds("airport", [211])],
  ["voo_atrasado", "O voo está atrasado uma hora.", "The flight is an hour late.", "statement", "✈️", pds("airport", [211])],
  ["apanhei_o_aviao", "Apanhei o avião às seis da manhã.", "I caught the plane at six in the morning.", "statement", "🛫", src("travel-collocations", [196, 197])],
  ["alugamos_um_carro", "Alugámos um carro no aeroporto.", "We rented a car at the airport.", "statement", "🚗", src("travel-collocations", [196, 197])],
  ["tirei_fotografias", "Tirei muitas fotografias.", "I took lots of photos.", "statement", "📱", src("travel-collocations", [196, 197])],
  ["ja_fiz_as_malas", "Já fiz as malas!", "I've packed my bags!", "statement", "🧳", cad("travel-preparation", [91])],
];

const PDS4_PHRASES: Ph[] = [
  ["neste_momento", "neste momento", "right now", "time", "⏰", pds("time-markers", [206, 207])],
  ["normalmente", "normalmente", "usually", "time", "🔁", pds("time-markers", [206, 207])],
  ["na_proxima_semana", "na próxima semana", "next week", "time", "📅", pds("time-markers", [206, 207])],
  ["pela_primeira_vez", "pela primeira vez", "for the first time", "time", "🌟", pds("time-markers", [206, 207])],
];

const TRAB4_PHRASES: Ph[] = [
  ["pode_sentar_se", "Pode sentar-se, por favor.", "Please, have a seat.", "courtesy", "🪑", trab("job-interview", [213])],
  ["qual_a_sua_formacao", "Qual é a sua formação?", "What is your educational background?", "question", "🎓", trab("job-interview", [213])],
  ["tem_experiencia", "Tem experiência nesta área?", "Do you have experience in this field?", "question", "📊", trab("job-interview", [213])],
  ["porque_quer_mudar", "Porque é que quer mudar de emprego?", "Why do you want to change jobs?", "question", "🤔", trab("job-interview", [213])],
  ["pode_comecar", "Pode começar no próximo mês?", "Can you start next month?", "question", "📅", trab("job-interview", [213])],
  ["trabalhei_tres_anos", "Trabalhei três anos numa empresa de publicidade.", "I worked for three years at an advertising company.", "answer", "🏢", trab("job-interview", [213])],
  ["vivo_ha_cinco_anos", "Vivo em Portugal há cinco anos.", "I've lived in Portugal for five years.", "answer", "🇵🇹", trab("job-interview", [213])],
  ["falo_tres_linguas", "Falo inglês, árabe e português.", "I speak English, Arabic and Portuguese.", "answer", "🗣️", trab("cv-languages", [212])],
  ["dizemos_lhe_algo", "Dizemos-lhe alguma coisa até sexta-feira.", "We'll let you know by Friday.", "statement", "📅", trab("job-interview", [213])],
  ["fico_a_aguardar", "Fico a aguardar, então. Obrigado!", "I'll wait to hear from you, then. Thank you!", "courtesy", "🙏", trab("job-interview", [213])],
];

const MUNDO4_PHRASES: Ph[] = [
  ["dez_ilhas", "Cabo Verde tem dez ilhas.", "Cape Verde has ten islands.", "statement", "🏝️", mundo("cabo-verde-geography", [214])],
  ["capital_praia", "A capital é a cidade da Praia.", "The capital is the city of Praia.", "statement", "🏙️", mundo("cabo-verde-geography", [214])],
  ["fala_se_crioulo", "Fala-se português e crioulo.", "Portuguese and Creole are spoken.", "statement", "🗣️", mundo("cabo-verde-languages", [214])],
  ["clima_quente_seco", "O clima é quente e seco.", "The climate is hot and dry.", "weather", "☀️", mundo("cabo-verde-geography", [214])],
  ["pico_do_fogo", "O Pico do Fogo é um vulcão ativo.", "Pico do Fogo is an active volcano.", "statement", "🌋", mundo("cabo-verde-geography", [214])],
  ["carnaval_mindelo", "O Carnaval do Mindelo é muito famoso.", "Mindelo's Carnival is very famous.", "statement", "🎭", mundo("cabo-verde-festivals", [215])],
  ["morna", "A morna é a música de Cabo Verde.", "Morna is the music of Cape Verde.", "statement", "🎵", mundo("cabo-verde-culture", [214, 215])],
];

const phrase =
  (prefix: string) =>
  ([slug, pt, en, fn, situation, source]: Ph): KnowledgeItem => ({ id: `function.${prefix}.${slug}`, kind: "phrase", pt, en, fn, situation, source });

const phrases: KnowledgeItem[] = [
  ...U08_PHRASES.map(phrase("u08")),
  ...PDS4_PHRASES.map(phrase("pds4")),
  ...TRAB4_PHRASES.map(phrase("trab4")),
  ...MUNDO4_PHRASES.map(phrase("mundo4")),
];

/* -------------------------------------------- Nouns -------------------------------------------- */

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: "objeto" | "lugar" | "natureza" | "animal" | "escola" | "lazer", source: Source];
const NOUNS: N[] = [
  ["viagem", "a", "viagem", "trip", "🌍", "lazer", src("holidays-travel", [190])],
  ["ilha", "a", "ilha", "island", "🏝️", "lugar", src("holidays-travel", [190])],
  ["campo", "o", "campo", "countryside", "🏞️", "lugar", src("holiday-places", [191])],
  ["por_do_sol", "o", "pôr do sol", "sunset", "🌅", "natureza", src("places-nature", [197, 198])],
  ["aldeia", "a", "aldeia", "village", "🏡", "lugar", src("places-nature", [198, 199])],
  ["passaporte", "o", "passaporte", "passport", "🪪", "objeto", cad("travel-preparation", [91])],
  ["vulcao", "o", "vulcão", "volcano", "🌋", "natureza", mundo("cabo-verde-geography", [214])],
  ["tartaruga", "a", "tartaruga", "turtle", "🐢", "animal", mundo("cabo-verde-nature", [214])],
  ["tambor", "o", "tambor", "drum", "🥁", "objeto", mundo("cabo-verde-festivals", [215])],
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

/* ------------------------------------------ Adjectives ------------------------------------------ */

type A = [slug: string, m: string, f: string, en: string, emoji: string, opposite: string, source: Source];
const ADJ: A[] = [
  ["cheio", "cheio", "cheia", "full", "👥", "vazio", src("holiday-accounts", [200, 201])],
  ["vazio", "vazio", "vazia", "empty", "⚪", "cheio", src("holiday-accounts", [200, 201])],
  ["humido", "húmido", "húmida", "humid / damp", "💧", "", mundo("cabo-verde-geography", [214])],
];

/**
 * Every opposite pair becomes a Na Mesma Onda spectrum, which needs its "thing" clues in
 * src/games/wave/things.ts (keyed "cheio|vazio", "humido|seco"). Until those exist the pairs are
 * only named in `why`; flip this on once the clues are added.
 */
const WIRE_OPPOSITES = true;

const adjectives: KnowledgeItem[] = ADJ.map(([slug, m, f, en, emoji, opposite, source]) => ({
  id: `vocab.adjective.${slug}`,
  kind: "adjective",
  m,
  f,
  en,
  emoji,
  opposite: WIRE_OPPOSITES && opposite ? `vocab.adjective.${opposite}` : undefined,
  source,
  why: `${m} (m.) · ${f} (f.) ≠ ${ADJ.find((x) => x[0] === opposite)?.[1] ?? opposite}`,
}));

/* -------------------------------------------- Frames -------------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], en: string, why: string, source: Source, targets?: string[]];
const FRAMES: Fr[] = [
  // férias e preferências
  ["prefiro_praia", "Eu ___ a praia à montanha.", "prefiro", ["prefere", "preferes", "preferimos"], "I prefer the beach to the mountains.", "preferir: eu prefiro (e → i).", src("holiday-preferences", [191, 192]), ["function.u08.prefiro_praia"]],
  ["andar_de_aviao", "Não gosto de andar ___ avião.", "de", ["em", "a", "com"], "I don't like travelling by plane.", "andar de + transporte: de avião, de comboio, de barco.", src("holiday-preferences", [191, 192])],
  ["ainda_nao", "Já foste aos Açores? — Não, ___ não fui.", "ainda", ["já", "nunca", "ontem"], "Have you been to the Azores? — No, not yet.", "ainda não = not yet.", src("ja-ainda-nao-nunca", [193]), ["function.u08.ainda_nao_fui"]],
  // PPS -ar
  ["viajei", "No verão passado, eu ___ para os Açores.", "viajei", ["viajo", "viajou", "viajaste"], "Last summer, I travelled to the Azores.", "eu -ei: viajei.", src("pps-regular-ar", [194, 195]), ["grammar.viajar.pps.eu"]],
  ["visitamos", "Ontem, nós ___ o castelo.", "visitámos", ["visitamos", "visitaram", "visitei"], "Yesterday we visited the castle.", "Passado, nós -ar: visitámos (com acento).", src("pps-regular-ar", [194, 195]), ["grammar.visitar.pps.nos"]],
  ["ficaste", "Na semana passada, em que hotel ___ tu?", "ficaste", ["ficou", "fiquei", "ficaram"], "Last week, which hotel did you stay at?", "tu -aste: ficaste.", src("pps-regular-ar", [194, 195]), ["grammar.ficar.pps.tu"]],
  ["fiquei", "Eu ___ em casa no domingo passado.", "fiquei", ["ficei", "ficou", "ficaste"], "I stayed at home last Sunday.", "ficar → fiquei (c → qu).", cad("pps-regular-ar", [92, 93]), ["grammar.ficar.pps.eu"]],
  // PPS -er / -ir
  ["comi", "Ontem, eu ___ peixe grelhado ao jantar.", "comi", ["como", "comeu", "comeste"], "Yesterday I had grilled fish for dinner.", "eu -i: comi.", src("pps-regular-er", [194, 195]), ["grammar.comer.pps.eu"]],
  ["conheceste", "Onde é que tu ___ a Ana?", "conheceste", ["conheci", "conheceu", "conheceram"], "Where did you meet Ana?", "tu -este: conheceste.", src("pps-regular-er", [194, 195]), ["grammar.conhecer.pps.tu"]],
  ["comeram", "Eles ___ muito bem em Cabo Verde.", "comeram", ["comemos", "comeu", "comi"], "They ate very well in Cape Verde.", "eles -eram: comeram.", src("pps-regular-er", [194, 195]), ["grammar.comer.pps.eles"]],
  ["partiu", "O comboio ___ às nove e um quarto.", "partiu", ["parti", "partiram", "partimos"], "The train left at a quarter past nine.", "ele -iu: partiu.", src("pps-regular-ir", [194, 195]), ["grammar.partir.pps.ele"]],
  ["partimos", "Nós ___ de Lisboa às seis da manhã.", "partimos", ["partiram", "parti", "partiu"], "We left Lisbon at six in the morning.", NOS_ER_IR, src("pps-regular-ir", [194, 195]), ["grammar.partir.pps.nos"]],
  // ir / estar / ter
  ["fui_cinema", "No sábado passado, eu ___ ao cinema.", "fui", ["foi", "foste", "fomos"], "Last Saturday I went to the cinema.", "ir: eu fui.", src("pps-irregular-ir-ser", [196]), ["grammar.ir.pps.eu"]],
  ["foram_cv", "Os meus amigos ___ a Cabo Verde em 2019.", "foram", ["foi", "fomos", "fui"], "My friends went to Cape Verde in 2019.", "eles foram.", src("pps-irregular-ir-ser", [196]), ["grammar.ir.pps.eles"]],
  ["estiveste", "Quanto tempo ___ tu nos Açores?", "estiveste", ["estive", "estiveram", "estivemos"], "How long were you in the Azores?", "estar: tu estiveste.", src("pps-irregular-estar", [196]), ["grammar.estar.pps.tu"]],
  ["tempo_esteve", "O tempo ___ ótimo durante as férias.", "esteve", ["estive", "estiveram", "estiveste"], "The weather was great during the holidays.", "Tempo no passado: esteve bom / esteve calor.", src("weather-past", [197, 198]), ["grammar.estar.pps.ele"]],
  ["tivemos_sorte", "Nós ___ muita sorte com o tempo.", "tivemos", ["tiveram", "tive", "teve"], "We were very lucky with the weather.", "ter: nós tivemos.", src("pps-irregular-ter", [196]), ["grammar.ter.pps.nos"]],
  ["teve_de_voltar", "A Ana ___ de voltar mais cedo.", "teve", ["tive", "tiveste", "tiveram"], "Ana had to go back earlier.", "ter de + infinitivo: ela teve de voltar.", src("pps-irregular-ter", [196]), ["grammar.ter.pps.ele"]],
  // ser / fazer / ver
  ["viagem_foi", "A viagem ___ fantástica!", "foi", ["fui", "foram", "fomos"], "The trip was fantastic!", "ser: a viagem foi.", src("pps-irregular-ir-ser", [196]), ["grammar.ser.pps.ele"]],
  ["pessoas_foram", "As pessoas ___ muito simpáticas.", "foram", ["foi", "fomos", "fui"], "People were very friendly.", "ser: elas foram.", src("pps-irregular-ir-ser", [196]), ["grammar.ser.pps.eles"]],
  ["fizeste", "O que ___ tu no fim de semana?", "fizeste", ["fiz", "fez", "fizeram"], "What did you do at the weekend?", "fazer: tu fizeste.", cad("pps-irregular", [97, 99]), ["grammar.fazer.pps.tu"]],
  ["fiz_caminhada", "Eu ___ uma caminhada na serra.", "fiz", ["fez", "fizeste", "fizeram"], "I went for a hike in the hills.", "fazer: eu fiz.", cad("pps-irregular", [97, 99]), ["grammar.fazer.pps.eu"]],
  ["vimos_golfinhos", "Nós ___ golfinhos no mar!", "vimos", ["viram", "vi", "viu"], "We saw dolphins in the sea!", "ver: nós vimos.", pds("pps-irregular", [206, 207]), ["grammar.ver.pps.nos"]],
  // marcadores de tempo
  ["nunca_fui", "Eu ___ fui a Cabo Verde, mas quero ir.", "nunca", ["ainda", "ontem", "amanhã"], "I've never been to Cape Verde, but I want to go.", "nunca + passado = never.", cad("pps-markers", [98]), ["function.u08.nunca_fui_acores"]],
  ["ha_dois_anos", "Fui ao Brasil ___ dois anos.", "há", ["desde", "em", "de"], "I went to Brazil two years ago.", "há + tempo = ago.", src("past-time-expressions", [194, 197]), ["function.u08.ha_dois_anos"]],
  ["semana_passada", "Na semana ___, estive doente.", "passada", ["próxima", "passado", "passadas"], "Last week, I was ill.", "a semana → passada (feminino).", src("past-time-expressions", [194, 197]), ["function.u08.na_semana_passada"]],
  ["normalmente_ontem", "___, vou de autocarro; mas ontem fui a pé.", "Normalmente", ["Ontem", "Anteontem", "Ainda"], "I usually go by bus, but yesterday I walked.", "normalmente → presente; ontem → passado.", src("presente-vs-pps", [198, 199])],
  // hotel / aeroporto
  ["apanhei_aviao", "Ontem, eu ___ o avião às sete.", "apanhei", ["apanho", "apanhou", "apanhaste"], "Yesterday I caught the plane at seven.", "apanhar o avião / o comboio / o autocarro.", src("travel-collocations", [196, 197])],
  ["deixar_malas_rececao", "Posso deixar as malas na ___?", "receção", ["quarto", "aeroporto", "hotel"], "Can I leave my bags at reception?", "a receção → na receção.", src("hotel", [197, 198]), ["function.u08.deixar_as_malas"]],
  ["reservei_quarto", "Ontem, eu ___ um quarto pela Internet.", "reservei", ["reservo", "reservou", "reservaste"], "Yesterday I booked a room online.", "eu -ei: reservei.", cad("travel-preparation", [91])],
  // pds4: quatro tempos (pp. 206–207)
  ["tempo_agora", "Neste momento, eu ___ a ler um livro.", "estou", ["vou", "li", "leio"], "Right now, I'm reading a book.", "Agora: estar a + infinitivo.", pds("tense-frames", [206, 207])],
  ["tempo_normalmente", "Normalmente, nós ___ às oito.", "jantamos", ["jantámos", "janto", "jantaram"], "We usually have dinner at eight.", "Hábito → presente: jantamos (sem acento).", pds("tense-frames", [206, 207])],
  ["tempo_ontem", "Ontem, nós ___ às dez.", "jantámos", ["jantamos", "vamos jantar", "estamos a jantar"], "Yesterday we had dinner at ten.", "Passado: jantámos (com acento).", pds("tense-frames", [206, 207])],
  ["tempo_amanha", "Amanhã, eu ___ visitar a minha avó.", "vou", ["fui", "estou", "visitei"], "Tomorrow I'm going to visit my grandmother.", "Futuro: ir + infinitivo.", pds("tense-frames", [206, 207])],
  ["tempo_passado_foi", "Na semana passada, o Hadi ___ a Cabo Verde.", "foi", ["vai", "vem", "está"], "Last week Hadi went to Cape Verde.", "na semana passada → passado: foi.", pds("tense-frames", [206, 207])],
  // trab4
  ["a_sua_nacionalidade", "Qual é a ___ nacionalidade?", "sua", ["seu", "suas", "teu"], "What is your nationality?", "Entrevista: formal → a sua.", trab("job-interview", [213])],
  ["ha_cinco_anos", "Vivo em Lisboa ___ cinco anos.", "há", ["desde", "em", "por"], "I've lived in Lisbon for five years.", "presente + há = for (até hoje).", trab("job-interview", [213]), ["function.trab4.vivo_ha_cinco_anos"]],
  ["mudar_de_emprego", "Porque é que quer mudar ___ emprego?", "de", ["o", "do", "para"], "Why do you want to change jobs?", "mudar de emprego / de casa.", trab("job-interview", [213]), ["function.trab4.porque_quer_mudar"]],
  // mundo4
  ["cv_no_atlantico", "Cabo Verde fica ___ oceano Atlântico.", "no", ["na", "em", "do"], "Cape Verde is in the Atlantic Ocean.", "o oceano → no oceano.", mundo("cabo-verde-geography", [214])],
  ["lingua_oficial", "Em Cabo Verde, a língua oficial ___ o português.", "é", ["está", "são", "tem"], "In Cape Verde, the official language is Portuguese.", "ser para identificar: a língua oficial é…", mundo("cabo-verde-languages", [214])],
  ["maior_ilha", "Santiago é a ___ ilha de Cabo Verde.", "maior", ["mais grande", "grande", "maiores"], "Santiago is the largest island of Cape Verde.", "grande → maior (nunca \"mais grande\").", mundo("cabo-verde-geography", [214])],
];

const frames: KnowledgeItem[] = FRAMES.map(([slug, text, answer, distractors, en, why, source, targets]) => ({
  id: `grammar.frame.${slug}`,
  kind: "frame",
  text,
  answer,
  distractors,
  en,
  why,
  targets,
  source,
}));

/* -------------------------------------------- Errors -------------------------------------------- */

type Err = [slug: string, tokens: string[], wrongIndex: number, fix: string, why: string, en: string, source: Source];
const ERRORS: Err[] = [
  ["ficei", ["Eu", "ficei", "num", "hotel", "no", "Porto."], 1, "fiquei", "ficar → fiquei (c → qu antes de e).", "I stayed in a hotel in Porto.", cad("pps-regular-ar", [92, 93])],
  ["pagei", ["Ontem", "pagei", "o", "hotel."], 1, "paguei", "pagar → paguei (g → gu antes de e).", "Yesterday I paid for the hotel.", cad("pps-regular-ar", [92, 93])],
  ["viajamos_passado", ["No", "ano", "passado,", "viajamos", "muito."], 3, "viajámos", "Passado, nós -ar: viajámos (com acento).", "Last year we travelled a lot.", src("pps-nos-accent", [200, 205])],
  ["ontem_vamos", ["Ontem,", "nós", "vamos", "à", "praia."], 2, "fomos", "Ontem → passado: fomos.", "Yesterday we went to the beach.", src("presente-vs-pps", [198, 199])],
  ["fui_doente", ["Eu", "fui", "doente", "na", "semana", "passada."], 1, "estive", "Estado passageiro: estar → estive doente.", "I was ill last week.", src("pps-irregular-estar", [196])],
  ["fazeste", ["O", "que", "fazeste", "ontem?"], 2, "fizeste", "fazer → fiz, fizeste, fez.", "What did you do yesterday?", cad("pps-irregular", [97, 99])],
  ["desde_tres_anos", ["Fui", "a", "Cabo", "Verde", "desde", "três", "anos."], 4, "há", "há + tempo = ago: há três anos.", "I went to Cape Verde three years ago.", src("past-time-expressions", [194, 197])],
  ["estou_a_trabalhei", ["Agora", "estou", "a", "trabalhei."], 3, "trabalhar", "estar a + infinitivo: estou a trabalhar.", "Right now I'm working.", pds("tense-frames", [206, 207])],
  ["o_sua_formacao", ["Qual", "é", "o", "sua", "formação?"], 2, "a", "a formação → a sua formação.", "What is your education?", trab("job-interview", [213])],
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

export const U08_ITEMS: KnowledgeItem[] = [...conjugations, ...phrases, ...nouns, ...adjectives, ...frames, ...errors];
