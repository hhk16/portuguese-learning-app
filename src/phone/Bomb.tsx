/** Batata Quente on the phone: answer fast to pass the potato — or, while it's not yours, tell them to hurry. */
import { useEffect } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "bomb" }>;

const ASK: Record<V["kind"], { pt: string; en: string }> = {
  hear: { pt: "🔊 Ouve e toca!", en: "Listen to the TV, tap the picture" },
  see: { pt: "Como se diz?", en: "Tap its name in Portuguese" },
  number: { pt: "Que número é?", en: "Tap the number in words" },
  hearNumber: { pt: "🔊 Ouve o número!", en: "Listen to the TV, tap the number" },
  opposite: { pt: "O contrário de…", en: "Tap the opposite" },
  phrase: { pt: "🔊 Ouve e toca!", en: "Listen to the TV, tap what it said" },
};

export function Bomb({ v, send }: { v: V; send: Send }) {
  const locked = useCountdown(v.lockedMs ?? 0);
  useEffect(() => {
    if (v.holding) navigator.vibrate?.([30, 40, 30]);
  }, [v.holding]);
  const score = (
    <div className="bomb-score">
      <span className="kicker">
        {v.practice ? "Ensaio" : `Batata ${v.round + 1}/${v.rounds}`}
        {v.double ? " · ×2!" : ""}
      </span>
      {v.score.map((s) => (
        <span key={s.name} className="pill">
          {s.name} {s.wins}
        </span>
      ))}
    </div>
  );
  if (!v.holding)
    return (
      <div className="p-col bomb-safe">
        {score}
        <div className="p-center">
          <div className="p-bob">
            <Picture glyph="🥔" size="96px" />
          </div>
          <div className="p-big">A batata está com {v.holder}!</div>
          <div className="p-sub">The potato is with {v.holder}. When it comes back, answer fast!</div>
        </div>
        {v.hurryLeft !== undefined && (
          <button
            className="btn block coral p-hero-btn"
            disabled={v.hurryLeft <= 0}
            onClick={() => {
              play("tap");
              navigator.vibrate?.(25);
              send({ mode: "bomb", hurry: true });
            }}
          >
            <span className="bi">
              Despacha-te! 🔥 ({v.hurryLeft})
              <small>Hurry them up — the fuse burns faster (it might come back to you!)</small>
            </span>
          </button>
        )}
      </div>
    );
  const ask = ASK[v.kind];
  const answer = (a: string) => {
    if (locked > 0) return;
    play("lock");
    navigator.vibrate?.(15);
    send({ mode: "bomb", answer: a });
  };
  return (
    <div className={`p-col bomb-hot ${locked > 0 ? "locked" : ""}`}>
      {score}
      <div className="p-callout hot">
        <b className="display">🥔🔥 {ask.pt}</b>
        <span>{ask.en} — right answer passes the potato!</span>
      </div>
      {v.prompt && (
        <div className="bomb-prompt card">
          {v.prompt.pic && <Picture glyph={v.prompt.pic} size="72px" />}
          {v.kind === "opposite" && <b className="display">{v.prompt.pt}</b>}
        </div>
      )}
      <div className={v.pictures ? "final-pics" : "draw-options"}>
        {(v.options ?? []).map((o) => (
          <button key={o.pt} className={v.pictures ? "final-pic card" : "lopt card"} disabled={locked > 0} onClick={() => answer(o.pt)}>
            {v.pictures ? <Picture glyph={o.pic} size="64px" /> : <span>{o.pt}</span>}
          </button>
        ))}
      </div>
      {locked > 0 && <div className="bomb-locked display">✗ Errado! Espera… · Wrong — wait a moment</div>}
    </div>
  );
}
