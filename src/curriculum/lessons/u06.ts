/** Unit 6 lessons (and the review / world sections that follow it), in book order, plus their tip cards. */
import type { AulaStep } from "../aulas.ts";
import type { Lesson } from "../schema.ts";

const pav = (unit: "u06" | "pds3" | "trab3" | "mundo3", pages: number[], concept: string) => ({ sourceId: "pav1-student" as const, unit, pages, concept });
const ids = (prefix: string, ...slugs: string[]) => slugs.map((s) => `${prefix}.${s}`);
const ph = (...s: string[]) => ids("function.u06", ...s);
const nouns = (...s: string[]) => ids("vocab.noun", ...s);
const frames = (...s: string[]) => ids("grammar.frame", ...s);
const errors = (...s: string[]) => ids("grammar.error", ...s);
const ALL = ["eu", "tu", "ele", "nos", "eles"];
const verb = (slug: string, persons = ALL) => persons.map((p) => `grammar.${slug}.${p}`);

export const U06_LESSONS: Lesson[] = [
  {
    id: "u06.sintomas",
    unit: "u06",
    title: "Não me sinto bem — sintomas e sentir-se",
    source: pav("u06", [139, 140, 141, 142], "health-states"),
    itemIds: [
      ...verb("sentirse"),
      ...ph("nao_me_sinto_bem", "estou_com_febre", "tenho_dores_cabeca", "estou_constipado", "ando_cansada", "estas_melhor", "as_melhoras"),
      "vocab.adjective.doente",
      ...frames("nao_me_sinto", "te_sentes", "ela_sente", "com_febre"),
      ...errors("tenho_com"),
    ],
    canDo: ["cd16.health", "cd03.greet-polite"],
  },
  {
    id: "u06.corpo",
    unit: "u06",
    title: "A cabeça e o braço — o corpo",
    source: pav("u06", [141, 142, 143], "body"),
    itemIds: [
      ...nouns("braco", "perna", "barriga", "dente", "garganta", "coracao", "dedo"),
      ...nouns("cabeca", "olhos", "nariz", "boca", "orelha", "mao", "pe"),
      "vocab.profession.cardiologista",
      "vocab.profession.oftalmologista",
      "vocab.profession.pediatra",
      ...frames("cardiologista", "lavo_maos"),
      ...errors("oftalmologista"),
    ],
    canDo: ["cd16.health"],
  },
  {
    id: "u06.doer",
    unit: "u06",
    title: "Dói-me a cabeça — o verbo doer",
    source: pav("u06", [142, 158], "verb-doer"),
    itemIds: [
      ...ph("doi_me_cabeca", "doem_me_pes", "doi_me_garganta", "doi_me_barriga", "doem_me_costas", "doi_lhe_dente", "o_que_te_doi", "onde_lhe_doi"),
      ...frames("doi_cabeca", "doem_pernas", "te_doi"),
      ...errors("doi_os_pes", "doem_garganta", "perna_o"),
    ],
    canDo: ["cd16.health"],
  },
  {
    id: "u06.conselhos",
    unit: "u06",
    title: "Bebe muita água! — conselhos (tu)",
    source: pav("u06", [143, 144, 145, 148, 159], "imperative-informal"),
    itemIds: [
      ...["beber", "descansar", "dormir", "comer", "tomar", "ficar", "ir", "fazer"].map((v) => `grammar.${v}.imperativo.tu`),
      ...ph("deves_descansar", "tens_de_ir", "nao_trabalhes", "nao_bebas_cafe"),
      "vocab.adjective.saudavel",
      ...frames("bebe", "nao_bebas", "nao_trabalhes", "deves"),
      ...errors("nao_bebes", "fica_descanses"),
    ],
    canDo: ["cd16.health", "cd23.speak-short"],
  },
  {
    id: "u06.pedir_perder_dormir",
    unit: "u06",
    title: "Durmo mal — pedir, perder, dormir",
    source: pav("u06", [145, 146, 147, 158], "verbs-pedir-perder-dormir"),
    itemIds: [...verb("pedir"), ...verb("perder"), ...verb("dormir"), ...frames("peco", "perco", "durmo", "perdes"), ...errors("dormo")],
    canDo: ["cd06.routines", "cd16.health"],
  },
  {
    id: "u06.no_medico",
    unit: "u06",
    title: "Tome um comprimido — no médico",
    source: pav("u06", [145, 147, 150, 151, 152, 159], "imperative-formal"),
    itemIds: [
      ...ph("marcar_consulta", "primeira_vez", "pode_ser_quinta", "tome_comprimido", "beba_agua", "descanse", "nao_fume", "faca_desporto", "volte"),
      ...frames("tome", "bebam", "nao_fume", "faca"),
      ...errors("toma_formal"),
    ],
    canDo: ["cd16.health", "cd24.cope"],
  },
  {
    id: "u06.farmacia",
    unit: "u06",
    title: "Na farmácia — comprimidos e receitas",
    source: pav("u06", [153, 154, 158], "pharmacy"),
    itemIds: [
      ...nouns("farmacia", "comprimido", "receita", "injecao", "febre", "gripe", "constipacao", "tosse", "sono"),
      ...ph("queria_comprimidos", "precisa_receita", "vais_apanhar"),
      ...frames("tomar", "apanhar", "fazer_analises", "para_garganta"),
    ],
    canDo: ["cd16.health", "cd10.buy-pay"],
  },
  {
    id: "pds3.revisao",
    unit: "pds3",
    title: "Ponto da Situação 3 — revisão das Unidades 5 e 6",
    source: pav("pds3", [160, 161, 162, 163, 164, 165], "review-u05-u06"),
    itemIds: [
      "grammar.viajar.ir_futuro.eles",
      "grammar.fazer.ir_futuro.nos",
      "grammar.procurar.estar_a.eu",
      "grammar.experimentar.estar_a.eles",
      "grammar.fazer.tu",
      "grammar.dar.ele",
      "grammar.trazer.eles",
      "grammar.pedir.eu",
      "grammar.ir.imperativo.tu",
      "function.u05.esta_a_chover",
      "function.u06.doi_me_cabeca",
      "function.u05.o_que_vais_fazer",
      "vocab.noun.verao",
      ...frames("pds3_agora", "pds3_proximo", "pds3_normalmente", "na_primavera"),
      ...errors("pds3_sei_ana", "janeiro_minuscula"),
    ],
    canDo: ["cd14.weather-clothes", "cd15.future-plans", "cd16.health"],
  },
  {
    id: "trab3.anuncios",
    unit: "trab3",
    title: "Precisa-se de cozinheiro — anúncios de emprego",
    source: pav("trab3", [166, 167], "job-ads"),
    itemIds: [
      ...ids("function.trab3", "precisa_se", "tempo_inteiro", "disponibilidade", "por_turnos", "em_equipa", "experiencia", "falo_linguas", "envie_cv", "entrevista", "melhores_cumprimentos"),
      ...nouns("anuncio", "curriculo", "empresa"),
      ...ids("vocab.profession", "arquiteto", "enfermeiro", "jornalista"),
      ...frames("trab3_precisa_de", "trab3_tempo_inteiro", "trab3_para"),
      ...errors("trab3_na_equipa"),
    ],
    canDo: ["cd02.personal-info", "cd21.forms"],
  },
  {
    id: "mundo3.angola_timor",
    unit: "mundo3",
    title: "Angola e Timor-Leste — o mundo do português",
    source: pav("mundo3", [168, 169, 170], "angola-timor-leste"),
    itemIds: [
      "vocab.nationality.angola",
      "vocab.nationality.timor",
      "vocab.nationality.portugal",
      "grammar.origin.angola",
      ...ids("function.mundo3", "capital_angola", "moeda_angola", "angola_africa", "capital_timor", "linguas_timor", "clima_tropical", "quando_ir_angola", "mata_bicho", "maka"),
      ...frames("mundo3_desde", "mundo3_em_africa", "mundo3_linguas"),
    ],
    canDo: ["cd22.listen-clear", "cd01.introduce-self"],
  },
];

