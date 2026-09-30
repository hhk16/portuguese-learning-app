/**
 * A1 core vocabulary for the picture games (Pares Secretos, Em Sintonia, Desenha!):
 * everyday nouns with their article, and adjective opposites for Na Mesma Onda.
 * Chosen from the Camões A1 reference level (everyday objects, food and drink, animals, home,
 * transport, places, weather) in European Portuguese forms (autocarro, comboio, telemóvel…).
 */
import type { KnowledgeItem, Source } from "../schema.ts";

const camoes = (concept: string): Source => ({ sourceId: "camoes-a1", concept });

type N = [slug: string, article: "o" | "a", pt: string, en: string, emoji: string, category: NounCategory];
export type NounCategory = "comida" | "bebida" | "animal" | "casa" | "objeto" | "transporte" | "lugar" | "natureza" | "roupa" | "corpo";

const NOUNS: N[] = [
  // comida
  ["pao", "o", "pão", "bread", "🍞", "comida"],
  ["queijo", "o", "queijo", "cheese", "🧀", "comida"],
  ["ovo", "o", "ovo", "egg", "🥚", "comida"],
  ["maca", "a", "maçã", "apple", "🍎", "comida"],
  ["banana", "a", "banana", "banana", "🍌", "comida"],
  ["laranja", "a", "laranja", "orange", "🍊", "comida"],
  ["morango", "o", "morango", "strawberry", "🍓", "comida"],
  ["uvas", "a", "uva", "grape", "🍇", "comida"],
  ["tomate", "o", "tomate", "tomato", "🍅", "comida"],
  ["cenoura", "a", "cenoura", "carrot", "🥕", "comida"],
  ["batata", "a", "batata", "potato", "🥔", "comida"],
  ["bolo", "o", "bolo", "cake", "🎂", "comida"],
  ["gelado", "o", "gelado", "ice cream", "🍦", "comida"],
  ["sopa", "a", "sopa", "soup", "🍲", "comida"],
  ["pizza", "a", "pizza", "pizza", "🍕", "comida"],
  ["chocolate", "o", "chocolate", "chocolate", "🍫", "comida"],
  ["croissant", "o", "croissant", "croissant", "🥐", "comida"],
  ["salada", "a", "salada", "salad", "🥗", "comida"],
  // bebida
  ["cafe", "o", "café", "coffee", "☕", "bebida"],
  ["agua", "a", "água", "water", "💧", "bebida"],
  ["leite", "o", "leite", "milk", "🥛", "bebida"],
  ["vinho", "o", "vinho", "wine", "🍷", "bebida"],
  ["cerveja", "a", "cerveja", "beer", "🍺", "bebida"],
  // animal
  ["gato", "o", "gato", "cat", "🐱", "animal"],
  ["cao", "o", "cão", "dog", "🐶", "animal"],
  ["peixe", "o", "peixe", "fish", "🐟", "animal"],
  ["passaro", "o", "pássaro", "bird", "🐦", "animal"],
  ["rato", "o", "rato", "mouse", "🐭", "animal"],
  ["elefante", "o", "elefante", "elephant", "🐘", "animal"],
  // casa
  ["casa", "a", "casa", "house", "🏠", "casa"],
  ["cama", "a", "cama", "bed", "🛏️", "casa"],
  ["cadeira", "a", "cadeira", "chair", "🪑", "casa"],
  ["chave", "a", "chave", "key", "🔑", "casa"],
  ["frigideira", "a", "frigideira", "frying pan", "🍳", "casa"],
  ["faca", "a", "faca", "knife", "🔪", "casa"],
  // objeto
  ["livro", "o", "livro", "book", "📖", "objeto"],
  ["lapis", "o", "lápis", "pencil", "✏️", "objeto"],
  ["telemovel", "o", "telemóvel", "mobile phone", "📱", "objeto"],
  ["computador", "o", "computador", "computer", "💻", "objeto"],
  ["televisao", "a", "televisão", "television", "📺", "objeto"],
  ["relogio", "o", "relógio", "watch", "⌚", "objeto"],
  ["mochila", "a", "mochila", "backpack", "🎒", "objeto"],
  ["guitarra", "a", "guitarra", "guitar", "🎸", "objeto"],
  ["bola", "a", "bola", "ball", "⚽", "objeto"],
  ["presente", "o", "presente", "present", "🎁", "objeto"],
  ["dinheiro", "o", "dinheiro", "money", "💶", "objeto"],
  // roupa
  ["camisola", "a", "camisola", "sweater / T-shirt", "👕", "roupa"],
  ["sapatilhas", "a", "sapatilha", "trainer (shoe)", "👟", "roupa"],
  // transporte
  ["carro", "o", "carro", "car", "🚗", "transporte"],
  ["bicicleta", "a", "bicicleta", "bicycle", "🚲", "transporte"],
  ["aviao", "o", "avião", "plane", "✈️", "transporte"],
  ["autocarro", "o", "autocarro", "bus", "🚌", "transporte"],
  ["comboio", "o", "comboio", "train", "🚂", "transporte"],
  // lugar
  ["escola", "a", "escola", "school", "🏫", "lugar"],
  ["hospital", "o", "hospital", "hospital", "🏥", "lugar"],
  ["praia", "a", "praia", "beach", "🏖️", "lugar"],
  ["montanha", "a", "montanha", "mountain", "⛰️", "lugar"],
  ["supermercado", "o", "supermercado", "supermarket", "🛒", "lugar"],
  // natureza
  ["sol", "o", "sol", "sun", "☀️", "natureza"],
  ["lua", "a", "lua", "moon", "🌙", "natureza"],
  ["chuva", "a", "chuva", "rain", "🌧️", "natureza"],
  ["neve", "a", "neve", "snow", "❄️", "natureza"],
  ["arvore", "a", "árvore", "tree", "🌳", "natureza"],
  ["flor", "a", "flor", "flower", "🌷", "natureza"],
  ["fogo", "o", "fogo", "fire", "🔥", "natureza"],
  ["gelo", "o", "gelo", "ice", "🧊", "natureza"],
  // corpo
  ["mao", "a", "mão", "hand", "✋", "corpo"],
  ["olhos", "o", "olho", "eye", "👀", "corpo"],
  ["orelha", "a", "orelha", "ear", "👂", "corpo"],
  ["pe", "o", "pé", "foot", "🦶", "corpo"],
  ["cabeca", "a", "cabeça", "head", "🧠", "corpo"],
];

