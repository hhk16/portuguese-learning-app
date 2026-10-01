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
          {a.found}/{a.goal} encontrados · found
        </span>
        <span className="pill">
          Turno {Math.min(a.turnsUsed + 1, a.rules.turns)}/{a.rules.turns}
        </span>
        <span className="pill">{"❤️".repeat(Math.max(0, a.lives))}</span>
        {a.phase === "clue" && !a.inPractice && <span className={`pill clock ${a.msLeft < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
      </GameTop>
      {a.phase === "clue" && a.turnsUsed === 0 && (
        <div className="goal-line">
          🎯 <b>Objetivo: encontrar as {a.goal} imagens secretas em {a.rules.turns} turnos</b> <i>Goal: all {a.goal} in {a.rules.turns} turns, no bombs</i>
        </div>
      )}
      <div className={`turn-banner card ${a.phase === "sudden" ? "sudden" : ""}`}>
        {a.phase === "sudden" && (
          <span className="bi-line">
            <b className="display">💓 Morte súbita!</b>
            <i>Sudden death — no clues, both tap. One wrong card and it's over.</i>
          </span>
        )}
        {giver && a.phase !== "sudden" && <PlayerChip p={giver} size="2em" />}
        {a.phase === "clue" && (
          <span className="bi-line">
            está a escolher uma pista…<i>is choosing a clue</i>
          </span>
        )}
        {a.phase === "guess" && a.clueWord && (
          <>
            <span className="clue-big display">
              <Picture glyph={a.clueWord.pic} size="1.6em" /> {a.clueWord.pt} · {a.clueCount}
            </span>
            <span className="arrow">→</span>
            {guesser && <PlayerChip p={guesser} size="2em" />}
            <span className="bi-line">
              escolhe ({a.guessesLeft})<i>taps the pictures</i>
            </span>
          </>
        )}
        {a.phase === "end" && <span>Fim!</span>}
      </div>
      <div className={`secret-board n${a.cards.length}`}>
        {a.cards.map((c) => (
          <div key={c.id} className={`sb-card card s-${c.state} ${a.flash?.id === c.id ? "flash" : ""} ${a.flash?.id === c.id && c.state === "boom" ? "shake-screen" : ""}`}>
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
