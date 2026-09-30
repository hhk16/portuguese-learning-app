/** Apanha! on the TV: listen, then the flipping cards; slam on the phone. */
import { useEffect, useState } from "react";
import type { Apanha } from "../../games/snap/snap.ts";
import { Avatar } from "../../ui/Avatar.tsx";
import { gameNow } from "../clock.ts";
import { getRuntime } from "../runtime.ts";

function useCardIndex(a: Apanha): number {
  const [i, setI] = useState(-1);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setI(a.phase === "flip" ? a.cardAt(gameNow()) : -1);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [a]);
  return i;
}

export function SnapScreen({ a }: { a: Apanha }) {
  const rt = getRuntime();
  const r = a.round;
  const i = useCardIndex(a);
  const card = r && i >= 0 ? r.deck[i] : null;
  return (
    <div className="tv-overlay snap-screen">
      <div className="snap-head">
        <div className="dz-title">APANHA!</div>
        <div className="snap-round">
          {a.index}/{a.totalRounds} {r && !r.written && <span className="badge">SÓ A OUVIR ×2</span>}
        </div>
        <div className="snap-scores">
          {rt.activePlayers.map((p) => (
            <div key={p.playerId} className={`player-chip ${r?.stunned.has(p.playerId) ? "off" : ""}`} data-color={p.color}>
              <Avatar kind={p.avatar} color={p.color} size={40} mood={r?.stunned.has(p.playerId) ? "shock" : "happy"} />
              {p.name}
              <span className="score">{a.scores.get(p.playerId) ?? 0}</span>
              {r?.stunned.has(p.playerId) && <span>🥶</span>}
            </div>
          ))}
        </div>
      </div>
      {!r && (
        <div className="center-stack">
          <div className="slam" style={{ fontSize: "8rem" }}>
            APANHA!
          </div>
          <div className="slam-hint">Ouve a palavra · bate no telemóvel quando a vires</div>
        </div>
      )}
      {r && a.phase === "listen" && (
        <div className="center-stack">
          <div className="snap-ear">👂</div>
          <div className="snap-word">{r.written ? r.target.pt : "Ouve bem…"}</div>
        </div>
      )}
      {r && a.phase === "flip" && (
        <div className="center-stack">
          {r.written && <div className="snap-hint">Apanha: {r.target.pt}</div>}
          {card ? (
            <div key={i} className="snap-card">
              {card.emoji && card.emoji !== card.en && <div className="e">{card.emoji}</div>}
              <div className="en">{card.en}</div>
            </div>
          ) : (
            <div className="snap-card blank">…</div>
          )}
          <div className="snap-dots">
            {r.deck.map((_, k) => (
              <span key={k} className={k === i ? "on" : k < i ? "past" : ""} />
            ))}
          </div>
        </div>
      )}
      {r && a.phase === "reveal" && (
        <div className="center-stack">
          <div className="snap-card reveal">
            {r.target.emoji && r.target.emoji !== r.target.en && <div className="e">{r.target.emoji}</div>}
            <div className="pt">{r.target.pt}</div>
            <div className="en">{r.target.en}</div>
          </div>
          <div className="snap-verdict">{r.winner ? `${r.winner.name} apanhou! +${r.written ? 1 : 2}` : "Ninguém apanhou!"}</div>
        </div>
      )}
    </div>
  );
}
