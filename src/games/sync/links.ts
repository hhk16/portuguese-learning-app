/**
 * Em Sintonia word links: a link word and the everyday nouns it connects. Pairs are drawn from
 * one link's members, so every pair has at least one good answer ("o gelado + a neve → frio").
 * Link words are A1 adjectives (curriculum items), colours, tastes, category words, places and times.
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
  // Adjectives (A1 opposites)
  adj("frio", "frio", "cold", "🥶", ["gelado", "neve", "gelo", "cerveja", "sumo", "mar"]),
  adj("quente", "quente", "hot", "🥵", ["cafe", "sopa", "sol", "fogo", "pizza", "cha", "chuveiro"]),
  adj("grande", "grande", "big", "🐘", ["elefante", "aviao", "montanha", "comboio", "autocarro", "casa", "castelo", "melancia"]),
  adj("pequeno", "pequeno", "small", "🐭", ["rato", "ovo", "morango", "chave", "lapis", "uvas", "abelha", "caracol"]),
  adj("caro", "caro", "expensive", "💎", ["vinho", "relogio", "computador", "aviao", "carro", "presente", "telemovel", "mota"]),
  adj("barato", "barato", "cheap", "🪙", ["pao", "agua", "banana", "lapis", "batata", "arroz", "sal", "cafe"]),
  adj("bom", "bom", "good / tasty", "😋", ["chocolate", "bolo", "pizza", "gelado", "croissant", "hamburguer", "frango", "queijo"]),
  adj("rapido", "rápido", "fast", "🚀", ["comboio", "carro", "aviao", "cao", "mota", "metro", "cavalo", "tubarao"]),
  adj("barulhento", "barulhento", "noisy", "📢", ["autocarro", "guitarra", "cao", "aviao", "televisao", "mota", "galinha"]),
  adj("bonito", "bonito", "beautiful", "🌷", ["flor", "praia", "montanha", "presente", "arvore", "arco_iris", "estrela", "castelo"]),
  adj("pesado", "pesado", "heavy", "🏋️", ["elefante", "mochila", "computador", "televisao", "cama", "sofa", "mala", "melancia"]),
  adj("leve", "leve", "light", "🪶", ["passaro", "lapis", "bola", "croissant", "balao", "meia", "chapeu"]),
  adj("lento", "lento", "slow", "🐢", ["caracol", "eletrico", "barco", "vaca", "bicicleta"]),
  adj("velho", "velho", "old", "👴", ["castelo", "igreja", "museu", "eletrico", "livro", "relogio", "arvore"]),
  adj("novo", "novo", "new", "✨", ["telemovel", "computador", "trotinete", "presente", "sapatilhas", "televisao"]),
  adj("sujo", "sujo", "dirty", "🦠", ["porco", "meia", "sapatilhas", "sanita", "rato", "pe", "dinheiro", "frigideira"]),
  adj("limpo", "limpo", "clean", "🧼", ["chuveiro", "agua", "neve", "hospital", "gato"]),
  adj("calmo", "calmo", "calm", "😌", ["gato", "lua", "peixe", "igreja", "museu", "livro", "caracol"]),
  // Colours, taste and shape
  word("branco", "white", "⚪", ["leite", "neve", "nuvem", "arroz", "sal", "sanita"]),
  word("amarelo", "yellow", "🟡", ["banana", "sol", "limao", "queijo", "abelha", "ananas"]),
  word("verde", "green", "🟢", ["arvore", "salada", "uvas", "melancia", "pera"]),
  word("vermelho", "red", "🔴", ["morango", "tomate", "maca", "fogo", "carro", "boca"]),
  word("doce", "sweet", "🍭", ["chocolate", "bolo", "gelado", "bolacha", "morango", "ananas", "sumo", "melancia"]),
  word("salgado", "salty", "🥨", ["sal", "mar", "queijo", "batata", "sandes", "pizza"]),
  word("redondo", "round", "⭕", ["bola", "laranja", "sol", "pizza", "relogio", "melancia", "balao", "lua"]),
  // Categories
  word("fruta", "fruit", "🍎", ["maca", "banana", "laranja", "morango", "uvas", "ananas", "melancia"]),
  word("bebida", "drink", "🥤", ["cafe", "agua", "leite", "vinho", "cerveja", "sumo", "cha"]),
  word("comida", "food", "🍽️", ["pao", "queijo", "bolo", "pizza", "sopa", "salada", "ovo", "arroz"]),
  word("legumes", "vegetables", "🥦", ["tomate", "cenoura", "batata", "cebola", "salada"]),
  word("carne", "meat", "🍖", ["frango", "hamburguer", "porco", "vaca", "leao", "tubarao"], "vocab.noun.carne"),
  word("animal", "animal", "🐾", ["gato", "cao", "peixe", "passaro", "rato", "elefante", "leao", "cavalo"]),
  word("transporte", "transport", "🚦", ["carro", "bicicleta", "aviao", "autocarro", "comboio", "barco", "mota", "trotinete"]),
  word("natureza", "nature", "🌿", ["sol", "lua", "chuva", "neve", "arvore", "flor", "montanha"]),
  word("corpo", "body", "🧍", ["mao", "olhos", "orelha", "pe", "cabeca", "boca", "nariz"]),
  word("roupa", "clothes", "👕", ["camisola", "sapatilhas", "casaco", "chapeu", "meia", "cachecol"]),
  word("perigoso", "dangerous", "⚠️", ["tubarao", "leao", "fogo", "faca", "abelha", "mota"]),
  // Places
  word("escola", "school", "🏫", ["prof:professor", "livro", "lapis", "mochila", "caneta", "prof:estudante"], "vocab.noun.escola"),
  word("hospital", "hospital", "🏥", ["prof:medico", "prof:enfermeiro", "prof:dentista", "cama", "cabeca"], "vocab.noun.hospital"),
  word("cozinha", "kitchen", "🍳", ["prof:cozinheiro", "frigideira", "faca", "ovo", "sal", "batata"]),
  word("casa", "house / home", "🏠", ["cama", "cadeira", "chave", "televisao", "gato", "porta", "janela", "sofa"], "vocab.noun.casa"),
  word("praia", "beach", "🏖️", ["sol", "agua", "peixe", "bola", "gelado", "chapeu", "mar"], "vocab.noun.praia"),
  word("mar", "sea", "🌊", ["peixe", "tubarao", "barco", "agua", "sal"], "vocab.noun.mar"),
  word("quarto", "bedroom", "🛏️", ["cama", "camisola", "relogio", "livro", "meia", "janela"]),
  word("casa de banho", "bathroom", "🛁", ["chuveiro", "sanita", "agua", "mao", "cabeca"]),
  word("mercado", "market", "🧺", ["peixe", "flor", "queijo", "laranja", "uvas", "pao", "dinheiro"]),
  word("supermercado", "supermarket", "🛒", ["leite", "arroz", "bolacha", "sumo", "dinheiro", "cerveja", "chocolate"], "vocab.noun.supermercado"),
  word("restaurante", "restaurant", "🍴", ["prof:empregado_mesa", "prof:cozinheiro", "vinho", "sopa", "pizza", "dinheiro", "cadeira"]),
  word("estação", "station", "🚉", ["comboio", "metro", "mala", "relogio", "jornal", "cafe"], "vocab.noun.estacao"),
  word("aeroporto", "airport", "🛫", ["aviao", "prof:piloto", "mala", "telemovel", "mochila", "dinheiro"], "vocab.noun.aeroporto"),
  word("cidade", "city", "🏙️", ["eletrico", "metro", "cinema", "museu", "supermercado", "igreja", "hospital"]),
  word("parque", "park", "🏞️", ["cao", "bola", "bicicleta", "passaro", "trotinete", "arvore"]),
  word("jardim", "garden", "🏡", ["flor", "abelha", "prof:jardineiro", "arvore", "caracol"]),
  word("quinta", "farm", "🚜", ["vaca", "porco", "galinha", "cavalo", "ovo", "leite", "cao"]),
  word("escritório", "office", "🏢", ["computador", "telemovel", "caneta", "cadeira", "prof:secretario", "prof:gestor"]),
  // Times and occasions
  word("manhã", "morning", "🌅", ["cafe", "relogio", "jornal", "pao", "chuveiro", "escola"]),
  word("noite", "night", "🌙", ["lua", "cama", "vinho", "estrela", "cinema"]),
  word("pequeno-almoço", "breakfast", "🥐", ["cafe", "leite", "pao", "croissant", "sumo", "ovo", "queijo"]),
  word("verão", "summer", "😎", ["sol", "gelado", "melancia", "sumo", "praia", "cerveja"]),
  word("inverno", "winter", "⛄", ["neve", "casaco", "cachecol", "chuva", "sopa", "cha", "guarda_chuva"]),
  word("Natal", "Christmas", "🎄", ["presente", "arvore", "estrela", "bolo", "chocolate", "vinho"]),
  word("festa", "party", "🥳", ["balao", "bolo", "presente", "cerveja", "pizza", "guitarra"]),
  // Other
  word("céu", "sky", "🌤️", ["lua", "estrela", "nuvem", "sol", "aviao", "passaro", "arco_iris", "balao"]),
  word("música", "music", "🎵", ["guitarra", "televisao", "passaro", "prof:pianista", "orelha", "telemovel"]),
  word("desporto", "sport", "🏅", ["bola", "bicicleta", "sapatilhas", "cavalo", "pe"]),
  word("Portugal", "Portugal", "🇵🇹", ["eletrico", "vinho", "cafe", "castelo", "praia", "sol", "bola"], "vocab.nationality.portugal"),
];

/** Plain category words ("fruta", "animal"…): the obvious clue. Pares Secretos keeps them for Fácil only. */
export const CATEGORY_LINKS: ReadonlySet<string> = new Set(["fruta", "bebida", "comida", "legumes", "carne", "animal", "transporte", "natureza", "corpo", "roupa"]);

/** Links that contain a member. */
export function linksOf(member: string): Link[] {
  return LINKS.filter((l) => l.members.includes(member));
}
