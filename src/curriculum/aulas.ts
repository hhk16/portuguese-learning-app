/**
 * Mini Aula scripts (Teach stage), one per lesson in lessons.ts. Each ends with a quick check
 * (Recognise); the practice round that follows draws on the lesson's items (Produce / Use).
 * Wording is original; paradigms and word lists are facts of the language as taught in
 * Português a Valer 1, Units 0–1.
 */
export type AulaStep =
  | { kind: "title"; big: string; small: string; say: string; ms: number }
  | { kind: "example"; kicker?: string; big: string; note: string; emoji?: string; say: string; ms: number }
  | { kind: "merge"; a: string; b: string; result: string; example: string; emoji: string; say: string; ms: number }
  | { kind: "rule"; kicker?: string; big: string; note: string; say: string; ms: number }
  | { kind: "table"; kicker: string; rows: [string, string][]; note?: string; say?: string; ms: number }
  | { kind: "check"; itemId: string; ms: number }
  | { kind: "summary"; rows: [string, string][]; note?: string; ms: number };

const BASE_AULAS: Record<string, AulaStep[]> = {
  "u00.cumprimentos": [
    { kind: "title", big: "Olá! Bom dia!", small: "Cumprimentar e despedir-se", say: "Olá! Bom dia!", ms: 3800 },
    { kind: "table", kicker: "A HORA CONTA", rows: [["🌅 de manhã", "Bom dia!"], ["☀️ à tarde", "Boa tarde!"], ["🌙 à noite", "Boa noite!"]], say: "Bom dia. Boa tarde. Boa noite.", ms: 6500 },
    { kind: "rule", kicker: "INFORMAL", big: "Olá! Tudo bem?", note: "“Olá” é para amigos, família e colegas. Resposta: Tudo bem, obrigado/a!", say: "Olá! Tudo bem?", ms: 6000 },
    { kind: "table", kicker: "DESPEDIDAS", rows: [["Adeus!", "goodbye"], ["Até logo!", "see you later"], ["Até amanhã!", "see you tomorrow"]], say: "Adeus. Até logo. Até amanhã.", ms: 6500 },
    { kind: "rule", kicker: "BOAS MANEIRAS", big: "Obrigado · Obrigada", note: "Depende de QUEM fala: um homem diz obrigado, uma mulher diz obrigada. Resposta: De nada.", say: "Obrigado. Obrigada. De nada.", ms: 7000 },
    { kind: "check", itemId: "function.u00.boa_noite", ms: 7000 },
    { kind: "check", itemId: "function.u00.ate_amanha", ms: 7000 },
    { kind: "summary", rows: [["manhã / tarde / noite", "Bom dia / Boa tarde / Boa noite"], ["sair", "Adeus · Até logo · Até amanhã"], ["agradecer", "Obrigado/a → De nada"]], ms: 5000 },
  ],
  "u00.desenrascar": [
    { kind: "title", big: "Não percebo!", small: "Frases para sobreviver", say: "Não percebo!", ms: 3800 },
    { kind: "example", big: "Não percebo.", note: "A frase mais útil do A1. (I don't understand.)", emoji: "🤯", say: "Não percebo.", ms: 5500 },
    { kind: "example", big: "Pode repetir, por favor?", note: "Formal e educado — funciona com toda a gente.", emoji: "🔁", say: "Pode repetir, por favor?", ms: 6000 },
    { kind: "example", big: "Mais devagar, por favor.", note: "Quando falam rápido demais.", emoji: "🐢", say: "Mais devagar, por favor.", ms: 6000 },
    { kind: "table", kicker: "PERGUNTAR PALAVRAS", rows: [["Como se diz … em português?", "how do you say …?"], ["O que significa …?", "what does … mean?"]], say: "Como se diz em português? O que significa?", ms: 7500 },
    { kind: "check", itemId: "function.u00.pode_repetir", ms: 7000 },
    { kind: "check", itemId: "function.u00.mais_devagar", ms: 7000 },
    { kind: "summary", rows: [["não entendo", "Não percebo."], ["outra vez", "Pode repetir?"], ["devagar", "Mais devagar, por favor."]], ms: 5000 },
  ],
  "u01.ser": [
    { kind: "title", big: "Eu sou…", small: "Verbo SER: quem és", say: "Eu sou o Blip.", ms: 3800 },
    { kind: "table", kicker: "VERBO SER", rows: [["eu", "sou"], ["tu", "és"], ["ele · ela · você", "é"], ["nós", "somos"], ["eles · elas · vocês", "são"]], say: "Eu sou, tu és, ele é, nós somos, eles são.", ms: 8000 },
    { kind: "example", kicker: "PARA QUE SERVE", big: "Sou a Ana. Sou economista.", note: "Nome, profissão, nacionalidade, origem → SER", emoji: "🪪", say: "Sou a Ana. Sou economista.", ms: 6500 },
    { kind: "rule", kicker: "ATENÇÃO", big: "Eles são portugueses.", note: "“são” leva til (~) — soa nasal.", say: "Eles são portugueses.", ms: 6000 },
    { kind: "check", itemId: "grammar.frame.nos_somos", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.eles_sao", ms: 7000 },
    { kind: "summary", rows: [["eu / tu", "sou / és"], ["ele · ela · você", "é"], ["nós / eles", "somos / são"]], ms: 5000 },
  ],
  "u01.ter": [
    { kind: "title", big: "Tenho 30 anos", small: "Verbo TER: idade, família, coisas", say: "Tenho trinta anos.", ms: 3800 },
    { kind: "table", kicker: "VERBO TER", rows: [["eu", "tenho"], ["tu", "tens"], ["ele · ela · você", "tem"], ["nós", "temos"], ["eles · elas · vocês", "têm"]], say: "Eu tenho, tu tens, ele tem, nós temos, eles têm.", ms: 8000 },
    { kind: "rule", kicker: "IDADE = TER", big: "Tenho 30 anos.", note: "A idade é com TER. Nunca “sou 30 anos”.", say: "Tenho trinta anos.", ms: 6000 },
    { kind: "rule", kicker: "TEM vs TÊM", big: "Ela tem · Eles têm", note: "Plural leva chapéu: têm. Ouve-se mais longo.", say: "Ela tem um gato. Eles têm dois gatos.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.eles_tem", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.eu_tenho", ms: 7000 },
    { kind: "summary", rows: [["eu / tu", "tenho / tens"], ["ele · ela", "tem"], ["nós / eles", "temos / têm ^"]], ms: 5000 },
  ],
  "u01.verbos_ar": [
    { kind: "title", big: "Falo · falas · fala", small: "Verbos regulares em -AR", say: "Eu falo português.", ms: 3800 },
    { kind: "table", kicker: "FALAR", rows: [["eu", "falo"], ["tu", "falas"], ["ele · ela · você", "fala"], ["nós", "falamos"], ["eles · elas · vocês", "falam"]], say: "Eu falo, tu falas, ele fala, nós falamos, eles falam.", ms: 8000 },
    { kind: "rule", kicker: "O PADRÃO", big: "-o · -as · -a · -amos · -am", note: "Funciona com morar, trabalhar, estudar, gostar, jogar…", say: "Moro, moras, mora, moramos, moram.", ms: 6500 },
    { kind: "example", big: "Moro em Lisboa e trabalho num hospital.", note: "morar → moro · trabalhar → trabalho", emoji: "🏥", say: "Moro em Lisboa e trabalho num hospital.", ms: 6500 },
    { kind: "rule", kicker: "GOSTAR DE", big: "Gosto de viajar.", note: "“gostar” pede sempre “de”.", say: "Gosto de viajar.", ms: 5500 },
    { kind: "check", itemId: "grammar.frame.nos_moramos", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.eles_estudam", ms: 7000 },
    { kind: "summary", rows: [["eu", "-o"], ["tu", "-as"], ["ele", "-a"], ["nós", "-amos"], ["eles", "-am"]], ms: 5000 },
  ],
  "u01.chamar_se": [
    { kind: "title", big: "Como te chamas?", small: "Chamar-se: dizer o nome", say: "Como te chamas?", ms: 3800 },
    { kind: "table", kicker: "CHAMAR-SE", rows: [["eu", "chamo-me"], ["tu", "chamas-te"], ["ele · ela · você", "chama-se"], ["nós", "chamamo-nos"], ["eles · elas · vocês", "chamam-se"]], say: "Chamo-me, chamas-te, chama-se.", ms: 8000 },
    { kind: "rule", kicker: "TU vs VOCÊ", big: "Como te chamas? · Como se chama?", note: "tu = informal (amigos) · você / o senhor = formal", say: "Como te chamas? Como se chama?", ms: 6500 },
    { kind: "rule", kicker: "COM “NÃO”", big: "Não me chamo Paulo.", note: "Com “não”, o pronome passa para ANTES do verbo.", say: "Não me chamo Paulo.", ms: 6500 },
    { kind: "check", itemId: "grammar.frame.eu_chamo", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.ele_chama", ms: 7000 },
    { kind: "summary", rows: [["eu", "chamo-me"], ["ele · ela", "chama-se"], ["negativa", "não me chamo"]], ms: 5000 },
  ],
  "u01.nacionalidades": [
    { kind: "title", big: "Sou português!", small: "Nacionalidades: masculino e feminino", say: "Sou português. Sou portuguesa.", ms: 3800 },
    { kind: "table", kicker: "-ÊS → -ESA", rows: [["português", "portuguesa"], ["francês", "francesa"], ["inglês", "inglesa"], ["japonês", "japonesa"]], note: "No feminino o acento desaparece.", say: "Português, portuguesa. Francês, francesa.", ms: 7500 },
    { kind: "table", kicker: "-O → -A", rows: [["italiano", "italiana"], ["brasileiro", "brasileira"], ["sueco", "sueca"], ["angolano", "angolana"]], say: "Italiano, italiana. Brasileiro, brasileira.", ms: 7000 },
    { kind: "table", kicker: "ESPECIAIS", rows: [["alemão", "alemã · alemães"], ["espanhol", "espanhola · espanhóis"], ["belga · guineense", "iguais m/f"]], say: "Alemão, alemã. Espanhol, espanhola.", ms: 7500 },
    { kind: "check", itemId: "vocab.nationality.alemanha", ms: 7000 },
    { kind: "check", itemId: "vocab.nationality.japao", ms: 7000 },
    { kind: "summary", rows: [["-ês", "-esa"], ["-o", "-a"], ["alemão", "alemã"], ["-ense / belga", "igual"]], ms: 5000 },
  ],
  "u01.profissoes": [
    { kind: "title", big: "O que fazes?", small: "Profissões: o médico, a médica", say: "Sou médico. Sou médica.", ms: 3800 },
    { kind: "table", kicker: "-O → -A", rows: [["médico", "médica"], ["advogado", "advogada"], ["engenheiro", "engenheira"], ["empregado de mesa", "empregada de mesa"]], say: "Médico, médica. Advogado, advogada.", ms: 7500 },
    { kind: "table", kicker: "-OR → -ORA", rows: [["professor", "professora"], ["escritor", "escritora"], ["gestor", "gestora"]], say: "Professor, professora.", ms: 6500 },
    { kind: "rule", kicker: "IGUAIS", big: "o jornalista · a jornalista", note: "-ista e -ante não mudam: só muda o artigo (o/a estudante).", say: "O jornalista. A jornalista.", ms: 6500 },
    { kind: "example", kicker: "ONDE TRABALHA?", big: "O médico trabalha no hospital.", note: "professor → escola · cozinheiro → cozinha · piloto → avião", emoji: "🏥", say: "O médico trabalha no hospital.", ms: 6500 },
    { kind: "check", itemId: "vocab.profession.advogado", ms: 7000 },
    { kind: "check", itemId: "vocab.profession.jornalista", ms: 7000 },
    { kind: "summary", rows: [["-o", "-a"], ["-or", "-ora"], ["-ista · -ante", "igual"]], ms: 5000 },
  ],
  "u01.de_origin": [
    { kind: "title", big: "De onde és?", small: "de · do · da · dos · das", say: "De onde és?", ms: 3600 },
    { kind: "example", kicker: "CIDADES", big: "Sou de Lisboa.", note: "Cidades: normalmente SEM artigo → só de", emoji: "🏙️", say: "Sou de Lisboa.", ms: 5200 },
    { kind: "merge", a: "de", b: "o", result: "do", example: "o Brasil → Sou do Brasil.", emoji: "🇧🇷", say: "Sou do Brasil.", ms: 5200 },
    { kind: "merge", a: "de", b: "a", result: "da", example: "a Alemanha → Sou da Alemanha.", emoji: "🇩🇪", say: "Sou da Alemanha.", ms: 5200 },
    { kind: "merge", a: "de", b: "os", result: "dos", example: "os Estados Unidos → Sou dos Estados Unidos.", emoji: "🇺🇸", say: "Sou dos Estados Unidos.", ms: 5600 },
    { kind: "rule", kicker: "ATENÇÃO", big: "Sou do Porto!", note: "Exceção: o Porto tem artigo (tal como o Rio de Janeiro).", say: "Sou do Porto.", ms: 5200 },
    { kind: "rule", kicker: "SEM ARTIGO", big: "Sou de Portugal.", note: "Alguns países não levam artigo: Portugal, Angola, Moçambique…", say: "Sou de Portugal.", ms: 5000 },
    { kind: "check", itemId: "grammar.origin.alemanha", ms: 7000 },
    { kind: "check", itemId: "grammar.origin.porto", ms: 7000 },
    { kind: "summary", rows: [["de + o", "do"], ["de + a", "da"], ["de + os", "dos"], ["de + as", "das"]], note: "Cidades sem artigo: de Lisboa · Exceções: do Porto", ms: 4200 },
  ],
  "u01.em_lugar": [
    { kind: "title", big: "Onde moras?", small: "em · no · na · nos · nas", say: "Onde moras?", ms: 3600 },
    { kind: "example", kicker: "CIDADES", big: "Moro em Lisboa.", note: "Cidades sem artigo → só em", emoji: "🏙️", say: "Moro em Lisboa.", ms: 5200 },
    { kind: "merge", a: "em", b: "o", result: "no", example: "o Porto → Moro no Porto.", emoji: "🍷", say: "Moro no Porto.", ms: 5200 },
    { kind: "merge", a: "em", b: "a", result: "na", example: "a Alemanha → Ela mora na Alemanha.", emoji: "🇩🇪", say: "Ela mora na Alemanha.", ms: 5200 },
    { kind: "merge", a: "em", b: "os", result: "nos", example: "os Estados Unidos → Trabalham nos Estados Unidos.", emoji: "🇺🇸", say: "Trabalham nos Estados Unidos.", ms: 5600 },
    { kind: "rule", kicker: "TAMBÉM LUGARES", big: "Estudo na universidade.", note: "a universidade → na · o hospital → no", say: "Estudo na universidade.", ms: 5500 },
    { kind: "check", itemId: "grammar.frame.em_porto", ms: 7000 },
    { kind: "check", itemId: "grammar.frame.em_suecia", ms: 7000 },
    { kind: "summary", rows: [["em + o", "no"], ["em + a", "na"], ["em + os", "nos"], ["em + as", "nas"]], ms: 4200 },
  ],
  "u01.numeros": [
    { kind: "title", big: "0 · 1 · 2 · 3…", small: "Números até 20", say: "Um, dois, três.", ms: 3600 },
    { kind: "table", kicker: "1 E 2 CONCORDAM", rows: [["1", "um · uma"], ["2", "dois · duas"]], note: "um livro, uma casa · dois homens, duas mulheres", say: "Um, uma. Dois, duas.", ms: 6500 },
    { kind: "table", kicker: "11 A 15", rows: [["11 · 12", "onze · doze"], ["13 · 14", "treze · catorze"], ["15", "quinze"]], say: "Onze, doze, treze, catorze, quinze.", ms: 7000 },
    { kind: "table", kicker: "16 A 20 (PT-PT)", rows: [["16 · 17", "dezasseis · dezassete"], ["18 · 19", "dezoito · dezanove"], ["20", "vinte"]], note: "Em Portugal: dezasseis, dezassete, dezanove — com “a”.", say: "Dezasseis, dezassete, dezoito, dezanove, vinte.", ms: 7500 },
    { kind: "rule", kicker: "OUVE BEM", big: "três ≠ treze · dois ≠ doze", note: "Uma sílaba vs duas sílabas.", say: "Três. Treze. Dois. Doze.", ms: 6000 },
    { kind: "check", itemId: "vocab.number.n13", ms: 7000 },
    { kind: "check", itemId: "vocab.number.n16", ms: 7000 },
    { kind: "summary", rows: [["13 · 14", "treze · catorze"], ["16 · 17", "dezasseis · dezassete"], ["19", "dezanove"]], ms: 4500 },
  ],
};

import { U02_AULAS } from "./lessons/u02.ts";
import { U03_AULAS } from "./lessons/u03.ts";
import { U04_AULAS } from "./lessons/u04.ts";
import { U05_AULAS } from "./lessons/u05.ts";
import { U06_AULAS } from "./lessons/u06.ts";
import { U07_AULAS } from "./lessons/u07.ts";
import { U08_AULAS } from "./lessons/u08.ts";

export const AULAS: Record<string, AulaStep[]> = { ...BASE_AULAS, ...U02_AULAS, ...U03_AULAS, ...U04_AULAS, ...U05_AULAS, ...U06_AULAS, ...U07_AULAS, ...U08_AULAS };
