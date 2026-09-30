/**
 * Em Sintonia word links: a link word and the everyday nouns it connects. Pairs are drawn from
 * one link's members, so every pair has at least one good answer ("o gelado + a neve → frio").
 * Link words are A1 adjectives (curriculum items), category words and places.
 */
export interface Link {
  /** What the players would write/pick. */
  pt: string;
  en: string;
  pic?: string;
  /** Curriculum item for evidence, when there is one. */
  itemId?: string;
  /** Noun slugs (vocab.noun.<slug>) or professions ("prof:<slug>"). */
  members: string[];
}

const adj = (slug: string, pt: string, en: string, pic: string, members: string[]): Link => ({ pt, en, pic, itemId: `vocab.adjective.${slug}`, members });
const word = (pt: string, en: string, pic: string, members: string[], itemId?: string): Link => ({ pt, en, pic, itemId, members });

export const LINKS: Link[] = [
  adj("frio", "frio", "cold", "🥶", ["gelado", "neve", "gelo", "cerveja"]),
  adj("quente", "quente", "hot", "🥵", ["cafe", "sopa", "sol", "fogo", "pizza"]),
  adj("grande", "grande", "big", "🐘", ["elefante", "aviao", "montanha", "comboio", "autocarro", "casa"]),
  adj("pequeno", "pequeno", "small", "🐭", ["rato", "ovo", "morango", "chave", "lapis", "uvas"]),
  adj("caro", "caro", "expensive", "💎", ["vinho", "relogio", "computador", "aviao", "carro", "presente"]),
  adj("barato", "barato", "cheap", "🪙", ["pao", "agua", "banana", "lapis", "batata"]),
  adj("bom", "bom", "good / tasty", "😋", ["chocolate", "bolo", "pizza", "gelado", "croissant"]),
  adj("rapido", "rápido", "fast", "🚀", ["comboio", "carro", "aviao", "cao"]),
  adj("barulhento", "barulhento", "noisy", "📢", ["autocarro", "guitarra", "cao", "aviao", "televisao"]),
  adj("bonito", "bonito", "beautiful", "🌷", ["flor", "praia", "montanha", "presente", "arvore"]),
  adj("pesado", "pesado", "heavy", "🏋️", ["elefante", "mochila", "computador", "televisao", "cama"]),
  adj("leve", "leve", "light", "🪶", ["passaro", "lapis", "bola", "croissant"]),
  word("fruta", "fruit", "🍎", ["maca", "banana", "laranja", "morango", "uvas"]),
  word("bebida", "drink", "🥤", ["cafe", "agua", "leite", "vinho", "cerveja"]),
  word("comida", "food", "🍽️", ["pao", "queijo", "bolo", "pizza", "sopa", "salada", "ovo"]),
  word("animal", "animal", "🐾", ["gato", "cao", "peixe", "passaro", "rato", "elefante"]),
  word("transporte", "transport", "🚦", ["carro", "bicicleta", "aviao", "autocarro", "comboio"]),
  word("natureza", "nature", "🌿", ["sol", "lua", "chuva", "neve", "arvore", "flor", "montanha"]),
  word("corpo", "body", "🧍", ["mao", "olhos", "orelha", "pe", "cabeca"]),
  word("escola", "school", "🏫", ["prof:professor", "livro", "lapis", "mochila"], "vocab.noun.escola"),
  word("hospital", "hospital", "🏥", ["prof:medico", "prof:enfermeiro"], "vocab.noun.hospital"),
  word("cozinha", "kitchen", "🍳", ["prof:cozinheiro", "frigideira", "faca", "ovo"]),
  word("casa", "house / home", "🏠", ["cama", "cadeira", "chave", "televisao", "gato"], "vocab.noun.casa"),
  word("praia", "beach", "🏖️", ["sol", "agua", "peixe", "bola", "gelado"], "vocab.noun.praia"),
  word("noite", "night", "🌙", ["lua", "cama", "vinho"]),
  word("música", "music", "🎵", ["guitarra", "televisao", "passaro"]),
];

/** Links that contain a member. */
export function linksOf(member: string): Link[] {
  return LINKS.filter((l) => l.members.includes(member));
}
