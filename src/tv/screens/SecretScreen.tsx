/** Pares Secretos on the TV: the shared board, whose turn it is, the clue, and progress. */
import type { ParesSecretos } from "../../games/secret/secret.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { DoNow, GameTop } from "./Menus.tsx";

export function SecretScreen({ a }: { a: ParesSecretos }) {
  const giver = a.giver;
  const guesser = a.guesser;
  if (a.players.length < 2)
    return (
      <div className="tv-overlay game-screen">
        <GameTop title="Pares Secretos" pic="🕵️" />
        <div className="card stage-card center">
          <h2 className="display">Este jogo precisa de duas pessoas</h2>
          <p className="muted">Chama o teu par para entrar com o telemóvel. · Ask your partner to join on their phone.</p>
        </div>
      </div>
    );
  return (
    <div className="tv-overlay game-screen">
      <GameTop title="Pares Secretos" pic="🕵️">
        <span className="pill">
          {a.found}/{a.goal} encontrados · found
        </span>
        <span className="pill">
          Turno {Math.min(a.turnsUsed + 1, a.rules.turns)}/{a.rules.turns}
        </span>
        <span className="pill">{a.lives > 0 ? "❤️".repeat(a.lives) : "💔 0"}</span>
        {a.phase === "clue" && !a.inPractice && <span className={`pill clock ${a.msLeft < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
      </GameTop>
      {a.phase === "clue" && giver ? (
        <DoNow who={giver} pt={guesser ? `Dá uma pista a ${guesser.name}!` : "Dá uma pista!"} en={`Pick a clue for your green pictures${guesser ? ` — ${guesser.name} guesses` : ""}`} phone />
      ) : a.phase === "guess" && guesser ? (
        <DoNow who={guesser} pt="Toca nas imagens da pista!" en={`Tap the pictures that fit the clue — ${a.guessesLeft} ${a.guessesLeft === 1 ? "tap" : "taps"} left`} phone />
      ) : a.phase === "sudden" ? (
        <DoNow tone="alert" pt="💓 Morte súbita: toquem sem errar!" en="No clues — one wrong card and it's over" phone />
      ) : (
        <DoNow tone="calm" pt="Fim do jogo!" en="Game over — here's the board" />
      )}
      {/* The clue (status, not an instruction); its row is kept while the clue is being picked so the board never jumps. */}
      {(a.phase === "clue" || a.phase === "guess") && (
        <div className="turn-banner card secret-clue" style={a.phase === "guess" && a.clueWord ? undefined : { visibility: "hidden" }}>
          {giver && <PlayerChip p={giver} size="1.6em" />}
          <span className="kicker">Pista · Clue</span>
          <span className="clue-big display">
            {a.clueWord ? (
              <>
                <Picture glyph={a.clueWord.pic} size="1.4em" /> {a.clueWord.pt} · {a.clueCount}
              </>
            ) : (
              "…"
            )}
            {a.clueTyped && <small className="typed-badge"> ✍️</small>}
          </span>
        </div>
      )}
      <div className={`secret-board n${a.cards.length}`}>
        {a.cards.map((c) => (
          <div key={c.id} className={`sb-card card s-${c.state} ${a.flash?.id === c.id ? "flash" : ""} ${a.flash?.id === c.id && c.state === "boom" ? "shake-screen" : ""}`}>
            <Picture glyph={c.card.emoji} size="3.4em" />
            <span className="w display">{c.card.pt}</span>
            {c.state === "found" && <span className="tag good">✓</span>}
            {c.state === "boom" && <span className="tag bad">💣</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
