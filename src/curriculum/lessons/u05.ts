/** Unit 5 lessons (and the review / world sections that follow it), in book order, plus their tip cards. */
import type { AulaStep } from "../aulas.ts";
import type { Lesson } from "../schema.ts";

const pav = (pages: number[], concept: string) => ({ sourceId: "pav1-student" as const, unit: "u05", pages, concept });
const ids = (prefix: string, ...slugs: string[]) => slugs.map((s) => `${prefix}.${s}`);
const ph = (...s: string[]) => ids("function.u05", ...s);
const nouns = (...s: string[]) => ids("vocab.noun", ...s);
const adjs = (...s: string[]) => ids("vocab.adjective", ...s);
const frames = (...s: string[]) => ids("grammar.frame", ...s);
const errors = (...s: string[]) => ids("grammar.error", ...s);
const persons = (verb: string, ...p: string[]) => p.map((x) => `grammar.${verb}.${x}`);
const ALL = ["eu", "tu", "ele", "nos", "eles"];

export const U05_LESSONS: Lesson[] = [
  {
    id: "u05.tempo",
    unit: "u05",
    title: "Está sol! — o tempo",
    source: pav([116, 117, 119], "weather"),
    itemIds: [
      ...ph("como_esta_tempo", "esta_sol", "esta_calor", "esta_frio", "esta_a_chover", "esta_a_nevar", "esta_vento", "ceu_nublado"),
      ...nouns("vento", "calor", "frio", "ceu"),
      ...adjs("nublado", "solarengo", "seco", "molhado"),
      ...frames("esta_sol", "muito_calor"),
      ...errors("e_calor", "muita_frio"),
    ],
    canDo: ["cd14.weather-clothes", "cd22.listen-clear"],
  },
  {
    id: "u05.ir_infinitivo",
    unit: "u05",
    title: "Amanhã vou viajar — ir + infinitivo",
    source: pav([116, 117, 118, 136], "ir-infinitivo"),
    itemIds: [
      ...ALL.map((p) => `grammar.viajar.ir_futuro.${p}`),
      ...ALL.map((p) => `grammar.fazer.ir_futuro.${p}`),
      ...ph("como_vai_estar", "vai_chover", "vai_estar_sol", "o_que_vais_fazer"),
      ...frames("vou_viajar", "vais_fazer", "vao_fazer", "vai_chover"),
      ...errors("vou_viajo", "nos_vai"),
    ],
    canDo: ["cd15.future-plans", "cd14.weather-clothes"],
  },
  {
    id: "u05.estacoes_meses",
    unit: "u05",
    title: "No inverno, em janeiro — estações e meses",
    source: pav([119, 120, 121, 136], "seasons-months"),
    itemIds: [
      ...nouns("primavera", "verao", "outono", "inverno"),
      ...ph("janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"),
      ...frames("em_agosto", "no_inverno", "tao_como"),
      ...errors("no_marco"),
    ],
    canDo: ["cd14.weather-clothes", "cd07.numbers-prices"],
  },
  {
    id: "u05.roupa_cores",
    unit: "u05",
    title: "De que cor é a saia? — roupa e cores",
    source: pav([122, 123, 124], "clothes-colours"),
    itemIds: [
      ...nouns("vestido", "saia", "bota", "sandalia", "camisa", "luva", "biquini", "bone"),
      ...adjs("vermelho", "branco", "preto", "amarelo", "verde", "azul", "castanho", "cinzento"),
      ...frames("saia_vermelha", "tenis_azuis", "tem_vestido"),
      ...errors("camisa_branco"),
    ],
    canDo: ["cd14.weather-clothes", "cd05.family-describe"],
  },
  {
    id: "u05.compras_roupa",
    unit: "u05",
    title: "Posso experimentar? — comprar roupa",
    source: pav([128, 129, 130], "shopping-clothes"),
    itemIds: [
      ...ph("queria_ver", "que_tamanho", "que_numero", "posso_experimentar", "provador", "tem_noutra_cor", "estou_so_a_ver"),
      ...persons("experimentar.estar_a", "eu", "tu", "ele"),
      "grammar.procurar.estar_a.nos",
      ...adjs("largo", "apertado", "cor_de_rosa", "cor_de_laranja", "roxo"),
      ...frames("estou_a_experimentar", "estamos_a_procurar", "apertadas"),
      ...errors("estou_de"),
    ],
    canDo: ["cd10.buy-pay", "cd14.weather-clothes"],
  },
  {
    id: "u05.dar_fazer_trazer_por",
    unit: "u05",
    title: "Faço, trago, ponho — dar, fazer, trazer, pôr",
    source: pav([129, 130, 136], "verbs-irregular-dar-fazer-trazer-por"),
    itemIds: [
      ...persons("dar", "eu", "tu", "eles"),
      ...persons("fazer", "eu", "ele", "nos"),
      ...persons("trazer", "eu", "tu", "ele"),
      ...persons("por", ...ALL),
      ...frames("faco", "ponho", "trazes", "poem"),
      ...errors("fazo", "trazo"),
    ],
    canDo: ["cd06.routines", "cd23.speak-short"],
  },
  {
    id: "u05.tempos_livres",
    unit: "u05",
    title: "Sabes nadar? — saber, conhecer, há e desde",
    source: pav([124, 125, 127, 131, 133, 135], "saber-conhecer-ha-desde"),
    itemIds: [
      ...ph("sabes_nadar", "nao_sei_esquiar", "conheces_evora", "nao_consigo_dormir", "podes_vir", "faco_surf_desde", "ha_quanto_tempo", "moro_ha"),
      ...frames("conheces", "sabes", "consigo", "ha"),
      ...errors("sabes_ana", "desde_tres"),
      "pron.u05.caro_carro",
      "pron.u05.moro_morro",
    ],
    canDo: ["cd06.routines", "cd17.invitations"],
  },
];

