/** Ana's wardrobe on the phone: tap a top and a bottom — the TV (and this preview) show her wearing them. */
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { lookUrl } from "../art/wardrobe.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";

type V = Extract<ControllerView, { mode: "wardrobe" }>;

export function Wardrobe({ v, send }: { v: V; send: Send }) {
  const pick = (part: "top" | "bottom", id: string) => {
    play("tap");
    navigator.vibrate?.(15);
    send({ mode: "wardrobe", [part]: id });
  };
  const preview = lookUrl({ top: v.top, bottom: v.bottom }, "stand") ?? "/art/characters/ana-stand.webp";
  return (
    <div className="p-col wardrobe">
      <div className="wardrobe-head">
        <img className="wardrobe-preview" src={preview} alt="" key={preview} />
        <div>
          <div className="p-big">Guarda-roupa 👗</div>
          <div className="p-sub">Escolhe a tua roupa — a TV mostra-te com ela. · Pick your outfit and see it on the TV.</div>
        </div>
      </div>
      <div className="kicker">Em cima · Top</div>
      <div className="wardrobe-grid">
        {v.tops.map((t) => (
          <button key={t.id} className={`card wardrobe-opt ${t.id === v.top ? "sel" : ""}`} disabled={!t.available} onClick={() => pick("top", t.id)}>
            <Picture glyph={t.pic} size="28px" />
            <b>{t.pt}</b>
            <small>{t.en}</small>
          </button>
        ))}
      </div>
      <div className="kicker">Em baixo · Bottom</div>
      <div className="wardrobe-grid">
        {v.bottoms.map((b) => (
          <button key={b.id} className={`card wardrobe-opt ${b.id === v.bottom ? "sel" : ""}`} disabled={!b.available} onClick={() => pick("bottom", b.id)}>
            <Picture glyph={b.pic} size="28px" />
            <b>{b.pt}</b>
            <small>{b.available ? b.en : "em breve com esta parte de cima · soon with this top"}</small>
          </button>
        ))}
      </div>
      <button
        className="btn block player"
        onClick={() => {
          play("select");
          send({ mode: "wardrobe", done: true });
        }}
      >
        <span className="bi">
          Pronto! ✨<small>Done</small>
        </span>
      </button>
    </div>
  );
}
