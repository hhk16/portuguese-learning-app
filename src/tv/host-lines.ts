/**
 * What the TV host says: short pt-PT lines, always with English underneath (A1 players), and
 * every line pre-recorded by the audio pipeline. Pure data (no DOM) so scripts can read it.
 */
export interface Line {
  pt: string;
  en: string;
}

/** Pipo's pose while saying a line. */
export type Mood = "talk" | "cheer" | "oops";

export type Mode = "lesson" | "secret" | "wave" | "sync" | "draw" | "stop" | "kitchen" | "final";

/** Rules, spoken one by one in the lobby. */
export const RULES: Record<Mode, Line[]> = {
  lesson: [
    { pt: "A TV mostra e diz cada exercício.", en: "The TV shows and says each exercise." },
    { pt: "Cada um responde no seu telemóvel.", en: "Each of you answers on your own phone." },
    { pt: "Acertam os dois? Ganham uma estrela!", en: "Both right? You win a star!" },
  ],
  secret: [
    { pt: "Cada um tem imagens secretas para o outro encontrar.", en: "You each have secret pictures for the other to find." },
    { pt: "Escolhe uma pista no telemóvel. A TV diz a pista.", en: "Pick a clue on your phone. The TV says it out loud." },
    { pt: "O teu par toca nas imagens. Cuidado com as bombas!", en: "Your partner taps the pictures. Watch out for the bombs!" },
  ],
  wave: [
    { pt: "Um mostrador entre dois opostos, por exemplo frio e quente.", en: "A dial between two opposites, like cold and hot." },
    { pt: "Quem vê o alvo escolhe uma coisa como pista: o gelado, o café…", en: "Whoever sees the target picks a thing as the clue: ice cream, coffee…" },
    { pt: "O outro roda o mostrador. Mais perto, mais pontos!", en: "The other turns the dial. Closer means more points!" },
  ],
  sync: [
    { pt: "Aparecem duas palavras.", en: "Two words appear." },
    { pt: "Cada um escolhe uma palavra que liga as duas.", en: "Each of you picks a word that links them." },
    { pt: "A mesma palavra? Estão em sintonia!", en: "The same word? You're in sync!" },
  ],
  draw: [
    { pt: "Um desenha a palavra secreta, sem falar.", en: "One of you draws the secret word, without talking." },
    { pt: "O outro escreve ou diz a palavra.", en: "The other types or says the word." },
    { pt: "Mais rápido, mais pontos!", en: "Faster means more points!" },
  ],
  stop: [
    { pt: "Uma letra e quatro categorias.", en: "One letter and four categories." },
    { pt: "Escreve uma palavra para cada uma, com essa letra.", en: "Write a word for each one, starting with that letter." },
    { pt: "Acabaste? Carrega STOP! O outro tem poucos segundos.", en: "Done? Hit STOP! The other player gets a few seconds." },
  ],
  final: [
    { pt: "A Grande Final! Um contra o outro.", en: "The Grand Final! Head to head." },
    { pt: "Vês uma imagem ou ouves uma palavra.", en: "You see a picture or hear a word." },
    { pt: "Responde primeiro no telemóvel e ganha a coroa!", en: "Answer first on your phone and win the crown!" },
  ],
  kitchen: [
    { pt: "Os clientes pedem em português. Ouçam bem!", en: "Customers order in Portuguese. Listen carefully!" },
    { pt: "A comida está nos dois telemóveis. Falem um com o outro!", en: "The food is split across both phones. Talk to each other!" },
    { pt: "Ponham tudo no tabuleiro e sirvam. Não percam clientes!", en: "Put it all on the tray and serve. Don't lose customers!" },
  ],
};

/** Reactions and announcements during games. */
export const SAY = {
  start: { pt: "Vamos jogar!", en: "Let's play!" },
  yourTurn: { pt: "É a tua vez!", en: "Your turn!" },
  nowGuess: { pt: "Agora adivinha!", en: "Now guess!" },
  good: { pt: "Muito bem!", en: "Well done!" },
  perfect: { pt: "Perfeito!", en: "Perfect!" },
  close: { pt: "Quase!", en: "So close!" },
  notQuite: { pt: "Nada disso!", en: "Not quite!" },
  ohNo: { pt: "Oh, não!", en: "Oh no!" },
  bomb: { pt: "Ai, a bomba!", en: "Oops, the bomb!" },
  timeUp: { pt: "Acabou o tempo!", en: "Time's up!" },
  hurry: { pt: "Depressa!", en: "Hurry up!" },
  finalRound: { pt: "Última ronda! Pontos a dobrar!", en: "Final round! Double points!" },
  record: { pt: "Novo recorde!", en: "New record!" },
  youDidIt: { pt: "Conseguiram!", en: "You did it!" },
  nextTime: { pt: "Para a próxima!", en: "Next time!" },
  served: { pt: "Pedido servido!", en: "Order served!" },
  notThat: { pt: "Não é isso!", en: "That's not it!" },
  swap: { pt: "Troca!", en: "Swap!" },
  customerLeft: { pt: "O cliente foi-se embora…", en: "The customer left…" },
  tie: { pt: "Empate! Mais uma letra!", en: "It's a tie! One more letter!" },
  tieBreak: { pt: "Empate! Pergunta de desempate!", en: "A tie! Tie-break question!" },
  inSync: { pt: "Em sintonia!", en: "In sync!" },
  makesSense: { pt: "Faz sentido?", en: "Does it make sense?" },
  listen: { pt: "Ouçam com atenção.", en: "Listen carefully." },
  stop: { pt: "Stop!", en: "Stop!" },
  rush: { pt: "Hora de ponta! Pontos a dobrar!", en: "Rush hour! Double points!" },
  suddenDeath: { pt: "Morte súbita! Sem pistas. Um erro e acabou!", en: "Sudden death! No clues. One mistake and it's over!" },
} satisfies Record<string, Line>;

