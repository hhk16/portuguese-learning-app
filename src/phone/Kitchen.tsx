/** Cozinha Caótica on the phone: your half of the pantry, the shared tray, Servir. */
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "kitchen" }>;

export function Kitchen({ v, send }: { v: V; send: Send }) {
  const left = useCountdown(v.msLeft);
  const act = (a: Extract<Parameters<Send>[0], { mode: "kitchen" }>["action"]) => send({ mode: "kitchen", action: a });
  return (
    <div className="p-col kitchen-pad">
      <div className="kitchen-head">
        <span className="pill">🍽️ {v.served}</span>
        <span className="pill">
          ⏱ {Math.floor(left / 60000)}:{String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}
        </span>
      </div>
      {v.swapped && <div className="p-warn">Troca! 🔄 Tens comida nova.</div>}
      <div className="kicker">A tua despensa · ouve os pedidos na TV</div>
      <div className={`pantry ${v.swapped ? "swapped" : ""}`}>
        {v.pantry.map((d) => (
          <button
            key={d.id}
            className="pantry-item card"
            onClick={(e) => {
              play("tap");
              navigator.vibrate?.(10);
              (e.currentTarget as HTMLElement).animate([{ transform: "scale(0.9)" }, { transform: "scale(1)" }], { duration: 160 });
              act({ a: "add", id: d.id });
            }}
          >
            <Picture glyph={d.pic} size="64px" />
            <b className="display">{d.pt}</b>
          </button>
        ))}
      </div>
      <div className="tray card">
        <span className="kicker">Tabuleiro</span>
        <div className="tray-row">
          {v.tray.length === 0 && <span className="muted">vazio</span>}
          {v.tray.map((t) => (
            <span key={t.pt} className="tray-chip">
              <Picture glyph={t.pic} size="22px" />
              {t.pt}
            </span>
          ))}
        </div>
      </div>
      <div className="p-grow" />
      <div className="row2">
        <button className="btn white" disabled={v.tray.length === 0} onClick={() => act({ a: "trash" })}>
          🗑️ Deitar fora
        </button>
        <button
          className="btn player"
          disabled={v.tray.length === 0}
          onClick={() => {
            navigator.vibrate?.(20);
            act({ a: "serve" });
          }}
        >
          Servir 🍽️
        </button>
      </div>
    </div>
  );
}
