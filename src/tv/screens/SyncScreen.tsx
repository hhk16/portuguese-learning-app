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
    if (a.phase !== "countdown" && a.phase !== "write" && a.phase !== "sense") return;
    const id = setInterval(() => force((x) => x + 1), 100);
    return () => clearInterval(id);
  }, [a.phase]);
  if (!a.pair) return null;
  const secs = Math.max(1, Math.ceil((a.phaseEnd - gameNow()) / 1000));
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Em Sintonia" pic="🤝">
        <span className="pill">
          Par {Math.min(a.round + 1, ROUNDS)}/{ROUNDS} · tentativa {a.attempt}/{ATTEMPTS}
        </span>
        {a.final && <span className="pill double-pill">×2</span>}
        {a.phase === "write" && <span className={`pill clock ${a.msLeft < 8000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
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
      <div className="sync-help">
        Uma palavra que ligue as duas <i>One word that links both — the same as your partner</i>
      </div>
      {a.previous.length > 0 && a.phase === "write" && (
        <div className="sync-prev-tv">
          <span className="kicker">Da última vez · Last try</span>
          {a.previous.map((p) => (
            <span key={p.name} className="word-chip">
              <b>{p.name}:</b> “{p.word}”
            </span>
          ))}
        </div>
      )}
      <div className="sync-answers">
        {a.players.map((p) => {
          const w = a.submittedBy(p);
          return (
            <div key={p.playerId} className={`card sync-answer ${a.phase === "reveal" ? (a.lastMatch ? "match" : "miss") : ""}`} data-color={p.color}>
              <Face avatar={p.avatar} color={p.color} size="2.6em" name={p.name} />
              <span className="display">{a.phase === "reveal" || a.phase === "sense" ? `“${w || "—"}”` : w ? "✓ Pronto" : "A pensar…"}</span>
            </div>
          );
        })}
      </div>
      {a.phase === "countdown" && (
        <div className="countdown display">
          <span key={secs}>{secs}</span>
        </div>
      )}
      {a.phase === "sense" && (
        <div className="sync-verdict display">
          Faz sentido? 🤔<i>Same word — does it link them? Vote on your phones</i>
        </div>
      )}
      {a.phase === "reveal" && (
        <div className={`sync-verdict display ${a.lastMatch ? "match" : ""}`}>
          {a.lastMatch ? "Em sintonia!" : a.attempt < ATTEMPTS ? "Quase! Outra vez…" : "Próximo par!"}
          <i>{a.lastMatch ? "In sync!" : a.attempt < ATTEMPTS ? "So close — same pair again" : "Next pair!"}</i>
        </div>
      )}
    </div>
  );
}