/** Other ways Pipo says the same thing, so the host doesn't repeat itself. */
export const VARIANTS: Partial<Record<keyof typeof SAY, Line[]>> = {
  start: [{ pt: "Vamos lá!", en: "Here we go!" }],
  good: [
    { pt: "Boa!", en: "Nice!" },
    { pt: "Isso mesmo!", en: "That's it!" },
    { pt: "Excelente!", en: "Excellent!" },
  ],
  perfect: [
    { pt: "Em cheio!", en: "Spot on!" },
    { pt: "Fantástico!", en: "Fantastic!" },
  ],
  close: [
    { pt: "Foi por pouco!", en: "That was close!" },
    { pt: "Tão perto!", en: "So near!" },
  ],
  ohNo: [
    { pt: "Ai, ai, ai…", en: "Oh dear…" },
    { pt: "Que pena!", en: "What a shame!" },
  ],
  bomb: [{ pt: "Bum! Cuidado com as bombas!", en: "Boom! Careful with the bombs!" }],
  timeUp: [{ pt: "Tempo!", en: "Time!" }],
  hurry: [
    { pt: "Rápido, rápido!", en: "Quick, quick!" },
    { pt: "Dez segundos!", en: "Ten seconds!" },
  ],
  youDidIt: [{ pt: "Muito bem, equipa!", en: "Well done, team!" }],
  nextTime: [{ pt: "Vão conseguir da próxima vez!", en: "You'll get it next time!" }],
  served: [{ pt: "Bom apetite!", en: "Enjoy your meal!" }],
  notThat: [{ pt: "Isso não é o pedido!", en: "That's not the order!" }],
  notQuite: [{ pt: "Não é bem isso!", en: "Not really!" }],
};

/** Lines with the player's name ("Boa, Ana!"). Pre-recorded for NAMES; other names use the device voice. */
export const NAMED = {
  yourTurn: { pt: "{name}, é a tua vez!", en: "{name}, it's your turn!" },
  giveClue: { pt: "{name}, dá uma pista!", en: "{name}, give a clue!" },
  pickClue: { pt: "{name}, escolhe uma pista!", en: "{name}, pick a clue!" },
  drawIt: { pt: "{name}, desenha!", en: "{name}, draw!" },
  guessIt: { pt: "{name}, adivinha!", en: "{name}, guess!" },
  wellDone: { pt: "Boa, {name}!", en: "Nice one, {name}!" },
  wins: { pt: "{name} ganha!", en: "{name} wins!" },
  mvp: { pt: "{name} é a estrela da noite!", en: "{name} is tonight's star!" },
} satisfies Record<string, Line>;

/** Names the host's lines are pre-recorded with. */
export const NAMES = ["Hadi", "Ana"];

/** Big one-verb commands on the TV ("Escolhe! · Pick!"). */
export const CUE = {
  pickClue: { pt: "Escolhe uma pista!", en: "Pick a clue!" },
  tap: { pt: "Toca nas imagens!", en: "Tap the pictures!" },
  turn: { pt: "Roda o mostrador!", en: "Turn the dial!" },
  write: { pt: "Escreve uma palavra!", en: "Write one word!" },
  draw: { pt: "Desenha!", en: "Draw!" },
  guess: { pt: "Escreve ou diz!", en: "Type or say it!" },
  fill: { pt: "Escreve!", en: "Write!" },
  cook: { pt: "Ouve e serve!", en: "Listen and serve!" },
  vote: { pt: "Vota!", en: "Vote!" },
} satisfies Record<string, Line>;

const CHEER = new Set<Line>([SAY.good, SAY.perfect, SAY.record, SAY.youDidIt, SAY.served, SAY.inSync, NAMED.wellDone, NAMED.wins, NAMED.mvp]);
const OOPS = new Set<Line>([SAY.ohNo, SAY.bomb, SAY.timeUp, SAY.customerLeft, SAY.notQuite, SAY.nextTime, SAY.notThat, SAY.close]);
export function moodOf(l: Line): Mood {
  return CHEER.has(l) ? "cheer" : OOPS.has(l) ? "oops" : "talk";
}

export function hostSpoken(): string[] {
  const named = Object.values(NAMED).flatMap((l) => NAMES.map((n) => l.pt.replace("{name}", n)));
  return [
    ...Object.values(RULES).flatMap((ls) => ls.map((l) => l.pt)),
    ...Object.values(SAY).map((l) => l.pt),
    ...Object.values(VARIANTS).flatMap((ls) => ls!.map((l) => l.pt)),
    ...named,
  ];
}
