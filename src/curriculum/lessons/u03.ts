/** Unit 3 lessons (and the review / world sections that follow it), in book order, plus their tip cards. */
import type { AulaStep } from "../aulas.ts";
import type { Lesson } from "../schema.ts";

const pav = (pages: number[], concept: string) => ({ sourceId: "pav1-student" as const, unit: "u03", pages, concept });
const P = ["eu", "tu", "ele", "nos", "eles"] as const;
const verbIds = (slug: string, persons: readonly string[] = P) => persons.map((p) => `grammar.${slug}.${p}`);
const nouns = (...s: string[]) => s.map((x) => `vocab.noun.${x}`);
const fn = (...s: string[]) => s.map((x) => `function.u03.${x}`);
const frames = (...s: string[]) => s.map((x) => `grammar.frame.${x}`);
const errors = (...s: string[]) => s.map((x) => `grammar.error.${x}`);

export const U03_LESSONS: Lesson[] = [
  {
    id: "u03.refeicoes",
    unit: "u03",
    title: "Ao pequeno-almoço — refeições e comida",
    source: pav([64, 65, 66], "meals-food-habits"),
    itemIds: [
      ...nouns("pequeno_almoco", "almoco", "lanche", "jantar", "massa", "batata_frita", "mel", "legume"),
      "vocab.adjective.doce",
      "vocab.adjective.salgado",
      ...verbIds("costumar"),
      ...frames("costumo_almocar", "costumam_jantar", "de_manha_cafe"),
      ...errors("costumo_almocar", "de_manha"),
    ],
    canDo: ["cd09.order-food", "cd06.routines"],
  },
  {
    id: "u03.restaurante",
    unit: "u03",
    title: "Queria um galão, por favor — no restaurante",
    source: pav([64, 68, 69, 70], "restaurant-ordering"),
    itemIds: [
      ...fn("vamos_almocar", "queriamos_mesa", "trazer_ementa", "queria_galao", "para_beber", "prato_do_dia", "a_conta", "bom_apetite"),
      ...nouns("restaurante", "ementa", "conta", "sobremesa", "refrigerante", "colher"),
      ...frames("queria_cafe", "queriamos_menus", "e_para_beber"),
      ...errors("queria_sopa", "uma_garrafa"),
    ],
    canDo: ["cd09.order-food", "cd10.buy-pay", "cd03.greet-polite"],
  },
  {
    id: "u03.horas",
    unit: "u03",
    title: "Que horas são? — as horas e os dias",
    source: pav([70, 71, 73, 84], "telling-time-days"),
    itemIds: [
      ...fn("que_horas", "e_uma_hora", "meio_dia", "e_um_quarto", "e_meia", "menos_vinte"),
      ...fn("segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo", "fim_de_semana"),
      ...frames("e_uma_hora", "as_nove", "ao_meio_dia", "aos_sabados", "na_segunda"),
      ...errors("e_uma_hora"),
    ],
    canDo: ["cd08.time", "cd07.numbers-prices"],
  },
  {
    id: "u03.verbos_ir",
    unit: "u03",
    title: "Decido, preferes, parte — verbos em -ir",
    source: pav([74, 83], "verbs-ir"),
    itemIds: [
      ...verbIds("decidir"),
      ...verbIds("preferir"),
      ...verbIds("partir"),
      ...frames("eu_decido", "tu_preferes", "nos_partimos"),
      ...errors("prefiro", "partimos"),
    ],
    canDo: ["cd06.routines", "cd09.order-food"],
  },
  {
    id: "u03.rotina",
    unit: "u03",
    title: "Levanto-me às sete — a rotina e os verbos reflexos",
    source: pav([72, 74, 76, 83], "reflexive-verbs-routine"),
    itemIds: [
      ...verbIds("levantarse"),
      ...verbIds("deitarse"),
      ...verbIds("vestirse", ["eu", "ele", "nos"]),
      ...frames("levanto_me", "nao_me_levanto", "deitamo_nos", "a_que_horas_te_deitas"),
      ...errors("nao_me_deito", "levantamo_nos"),
    ],
    canDo: ["cd06.routines", "cd08.time"],
  },
  {
    id: "u03.ver_ler_ouvir",
    unit: "u03",
    title: "Vejo, leio, ouço — verbos irregulares",
    source: pav([75, 84], "irregular-ver-ler-ouvir"),
    itemIds: [
      ...verbIds("ver"),
      ...verbIds("ler"),
      ...verbIds("ouvir"),
      ...frames("vemos_televisao", "eu_leio", "ouco_musica"),
      ...errors("ouco", "veem"),
    ],
    canDo: ["cd06.routines"],
  },
  {
    id: "u03.tempos_livres",
    unit: "u03",
    title: "Vamos ao cinema? — ir, sair e tempos livres",
    source: pav([75, 78, 79, 84], "leisure-invitations"),
    itemIds: [
      ...verbIds("ir"),
      ...verbIds("sair"),
      ...nouns("ginasio", "parque", "concerto"),
      ...fn("queres_ir", "boa_ideia", "nao_posso"),
      ...frames("vou_ao_cinema", "vamos_a_praia", "ela_sai", "eles_vao_ginasio"),
    ],
    canDo: ["cd06.routines", "cd17.invitations"],
  },
];