const nouns: KnowledgeItem[] = NOUNS.map(([slug, article, pt, en, emoji, category]) => ({
  id: `vocab.noun.${slug}`,
  kind: "noun",
  pt,
  article,
  en,
  emoji,
  category,
  source: camoes(`a1-vocabulary-${category}`),
  why: `${article} ${pt} — ${article === "o" ? "masculino" : "feminino"}`,
}));

/* ------------------------- Adjective opposites (Na Mesma Onda) ------------------------- */

type A = [slug: string, m: string, f: string, en: string, emoji: string, opposite: string];
const ADJ: A[] = [
  ["frio", "frio", "fria", "cold", "🥶", "quente"],
  ["quente", "quente", "quente", "hot", "🥵", "frio"],
  ["pequeno", "pequeno", "pequena", "small", "🐭", "grande"],
  ["grande", "grande", "grande", "big", "🐘", "pequeno"],
  ["barato", "barato", "barata", "cheap", "🪙", "caro"],
  ["caro", "caro", "cara", "expensive", "💎", "barato"],
  ["triste", "triste", "triste", "sad", "😢", "feliz"],
  ["feliz", "feliz", "feliz", "happy", "😀", "triste"],
  ["facil", "fácil", "fácil", "easy", "👍", "dificil"],
  ["dificil", "difícil", "difícil", "difficult", "🤯", "facil"],
  ["lento", "lento", "lenta", "slow", "🐢", "rapido"],
  ["rapido", "rápido", "rápida", "fast", "🚀", "lento"],
  ["mau", "mau", "má", "bad", "👎", "bom"],
  ["bom", "bom", "boa", "good", "😋", "mau"],
  ["velho", "velho", "velha", "old", "👴", "novo"],
  ["novo", "novo", "nova", "new / young", "✨", "velho"],
  ["feio", "feio", "feia", "ugly", "🧟", "bonito"],
  ["bonito", "bonito", "bonita", "beautiful", "🌷", "feio"],
  ["calmo", "calmo", "calma", "calm", "😌", "barulhento"],
  ["barulhento", "barulhento", "barulhenta", "noisy", "📢", "calmo"],
  ["leve", "leve", "leve", "light (weight)", "🪶", "pesado"],
  ["pesado", "pesado", "pesada", "heavy", "🏋️", "leve"],
  ["limpo", "limpo", "limpa", "clean", "🧼", "sujo"],
  ["sujo", "sujo", "suja", "dirty", "🦠", "limpo"],
];

const adjectives: KnowledgeItem[] = ADJ.map(([slug, m, f, en, emoji, opposite]) => ({
  id: `vocab.adjective.${slug}`,
  kind: "adjective",
  m,
  f,
  en,
  emoji,
  opposite: `vocab.adjective.${opposite}`,
  source: camoes("a1-adjectives-opposites"),
  why: m === f ? `${m}: igual no masculino e no feminino.` : `${m} (m.) · ${f} (f.)`,
}));

export const A1_CORE_ITEMS: KnowledgeItem[] = [...nouns, ...adjectives];
