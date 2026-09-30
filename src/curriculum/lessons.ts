/**
 * Lessons: each has a Mini Aula script (aulas.ts), the knowledge items it teaches, and provenance.
 * Order = the book's order, so "next lesson" follows the class.
 */
import type { Lesson } from "./schema.ts";

const verbIds = (slug: string) => ["eu", "tu", "ele", "nos", "eles"].map((p) => `grammar.${slug}.${p}`);
const pav = (unit: "u00" | "u01", pages: number[], concept: string) => ({ sourceId: "pav1-student" as const, unit, pages, concept });

export const LESSONS: Lesson[] = [
  {
    id: "u00.cumprimentos",
    unit: "u00",
    title: "Olá! Bom dia! — cumprimentos",
    source: pav("u00", [11], "greetings-farewells"),
    itemIds: ["ola", "bom_dia", "boa_tarde", "boa_noite", "adeus", "ate_logo", "ate_amanha", "obrigado", "de_nada", "desculpe", "por_favor"].map((s) => `function.u00.${s}`),
    canDo: ["cd03.greet-polite"],
  },
  {
    id: "u00.desenrascar",
    unit: "u00",
    title: "Não percebo! — desenrascar",
    source: pav("u00", [11], "classroom-expressions"),
    itemIds: ["nao_percebo", "pode_repetir", "mais_devagar", "como_se_diz", "o_que_significa"].map((s) => `function.u00.${s}`),
    canDo: ["cd04.repair", "cd24.cope"],
  },
  {
    id: "u01.ser",
    unit: "u01",
    title: "Eu sou… — verbo ser",
    source: pav("u01", [17, 31], "verb-ser"),
    itemIds: [...verbIds("ser"), "grammar.frame.nos_somos", "grammar.frame.eu_sou", "grammar.frame.tu_es", "grammar.frame.eles_sao", "grammar.error.nos_somos", "grammar.error.ela_e"],
    canDo: ["cd01.introduce-self", "cd02.personal-info"],
  },
  {
    id: "u01.ter",
    unit: "u01",
    title: "Tenho 30 anos — verbo ter",
    source: pav("u01", [19, 31], "verb-ter"),
    itemIds: [...verbIds("ter"), "grammar.frame.eu_tenho", "grammar.frame.ela_tem", "grammar.frame.eles_tem", "grammar.frame.nos_temos", "grammar.frame.tu_tens", "grammar.error.tenho_anos", "grammar.error.eles_tem", "grammar.error.ela_tem", "pron.u01.tem_tem"],
    canDo: ["cd02.personal-info"],
  },
  {
    id: "u01.verbos_ar",
    unit: "u01",
    title: "Falo, falas, fala — verbos em -ar",
    source: pav("u01", [14, 20, 32], "verbs-ar"),
    itemIds: [...verbIds("falar"), ...verbIds("morar"), ...verbIds("trabalhar"), ...verbIds("estudar"), ...verbIds("gostar"), "grammar.frame.nos_moramos", "grammar.frame.eu_falo", "grammar.frame.eles_estudam", "grammar.frame.ela_trabalha", "grammar.frame.tu_gostas", "grammar.error.tu_falas", "grammar.error.eles_moram"],
    canDo: ["cd02.personal-info", "cd06.routines"],
  },
  {
    id: "u01.chamar_se",
    unit: "u01",
    title: "Como te chamas? — chamar-se",
    source: pav("u01", [14, 17], "verb-chamar-se"),
    itemIds: [...verbIds("chamarse"), "grammar.frame.eu_chamo", "grammar.frame.ele_chama", "grammar.error.chamo_me", "grammar.error.nao_me_chamo"],
    canDo: ["cd01.introduce-self"],
  },
  {
    id: "u01.nacionalidades",
    unit: "u01",
    title: "Sou português — nacionalidades",
    source: pav("u01", [20, 21, 30], "nationalities"),
    itemIds: ["portugal", "franca", "inglaterra", "japao", "italia", "brasil", "suecia", "angola", "alemanha", "espanha", "belgica", "guine", "china", "eua"].map((s) => `vocab.nationality.${s}`).concat(["grammar.error.alema", "grammar.error.japonesa"]),
    canDo: ["cd01.introduce-self", "cd02.personal-info"],
  },
  {
    id: "u01.profissoes",
    unit: "u01",
    title: "O que fazes? — profissões",
    source: pav("u01", [22, 23, 24], "professions"),
    itemIds: ["professor", "medico", "enfermeiro", "engenheiro", "advogado", "cozinheiro", "empregado_mesa", "escritor", "gestor", "jornalista", "estudante", "dentista", "motorista", "piloto", "economista"].map((s) => `vocab.profession.${s}`),
    canDo: ["cd02.personal-info"],
  },
  {
    id: "u01.de_origin",
    unit: "u01",
    title: "De onde és? — de, do, da, dos, das",
    source: pav("u01", [22, 31], "preposition-de-places"),
    itemIds: [
      "grammar.contraction.de_o",
      "grammar.contraction.de_a",
      "grammar.contraction.de_os",
      "grammar.contraction.de_as",
      ...["lisboa", "porto", "braga", "coimbra", "brasil", "japao", "alemanha", "china", "eua", "portugal", "angola", "maldivas"].map((s) => `grammar.origin.${s}`),
      ...["de_porto", "de_lisboa", "de_alemanha", "de_eua", "de_japao", "de_brasil", "de_maldivas", "de_china", "de_braga", "de_coimbra"].map((s) => `grammar.frame.${s}`),
      "grammar.error.do_brasil",
      "grammar.error.de_lisboa",
    ],
    canDo: ["cd01.introduce-self", "cd02.personal-info"],
  },
  {
    id: "u01.em_lugar",
    unit: "u01",
    title: "Onde moras? — em, no, na, nos, nas",
    source: pav("u01", [32], "preposition-em"),
    itemIds: [
      "grammar.contraction.em_o",
      "grammar.contraction.em_a",
      "grammar.contraction.em_os",
      "grammar.contraction.em_as",
      ...["em_porto", "em_lisboa", "em_suecia", "em_eua", "em_brasil", "em_alemanha", "em_universidade", "em_hospital", "em_faro", "em_maldivas", "em_acores"].map((s) => `grammar.frame.${s}`),
      "grammar.error.no_porto",
      "grammar.error.na_alemanha",
    ],
    canDo: ["cd02.personal-info"],
  },
  {
    id: "u01.numeros",
    unit: "u01",
    title: "Números até 20",
    source: pav("u01", [18], "numbers-0-50"),
    itemIds: [...Array.from({ length: 21 }, (_, i) => `vocab.number.n${i}`), "pron.u01.tres_treze", "pron.u01.dois_doze"],
    canDo: ["cd07.numbers-prices"],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
