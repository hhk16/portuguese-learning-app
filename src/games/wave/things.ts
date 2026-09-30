/**
 * Na Mesma Onda "thing" clues (Wavelength spirit): for each spectrum, everyday things spread over
 * the whole dial, from obvious extremes through middle-ish things to a few debatable ones that are
 * fun to argue about ("o mar é frio?" — in Portugal, the Atlantic says yes). Pure data.
 */

/** A thing the psychic can use as a clue, with where most people would put it (0 = left pole, 100 = right pole). The position is only a hint for bots/tests; scoring never uses it. */
export interface ThingClue {
  noun: string;
  at: number;
}

/** Keyed "<leftSlug>|<rightSlug>" exactly as spectra() orders them. `noun` is a slug of vocab.noun.<slug>. */
export const THINGS: Record<string, ThingClue[]> = {
  "frio|quente": [
    { noun: "gelo", at: 3 },
    { noun: "gelado", at: 6 },
    { noun: "neve", at: 8 },
    { noun: "cerveja", at: 20 },
    { noun: "mar", at: 25 }, // the Atlantic in Portugal: debatable
    { noun: "sumo", at: 28 },
    { noun: "agua", at: 38 },
    { noun: "salada", at: 42 },
    { noun: "leite", at: 45 },
    { noun: "pao", at: 55 },
    { noun: "chuveiro", at: 70 }, // depends who showers first
    { noun: "sopa", at: 82 },
    { noun: "cha", at: 85 },
    { noun: "cafe", at: 88 },
    { noun: "sol", at: 93 },
    { noun: "fogo", at: 98 },
  ],
  "grande|pequeno": [
    { noun: "montanha", at: 3 },
    { noun: "elefante", at: 8 },
    { noun: "aviao", at: 10 },
    { noun: "comboio", at: 14 },
    { noun: "estrela", at: 20 }, // enormous, but it looks tiny
    { noun: "cavalo", at: 28 },
    { noun: "sofa", at: 36 },
    { noun: "televisao", at: 42 },
    { noun: "cao", at: 48 }, // a Serra da Estrela or a chihuahua?
    { noun: "gato", at: 62 },
    { noun: "telemovel", at: 70 },
    { noun: "maca", at: 76 },
    { noun: "ovo", at: 82 },
    { noun: "rato", at: 85 },
    { noun: "chave", at: 88 },
    { noun: "abelha", at: 95 },
  ],
  "barato|caro": [
    { noun: "sal", at: 3 },
    { noun: "agua", at: 5 },
    { noun: "pao", at: 6 },
    { noun: "cafe", at: 10 }, // a bica in Portugal
    { noun: "batata", at: 12 },
    { noun: "cerveja", at: 20 },
    { noun: "gelado", at: 28 },
    { noun: "pizza", at: 38 },
    { noun: "livro", at: 40 },
    { noun: "vinho", at: 48 }, // from €2 to €200
    { noun: "sapatilhas", at: 55 },
    { noun: "guitarra", at: 62 },
    { noun: "relogio", at: 70 },
    { noun: "telemovel", at: 78 },
    { noun: "carro", at: 92 },
    { noun: "casa", at: 98 },
  ],
  "feliz|triste": [
    { noun: "presente", at: 5 },
    { noun: "bolo", at: 7 },
    { noun: "arco_iris", at: 10 },
    { noun: "praia", at: 14 },
    { noun: "cao", at: 20 },
    { noun: "flor", at: 22 },
    { noun: "gato", at: 28 },
    { noun: "dinheiro", at: 35 }, // does it buy happiness?
    { noun: "escola", at: 45 },
    { noun: "lua", at: 50 },
    { noun: "jornal", at: 60 }, // the news…
    { noun: "nuvem", at: 64 },
    { noun: "guarda_chuva", at: 70 },
    { noun: "chuva", at: 76 },
    { noun: "cebola", at: 82 }, // it makes you cry
    { noun: "hospital", at: 86 },
  ],
  "dificil|facil": [
    { noun: "aviao", at: 4 }, // flying one
    { noun: "barco", at: 15 },
    { noun: "guitarra", at: 18 },
    { noun: "croissant", at: 22 }, // making one at home
    { noun: "cavalo", at: 25 },
    { noun: "pao", at: 32 },
    { noun: "mota", at: 38 },
    { noun: "carro", at: 42 }, // parking in Lisbon…
    { noun: "computador", at: 48 },
    { noun: "gato", at: 55 },
    { noun: "livro", at: 62 },
    { noun: "bicicleta", at: 72 }, // once you know how
    { noun: "telemovel", at: 76 },
    { noun: "ovo", at: 85 },
    { noun: "bola", at: 88 },
    { noun: "televisao", at: 96 },
  ],
  "lento|rapido": [
    { noun: "caracol", at: 2 },
    { noun: "vaca", at: 14 },
    { noun: "elefante", at: 26 }, // they can run!
    { noun: "eletrico", at: 28 },
    { noun: "autocarro", at: 36 },
    { noun: "barco", at: 40 },
    { noun: "trotinete", at: 44 },
    { noun: "bicicleta", at: 48 },
    { noun: "metro", at: 58 },
    { noun: "gato", at: 64 },
    { noun: "comboio", at: 70 }, // Alfa Pendular or the regional?
    { noun: "passaro", at: 72 },
    { noun: "cavalo", at: 78 },
    { noun: "carro", at: 80 },
    { noun: "mota", at: 84 },
    { noun: "aviao", at: 96 },
  ],
  "bom|mau": [
    { noun: "chocolate", at: 5 },
    { noun: "bolo", at: 7 },
    { noun: "gelado", at: 10 },
    { noun: "praia", at: 14 },
    { noun: "pizza", at: 16 },
    { noun: "cafe", at: 20 },
    { noun: "sopa", at: 26 },
    { noun: "salada", at: 38 }, // good for you, but…
    { noun: "cerveja", at: 45 },
    { noun: "hamburguer", at: 48 },
    { noun: "abelha", at: 55 }, // honey or a sting?
    { noun: "cebola", at: 58 },
    { noun: "chuva", at: 62 },
    { noun: "fogo", at: 74 },
    { noun: "rato", at: 80 },
    { noun: "tubarao", at: 86 },
  ],
  "novo|velho": [
    { noun: "presente", at: 4 },
    { noun: "trotinete", at: 8 },
    { noun: "telemovel", at: 10 },
    { noun: "computador", at: 18 },
    { noun: "sapatilhas", at: 22 },
    { noun: "televisao", at: 38 },
    { noun: "aviao", at: 42 },
    { noun: "carro", at: 45 },
    { noun: "bicicleta", at: 52 },
    { noun: "comboio", at: 58 },
    { noun: "livro", at: 62 },
    { noun: "vinho", at: 70 }, // old wine is good wine
    { noun: "eletrico", at: 76 }, // Lisbon's trams
    { noun: "igreja", at: 85 },
    { noun: "castelo", at: 92 },
    { noun: "montanha", at: 98 },
  ],
  "bonito|feio": [
    { noun: "arco_iris", at: 3 },
    { noun: "flor", at: 5 },
    { noun: "praia", at: 8 },
    { noun: "mar", at: 12 },
    { noun: "estrela", at: 14 },
    { noun: "castelo", at: 20 },
    { noun: "cavalo", at: 26 },
    { noun: "nuvem", at: 36 },
    { noun: "cao", at: 40 },
    { noun: "chapeu", at: 48 }, // depends on the hat
    { noun: "vaca", at: 52 },
    { noun: "guarda_chuva", at: 58 },
    { noun: "caracol", at: 68 },
    { noun: "porco", at: 72 }, // some people love pigs
    { noun: "rato", at: 78 },
    { noun: "sanita", at: 86 },
  ],
  "barulhento|calmo": [
    { noun: "aviao", at: 3 },
    { noun: "mota", at: 8 },
    { noun: "aeroporto", at: 12 },
    { noun: "guitarra", at: 20 },
    { noun: "cao", at: 24 },
    { noun: "escola", at: 30 },
    { noun: "carro", at: 36 },
    { noun: "galinha", at: 42 },
    { noun: "praia", at: 52 }, // August or October?
    { noun: "mar", at: 58 },
    { noun: "cinema", at: 62 },
    { noun: "gato", at: 72 },
    { noun: "arvore", at: 78 },
    { noun: "museu", at: 82 },
    { noun: "livro", at: 90 },
    { noun: "peixe", at: 94 },
  ],
  "leve|pesado": [
    { noun: "balao", at: 2 },
    { noun: "meia", at: 5 },
    { noun: "lapis", at: 7 },
    { noun: "bola", at: 20 },
    { noun: "telemovel", at: 24 },
    { noun: "guitarra", at: 36 },
    { noun: "livro", at: 38 },
    { noun: "gato", at: 44 },
    { noun: "mochila", at: 52 }, // a school bag on a Monday…
    { noun: "bicicleta", at: 58 },
    { noun: "melancia", at: 64 },
    { noun: "mala", at: 68 },
    { noun: "sofa", at: 78 },
    { noun: "cavalo", at: 85 },
    { noun: "carro", at: 90 },
    { noun: "elefante", at: 96 },
  ],
  "limpo|sujo": [
    { noun: "chuveiro", at: 3 },
    { noun: "neve", at: 8 },
    { noun: "hospital", at: 10 },
    { noun: "agua", at: 15 },
    { noun: "gato", at: 24 }, // cats wash all day
    { noun: "cama", at: 28 },
    { noun: "praia", at: 38 },
    { noun: "mao", at: 50 },
    { noun: "carro", at: 55 },
    { noun: "metro", at: 60 },
    { noun: "cao", at: 64 },
    { noun: "sapatilhas", at: 70 },
    { noun: "telemovel", at: 72 }, // dirtier than you think
    { noun: "meia", at: 78 },
    { noun: "dinheiro", at: 80 },
    { noun: "porco", at: 92 },
  ],
};
