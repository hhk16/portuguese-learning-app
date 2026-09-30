/**
 * Blip's line bank. Keyed by game event; templates use {name}, {other}, {answer}, {verb}.
 * Blip is a sarcastic little arcade creature, never an encouraging owl. Lines are short
 * (TV-readable) and mostly in simple PT-PT, with an EN subtitle.
 */
export type McEvent =
  | { type: "join"; name: string }
  | { type: "rejoin"; name: string }
  | { type: "welcome" }
  | { type: "partyStart" }
  | { type: "microStart" }
  | { type: "speedUp" }
  | { type: "bothWrong" }
  | { type: "bothRight" }
  | { type: "fastest"; name: string }
  | { type: "streak"; name: string; n: number }
  | { type: "missAgain"; name: string; answer: string; verb?: string }
  | { type: "accentSlip"; name: string; answer: string }
  | { type: "turbo"; name: string }
  | { type: "combo"; name: string }
  | { type: "spinout"; name: string }
  | { type: "leadChange"; name: string; other: string }
  | { type: "ink"; name: string; other: string }
  | { type: "photoFinish" }
  | { type: "raceStart" }
  | { type: "aulaStart" }
  | { type: "aulaEnd" }
  | { type: "win"; name: string; other?: string }
  | { type: "tie" }
  | { type: "solo"; name: string };

export interface Line {
  pt: string;
  en: string;
  mood: "happy" | "smug" | "shock" | "sad" | "hype" | "teach";
}

type Bank = { [K in McEvent["type"]]: Line[] };

