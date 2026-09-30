/** Unit 0 — "Vamos começar?" (Livro do Aluno pp. 9–12): first survival expressions. */
import type { KnowledgeItem, Source } from "../schema.ts";

const src = (concept: string, pages: number[]): Source => ({ sourceId: "pav1-student", unit: "u00", pages, concept });
const camoes = (concept: string): Source => ({ sourceId: "camoes-a1", concept });

type Ph = [slug: string, pt: string, en: string, fn: "greeting" | "farewell" | "courtesy" | "repair", situation: string, source: Source];
const PHRASES: Ph[] = [
  ["ola", "Olá!", "Hi!", "greeting", "👋", src("greetings", [11])],
  ["bom_dia", "Bom dia!", "Good morning!", "greeting", "🌅", src("greetings", [11])],
  ["boa_tarde", "Boa tarde!", "Good afternoon!", "greeting", "☀️", src("greetings", [11])],
  ["boa_noite", "Boa noite!", "Good evening / night!", "greeting", "🌙", src("greetings", [11])],
  ["adeus", "Adeus!", "Goodbye!", "farewell", "🚪", src("farewells", [11])],
  ["ate_logo", "Até logo!", "See you later!", "farewell", "⏰", src("farewells", [11])],
  ["ate_amanha", "Até amanhã!", "See you tomorrow!", "farewell", "📅", src("farewells", [11])],
  ["obrigado", "Obrigado / Obrigada.", "Thank you.", "courtesy", "🙏", src("courtesy", [11])],
  ["de_nada", "De nada.", "You're welcome.", "courtesy", "😊", src("courtesy", [11])],
  ["desculpe", "Desculpe.", "Sorry / Excuse me.", "courtesy", "😬", src("courtesy", [11])],
  ["por_favor", "Por favor.", "Please.", "courtesy", "🥺", src("courtesy", [11])],
  ["nao_percebo", "Não percebo.", "I don't understand.", "repair", "🤯", src("classroom-expressions", [11])],
  ["pode_repetir", "Pode repetir, por favor?", "Can you repeat, please?", "repair", "🔁", src("classroom-expressions", [11])],
  ["mais_devagar", "Mais devagar, por favor.", "Slower, please.", "repair", "🐢", camoes("communication-repair")],
  ["como_se_diz", "Como se diz … em português?", "How do you say … in Portuguese?", "repair", "💬", src("classroom-expressions", [11])],
  ["o_que_significa", "O que significa …?", "What does … mean?", "repair", "❓", camoes("communication-repair")],
];

export const U00_ITEMS: KnowledgeItem[] = PHRASES.map(([slug, pt, en, fn, situation, source]) => ({
  id: `function.u00.${slug}`,
  kind: "phrase",
  pt,
  en,
  fn,
  situation,
  source,
}));
