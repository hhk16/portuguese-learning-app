/** Na Mesma Onda on the phone: the psychic sees the target; the guesser turns the dial. */
import { useRef, useState } from "react";
import { DialFace } from "../ui/DialFace.tsx";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";

type V = Extract<ControllerView, { mode: "dial" }>;

export function Dial({ v, send }: { v: V; send: Send }) {
  const [value, setValue] = useState(v.value);
  const last = useRef(0);
  const move = (x: number) => {
    setValue(x);
    const now = performance.now();
    if (now - last.current > 70) {
      last.current = now;
      send({ mode: "dial", action: { a: "move", value: x } });
    }
  };
  const ends = (
    <div className="dial-ends">
      <span>
        <Picture glyph={v.left.pic} size="40px" />
        <b>{v.left.pt}</b>
        <small>{v.left.en}</small>
      </span>
      <span>
        <Picture glyph={v.right.pic} size="40px" />
        <b>{v.right.pt}</b>
        <small>{v.right.en}</small>
      </span>
    </div>
  );
  if (v.phase === "reveal") {
    return (
      <div className="p-col">
        <div className="p-big center">{v.points ? `+${v.points} pontos!` : "Longe…"}</div>
        <DialFace value={v.value} target={v.target} />
        {ends}
        <div className="p-grow" />
        <button className="btn block player" onClick={() => send({ mode: "dial", action: { a: "next" } })}>
          Próximo
        </button>
      </div>
    );
  }
  if (v.role === "psychic") {
    return (
      <div className="p-col">
        <div className="p-callout">
          <b className="display">{v.phase === "clue" ? `Diz UMA palavra a ${v.partner}` : `${v.partner} está a rodar…`}</b>
          <span>O alvo está aqui. Que palavra fica neste sítio entre os dois?</span>
        </div>
        <DialFace value={v.phase === "guess" ? v.value : (v.target ?? 50)} target={v.target} />
        {ends}
        {v.ideas && (
          <>
            <div className="kicker">Ideias de palavras</div>
            <div className="idea-grid">
              {v.ideas.map((w) => (
                <span key={w.pt} className="idea card">
                  <Picture glyph={w.pic} size="30px" />
                  <b>{w.pt}</b>
                </span>
              ))}
            </div>
          </>
        )}
        <div className="p-grow" />
        {v.phase === "clue" && (
          <button className="btn block player" onClick={() => send({ mode: "dial", action: { a: "clued" } })}>
            Já disse a pista
          </button>
        )}
      </div>
    );
  }
  if (v.role === "guess") {
    return (
      <div className="p-col">
        <div className="p-callout">
          <b className="display">Roda o mostrador!</b>
          <span>Onde fica a palavra de {v.partner || "a pista"}?</span>
        </div>
        <DialFace value={value} onDrag={move} />
        {ends}
        <div className="p-grow" />
        <button
          className="btn block player"
          onClick={() => {
            send({ mode: "dial", action: { a: "move", value } });
            play("lock");
            send({ mode: "dial", action: { a: "lock" } });
          }}
        >
          Confirmar
        </button>
      </div>
    );
  }
  return (
    <div className="p-center">
      <div className="p-big">{v.partner} está a pensar…</div>
      <div className="p-sub">Olha para a TV.</div>
    </div>
  );
}