export const U03_AULAS: Record<string, AulaStep[]> = {
  "u03.refeicoes": [
    { kind: "title", big: "Ao pequeno-almoço", small: "As refeições e a comida", say: "O pequeno-almoço, o almoço, o lanche e o jantar.", ms: 3800 },
    { kind: "table", kicker: "AS REFEIÇÕES", rows: [["🌅 de manhã", "o pequeno-almoço"], ["🕐 12h–14h", "o almoço"], ["☕ à tarde", "o lanche"], ["🌙 à noite", "o jantar"]], note: "Verbos: tomar o pequeno-almoço · almoçar · lanchar · jantar", say: "De manhã, tomamos o pequeno-almoço. À noite, jantamos.", ms: 8000 },
    { kind: "table", kicker: "PARTES DO DIA", rows: [["de manhã", "in the morning"], ["à tarde / de tarde", "in the afternoon"], ["à noite / de noite", "in the evening / at night"]], say: "De manhã. À tarde. À noite.", ms: 6500 },
    { kind: "rule", kicker: "HÁBITOS", big: "Costumo almoçar em casa.", note: "costumar + infinitivo = o que fazes normalmente (I usually…).", say: "Costumo almoçar em casa.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.costumo_almocar", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.de_manha_cafe", ms: 7000 },
    { kind: "summary", rows: [["refeições", "pequeno-almoço · almoço · lanche · jantar"], ["hábito", "costumo + infinitivo"], ["manhã", "de manhã"]], ms: 5000 },
  ],
  "u03.restaurante": [
    { kind: "title", big: "Queria um galão!", small: "Pedir no café e no restaurante", say: "Queria um galão, por favor.", ms: 3800 },
    { kind: "table", kicker: "PEDIR COM DELICADEZA", rows: [["Queria…, por favor.", "I'd like… (eu)"], ["Queríamos…, por favor.", "we'd like… (nós)"], ["Pode trazer a ementa?", "could you bring the menu?"], ["A conta, por favor.", "the bill, please"]], note: "“Queria” é mais educado do que “quero”.", say: "Queria um café, por favor. Queríamos dois menus do dia.", ms: 8500 },
    { kind: "table", kicker: "O EMPREGADO PERGUNTA", rows: [["Já estão atendidos?", "have you been served?"], ["E para beber?", "and to drink?"], ["Mais alguma coisa?", "anything else?"]], say: "E para beber? Mais alguma coisa?", ms: 7000 },
    { kind: "example", kicker: "NA MESA", big: "Qual é o prato do dia?", note: "o prato do dia / o menu do dia = refeição completa a bom preço", emoji: "🍲", say: "Qual é o prato do dia?", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.queria_cafe", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.queriamos_menus", ms: 7000 },
    { kind: "summary", rows: [["eu", "Queria…"], ["nós", "Queríamos…"], ["no fim", "A conta, por favor."]], ms: 5000 },
  ],
  "u03.horas": [
    { kind: "title", big: "Que horas são?", small: "As horas e os dias da semana", say: "Que horas são?", ms: 3800 },
    { kind: "table", kicker: "DIZER AS HORAS", rows: [["É uma hora.", "1:00"], ["É meio-dia / meia-noite.", "12:00"], ["São duas horas.", "2:00"], ["São oito e um quarto.", "8:15"], ["São três e meia.", "3:30"], ["São onze menos vinte.", "10:40"]], note: "1h, meio-dia e meia-noite → É. As outras → São.", say: "É uma hora. São duas horas. São três e meia.", ms: 9000 },
    { kind: "table", kicker: "A QUE HORAS?", rows: [["à uma hora", "a + a"], ["às duas horas", "a + as"], ["ao meio-dia", "a + o"]], say: "À uma. Às duas. Ao meio-dia.", ms: 7000 },
    { kind: "table", kicker: "OS DIAS", rows: [["na segunda-feira", "this Monday (uma vez)"], ["às segundas-feiras", "on Mondays (hábito)"], ["no sábado", "this Saturday"], ["aos sábados", "on Saturdays"]], note: "segunda, terça, quarta, quinta, sexta(-feira) · sábado · domingo", say: "Na segunda-feira. Aos sábados.", ms: 8500 },
    { kind: "check", itemId: "grammar.frame.e_uma_hora", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.ao_meio_dia", ms: 7000 },
    { kind: "summary", rows: [["1h", "É uma hora"], ["2h, 3h…", "São … horas"], ["a que horas", "à · às · ao"], ["hábito", "aos sábados"]], ms: 5000 },
  ],
  "u03.verbos_ir": [
    { kind: "title", big: "Decido · preferes", small: "Verbos regulares em -IR", say: "Eu decido. Tu preferes.", ms: 3800 },
    { kind: "table", kicker: "PARTIR", rows: [["eu", "parto"], ["tu", "partes"], ["ele · ela · você", "parte"], ["nós", "partimos"], ["eles · elas · vocês", "partem"]], say: "Parto, partes, parte, partimos, partem.", ms: 8000 },
    { kind: "rule", kicker: "O PADRÃO", big: "-o · -es · -e · -imos · -em", note: "Igual aos verbos em -er, menos o nós: partimos (não “partemos”).", say: "Decido, decides, decide, decidimos, decidem.", ms: 6500 },
    { kind: "rule", kicker: "ATENÇÃO", big: "preferir → eu prefiro", note: "Em preferir, vestir, repetir: e → i só no eu.", say: "Eu prefiro chá.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.tu_preferes", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.nos_partimos", ms: 7000 },
    { kind: "summary", rows: [["eu", "-o (prefiro!)"], ["tu / ele", "-es / -e"], ["nós", "-imos"], ["eles", "-em"]], ms: 5000 },
  ],
  "u03.rotina": [
    { kind: "title", big: "Levanto-me às sete", small: "A rotina: verbos reflexos", say: "Levanto-me às sete.", ms: 3800 },
    { kind: "table", kicker: "LEVANTAR-SE", rows: [["eu", "levanto-me"], ["tu", "levantas-te"], ["ele · ela · você", "levanta-se"], ["nós", "levantamo-nos"], ["eles · elas · vocês", "levantam-se"]], note: "Também: deitar-se, vestir-se (visto-me), sentar-se.", say: "Levanto-me, levantas-te, levanta-se, levantamo-nos, levantam-se.", ms: 8500 },
    { kind: "rule", kicker: "O PRONOME SALTA", big: "Não me levanto cedo.", note: "Com não, nunca, também, já, só e perguntas (a que horas…), o pronome vem ANTES do verbo.", say: "Não me levanto cedo. A que horas te deitas?", ms: 7000 },
    { kind: "example", kicker: "UM DIA NORMAL", big: "Levanto-me, visto-me e saio.", note: "De manhã levanto-me · à noite deito-me", emoji: "⏰", say: "Levanto-me, visto-me e saio de casa.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.levanto_me", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.nao_me_levanto", ms: 7000 },
    { kind: "summary", rows: [["eu", "levanto-me"], ["nós", "levantamo-nos"], ["com não", "não me levanto"]], ms: 5000 },
  ],
  "u03.ver_ler_ouvir": [
    { kind: "title", big: "Vejo · leio · ouço", small: "Três verbos irregulares", say: "Vejo, leio, ouço.", ms: 3800 },
    { kind: "table", kicker: "VER · LER · OUVIR", rows: [["eu", "vejo · leio · ouço"], ["tu", "vês · lês · ouves"], ["ele · ela", "vê · lê · ouve"], ["nós", "vemos · lemos · ouvimos"], ["eles · elas", "veem · leem · ouvem"]], say: "Eu vejo, eu leio, eu ouço.", ms: 9000 },
    { kind: "rule", kicker: "NÃO CONFUNDIR", big: "eles veem ≠ eles vêm", note: "veem = ver (watch) · vêm = vir (come)", say: "Eles veem um filme. Eles vêm de autocarro.", ms: 6500 },
    { kind: "example", big: "À noite, vemos televisão.", note: "ver televisão · ler o jornal · ouvir música", emoji: "📺", say: "À noite, vemos televisão.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.ouco_musica", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.vemos_televisao", ms: 7000 },
    { kind: "summary", rows: [["ver", "vejo"], ["ler", "leio"], ["ouvir", "ouço"], ["eles", "veem · leem · ouvem"]], ms: 5000 },
  ],
  "u03.tempos_livres": [
    { kind: "title", big: "Vamos ao cinema?", small: "Ir, sair e os tempos livres", say: "Vamos ao cinema?", ms: 3800 },
    { kind: "table", kicker: "IR · SAIR", rows: [["eu", "vou · saio"], ["tu", "vais · sais"], ["ele · ela", "vai · sai"], ["nós", "vamos · saímos"], ["eles · elas", "vão · saem"]], say: "Vou, vais, vai, vamos, vão. Saio, sais, sai, saímos, saem.", ms: 9000 },
    { kind: "merge", a: "a", b: "o", result: "ao", example: "o cinema → Vou ao cinema.", emoji: "🎬", say: "Vou ao cinema.", ms: 5200 },
    { kind: "merge", a: "a", b: "a", result: "à", example: "a praia → Vamos à praia.", emoji: "🏖️", say: "Vamos à praia.", ms: 5200 },
    { kind: "table", kicker: "CONVITES", rows: [["Queres ir ao cinema?", "invite"], ["Boa ideia! Vamos!", "accept"], ["Desculpa, hoje não posso.", "refuse"]], say: "Queres ir ao cinema? Boa ideia! Desculpa, hoje não posso.", ms: 7500 },
    { kind: "check", itemId: "grammar.frame.vou_ao_cinema", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.vamos_a_praia", ms: 7000 },
    { kind: "summary", rows: [["a + o", "ao"], ["a + a", "à"], ["ir", "vou · vamos · vão"], ["sair", "saio · saímos"]], ms: 5000 },
  ],
};
