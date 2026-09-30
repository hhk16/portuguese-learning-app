/** Em Sintonia on the TV: two words, a countdown, and both secret words revealed together. */
import { useEffect, useState } from "react";
import type { EmSintonia } from "../../games/sync/sync.ts";
import { ATTEMPTS, ROUNDS } from "../../games/sync/sync.ts";
import { Face } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { gameNow } from "../clock.ts";
import { GameTop } from "./Menus.tsx";

export function SyncScreen({ a }: { a: EmSintonia }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (a.phase !== "countdown") return;
    const id = setInterval(() => force((x) => x + 1), 100);
    return () => clearInterval(id);
  }, [a.phase]);
  if (!a.pair) return null;
  const secs = Math.max(1, Math.ceil((a.phaseEnd - gameNow()) / 1000));
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Em Sintonia" pic="🤝">
        <span className="pill">
          Ronda {Math.min(a.round + 1, ROUNDS)}/{ROUNDS} · tentativa {a.attempt}/{ATTEMPTS}
        </span>
        <span className="pill star-pill">{a.score} pontos</span>
      </GameTop>
      <div className="sync-stage">
        <div className="card sync-tv-word">
          {a.pair[0].pic ? <Picture glyph={a.pair[0].pic} size="6em" /> : <span className="no-pic">✍️</span>}
          <b className="display">{a.pair[0].pt}</b>
          {a.pair[0].en && <i>{a.pair[0].en}</i>}
        </div>
        <div className="sync-plus display">+</div>
        <div className="card sync-tv-word">
          {a.pair[1].pic ? <Picture glyph={a.pair[1].pic} size="6em" /> : <span className="no-pic">✍️</span>}
          <b className="display">{a.pair[1].pt}</b>
          {a.pair[1].en && <i>{a.pair[1].en}</i>}
        </div>
      </div>
      <div className="sync-answers">
        {a.players.map((p) => {
          const w = a.submittedBy(p);
          return (
            <div key={p.playerId} className={`card sync-answer ${a.phase === "reveal" ? (a.lastMatch ? "match" : "miss") : ""}`} data-color={p.color}>
              <Face avatar={p.avatar} color={p.color} size="2.6em" name={p.name} />
              <span className="display">{a.phase === "reveal" ? `“${w}”` : w ? "✓ Pronto" : "A pensar…"}</span>
            </div>
          );
        })}
      </div>
      {a.phase === "countdown" && (
        <div className="countdown display">
          <span key={secs}>{secs}</span>
        </div>
      )}
      {a.phase === "reveal" && <div className={`sync-verdict display ${a.lastMatch ? "match" : ""}`}>{a.lastMatch ? "Em sintonia!" : a.attempt < ATTEMPTS ? "Quase! Agora com as vossas palavras…" : "Próxima ronda!"}</div>}
    </div>
  );
}