export const U05_AULAS: Record<string, AulaStep[]> = {
  "u05.tempo": [
    { kind: "title", big: "Como está o tempo?", small: "O tempo: sol, chuva, frio, calor", say: "Como está o tempo?", ms: 3800 },
    { kind: "table", kicker: "ESTÁ + TEMPO", rows: [["☀️ Está sol.", "it's sunny"], ["🥵 Está calor.", "it's hot"], ["🥶 Está frio.", "it's cold"], ["🌬️ Está vento.", "it's windy"], ["☁️ Está nublado.", "it's cloudy"]], note: "Em português, o tempo usa ESTAR: está sol, está frio.", say: "Está sol. Está calor. Está frio. Está vento.", ms: 8000 },
    { kind: "rule", kicker: "AGORA", big: "Está a chover! Está a nevar!", note: "Chuva e neve a cair agora: estar a + infinitivo.", say: "Está a chover. Está a nevar.", ms: 6000 },
    { kind: "rule", kicker: "MUITO", big: "Está muito calor · muito frio", note: "o calor, o frio: masculino → muito (nunca “muita”).", say: "Está muito calor. Está muito frio.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.esta_sol", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.muito_calor", ms: 7000 },
    { kind: "summary", rows: [["sol · calor · frio · vento", "Está…"], ["chover · nevar", "Está a…"], ["o céu", "está nublado / limpo"]], ms: 5000 },
  ],
  "u05.ir_infinitivo": [
    { kind: "title", big: "Amanhã vou viajar!", small: "IR + infinitivo: planos para o futuro", say: "Amanhã vou viajar.", ms: 3800 },
    { kind: "table", kicker: "IR + INFINITIVO", rows: [["eu", "vou viajar"], ["tu", "vais viajar"], ["ele · ela · você", "vai viajar"], ["nós", "vamos viajar"], ["eles · elas · vocês", "vão viajar"]], note: "Só o verbo IR muda. O segundo verbo fica no infinitivo.", say: "Vou viajar, vais viajar, vai viajar, vamos viajar, vão viajar.", ms: 8000 },
    { kind: "example", kicker: "HÁBITO vs PLANO", big: "Normalmente fico em casa, mas amanhã vou sair.", note: "normalmente → Presente · amanhã → ir + infinitivo", emoji: "📅", say: "Normalmente fico em casa, mas amanhã vou sair.", ms: 7000 },
    { kind: "rule", kicker: "O TEMPO AMANHÃ", big: "Amanhã vai chover.", note: "Como vai estar o tempo? Vai estar sol. Vai chover.", say: "Como vai estar o tempo amanhã? Vai chover.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.vou_viajar", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.vao_fazer", ms: 7000 },
    { kind: "summary", rows: [["eu / tu", "vou / vais + inf."], ["ele · ela", "vai + inf."], ["nós / eles", "vamos / vão + inf."]], ms: 5000 },
  ],
  "u05.estacoes_meses": [
    { kind: "title", big: "No inverno, em janeiro", small: "As estações e os meses", say: "No inverno, em janeiro.", ms: 3800 },
    { kind: "table", kicker: "AS ESTAÇÕES", rows: [["🌷 a primavera", "na primavera"], ["🏖️ o verão", "no verão"], ["🍂 o outono", "no outono"], ["⛄ o inverno", "no inverno"]], note: "Estações: em + artigo → no / na.", say: "Na primavera, no verão, no outono, no inverno.", ms: 8000 },
    { kind: "table", kicker: "OS MESES", rows: [["janeiro · fevereiro · março", "em janeiro"], ["abril · maio · junho", "em maio"], ["julho · agosto · setembro", "em agosto"], ["outubro · novembro · dezembro", "em dezembro"]], note: "Meses: em, sem artigo, e com letra minúscula.", say: "Em janeiro, em maio, em agosto, em dezembro.", ms: 8500 },
    { kind: "rule", kicker: "TÃO … COMO", big: "Hoje está tão frio como ontem.", note: "Comparar coisas iguais: tão + adjetivo + como.", say: "Hoje está tão frio como ontem.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.em_agosto", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.no_inverno", ms: 7000 },
    { kind: "summary", rows: [["meses", "em março"], ["estações", "no verão · na primavera"], ["igual", "tão … como"]], ms: 5000 },
  ],
  "u05.roupa_cores": [
    { kind: "title", big: "De que cor é?", small: "A roupa e as cores", say: "De que cor é a saia?", ms: 3800 },
    { kind: "table", kicker: "AS CORES CONCORDAM", rows: [["o vestido vermelho", "a saia vermelha"], ["o casaco branco", "a camisa branca"], ["os ténis pretos", "as botas pretas"], ["verde · azul", "iguais m./f. → verdes · azuis"]], note: "A cor concorda com a roupa: masculino / feminino, singular / plural.", say: "O vestido vermelho. A saia vermelha. As botas pretas.", ms: 8500 },
    { kind: "rule", kicker: "TER VESTIDO", big: "A Ana tem vestido um casaco azul.", note: "ter vestido = estar com esta roupa agora. “Vestido” não muda.", say: "A Ana tem vestido um casaco azul.", ms: 6500 },
    { kind: "example", kicker: "PERGUNTAR", big: "De que cor é o casaco? · De que cor são as botas?", note: "é (uma peça) · são (várias)", emoji: "🎨", say: "De que cor é o casaco? De que cor são as botas?", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.saia_vermelha", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.tenis_azuis", ms: 7000 },
    { kind: "summary", rows: [["-o → -a", "vermelho · vermelha"], ["-e / -l", "verde · azul (iguais)"], ["plural", "verdes · azuis"]], ms: 5000 },
  ],
  "u05.compras_roupa": [
    { kind: "title", big: "Posso experimentar?", small: "Comprar roupa e sapatos", say: "Posso experimentar?", ms: 3800 },
    { kind: "table", kicker: "NA LOJA", rows: [["Que tamanho veste?", "roupa: S, M, 38, 40…"], ["Que número calça?", "sapatos: 37, 42…"], ["Posso experimentar?", "can I try it on?"], ["Tem noutra cor?", "another colour?"], ["Estou só a ver.", "just looking"]], say: "Que tamanho veste? Que número calça? Posso experimentar?", ms: 8500 },
    { kind: "rule", kicker: "ESTAR A + INFINITIVO", big: "Estou a experimentar as calças.", note: "Uma ação agora, neste momento. Em Portugal: estar a + infinitivo.", say: "Estou a experimentar as calças.", ms: 6500 },
    { kind: "rule", kicker: "NÃO SERVE", big: "Está apertado · Está largo", note: "Roupa pequena demais: apertada. Grande demais: larga.", say: "Está apertado. Está largo.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.estou_a_experimentar", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.apertadas", ms: 7000 },
    { kind: "summary", rows: [["tamanho", "roupa"], ["número", "sapatos"], ["agora", "estou a + infinitivo"]], ms: 5000 },
  ],
  "u05.dar_fazer_trazer_por": [
    { kind: "title", big: "Faço · trago · ponho", small: "Verbos irregulares: dar, fazer, trazer, pôr", say: "Faço, trago, ponho.", ms: 3800 },
    { kind: "table", kicker: "IRREGULARES", rows: [["dar", "dou · dás · dá · damos · dão"], ["fazer", "faço · fazes · faz · fazemos · fazem"], ["trazer", "trago · trazes · traz · trazemos · trazem"], ["pôr", "ponho · pões · põe · pomos · põem"]], note: "Atenção ao eu: dou, faço, trago, ponho.", say: "Dou, faço, trago, ponho.", ms: 9000 },
    { kind: "rule", kicker: "SEM -E", big: "Ele faz · Ele traz", note: "fazer e trazer perdem o -e no ele/ela: faz, traz.", say: "Ele faz. Ele traz.", ms: 6000 },
    { kind: "example", kicker: "PÔR A ROUPA", big: "Está frio: ponho o cachecol.", note: "pôr = to put (on). Pões, põe, põem — com til.", emoji: "🧣", say: "Está frio: ponho o cachecol.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.faco", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.ponho", ms: 7000 },
    { kind: "summary", rows: [["eu", "dou · faço · trago · ponho"], ["ele · ela", "dá · faz · traz · põe"], ["eles", "dão · fazem · trazem · põem"]], ms: 5000 },
  ],
  "u05.tempos_livres": [
    { kind: "title", big: "Sabes nadar?", small: "Saber, conhecer, conseguir · há e desde", say: "Sabes nadar?", ms: 3800 },
    { kind: "table", kicker: "QUAL É O VERBO?", rows: [["conhecer", "pessoas e lugares: conheces Évora?"], ["saber", "factos e capacidades: sei nadar"], ["conseguir", "ser capaz agora: não consigo dormir"], ["poder", "possibilidade: podes vir no sábado?"]], say: "Conheces Évora? Sei nadar. Não consigo dormir. Podes vir?", ms: 9000 },
    { kind: "table", kicker: "HÁ vs DESDE", rows: [["há + período", "moro aqui há três anos"], ["desde + momento", "faço surf desde 2019"], ["pergunta", "Há quanto tempo…?"]], say: "Moro aqui há três anos. Faço surf desde 2019.", ms: 8000 },
    { kind: "check", itemId: "grammar.frame.conheces", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.ha", ms: 7000 },
    { kind: "summary", rows: [["pessoas / lugares", "conhecer"], ["capacidade", "saber"], ["há / desde", "período / momento"]], ms: 5000 },
  ],
};
