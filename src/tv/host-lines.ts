/**
 * What the TV host says: short pt-PT lines, always with English underneath (A1 players), and
 * every line pre-recorded by the audio pipeline. Pure data (no DOM) so scripts can read it.
 */
export interface Line {
  pt: string;
  en: string;
}

export type Mode = "lesson" | "secret" | "wave" | "sync" | "draw" | "stop" | "kitchen";

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
    { pt: "Quem vê o alvo escolhe uma pista: muito frio, um pouco quente…", en: "Whoever sees the target picks a clue: very cold, a bit hot…" },
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
  inSync: { pt: "Em sintonia!", en: "In sync!" },
  makesSense: { pt: "Faz sentido?", en: "Does it make sense?" },
  listen: { pt: "Ouçam com atenção.", en: "Listen carefully." },
  stop: { pt: "Stop!", en: "Stop!" },
  rush: { pt: "Hora de ponta! Pontos a dobrar!", en: "Rush hour! Double points!" },
} satisfies Record<string, Line>;

export function hostSpoken(): string[] {
  return [...Object.values(RULES).flatMap((ls) => ls.map((l) => l.pt)), ...Object.values(SAY).map((l) => l.pt)];
}
