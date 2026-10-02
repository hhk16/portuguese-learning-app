/** Batata Quente on the phone: answer fast to pass the potato — or, while it's not yours, answer your own question to heat it up. */
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

/** The typed "Aquece!" (Médio+): what to write, per kind. */
const TYPED: Partial<Record<V["kind"], { pt: string; en: string }>> = {
  see: { pt: "✍️ Como se diz?", en: "Type its name in Portuguese" },
  number: { pt: "✍️ Escreve o número", en: "Type the number in words" },
  opposite: { pt: "✍️ Escreve o contrário de…", en: "Type the opposite in Portuguese" },
};

export function Bomb({ v, send }: { v: V; send: Send }) {
  const locked = useCountdown(v.lockedMs ?? 0);
  useEffect(() => {
    if (v.holding) navigator.vibrate?.([30, 40, 30]);
  }, [v.holding]);
  // Status row: the round, and each player's pill — the one with the potato is marked 🥔.
  const score = (
    <div className="bomb-score">
      {!v.practice && (
        <span className="kicker">
          Batata {v.round + 1}/{v.rounds}
          {v.double ? " · ×2!" : ""}
        </span>
      )}
      {v.score.map((s) => (
        <span key={s.name} className={`pill ${s.name === v.holder ? "has-potato" : ""}`}>
          {s.name === v.holder ? "🥔 " : ""}
          {s.name} {s.wins}
        </span>
      ))}
    </div>
  );
  if (!v.holding) {
    const sq = v.steal;
    const sLocked = sq?.lockedMs ?? 0;
    return (
      <div className="p-col bomb-safe">
        {score}
        {sq ? (
          <>
            <div className="p-callout hot">
              <b className="display">🔥 Aquece a batata! ({v.hurryLeft ?? 0}×)</b>
              <span>Answer right: {v.holder}&apos;s fuse burns faster.</span>
            </div>
            {sq.prompt && (
              <div className="bomb-prompt card">
                <span className="prompt-label">
                  <b>{(sq.typed && TYPED[sq.kind]?.pt) || ASK[sq.kind].pt}</b>
                  <small>{(sq.typed && TYPED[sq.kind]?.en) || ASK[sq.kind].en}</small>
                </span>
                {sq.prompt.pic && <Picture glyph={sq.prompt.pic} size="56px" />}
                {sq.kind === "opposite" && <b className="display">{sq.prompt.pt}</b>}
              </div>
            )}
            {sq.typed ? (
              <form
                className="sync-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget.elements.namedItem("w") as HTMLInputElement;
                  if (!f.value.trim()) return;
                  play("tap");
                  send({ mode: "bomb", steal: f.value.trim() });
                  f.value = "";
                }}
              >
                <input name="w" placeholder="Escreve em português · Type it in Portuguese" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} disabled={sLocked > 0} />
                <button className="btn player" type="submit" disabled={sLocked > 0}>
                  OK
                </button>
              </form>
            ) : (
            <div className="draw-options">
              {sq.options.map((o) => (
                <button
                  key={o.pt}
                  className="lopt card"
                  disabled={sLocked > 0}
                  onClick={() => {
                    play("tap");
                    navigator.vibrate?.(20);
                    send({ mode: "bomb", steal: o.pt });
                  }}
                >
                  <span>{o.pt}</span>
                </button>
              ))}
            </div>
            )}
            {sLocked > 0 && <div className="bomb-locked display">✗ Errado! Espera… · Wrong — wait a moment</div>}
          </>
        ) : (
          <div className="p-center">
            <div className="p-bob">
              <Picture glyph="🥔" size="96px" />
            </div>
            <div className="p-big">A batata está com {v.holder}!</div>
            <div className="p-sub">
              {v.hurryLeft === 0
                ? `Já aqueceste 3 vezes — agora espera. · ${v.holder} is answering; if right, the potato comes to you!`
                : `${v.holder} is answering — if right, the potato comes to you!`}
            </div>
          </div>
        )}
      </div>
    );
  }
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
        <b className="display">🥔🔥 {(v.typed && TYPED[v.kind]?.pt) || ask.pt}</b>
        <span>{(v.typed && TYPED[v.kind]?.en) || ask.en} — right answer passes the potato!</span>
      </div>
      {v.prompt && (
        <div className="bomb-prompt card">
          {v.prompt.pic && <Picture glyph={v.prompt.pic} size="72px" />}
          {v.kind === "opposite" && <b className="display">{v.prompt.pt}</b>}
        </div>
      )}
      {v.typed && (
        <>
          <form
            className="sync-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget.elements.namedItem("w") as HTMLInputElement;
              if (!f.value.trim()) return;
              answer(f.value.trim());
              f.value = "";
            }}
          >
            <input name="w" placeholder="Escreve em português · Type it in Portuguese" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} disabled={locked > 0} autoFocus />
            <button className="btn player" type="submit" disabled={locked > 0}>
              OK
            </button>
          </form>
          <button className="btn white bomb-lifeline" disabled={locked > 0} onClick={() => (play("tap"), send({ mode: "bomb", lifeline: true }))}>
            <span className="bi">
              🆘 Mostrar opções<small>Show options — the fuse burns faster</small>
            </span>
          </button>
        </>
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
