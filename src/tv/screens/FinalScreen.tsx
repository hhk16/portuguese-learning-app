/** Grande Final on the TV: the question (picture or 🔊), who answered, and the race for the crown. */
import { QUESTIONS, type GrandeFinal } from "../../games/final/final.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

export function FinalScreen({ a }: { a: GrandeFinal }) {
  useTick(200, a.phase === "ask");
  const q = a.q;
  if (!q) return null;
  const secs = Math.ceil(a.msLeft / 1000);
  const top = Math.max(1, ...a.players.map((p) => p.score));
  return (
    <div className="tv-overlay game-screen centered final-screen">
      <GameTop title="Grande Final" pic="🏆">
        <span className="pill">
          Pergunta {Math.min(a.index + 1, QUESTIONS)}/{QUESTIONS}
        </span>
        {a.last && <span className="pill double-pill">×2</span>}
        {a.phase === "ask" && <span className={`pill clock ${a.msLeft < 4000 ? "low" : ""}`}>⏱ {secs}</span>}
      </GameTop>
      <div className="final-stage">
        <div className={`card final-q ${a.phase}`}>
          {q.kind === "see" ? (
            <>
              <span className="kicker">Vê · See — como se diz? · how do you say it?</span>
              <Picture glyph={q.word.emoji} size="7em" />
              <i className="final-en">{q.word.en}</i>
            </>
          ) : (
            <>
              <span className="kicker">Ouve · Listen — toca na imagem · tap the picture</span>
              <span className="final-ear">🔊</span>
            </>
          )}
          {a.phase === "reveal" && (
            <div className="final-answer">
              {q.kind === "hear" && <Picture glyph={q.word.emoji} size="3em" />}
              <b className="display">{q.word.pt}</b>
              <i>{q.word.en}</i>
            </div>
          )}
        </div>
        <div className="final-race">
          {a.players.map((p) => {
            const ans = a.answers.get(p.playerId);
            const first = a.firstRight === p.playerId;
            return (
              <div key={p.playerId} className="race-row">
                <PlayerChip p={p} size="2.2em" />
                <div className="race-bar">
                  <div data-color={p.color} style={{ width: `${(p.score / top) * 100}%` }} />
                </div>
                <b className="pp-score">{p.score}</b>
                <span className={`race-tag ${ans ? (a.phase === "reveal" ? (ans.ok ? "ok" : "bad") : "in") : ""}`}>
                  {ans ? (a.phase === "reveal" ? (ans.ok ? (first ? "1.º ⚡" : "✓") : "✗") : "🔒") : "…"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
