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

export type Mode = "lesson" | "secret" | "wave" | "sync" | "draw" | "stop" | "bomb" | "kitchen" | "final";

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
    { pt: "Aparecem duas palavras. Cada um escolhe uma palavra que liga as duas.", en: "Two words appear. Each of you picks a word that links them." },
    { pt: "A mesma palavra? Estão em sintonia!", en: "The same word? You're in sync!" },
    { pt: "Palavras diferentes? As vossas palavras são o novo par. Encontrem-se a meio!", en: "Different words? Your two words become the new pair. Meet in the middle!" },
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
  bomb: [
    { pt: "A batata está quente! Responde no telemóvel.", en: "The potato is hot! Answer on your phone." },
    { pt: "Acertaste? A batata passa para o outro.", en: "Got it right? The potato goes to the other player." },
    { pt: "Quando explodir, quem a tiver perde!", en: "When it blows up, whoever is holding it loses!" },
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
  near: { pt: "Perto!", en: "Close!" },
  farOff: { pt: "Estão em ondas diferentes…", en: "You're on different wavelengths…" },
  revenge: { pt: "Vingança na próxima?", en: "Revenge next time?" },
  listenNow: { pt: "Agora, ouçam!", en: "Now, listen!" },
  sentencesNow: { pt: "Agora, frases!", en: "Now, sentences!" },
  champion: { pt: "E a estrela da noite é…", en: "And tonight's star is…" },
  twoChampions: { pt: "Empate! Dois campeões!", en: "A tie! Two champions!" },
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
  betWon: { pt: "Bem apostado!", en: "Good bet!" },
  betLost: { pt: "Aposta perdida!", en: "Bet lost!" },
  bothPredicted: { pt: "Os dois adivinharam!", en: "You both saw it coming!" },
  livesOut: { pt: "Acabaram-se as vidas!", en: "Out of lives!" },
  lifeLost: { pt: "Menos uma vida!", en: "One life lost!" },
  twist: { pt: "Desafio especial!", en: "Special challenge!" },
  galleryTime: { pt: "Vamos ver a galeria!", en: "Let's look at the gallery!" },
  bestDrawing: { pt: "Qual é o melhor desenho?", en: "Which is the best drawing?" },
  hotPotato: { pt: "Batata quente!", en: "Hot potato!" },
  boom: { pt: "Bum!", en: "Boom!" },
  nightMaths: { pt: "Vamos fazer as contas da noite!", en: "Let's add up tonight's points!" },
  sem: { pt: "Atenção: com ou sem?", en: "Careful: with or without?" },
  petNamed: { pt: "Que nome tão bonito!", en: "What a lovely name!" },
  lightning: { pt: "Desafio relâmpago! Quarenta segundos!", en: "Lightning round! Forty seconds!" },
  suddenDeath: { pt: "Morte súbita! Sem pistas. Um erro e acabou!", en: "Sudden death! No clues. One mistake and it's over!" },
} satisfies Record<string, Line>;

/** Other ways Pipo says the same thing, so the host doesn't repeat itself. */
export const VARIANTS: Partial<Record<keyof typeof SAY, Line[]>> = {
  start: [{ pt: "Vamos lá!", en: "Here we go!" }],
  good: [
    { pt: "Boa!", en: "Nice!" },
    { pt: "Isso mesmo!", en: "That's it!" },
  ],
  perfect: [
    { pt: "Em cheio!", en: "Spot on!" },
    { pt: "Fantástico!", en: "Fantastic!" },
    { pt: "Excelente!", en: "Excellent!" },
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
  betWon: [{ pt: "Acertaste na aposta!", en: "You called it!" }],
  betLost: [{ pt: "Falhaste a aposta!", en: "You missed the bet!" }],
  boom: [{ pt: "Bum! Queimou!", en: "Boom! Burned!" }],
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
  noFaith: { pt: "{name}, não acreditaste?!", en: "{name}, you didn't believe it?!" },
  burned: { pt: "{name} queimou-se!", en: "{name} got burned!" },
  hurryUp: { pt: "Despacha-te, {name}!", en: "Hurry up, {name}!" },
  bestBy: { pt: "{name} fez o melhor desenho!", en: "{name} made the best drawing!" },
  mvpGame: { pt: "{name} foi a estrela deste jogo!", en: "{name} was the star of this game!" },
  levelUp: { pt: "{name} subiu de nível!", en: "{name} levelled up!" },
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
  answer: { pt: "Responde!", en: "Answer!" },
  listenTap: { pt: "Ouve e toca!", en: "Listen and tap!" },
  pickBest: { pt: "Escolhe o melhor!", en: "Pick the best!" },
} satisfies Record<string, Line>;

const CHEER = new Set<Line>([SAY.petNamed, NAMED.levelUp, SAY.betWon, SAY.bothPredicted, NAMED.bestBy, NAMED.mvpGame, SAY.near, SAY.good, SAY.perfect, SAY.record, SAY.youDidIt, SAY.served, SAY.inSync, NAMED.wellDone, NAMED.wins, NAMED.mvp]);
const OOPS = new Set<Line>([SAY.betLost, SAY.livesOut, SAY.lifeLost, SAY.boom, NAMED.burned, NAMED.noFaith, SAY.farOff, SAY.revenge, SAY.ohNo, SAY.bomb, SAY.timeUp, SAY.customerLeft, SAY.notQuite, SAY.nextTime, SAY.notThat, SAY.close]);
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

/** Big announcements: Pipo steps to the centre of the stage for these. */
const SPOTLIGHT = new Set<Line>([SAY.lightning, SAY.finalRound, SAY.twist, SAY.rush, SAY.suddenDeath, SAY.nightMaths, SAY.tie, SAY.tieBreak, SAY.hotPotato]);
export function isSpotlight(l: Line): boolean {
  return SPOTLIGHT.has(l);
}
