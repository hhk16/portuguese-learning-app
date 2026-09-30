/** Pares Secretos on the TV: the shared board, whose turn it is, the clue, and progress. */
import type { ParesSecretos } from "../../games/secret/secret.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";

export function SecretScreen({ a }: { a: ParesSecretos }) {
  const giver = a.giver;
  const guesser = a.guesser;
  if (a.players.length < 2)
    return (
      <div className="tv-overlay game-screen">
        <GameTop title="Pares Secretos" pic="🕵️" />
        <div className="card stage-card center">
          <h2 className="display">Este jogo precisa de duas pessoas</h2>
          <p className="muted">Chama o teu par para entrar com o telemóvel.</p>
        </div>
      </div>
    );
  return (
    <div className="tv-overlay game-screen">
      <GameTop title="Pares Secretos" pic="🕵️">
        <span className="pill">
          {a.found}/{a.goal} encontrados
        </span>
        <span className="pill">{a.turnsLeft} jogadas</span>
        <span className="pill">{"💣".repeat(Math.max(0, a.lives))}</span>
      </GameTop>
      <div className="turn-banner card">
        {giver && <PlayerChip p={giver} size="2em" />}
        <span>{a.phase === "clue" ? "está a pensar numa pista…" : a.phase === "guess" ? `deu uma pista para ${a.clueCount}` : "Fim!"}</span>
        {a.phase === "guess" && guesser && (
          <>
            <span className="arrow">→</span>
            <PlayerChip p={guesser} size="2em" />
            <span>
              escolhe ({a.guessesLeft} {a.guessesLeft === 1 ? "toque" : "toques"})
            </span>
          </>
        )}
      </div>
      <div className="secret-board">
        {a.cards.map((c) => (
          <div key={c.id} className={`sb-card card s-${c.state} ${a.flash?.id === c.id ? "flash" : ""}`}>
            <Picture glyph={c.card.emoji} size="4.2em" />
            <span className="w display">{c.card.pt}</span>
            {c.state === "found" && <span className="tag good">✓</span>}
            {c.state === "boom" && <span className="tag bad">💣</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
