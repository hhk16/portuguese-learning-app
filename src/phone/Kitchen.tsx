/** Cozinha Caótica on the phone: your half of the pantry, the shared tray, Servir. */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "kitchen" }>;

/** "Gorjeta!": the customer asks the one who served to name a dish — type it for a tip. */
function TipCard({ tip, onSend }: { tip: NonNullable<V["tip"]>; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const left = useCountdown(tip.msLeft);
  return (
    <form
      className="p-callout hot tip-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        play("lock");
        onSend(text.trim());
      }}
    >
      <span className="tip-ask">
        <Picture glyph={tip.pic} size="40px" />
        <b className="display">💶 Gorjeta! Como se diz?</b>
        <span className={`pill ${left < 4000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}s</span>
      </span>
      <span className="muted">
        Tip +{tip.bonus}: type it in Portuguese{tip.en ? ` (${tip.en})` : ""}, with o / a
      </span>
      <span className="sync-form">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="o … / a …" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} autoFocus />
        <button className="btn player" type="submit" disabled={!text.trim()}>
          OK
        </button>
      </span>
    </form>
  );
}

export function Kitchen({ v, send }: { v: V; send: Send }) {
  const left = useCountdown(v.msLeft);
  const act = (
    a: Extract<Parameters<Send>[0], { mode: "kitchen" }>["action"],
  ) => send({ mode: "kitchen", action: a });
  return (
    <div className={`p-col kitchen-pad ${v.tip ? "tipping" : ""}`}>
      <div className="kitchen-head">
        <span className="pill">⭐ {v.score}</span>
        <span className="pill hearts-mini">{"♥".repeat(v.hearts)}</span>
        {!v.practice && (
          <span className="pill">
            ⏱ {Math.floor(left / 60000)}:
            {String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}
          </span>
        )}
      </div>
      {v.tip && <TipCard key={v.tip.bonus + ":" + v.served} tip={v.tip} onSend={(text) => act({ a: "tip", text })} />}
      {v.swapped && !v.tip && (
        <div className="p-warn">
          Troca! 🔄 Tens comida nova. · Swap! You have new food.
        </div>
      )}
      {v.rush && (
        <div className="p-warn rush">🔥 Hora de ponta! ×2 · Rush hour!</div>
      )}
      {v.served === 0 && (
        <div className="p-callout soft">
          <b className="display">Ouve os pedidos na TV</b>
          <span>
            Listen to the orders on the TV. Tap your food; ask your partner for
            the rest!
          </span>
        </div>
      )}
      <div className="kicker">A tua despensa · Your pantry</div>
      <div className={`pantry ${v.swapped ? "swapped" : ""}`}>
        {v.pantry.map((d) => (
          <button
            key={d.id}
            className="pantry-item card"
            onClick={(e) => {
              play("tap");
              navigator.vibrate?.(10);
              (e.currentTarget as HTMLElement).animate(
                [{ transform: "scale(0.9)" }, { transform: "scale(1)" }],
                { duration: 160 },
              );
              act({ a: "add", id: d.id });
            }}
          >
            <Picture glyph={d.pic} size="48px" />
            <b className="display">{d.pt}</b>
          </button>
        ))}
      </div>
      <div className="tray card">
        <span className="kicker">Tabuleiro · Tray</span>
        <div className="tray-row">
          {v.tray.length === 0 && <span className="muted">vazio · empty</span>}
          {v.tray.map((t) => (
            <span key={t.pt} className="tray-chip">
              <Picture glyph={t.pic} size="22px" />
              {t.pt}
            </span>
          ))}
        </div>
      </div>
      <div className="p-grow" />
      {/* Always on screen, even in rush hour: the actions are pinned to the bottom. */}
      <div className="kitchen-actions">
        {v.replay && v.replay.length > 0 && !v.tip && (
          <div className="replay-row">
            <span className="kicker">
              🔊 Ouvir outra vez · Hear again (−3 s)
            </span>
            {v.replay.map((t) => (
              <button
                key={t}
                className="btn white mini"
                onClick={() => act({ a: "replay", table: t })}
              >
                {v.tables ? `Mesa ${t}` : "🔊"}
              </button>
            ))}
          </div>
        )}
        <div className="row2">
          <button
            className="btn white"
            disabled={v.tray.length === 0}
            onClick={() => act({ a: "trash" })}
          >
            <span className="bi">
              🗑️ Deitar fora<small>Throw away</small>
            </span>
          </button>
          {!v.tables && (
            <button
              className="btn player"
              disabled={v.tray.length === 0}
              onClick={() => {
                navigator.vibrate?.(20);
                act({ a: "serve" });
              }}
            >
              <span className="bi">
                Servir 🍽️<small>Serve</small>
              </span>
            </button>
          )}
        </div>
        {v.tables && (
          <div className="serve-tables">
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                className="btn player"
                disabled={v.tray.length === 0 || !v.tables!.includes(t)}
                onClick={() => {
                  navigator.vibrate?.(20);
                  act({ a: "serve", table: t });
                }}
              >
                <span className="bi">
                  Mesa {t}
                  <small>Serve table {t}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
