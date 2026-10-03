/**
 * Emoji we ship as Fluent 3D pictures (public/art/pictures) or circle flags (public/art/flags).
 * `node scripts/art/fetch-pictures.ts` downloads these PLUS any emoji it finds in src/curriculum string
 * literals at run time, so new curriculum emoji only need a re-run (optionally paste them here).
 * Digits/numbers are rendered as typography — no keycap emoji.
 */
import { normalizeGlyph } from "./glyph.ts";

/** Snapshot of the emoji used in src/curriculum/**.ts string literals (scripts/art/scan-curriculum.ts). */
export const CURRICULUM_GLYPHS: string[] = [
  "🌅", "☀️", "🌙", "🤯", "🔁", "🐢", "🪪", "🏥", "🏙️", "🇧🇷", "🇩🇪", "🇺🇸", "🍷", "🍞", "🧀", "🥚",
  "🍎", "🍌", "🍊", "🍓", "🍇", "🍅", "🥕", "🥔", "🎂", "🍦", "🍲", "🍕", "🍫", "🥐", "🥗", "☕", "💧",
  "🥛", "🍺", "🐱", "🐶", "🐟", "🐦", "🐭", "🐘", "🏠", "🛏️", "🪑", "🔑", "🍳", "🔪", "📖", "✏️", "📱",
  "💻", "📺", "⌚", "🎒", "🎸", "⚽", "🎁", "💶", "👕", "👟", "🚗", "🚲", "✈️", "🚌", "🚂", "🏫", "🏖️",
  "⛰️", "🛒", "🌧️", "❄️", "🌳", "🌷", "🔥", "🧊", "✋", "👀", "👂", "🦶", "🧠", "🥶", "🥵", "🪙", "💎",
  "😢", "😀", "👍", "🚀", "👎", "😋", "👴", "✨", "🧟", "😌", "📢", "🪶", "🏋️", "🧼", "🦠", "👋", "🚪",
  "⏰", "📅", "🙏", "😊", "😬", "🥺", "💬", "❓", "🇵🇹", "🇨🇳", "🇯🇵", "🇫🇷", "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "🇳🇴", "🇮🇹", "🇦🇴", "🇷🇺", "🇸🇪", "🇪🇬", "🇨🇦", "🇬🇳", "🇸🇹", "🇹🇱", "🇪🇸", "🇧🇪",
  "🧑‍🏫", "🧑‍⚕️", "💉", "👷", "⚖️", "📐", "🧑‍🍳", "🍽️", "💇", "🗂️", "✍️", "📊", "📰", "🎓", "🦷",
  "🚕", "🎹", "💐", "📈", "🗼", "🏝️", "🇲🇿", "🙋", "👉", "🧍", "👫", "👥", "♂", "♀",
];

/** Extra pictures for the party-game UI and upcoming content. */
export const EXTRA_GLYPHS: string[] = [
  "👋", "🙋", "👉", "🧍", "👫", "👥", "🎓", "📘", "✨", "🔊", "🐢", "⭐", "🌟", "🔥", "❤️", "🎉", "🏆",
  "✅", "❌", "⏰", "🍲", "🧊", "☕", "🍦", "☀️", "🌙", "🌧️", "❄️", "🐘", "🐭", "🐱", "🐶", "🐟", "🐦",
  "🍎", "🍌", "🍞", "🧀", "🥚", "🍷", "🍺", "🥛", "💧", "🍕", "🍰", "🍫", "🚗", "🚲", "✈️", "🚌", "🚂",
  "🏠", "🏫", "🏥", "🏖️", "⛰️", "🌳", "🌷", "📚", "📖", "✏️", "🎨", "🎹", "🎸", "⚽", "🎮", "📱", "💻",
  "📺", "👕", "👟", "🎒", "🔑", "⌚", "🛏️", "🪑", "🍳", "🔪", "🥕", "🧅", "🍅", "🥔", "🍋", "🍊", "🍇",
  "🍓", "🍉", "🥐", "🍝", "🍟", "🍔", "🥗", "🧂", "🍯", "🍬", "🥄", "🎂", "🎁", "💰", "💶", "🛒", "🧑‍🍳", "👩‍⚕️",
  "👨‍🏫", "🧑‍🎓", "👷", "👮", "🧑‍🚒", "🧑‍✈️", "🧑‍🌾", "😀", "😢", "😡", "😴", "🤒", "😋", "🥶",
  "🥵", "🤔", "😂", "🥳", "😎", "👍", "👎", "🤝", "🙏", "👂", "👄", "👀", "🧠", "💪", "🦶", "✋",
  "💣", "🔮", "🗣️", "🕵️", "⏱️", "🔇", "🎲", "⚙️", "🌍", "🔢", "➡️", "🤝", "🔁", "📺", "🧩", "💡",
  // Em Sintonia / Pares Secretos link words, game night, practice and the final
  "⚪", "🟡", "🟢", "🔴", "🍭", "🥨", "⭕", "🥤", "🥦", "🍖", "🐾", "🚦", "🌿", "⚠️", "🌊", "🛁", "🧺",
  "🍴", "🚉", "🛫", "🏙️", "🏞️", "🏡", "🚜", "🏢", "⛄", "🎄", "🌤️", "🎵", "🏅", "👑", "🔒", "💓", "🥁",
  "⚖️", "🦜", "🍽️", "👀",
];

/** Union of both lists, de-duplicated by normalised glyph (FE0F-insensitive). */
export const WANTED_GLYPHS: string[] = (() => {
  const seen = new Set<string>();
  return [...CURRICULUM_GLYPHS, ...EXTRA_GLYPHS].filter((g) => {
    const k = normalizeGlyph(g);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})();
