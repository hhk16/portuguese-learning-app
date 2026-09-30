/** Na Mesma Onda on the phone: the psychic sees the target and picks a clue; the guesser turns the dial. */
import { useRef, useState } from "react";
import { DialFace } from "../ui/DialFace.tsx";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "dial" }>;

export function Dial({ v, send }: { v: V; send: Send }) {
  const [value, setValue] = useState(v.value);
  const [sure, setSure] = useState(false);
  const left = useCountdown(v.msLeft ?? 0);
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
  const head = (
    <div className="sync-head">
      <span className="kicker">{v.final ? "Último mostrador · ×2!" : "Na Mesma Onda"}</span>
      {v.msLeft !== undefined && <span className={`pill ${left < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}s</span>}
    </div>
  );
  const clue = v.clue && (
    <div className="p-callout clue-callout">
      <span className="kicker">Pista · Clue</span>
      <b className="display">
        {v.clue.pic && <Picture glyph={v.clue.pic} size="30px" />} {v.clue.pt}
      </b>
      {v.clue.en && <span>{v.clue.en}</span>}
    </div>
  );
  if (v.phase === "reveal") {
    return (
      <div className="p-col">
        <div className="p-big center">{v.points ? `+${v.points} pontos!` : v.sure ? "Aposta perdida! · Bet lost" : "Longe… · Far off"}</div>
        <DialFace value={v.value} target={v.target} widths={v.bands} />
        {ends}
        {clue}
        <div className="p-grow" />
        <button className="btn block player" onClick={() => send({ mode: "dial", action: { a: "next" } })}>
          <span className="bi">
            Próximo<small>Next</small>
          </span>
        </button>
      </div>
    );
  }
  if (v.role === "psychic") {
    return (
      <div className="p-col">
        {head}
        <div className="p-callout">
          <b className="display">{v.phase === "clue" ? `Escolhe uma pista para ${v.partner}` : `${v.partner} está a rodar…`}</b>
          <span>{v.phase === "clue" ? "The target is here. Which thing belongs at this spot between the two words? The TV says it." : `${v.partner} is turning the dial…`}</span>
        </div>
        <DialFace value={v.phase === "guess" ? v.value : (v.target ?? 50)} target={v.target} widths={v.bands} />
        {ends}
        {v.phase === "guess" && clue}
        {v.clues && (
          <div className="clue-words">
            {v.clues.map((w) => (
              <button
                key={w.pt}
                className="bank-word card"
                onClick={() => {
                  play("tap");
                  navigator.vibrate?.(12);
                  send({ mode: "dial", action: { a: "clue", text: w.pt } });
                }}
              >
                <Picture glyph={w.pic} size="26px" />
                {w.pt}
                {w.en && <small>{w.en}</small>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (v.role === "guess") {
    return (
      <div className="p-col">
        {head}
        {clue ?? (
          <div className="p-callout">
            <b className="display">Roda o mostrador!</b>
            <span>Where does the clue go on the dial?</span>
          </div>
        )}
        <DialFace value={value} onDrag={v.locked ? undefined : move} />
        {ends}
        <div className="p-grow" />
        {v.locked ? (
          <div className="p-sub center">🥁 …</div>
        ) : (
          <>
            <button className={`btn block ${sure ? "mint" : "white"}`} onClick={() => setSure(!sure)}>
              <span className="bi">
                {sure ? "✓ " : ""}Tenho a certeza! ×2<small>Sure? Double if bullseye — or nothing</small>
              </span>
            </button>
            <button
              className="btn block player"
              onClick={() => {
                send({ mode: "dial", action: { a: "move", value } });
                play("lock");
                navigator.vibrate?.(20);
                send({ mode: "dial", action: { a: "lock", sure } });
              }}
            >
              <span className="bi">
                Confirmar<small>Lock it in</small>
              </span>
            </button>
          </>
        )}
      </div>
    );
  }
  return (
    <div className="p-center">
      <div className="p-big">{v.partner} está a pensar…</div>
      <div className="p-sub">{v.partner} is thinking… Look at the TV.</div>
    </div>
  );
}