export const LINES: Bank = {
  join: [
    { pt: "Olá, {name}! Bem-vindo à festa.", en: "Hi {name}! Welcome to the party.", mood: "happy" },
    { pt: "{name} chegou. Agora sim.", en: "{name} is here. Now we're talking.", mood: "hype" },
    { pt: "Muito prazer, {name}! Eu sou o Blip.", en: "Nice to meet you, {name}! I'm Blip.", mood: "happy" },
  ],
  rejoin: [
    { pt: "Ah, {name}. Tu outra vez.", en: "Ah, {name}. You again.", mood: "smug" },
    { pt: "Bem-vindo de volta, {name}!", en: "Welcome back, {name}!", mood: "happy" },
    { pt: "{name} voltou. Cuidado, toda a gente.", en: "{name} is back. Careful, everyone.", mood: "hype" },
  ],
  welcome: [
    { pt: "Eu sou o Blip. Hoje só se fala português.", en: "I'm Blip. Tonight: Portuguese only.", mood: "smug" },
    { pt: "Liguem os telemóveis. Vamos jogar!", en: "Phones out. Let's play!", mood: "hype" },
  ],
  partyStart: [
    { pt: "Noite de festa! Sem menus, sem pausas.", en: "Party night! No menus, no breaks.", mood: "hype" },
    { pt: "Preparados? Não interessa. Vamos!", en: "Ready? Doesn't matter. Go!", mood: "smug" },
  ],
  microStart: [
    { pt: "Micro Loucura! Olhos no ecrã!", en: "Micro Madness! Eyes on the screen!", mood: "hype" },
    { pt: "Regras? Não há tempo para regras.", en: "Rules? No time for rules.", mood: "smug" },
  ],
  speedUp: [
    { pt: "MAIS RÁPIDO!", en: "FASTER!", mood: "hype" },
    { pt: "Ok, agora a sério.", en: "OK, now for real.", mood: "smug" },
  ],
  bothWrong: [
    { pt: "Excelente. Ninguém fala português.", en: "Excellent. Nobody speaks Portuguese.", mood: "sad" },
    { pt: "Os dois? A sério?", en: "Both of you? Really?", mood: "shock" },
    { pt: "Vou fingir que não vi.", en: "I'll pretend I didn't see that.", mood: "smug" },
  ],
  bothRight: [
    { pt: "OK… agora estão perigosos.", en: "OK… now you're dangerous.", mood: "shock" },
    { pt: "Os dois! Que casal de génios.", en: "Both! What a genius couple.", mood: "happy" },
  ],
  fastest: [
    { pt: "{name}, mais rápido que o Wi-Fi!", en: "{name}, faster than the Wi-Fi!", mood: "hype" },
    { pt: "{name} nem pensou. Assustador.", en: "{name} didn't even think. Scary.", mood: "shock" },
  ],
  streak: [
    { pt: "{name}: {n} seguidas! Alguém pare isto.", en: "{name}: {n} in a row! Someone stop this.", mood: "hype" },
    { pt: "{name} está em chamas!", en: "{name} is on fire!", mood: "hype" },
  ],
  missAgain: [
    { pt: "{name}… tu NÃO és o verbo {verb}.", en: "{name}… you are NOT the verb {verb}.", mood: "smug" },
    { pt: "{name}, é \"{answer}\". Outra vez. Com amor.", en: "{name}, it's \"{answer}\". Again. With love.", mood: "sad" },
    { pt: "\"{answer}\", {name}. Escreve na mão.", en: "\"{answer}\", {name}. Write it on your hand.", mood: "smug" },
  ],
  accentSlip: [
    { pt: "Quase, {name}! O acento conta: {answer}.", en: "Almost, {name}! The accent counts: {answer}.", mood: "teach" },
    { pt: "{name}, o chapéu! {answer} tem chapéu!", en: "{name}, the hat! {answer} has a hat!", mood: "teach" },
  ],
  turbo: [
    { pt: "TURBO para {name}!", en: "TURBO for {name}!", mood: "hype" },
    { pt: "{name} carregou no acelerador!", en: "{name} hit the gas!", mood: "hype" },
  ],
  combo: [
    { pt: "COMBO! {name} está a voar!", en: "COMBO! {name} is flying!", mood: "hype" },
  ],
  spinout: [
    { pt: "{name} está a dar voltas… literalmente.", en: "{name} is spinning… literally.", mood: "smug" },
    { pt: "Pião! Gramática: 1. {name}: 0.", en: "Spin-out! Grammar: 1. {name}: 0.", mood: "smug" },
  ],
  leadChange: [
    { pt: "{name} passa à frente! Adeus, {other}!", en: "{name} takes the lead! Bye, {other}!", mood: "hype" },
  ],
  ink: [
    { pt: "{name} atirou tinta à {other}! Que maldade.", en: "{name} threw ink at {other}! So mean.", mood: "shock" },
  ],
  photoFinish: [
    { pt: "Foto-finish! Ninguém respira!", en: "Photo finish! Nobody breathe!", mood: "shock" },
  ],
  raceStart: [
    { pt: "Turbo Corrida! Respostas rápidas, carros rápidos.", en: "Turbo Race! Fast answers, fast karts.", mood: "hype" },
  ],
  aulaStart: [
    { pt: "Mini Aula. Noventa segundos. Prometo.", en: "Mini lesson. Ninety seconds. Promise.", mood: "teach" },
  ],
  aulaEnd: [
    { pt: "Aula acabada. Agora usem isso na corrida!", en: "Lesson over. Now use it in the race!", mood: "teach" },
  ],
  win: [
    { pt: "{name} ganha! {other}, há sempre amanhã.", en: "{name} wins! {other}, there's always tomorrow.", mood: "hype" },
    { pt: "Parabéns, {name}! Que vergonha, {other}.", en: "Congrats, {name}! Shame on you, {other}.", mood: "smug" },
  ],
  tie: [{ pt: "Empate! Isto é amor verdadeiro.", en: "A tie! That's true love.", mood: "happy" }],
  solo: [{ pt: "Muito bem, {name}. Mas sozinho é fácil.", en: "Well done, {name}. But alone it's easy.", mood: "smug" }],
};

export function fillTemplate(s: string, e: McEvent): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String((e as Record<string, unknown>)[k] ?? ""));
}
