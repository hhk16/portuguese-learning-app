/** Grande Final on the phone: pick or type the Portuguese word, or tap the picture you heard. First wins. */
import { useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "final" }>;

export function Final({ v, send }: { v: V; send: Send }) {
  const [text, setText] = useState("");
  const left = useCountdown(v.msLeft);
  const answer = (a: string) => {
    if (!a.trim()) return;
    play("lock");
    navigator.vibrate?.(15);
    send({ mode: "final", answer: a.trim() });
  };
  if (v.answered)
    return (
      <div className="p-center">
        <div className="p-big">🔒</div>
        <div className="p-sub">Resposta enviada! Olha para a TV. · Locked in — look at the TV!</div>
      </div>
    );
  return (
    <div className="p-col">
      <div className="sync-head">
        <span className="kicker">
          {v.label ?? `Grande Final · ${v.index + 1}/${v.total}`}
          {v.double ? " · ×2!" : ""}
        </span>
        <span className={`pill ${left < 4000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}s</span>
      </div>
      {v.kind === "frase" ? (
        <div className="p-callout">
          <b className="display">🔊 Ouve o pedido!</b>
          <span>Listen to the order on the TV: what did the customer ask for? Be the first!</span>
        </div>
      ) : v.kind === "see" ? (
        <div className="p-callout">
          <b className="display">Como se diz? {v.prompt?.pic && <Picture glyph={v.prompt.pic} size="36px" />}</b>
          <span>How do you say “{v.prompt?.en}” in Portuguese? Look at the TV — first right answer wins!</span>
        </div>
      ) : !v.options ? (
        <div className="p-callout">
          <b className="display">🔊 Ouve e escreve!</b>
          <span>Listen to the TV and type the word in Portuguese (the “o/a” is optional). You both need it!</span>
        </div>
      ) : (
        <div className="p-callout">
          <b className="display">🔊 Ouve e toca!</b>
          <span>{v.label ? "Listen to the TV and tap it — fast! You score when you both get it." : "Listen to the TV and tap the picture — be the first!"}</span>
        </div>
      )}
      {v.options ? (
        <div className={v.pictures ? "final-pics" : "draw-options"}>
          {v.options.map((o) => (
            <button key={o.pt} className={v.pictures ? "final-pic card" : "lopt card"} onClick={() => answer(o.pt)}>
              {v.kind === "frase" && <b className="display frase-n">{o.en}×</b>}
              {v.pictures ? <Picture glyph={o.pic} size="64px" /> : <span>{o.pt}</span>}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="sync-form"
          onSubmit={(e) => {
            e.preventDefault();
            answer(text);
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreve em português · Type in Portuguese" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} autoFocus />
          <button className="btn player" type="submit" disabled={!text.trim()}>
            OK
          </button>
        </form>
      )}
    </div>
  );
}
