/** The book's units (Português a Valer 1) and the extra everyday-words lessons, for menus and the chapter picker. */
export interface UnitInfo {
  id: string;
  /** Short label for menus ("Unidade 2"). */
  short: string;
  /** The unit's title as in the book. */
  title: string;
  en: string;
  pic: string;
}

export const UNITS: UnitInfo[] = [
  { id: "u00", short: "Unidade 0", title: "Vamos começar?", en: "Let's start: greetings and survival phrases", pic: "👋" },
  { id: "u01", short: "Unidade 1", title: "Olá! Eu sou a Ana.", en: "Introducing yourself: ser, ter, -ar verbs, nationalities, jobs", pic: "🙋" },
  { id: "u02", short: "Unidade 2", title: "A tua amiga é muito simpática!", en: "Family, describing people, -er verbs, estar", pic: "👨‍👩‍👧" },
  { id: "pds1", short: "Revisão 1", title: "Ponto da Situação 1", en: "Review of Units 0–2", pic: "🔁" },
  { id: "u03", short: "Unidade 3", title: "Vamos almoçar?", en: "Food, the café and restaurant, -ir verbs, the time", pic: "🍽️" },
  { id: "u04", short: "Unidade 4", title: "A vossa casa fica longe?", en: "The house, the city, directions, transport", pic: "🏘️" },
  { id: "pds2", short: "Revisão 2", title: "Ponto da Situação 2", en: "Review of Units 3–4", pic: "🔁" },
  { id: "u05", short: "Unidade 5", title: "Como vai estar o tempo?", en: "Weather, seasons, clothes, plans (ir + infinitivo)", pic: "🌦️" },
  { id: "u06", short: "Unidade 6", title: "Estás melhor?", en: "The body, health, the doctor and the pharmacy", pic: "🩺" },
  { id: "pds3", short: "Revisão 3", title: "Ponto da Situação 3", en: "Review of Units 5–6", pic: "🔁" },
  { id: "u07", short: "Unidade 7", title: "Quantos anos fazes?", en: "Dates, birthdays, invitations, the past", pic: "🎂" },
  { id: "u08", short: "Unidade 8", title: "Passei férias em Cabo Verde.", en: "Holidays and travel in the past tense", pic: "🏝️" },
  { id: "pds4", short: "Revisão 4", title: "Ponto da Situação 4", en: "Review of Units 7–8", pic: "🔁" },
  { id: "a1", short: "Dia a dia", title: "Palavras do dia a dia", en: "Everyday words for the picture games", pic: "🧺" },
];

export function unitOf(lessonUnit: string): UnitInfo | undefined {
  // trab/mundo lessons belong to the review block they sit in.
  const id = lessonUnit.startsWith("trab") || lessonUnit.startsWith("mundo") ? `pds${lessonUnit.slice(-1)}` : lessonUnit;
  return UNITS.find((u) => u.id === id);
}
