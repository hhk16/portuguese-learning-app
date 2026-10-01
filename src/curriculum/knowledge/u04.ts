/**
 * Unit 4 — "A vossa casa fica longe?" (Livro do Aluno pp. 85–103; Caderno Unidade 4 pp. 40–51),
 * plus Ponto da Situação 2 (pp. 104–109), O Mundo do Trabalho 2 (pp. 110–111) and
 * O Mundo do Português 2 — Brasil (pp. 112–114).
 * Transport and tickets, directions in the city, the house and its furniture, comparatives,
 * shops and prices (numbers to 1000), vir / ficar / poder / querer / saber / dizer, estar a + infinitivo.
 * Original wording; paradigms and word lists are facts of the language, organised as in the book.
 */
import type { KnowledgeItem, Person, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u04", pages, concept });
const cad = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-caderno", unit: "u04", pages, concept });
const pds = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "pds2", pages, concept });
const trab = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "trab2", pages, concept });
const mundo = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "mundo2", pages, concept });

/* -------------------------------------------- Nouns -------------------------------------------- */

type Cat = "casa" | "lugar" | "objeto" | "tempo" | "animal" | "lazer" | "transporte";
type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: Cat, source: Source];
const NOUNS: N[] = [
  // Divisões da casa (pp. 91, 93)
  ["cozinha", "a", "cozinha", "kitchen", "🥘", "casa", src("house-rooms", [91, 93])],
  ["sala", "a", "sala", "living room", "🖼️", "casa", src("house-rooms", [91, 93])],
  ["quarto", "o", "quarto", "bedroom", "😴", "casa", src("house-rooms", [91, 93])],
  ["casa_de_banho", "a", "casa de banho", "bathroom", "🛁", "casa", src("house-rooms", [91, 93])],
  ["varanda", "a", "varanda", "balcony", "🪴", "casa", src("house-rooms", [91])],
  ["escritorio", "o", "escritório", "study / office", "💼", "casa", src("house-rooms", [93])],
  // Mobiliário e eletrodomésticos (p. 93)
  ["frigorifico", "o", "frigorífico", "fridge", "🧊", "casa", src("furniture-appliances", [93])],
  ["candeeiro", "o", "candeeiro", "lamp", "💡", "casa", cad("house-city", [41])],
  ["espelho", "o", "espelho", "mirror", "🪞", "casa", src("furniture-appliances", [93])],
  // Casa e bairro (p. 92)
  ["predio", "o", "prédio", "block of flats / building", "🏢", "lugar", src("housing-neighbourhood", [92])],
  ["apartamento", "o", "apartamento", "flat / apartment", "🏘️", "casa", src("housing-neighbourhood", [92, 93])],
  ["jardim", "o", "jardim", "garden / park", "🌿", "lugar", src("housing-neighbourhood", [92])],
  // Na cidade (p. 90)
  ["rua", "a", "rua", "street", "🏙️", "lugar", src("in-the-city", [90])],
  ["praca", "a", "praça", "square", "⛲", "lugar", src("in-the-city", [90])],
  ["semaforo", "o", "semáforo", "traffic lights", "🚦", "lugar", src("in-the-city", [90])],
  ["passadeira", "a", "passadeira", "zebra crossing", "🚸", "lugar", src("in-the-city", [90])],
  ["paragem", "a", "paragem", "bus stop", "🚏", "transporte", src("in-the-city", [90])],
  // Bilhetes (pp. 89–90)
  ["bilhete", "o", "bilhete", "ticket", "🎫", "objeto", src("station-tickets", [89, 90])],
  // Lojas e serviços (p. 95)
  ["livraria", "a", "livraria", "bookshop", "📚", "lugar", src("shops-services", [95])],
  ["padaria", "a", "padaria", "bakery", "🥖", "lugar", src("shops-services", [102])],
  ["talho", "o", "talho", "butcher's", "🍖", "lugar", src("shops-services", [95])],
  ["banco", "o", "banco", "bank", "💰", "lugar", src("shops-services", [95])],
  ["papelaria", "a", "papelaria", "stationer's / newsagent's", "📰", "lugar", src("shops-services", [95])],
  // O Mundo do Trabalho 2 (p. 110)
  ["reuniao", "a", "reunião", "meeting", "🤝", "tempo", trab("work-agenda", [110])],
  ["agenda", "a", "agenda", "diary / planner", "📅", "objeto", trab("work-agenda", [110])],
  ["relatorio", "o", "relatório", "report", "📊", "objeto", trab("work-agenda", [110])],
  // O Mundo do Português 2 — Brasil (pp. 112–113)
  ["papagaio", "o", "papagaio", "parrot", "🦜", "animal", mundo("brazil-culture", [112, 113])],
  ["samba", "o", "samba", "samba", "🥁", "lazer", mundo("brazil-culture", [113])],
  ["carnaval", "o", "carnaval", "carnival", "🎉", "lazer", mundo("brazil-culture", [113])],
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

/* ---------------------------------- Adjectives (describing places) ---------------------------------- */

type A = [slug: string, m: string, f: string, en: string, emoji: string, opposite: string];
const ADJ: A[] = [
  ["moderno", "moderno", "moderna", "modern", "📱", "antigo"],
  ["antigo", "antigo", "antiga", "old (historic)", "🏰", "moderno"],
  ["claro", "claro", "clara", "bright / light", "☀️", "escuro"],
  ["escuro", "escuro", "escura", "dark", "🌙", "claro"],
];
const adjectives: KnowledgeItem[] = ADJ.map(([slug, m, f, en, emoji, opposite]) => ({
  id: `vocab.adjective.${slug}`,
  kind: "adjective",
  m,
  f,
  en,
  emoji,
  // Linked both ways (Batata Quente's "o contrário de…"; a dial once things.ts has clues for it).
  opposite: `vocab.adjective.${opposite}`,
  why: `${m} (m.) · ${f} (f.) — contrário: ${opposite}`,
  source: src("describe-compare-places", [92, 94]),
}));

/* --------------------------------------------- Phrases --------------------------------------------- */

type Fn = "question" | "answer" | "statement" | "order" | "opinion" | "plan" | "direction";
type Ph = [id: string, pt: string, en: string, fn: Fn, situation: string, source: Source];
const PHRASES: Ph[] = [
  // Convite, casa e transportes (pp. 86–89)
  ["u04.queres_vir", "Queres vir connosco ao concerto?", "Do you want to come to the concert with us?", "question", "🎤", src("invite-event", [86])],
  ["u04.como_vens", "Como é que vens para a universidade?", "How do you get to university?", "question", "🚌", src("transport", [86])],
  ["u04.venho_a_pe", "Venho a pé. São só dez minutos.", "I come on foot. It's only ten minutes.", "answer", "🚶", src("transport", [86, 89])],
  // Bilhetes (pp. 89–90)
  ["u04.queriamos_bilhetes", "Queríamos dois bilhetes para o Porto.", "We'd like two tickets to Porto.", "order", "🎫", src("station-tickets", [90])],
  ["u04.ida_e_volta", "Só de ida ou de ida e volta?", "One-way or return?", "question", "🔁", src("station-tickets", [90])],
  ["u04.a_que_horas_parte", "A que horas parte o comboio?", "What time does the train leave?", "question", "🚂", src("station-tickets", [89])],
  // Direções (pp. 90–91)
  ["u04.podia_dizer_caminho", "Desculpe, podia dizer-me o caminho para a estação?", "Excuse me, could you tell me the way to the station?", "direction", "🗺️", src("directions", [91])],
  ["u04.segue_em_frente", "Segue sempre em frente.", "Keep going straight on.", "direction", "⬆️", src("directions", [90])],
  ["u04.vira_esquerda", "Vira à esquerda.", "Turn left.", "direction", "⬅️", src("directions", [90])],
  ["u04.vira_direita", "Vira na primeira rua à direita.", "Take the first street on the right.", "direction", "➡️", src("directions", [90])],
  ["u04.atravessa", "Atravessa a rua na passadeira.", "Cross the street at the zebra crossing.", "direction", "🚸", src("directions", [90])],
  ["u04.fica_longe", "A tua casa fica longe?", "Is your house far away?", "question", "🏠", src("location-ficar", [86])],
  // A casa (pp. 92–93)
  ["u04.segundo_andar", "Moro no segundo andar.", "I live on the second floor.", "statement", "🏢", src("housing-neighbourhood", [92])],
  ["u04.arrenda_se", "Arrenda-se apartamento T2.", "Two-bedroom flat to let.", "statement", "🔑", src("rental-ads", [93])],
  ["u04.mobilado", "O apartamento é mobilado.", "The flat is furnished.", "statement", "🛋️", src("rental-ads", [93])],
  // Opinião (p. 90)
  ["u04.nao_achas", "É melhor, não achas?", "It's better, don't you think?", "opinion", "🤔", src("opinion", [90])],
  // Lojas (pp. 95–96)
  ["u04.quanto_custa", "Quanto custa?", "How much does it cost?", "question", "💶", src("shops-requests", [96])],
  ["u04.posso_pagar_cartao", "Posso pagar com cartão?", "Can I pay by card?", "question", "💳", src("shops-requests", [96])],
  ["u04.queria_marcar", "Queria marcar uma hora, por favor.", "I'd like to book an appointment, please.", "order", "💇", src("shops-requests", [96])],
  // O Mundo do Trabalho 2 (pp. 110–111)
  ["trab2.reuniao_as_nove", "Na segunda-feira tenho uma reunião às nove.", "On Monday I have a meeting at nine.", "statement", "🤝", trab("work-agenda", [110])],
  ["trab2.responder_emails", "Tenho de responder aos e-mails.", "I have to answer the emails.", "statement", "💻", trab("work-agenda", [110, 111])],
  ["trab2.nao_tenho_de", "Não tenho de trabalhar ao fim de semana.", "I don't have to work at the weekend.", "statement", "😌", trab("ter-de-costumar", [111])],
  ["trab2.costumo_metro", "Costumo ir para o trabalho de metro.", "I usually go to work by metro.", "statement", "🚇", trab("ter-de-costumar", [111])],
  ["trab2.marcar_reuniao", "Podemos marcar uma reunião para terça-feira?", "Can we set up a meeting for Tuesday?", "question", "📅", trab("work-agenda", [110])],
  // O Mundo do Português 2 — Brasil (pp. 112–114)
  ["mundo2.maior_pais", "O Brasil é o maior país da América do Sul.", "Brazil is the largest country in South America.", "statement", "🇧🇷", mundo("brazil-geography", [112])],
  ["mundo2.capital", "A capital do Brasil é Brasília.", "The capital of Brazil is Brasília.", "statement", "🏛️", mundo("brazil-geography", [113])],
  ["mundo2.fronteira", "O Brasil faz fronteira com dez países.", "Brazil borders ten countries.", "statement", "🗺️", mundo("brazil-geography", [112])],
  ["mundo2.voce_gosta", "Você gosta de dançar?", "Do you like dancing? (Brazil: você instead of tu)", "question", "💃", mundo("pe-pb-grammar", [114])],
  ["mundo2.talho_acougue", "o talho · o açougue (BR)", "butcher's (Portugal · Brazil)", "statement", "🍖", mundo("pe-pb-vocabulary", [114])],
  ["mundo2.tshirt_camiseta", "a T-shirt · a camiseta (BR)", "T-shirt (Portugal · Brazil)", "statement", "👕", mundo("pe-pb-vocabulary", [114])],
  ["mundo2.aguardente_cachaca", "a aguardente · a cachaça (BR)", "spirit / firewater (Portugal · Brazil)", "statement", "🥃", mundo("pe-pb-vocabulary", [114])],
];

const phrases: KnowledgeItem[] = PHRASES.map(([id, pt, en, fn, situation, source]) => ({
  id: `function.${id}`,
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
type Five = [string, string, string, string, string];

function verb(slug: string, verbName: string, forms: Five, en: Five, source: Source, whyFor?: Partial<Record<Person, string>>): KnowledgeItem[] {
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
const en3 = (base: string, third: string): Five => [`I ${base}`, `you ${base}`, `he / she ${third}`, `we ${base}`, `they ${base}`];

const verbs: KnowledgeItem[] = [
  ...verb("vir", "vir", ["venho", "vens", "vem", "vimos", "vêm"], en3("come", "comes"), src("irregular-vir", [86, 97, 101]), {
    ele: "ele vem — sem acento.",
    eles: "eles vêm — com acento (≠ veem, de ver).",
  }),
  ...verb("ficar", "ficar", ["fico", "ficas", "fica", "ficamos", "ficam"], ["I stay", "you stay", "he / she / it stays · is (located)", "we stay", "they stay · are (located)"], src("location-ficar", [86, 92]), {
    ele: "Onde fica…? = onde é / onde está (lugares e edifícios).",
  }),
  ...verb("poder", "poder", ["posso", "podes", "pode", "podemos", "podem"], en3("can", "can"), src("irregular-poder-querer-saber", [97, 101]), {
    eu: "poder: eu posso — irregular.",
  }),
  ...verb("querer", "querer", ["quero", "queres", "quer", "queremos", "querem"], en3("want", "wants"), src("irregular-poder-querer-saber", [97, 101]), {
    ele: "ele quer — sem -e no fim.",
  }),
  ...verb("saber", "saber", ["sei", "sabes", "sabe", "sabemos", "sabem"], en3("know", "knows"), src("irregular-poder-querer-saber", [97, 101]), {
    eu: "saber: eu sei — irregular.",
  }),
  ...verb("dizer", "dizer", ["digo", "dizes", "diz", "dizemos", "dizem"], en3("say", "says"), src("irregular-dizer", [97, 101]), {
    eu: "dizer: eu digo.",
    ele: "ele diz — sem -e no fim.",
  }),
];

/** Estar a + infinitivo (ações em curso), ids grammar.<verb>.estar_a.<person>. */
type Prog = [verbSlug: string, verbName: string, person: Person, form: string, en: string];
const PROG: Prog[] = [
  ["fazer", "fazer", "eu", "estou a fazer", "I am doing"],
  ["fazer", "fazer", "tu", "estás a fazer", "you are doing"],
  ["fazer", "fazer", "ele", "está a fazer", "he / she is doing"],
  ["fazer", "fazer", "nos", "estamos a fazer", "we are doing"],
  ["fazer", "fazer", "eles", "estão a fazer", "they are doing"],
  ["preparar", "preparar", "eu", "estou a preparar", "I am preparing"],
  ["ver", "ver", "tu", "estás a ver", "you are watching"],
  ["arrumar", "arrumar", "eles", "estão a arrumar", "they are tidying"],
];
const progressive: KnowledgeItem[] = PROG.map(([slug, verbName, person, form, en]) => ({
  id: `grammar.${slug}.estar_a.${person}`,
  kind: "conjugation",
  verb: verbName,
  tense: "estar_a",
  person,
  form,
  en,
  source: src("estar-a-infinitive", [98, 101]),
  why: "PT-PT: estar a + infinitivo para ações a decorrer agora.",
}));

/* ------------------------------------------ Numbers 200–1000 ------------------------------------------ */

type Num = [value: number, pt: string, fem?: string];
const NUMS: Num[] = [
  [200, "duzentos", "duzentas"],
  [300, "trezentos", "trezentas"],
  [400, "quatrocentos", "quatrocentas"],
  [500, "quinhentos", "quinhentas"],
  [600, "seiscentos", "seiscentas"],
  [700, "setecentos", "setecentas"],
  [800, "oitocentos", "oitocentas"],
  [900, "novecentos", "novecentas"],
  [1000, "mil"],
];
const numbers: KnowledgeItem[] = NUMS.map(([value, pt, fem]) => ({
  id: `vocab.number.n${value}`,
  kind: "number",
  value,
  pt,
  fem,
  source: src("numbers-to-1000", [94, 95]),
  why:
    value === 500
      ? "quinhentos — forma especial (não “cinco centos”)."
      : value === 1000
        ? "mil — não muda: mil euros, mil pessoas."
        : `${pt} / ${fem}: as centenas concordam (duzentos euros, duzentas pessoas).`,
}));

/* --------------------------------------------- Frames --------------------------------------------- */

type Fr = [slug: string, text: string, answer: string, distractors: string[], targets: string[], en: string, why: string, source: Source];
const FRAMES: Fr[] = [
  // Transportes: de / em / a pé · para / a · vir
  ["no_autocarro_24", "Vimos ___ autocarro 24.", "no", ["de", "a", "na"], [], "We come on the number 24 bus.", "Um autocarro específico: no autocarro 24. Qualquer um: de autocarro.", src("transport-prepositions", [89, 102])],
  ["vai_a_pe", "Ela vai ___ pé para a escola.", "a", ["de", "em", "no"], [], "She walks to school.", "a pé (mas de carro, de comboio, de bicicleta)", src("transport-prepositions", [89, 102])],
  ["eles_vem_comboio", "Eles ___ de comboio para Lisboa.", "vêm", ["vem", "veem", "vimos"], ["grammar.vir.eles"], "They come to Lisbon by train.", "vir: eles vêm (com acento)", src("irregular-vir", [101])],
  ["vou_para_casa", "Já é tarde. Vou ___ casa.", "para", ["na", "em", "da"], [], "It's late. I'm going home.", "para = direção (para ficar): vou para casa", src("movement-prepositions", [88, 102])],
  // Direções: ficar · por + artigo · a + artigo
  ["onde_fica_estacao", "Onde ___ a estação de comboios?", "fica", ["ficas", "ficam", "fico"], ["grammar.ficar.ele"], "Where is the train station?", "Para lugares: Onde fica…?", src("location-ficar", [86, 91])],
  ["passa_pela_rua", "Este autocarro passa ___ minha rua.", "pela", ["pelo", "pelas", "ao"], [], "This bus goes along my street.", "por + a = pela (caminho)", src("movement-prepositions", [102])],
  ["ate_ao_semaforo", "Vai até ___ semáforo e vira à direita.", "ao", ["à", "o", "no"], [], "Go up to the traffic lights and turn right.", "até + a + o = até ao", src("directions", [90])],
  ["ficamos_em_casa", "No domingo, nós ___ em casa.", "ficamos", ["ficam", "fica", "fico"], ["grammar.ficar.nos"], "On Sunday we stay at home.", "nós → ficamos", cad("directions", [40])],
  // A casa: há · tem · fica no … andar · na cozinha
  ["ha_um_jardim", "Perto da minha casa, ___ um jardim.", "há", ["é", "são", "está"], [], "Near my house there's a garden.", "Para dizer que existe: há.", src("haver-existence", [92])],
  ["no_terceiro_andar", "O apartamento fica ___ terceiro andar.", "no", ["na", "ao", "em"], [], "The flat is on the third floor.", "o andar → no terceiro andar", src("housing-neighbourhood", [92])],
  ["frigorifico_na_cozinha", "O frigorífico está ___ cozinha.", "na", ["no", "à", "em"], [], "The fridge is in the kitchen.", "a cozinha → na cozinha", src("furniture-appliances", [93])],
  ["cama_no_quarto", "A cama está ___ quarto.", "no", ["na", "ao", "nos"], [], "The bed is in the bedroom.", "o quarto → no quarto", src("furniture-appliances", [93])],
  ["casa_tem_quartos", "A nossa casa ___ dois quartos e uma varanda.", "tem", ["há", "é", "são"], [], "Our house has two bedrooms and a balcony.", "A casa tem… (a casa é o sujeito)", src("housing-neighbourhood", [92])],
  // Comparativos
  ["mais_caro_do_que", "Este apartamento é mais caro ___ o nosso.", "do que", ["que do", "de", "como"], [], "This flat is more expensive than ours.", "mais … do que", src("comparatives", [94, 103])],
  ["quarto_maior", "O teu quarto é ___ do que o meu.", "maior", ["mais grande", "mais maior", "grande"], [], "Your room is bigger than mine.", "grande → maior (nunca “mais grande”)", src("comparatives", [94, 103])],
  ["restaurante_melhor", "Este restaurante é ___ do que aquele.", "melhor", ["mais bom", "bom", "bem"], [], "This restaurant is better than that one.", "bom → melhor", src("comparatives", [94, 103])],
  ["transito_pior", "O trânsito no centro é ___ do que aqui.", "pior", ["mais mau", "mau", "mal"], [], "The traffic in the centre is worse than here.", "mau → pior", src("comparatives", [94, 103])],
  ["menos_rapida", "A bicicleta é ___ rápida do que o carro.", "menos", ["mais pouco", "pouco", "menor"], [], "The bike is slower than the car.", "menos … do que (inferioridade)", cad("comparatives", [46])],
  // Lojas e números
  ["setecentos_euros", "700 € — o apartamento custa ___ euros.", "setecentos", ["setecentas", "sete cem", "setessentos"], ["vocab.number.n700"], "€700 — the flat costs seven hundred euros.", "700 = setecentos (os euros → masculino)", src("numbers-to-1000", [93, 94])],
  ["duzentas_paginas", "200 — o livro tem ___ páginas.", "duzentas", ["duzentos", "dois cem", "doiscentas"], ["vocab.number.n200"], "200 — the book has two hundred pages.", "as páginas → feminino: duzentas", src("numbers-to-1000", [94])],
  ["carne_no_talho", "Compro carne no ___.", "talho", ["padaria", "livraria", "banco"], ["vocab.noun.talho"], "I buy meat at the butcher's.", "o talho → no talho", src("shops-services", [95])],
  // poder · querer · saber · com + pronome
  ["podes_vir_jantar", "Tu ___ vir jantar connosco?", "podes", ["pode", "posso", "podem"], ["grammar.poder.tu"], "Can you come to dinner with us?", "tu → podes", src("irregular-poder-querer-saber", [101])],
  ["eu_quero_cha", "Eu ___ um chá, se faz favor.", "quero", ["quer", "queres", "querem"], ["grammar.querer.eu"], "I want a tea, please.", "eu → quero", src("irregular-poder-querer-saber", [101])],
  ["vens_comigo", "Vens ao cinema ___ ?", "comigo", ["com eu", "com mim", "contigo"], [], "Are you coming to the cinema with me?", "com + eu = comigo", src("com-pronoun", [97, 102])],
  ["nao_sei_se_vem", "Eu não ___ se ela vem.", "sei", ["sabo", "sabe", "sabem"], ["grammar.saber.eu"], "I don't know if she's coming.", "saber: eu sei", src("irregular-poder-querer-saber", [101])],
  // estar a + infinitivo · dizer
  ["estou_a_preparar", "Agora ___ a preparar o jantar.", "estou", ["sou", "tenho", "vou"], ["grammar.preparar.estar_a.eu"], "Right now I'm making dinner.", "estar a + infinitivo: estou a preparar", src("estar-a-infinitive", [98, 101])],
  ["estao_a_arrumar", "Eles estão ___ arrumar a casa.", "a", ["de", "em", "o"], ["grammar.arrumar.estar_a.eles"], "They are tidying the house.", "estar + a + infinitivo", src("estar-a-infinitive", [98, 101])],
  ["estas_a_ver", "Tu ___ a ver o filme?", "estás", ["és", "está", "estou"], ["grammar.ver.estar_a.tu"], "Are you watching the film?", "tu → estás a ver", src("estar-a-infinitive", [101])],
  ["diz_que_vem", "A Bruna ___ que vem ao concerto.", "diz", ["dize", "digo", "dizem"], ["grammar.dizer.ele"], "Bruna says she's coming to the concert.", "ela → diz", src("irregular-dizer", [101])],
  // Ponto da Situação 2: preposição + pronome interrogativo
  ["com_quem_vais", "___ quem vais ao concerto? — Com a Ana.", "Com", ["Em", "Do", "No"], [], "Who are you going to the concert with? — With Ana.", "Preposição + quem: com quem, de quem, para quem", pds("interrogatives", [105])],
  ["de_onde_vens", "___ onde vens? — Venho do ginásio.", "De", ["Em", "No", "A"], [], "Where are you coming from? — From the gym.", "vir de → De onde vens?", pds("interrogatives", [105])],
  // O Mundo do Trabalho 2: ter de · costumar
  ["tenho_de_entregar", "Na sexta-feira, ___ de entregar o relatório.", "tenho", ["sou", "estou", "há"], ["grammar.ter.eu"], "On Friday I have to hand in the report.", "Obrigação: ter de + infinitivo", trab("ter-de-costumar", [111])],
  ["nao_costumo_sabado", "Eu não ___ trabalhar ao sábado.", "costumo", ["costumas", "costumam", "costume"], ["grammar.costumar.eu"], "I don't usually work on Saturdays.", "Hábito: (não) costumo + infinitivo", trab("ter-de-costumar", [111])],
  ["tens_de_telefonar", "Tu ___ de telefonar ao cliente.", "tens", ["tem", "tenho", "têm"], ["grammar.ter.tu"], "You have to phone the client.", "tu → tens de", trab("ter-de-costumar", [111])],
  // O Mundo do Português 2
  ["brasil_na_america", "O Brasil fica ___ América do Sul.", "na", ["no", "da", "à"], [], "Brazil is in South America.", "a América do Sul → na América do Sul", mundo("brazil-geography", [112])],
  ["banhado_pelo_atlantico", "O Brasil é banhado ___ oceano Atlântico.", "pelo", ["pela", "pelos", "do"], [], "Brazil's coast is on the Atlantic Ocean.", "por + o = pelo", mundo("brazil-geography", [112])],
  ["voce_em_vez_de_tu", "No Brasil, diz-se ___ em vez de tu.", "você", ["vós", "ele", "nós"], [], "In Brazil, people say você instead of tu.", "Brasil: você gosta… · Portugal: tu gostas…", mundo("pe-pb-grammar", [114])],
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
  ["de_bicicleta", ["Venho", "em", "bicicleta."], 1, "de", "Meio de transporte: de bicicleta, de carro (mas a pé).", "I come by bike.", cad("transport-prepositions", [48])],
  ["pela_praca", ["O", "autocarro", "passa", "pelo", "praça."], 3, "pela", "a praça → pela praça (por + a).", "The bus goes through the square.", cad("movement-prepositions", [47])],
  ["ha_um_sofa", ["Na", "sala", "têm", "um", "sofá."], 2, "há", "Para dizer que existe: há.", "There's a sofa in the living room.", src("haver-existence", [92])],
  ["maior_do_que", ["Lisboa", "é", "maior", "de", "que", "o", "Porto."], 3, "do", "Comparativo: maior do que.", "Lisbon is bigger than Porto.", src("comparatives", [103])],
  ["eu_posso", ["Eu", "podo", "ir", "contigo."], 1, "posso", "poder: eu posso.", "I can go with you.", cad("irregular-2", [44])],
  ["estou_a_estudar", ["Agora", "estou", "estudar", "para", "o", "teste."], 2, "a estudar", "PT-PT: estar a + infinitivo — estou a estudar.", "Right now I'm studying for the test.", cad("estar-a", [43])],
  ["tem_de_responder", ["Ela", "tem", "responder", "aos", "e-mails."], 1, "tem de", "Obrigação: ter de + infinitivo.", "She has to answer the emails.", trab("ter-de-costumar", [111])],
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

export const U04_ITEMS: KnowledgeItem[] = [...nouns, ...adjectives, ...phrases, ...verbs, ...progressive, ...numbers, ...frames, ...errors];