export const U06_AULAS: Record<string, AulaStep[]> = {
  "u06.sintomas": [
    { kind: "title", big: "Estás melhor?", small: "Dizer como me sinto", say: "Estás melhor?", ms: 3800 },
    { kind: "table", kicker: "SENTIR-SE", rows: [["eu", "sinto-me"], ["tu", "sentes-te"], ["ele · ela · você", "sente-se"], ["nós", "sentimo-nos"], ["eles · elas · vocês", "sentem-se"]], note: "Com “não”, o pronome vai para antes: não me sinto bem.", say: "Sinto-me, sentes-te, sente-se, sentimo-nos, sentem-se.", ms: 8000 },
    { kind: "table", kicker: "SINTOMAS", rows: [["estar com + nome", "estou com febre"], ["ter + nome", "tenho dores de cabeça · tenho tosse"], ["estar + adjetivo", "estou constipado/a · estou doente"], ["andar + adjetivo", "ando cansado/a (há uns tempos)"]], say: "Estou com febre. Tenho dores de cabeça. Ando cansada.", ms: 8500 },
    { kind: "rule", kicker: "SIMPATIA", big: "As melhoras!", note: "Diz-se a quem está doente. (Get well soon!)", say: "As melhoras!", ms: 5000 },
    { kind: "check", itemId: "grammar.frame.nao_me_sinto", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.com_febre", ms: 7000 },
    { kind: "summary", rows: [["sentir-se", "sinto-me · não me sinto"], ["febre", "estou com febre"], ["dores", "tenho dores de…"]], ms: 5000 },
  ],
  "u06.corpo": [
    { kind: "title", big: "A cabeça e o corpo", small: "As partes do corpo", say: "A cabeça, o braço, a perna.", ms: 3800 },
    { kind: "table", kicker: "O CORPO", rows: [["a cabeça · os olhos · o nariz", "head · eyes · nose"], ["a boca · o dente · a garganta", "mouth · tooth · throat"], ["o braço · a mão · o dedo", "arm · hand · finger"], ["a barriga · a perna · o pé", "belly · leg · foot"]], say: "A cabeça, o braço, a mão, a barriga, a perna, o pé.", ms: 8500 },
    { kind: "table", kicker: "ESPECIALIDADES", rows: [["o/a cardiologista", "o coração"], ["o/a oftalmologista", "os olhos"], ["o/a dentista", "os dentes"], ["o/a pediatra", "as crianças"]], note: "-ista e -a: iguais no masculino e no feminino.", say: "O cardiologista. A oftalmologista. O pediatra.", ms: 8000 },
    { kind: "check", itemId: "grammar.frame.cardiologista", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.lavo_maos", ms: 7000 },
    { kind: "summary", rows: [["a mão", "as mãos"], ["o pé", "os pés"], ["-ista", "o/a cardiologista"]], ms: 5000 },
  ],
  "u06.doer": [
    { kind: "title", big: "Dói-me a cabeça!", small: "O verbo doer", say: "Dói-me a cabeça.", ms: 3800 },
    { kind: "table", kicker: "DOER: SÓ DUAS FORMAS", rows: [["dói-me / -te / -lhe", "a cabeça · a barriga · o pé"], ["doem-me / -te / -lhe", "os pés · as costas · os olhos"]], note: "O verbo concorda com a parte do corpo, não com a pessoa.", say: "Dói-me a cabeça. Doem-me os pés.", ms: 8000 },
    { kind: "rule", kicker: "PERGUNTAR", big: "O que é que te dói?", note: "tu → te dói · você → lhe dói (Onde é que lhe dói?)", say: "O que é que te dói? Onde é que lhe dói?", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.doi_cabeca", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.doem_pernas", ms: 7000 },
    { kind: "summary", rows: [["uma coisa", "dói-me"], ["várias coisas", "doem-me"], ["tu / você", "te dói / lhe dói"]], ms: 5000 },
  ],
  "u06.conselhos": [
    { kind: "title", big: "Bebe muita água!", small: "Dar conselhos a um amigo (tu)", say: "Bebe muita água!", ms: 3800 },
    { kind: "table", kicker: "IMPERATIVO (TU)", rows: [["ele bebe", "Bebe!"], ["ele descansa", "Descansa!"], ["ele dorme", "Dorme mais!"], ["ele vai", "Vai ao médico!"]], note: "Afirmativo (tu) = a forma de ele/ela no Presente.", say: "Bebe! Descansa! Dorme mais! Vai ao médico!", ms: 8000 },
    { kind: "table", kicker: "NA NEGATIVA", rows: [["eu trabalho → -es", "Não trabalhes!"], ["eu bebo → -as", "Não bebas!"], ["eu durmo → -as", "Não durmas tarde!"]], note: "Parte do eu: tira o -o; -ar → -es; -er/-ir → -as.", say: "Não trabalhes! Não bebas!", ms: 8000 },
    { kind: "rule", kicker: "OUTRA MANEIRA", big: "Deves descansar · Tens de ir ao médico", note: "dever + inf. (conselho) · ter de + inf. (obrigação)", say: "Deves descansar. Tens de ir ao médico.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.bebe", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.nao_bebas", ms: 7000 },
    { kind: "summary", rows: [["sim", "Bebe! Descansa!"], ["não", "Não bebas! Não trabalhes!"], ["conselho", "Deves… · Tens de…"]], ms: 5000 },
  ],
  "u06.pedir_perder_dormir": [
    { kind: "title", big: "Durmo mal…", small: "Pedir, perder, dormir: irregulares no eu", say: "Durmo mal.", ms: 3800 },
    { kind: "table", kicker: "SÓ O EU MUDA", rows: [["pedir", "peço · pedes · pede · pedimos · pedem"], ["perder", "perco · perdes · perde · perdemos · perdem"], ["dormir", "durmo · dormes · dorme · dormimos · dormem"]], say: "Peço, perco, durmo.", ms: 8500 },
    { kind: "example", kicker: "NO DIA A DIA", big: "Perco sempre o autocarro e durmo pouco.", note: "perder o autocarro = to miss the bus", emoji: "🚌", say: "Perco sempre o autocarro e durmo pouco.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.durmo", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.peco", ms: 7000 },
    { kind: "summary", rows: [["pedir", "eu peço"], ["perder", "eu perco"], ["dormir", "eu durmo"]], ms: 5000 },
  ],
  "u06.no_medico": [
    { kind: "title", big: "Tome um comprimido", small: "No médico: o imperativo formal", say: "Tome um comprimido.", ms: 3800 },
    { kind: "table", kicker: "FORMAL (VOCÊ / VOCÊS)", rows: [["eu tomo → -e / -em", "Tome! · Tomem!"], ["eu bebo → -a / -am", "Beba! · Bebam!"], ["eu faço → -a / -am", "Faça! · Façam!"], ["eu fumo → não -e", "Não fume!"]], note: "Parte do eu do Presente: -ar → -e; -er/-ir → -a.", say: "Tome. Beba. Faça exercício. Não fume.", ms: 8500 },
    { kind: "table", kicker: "MARCAR UMA CONSULTA", rows: [["Queria marcar uma consulta.", "I'd like an appointment."], ["Pode ser na quinta às dez?", "Thursday at ten?"], ["É a primeira vez?", "first visit?"]], say: "Queria marcar uma consulta, por favor.", ms: 7500 },
    { kind: "check", itemId: "grammar.frame.tome", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.nao_fume", ms: 7000 },
    { kind: "summary", rows: [["tu", "Toma! Bebe!"], ["você", "Tome! Beba!"], ["vocês", "Tomem! Bebam!"]], ms: 5000 },
  ],
  "u06.farmacia": [
    { kind: "title", big: "Na farmácia", small: "Comprar medicamentos", say: "Queria uns comprimidos para a garganta.", ms: 3800 },
    { kind: "table", kicker: "TOMAR · APANHAR · FAZER", rows: [["tomar", "um comprimido · um xarope"], ["apanhar", "uma gripe · uma constipação"], ["fazer", "análises · um exame"]], say: "Tomar um comprimido. Apanhar uma gripe. Fazer análises.", ms: 8000 },
    { kind: "rule", kicker: "PARA", big: "Estes comprimidos são para a garganta.", note: "para = objetivo (para quê?)", say: "Estes comprimidos são para a garganta.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.tomar", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.apanhar", ms: 7000 },
    { kind: "summary", rows: [["remédio", "tomar"], ["doença", "apanhar"], ["exames", "fazer"]], ms: 5000 },
  ],
  "pds3.revisao": [
    { kind: "title", big: "Ponto da Situação 3", small: "Revisão: Unidades 5 e 6", say: "Ponto da situação.", ms: 3800 },
    { kind: "table", kicker: "QUE TEMPO VERBAL?", rows: [["normalmente · sempre", "Presente: acordo às sete"], ["agora · neste momento", "estar a + inf.: está a chover"], ["amanhã · no próximo sábado", "ir + inf.: vamos jantar fora"], ["conselho (tu / você)", "Imperativo: Bebe! · Beba!"]], say: "Normalmente acordo às sete. Agora está a chover. Amanhã vamos jantar fora.", ms: 9000 },
    { kind: "check", itemId: "grammar.frame.pds3_agora", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.pds3_proximo", ms: 7000 },
    { kind: "summary", rows: [["hábito", "Presente"], ["agora", "estar a + infinitivo"], ["futuro", "ir + infinitivo"]], ms: 5000 },
  ],
  "trab3.anuncios": [
    { kind: "title", big: "Precisa-se!", small: "Anúncios de emprego e candidaturas", say: "Precisa-se de cozinheiro.", ms: 3800 },
    { kind: "table", kicker: "NUM ANÚNCIO", rows: [["Precisa-se de…", "… wanted"], ["a tempo inteiro / parcial", "full-time / part-time"], ["disponibilidade imediata", "can start now"], ["trabalhar por turnos", "shift work"], ["Envie o seu currículo", "send your CV"]], say: "Precisa-se de enfermeiro. Trabalho a tempo inteiro.", ms: 8500 },
    { kind: "rule", kicker: "NA CARTA", big: "Com os melhores cumprimentos,", note: "Para terminar uma carta ou um e-mail formal.", say: "Com os melhores cumprimentos.", ms: 5500 },
    { kind: "check", itemId: "grammar.frame.trab3_precisa_de", ms: 7000 },
    { kind: "summary", rows: [["anúncio", "Precisa-se de…"], ["horário", "a tempo inteiro"], ["fim da carta", "Com os melhores cumprimentos"]], ms: 5000 },
  ],
  "mundo3.angola_timor": [
    { kind: "title", big: "Angola e Timor-Leste", small: "Dois países de língua portuguesa", say: "Angola e Timor-Leste.", ms: 3800 },
    { kind: "table", kicker: "FICHA", rows: [["🇦🇴 Angola", "capital Luanda · moeda kwanza"], ["🇹🇱 Timor-Leste", "capital Díli · independente desde 2002"], ["línguas", "português + kimbundo, umbundo… · português + tétum"]], say: "A capital de Angola é Luanda. A capital de Timor-Leste é Díli.", ms: 8500 },
    { kind: "table", kicker: "PORTUGUÊS DE ANGOLA", rows: [["o pequeno-almoço", "o mata-bicho"], ["um problema", "uma maka"], ["o dinheiro", "o guito"]], say: "Em Angola, o pequeno-almoço é o mata-bicho.", ms: 7500 },
    { kind: "check", itemId: "grammar.frame.mundo3_em_africa", ms: 7000 },
    { kind: "summary", rows: [["Angola", "Luanda · kwanza"], ["Timor-Leste", "Díli · tétum"], ["em", "em África"]], ms: 5000 },
  ],
};
