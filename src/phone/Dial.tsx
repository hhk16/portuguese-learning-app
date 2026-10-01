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
  const listLeft = useCountdown(v.listInMs ?? 0);
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
      {v.signals !== undefined && <span className="pill">📶 {v.signals}</span>}
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
        {v.psychicBet && <div className={`p-sub center ${v.betWon ? "ok" : ""}`}>Aposta: {{ cheio: "🎯 Em cheio", perto: "👌 Perto", longe: "🙈 Longe" }[v.psychicBet]} {v.betWon ? "✓ +3" : "✗"}</div>}
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
        {v.phase === "guess" && !v.locked && (
          <div className="side-bet">
            <span className="kicker">Aposta secreta · Secret bet: how close will {v.partner} get? (+3)</span>
            <div className="row3">
              {(
                [
                  ["cheio", "🎯 Em cheio", "Bullseye"],
                  ["perto", "👌 Perto", "Close"],
                  ["longe", "🙈 Longe", "Far"],
                ] as const
              ).map(([id, pt, en]) => (
                <button key={id} className={`btn bet-btn ${v.psychicBet === id ? "mint" : "white"}`} disabled={!!v.psychicBet} onClick={() => send({ mode: "dial", action: { a: "bet", bet: id } })}>
                  <span className="bi">
                    {pt}
                    <small>{en}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {v.typeClue && <TypedClue v={v} send={send} />}
        {v.clues && (!v.typeClue || listLeft <= 0) && (
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

/** Médio+: write a thing for the clue (any noun you know); the chips open later as a lifeline. */
function TypedClue({ v, send }: { v: V; send: Send }) {
  const [text, setText] = useState("");
  const listLeft = useCountdown(v.listInMs ?? 0);
  return (
    <div className="typed-clue">
      <div className="kicker">✍️ Escreve uma coisa · Write a thing (o café, a neve, o sol…) for where the target is</div>
      <form
        className="sync-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          play("lock");
          send({ mode: "dial", action: { a: "clue", text: text.trim(), typed: true } });
        }}
      >
        <input className="clue-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="o café, a neve…" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={30} />
        <button className="btn player" type="submit" disabled={!text.trim()}>
          OK
        </button>
      </form>
      {v.clueError && <div className="p-warn">“{v.clueError}”? Pipo não conhece essa coisa — tenta outra. · Try another thing.</div>}
      {listLeft > 0 ? <div className="p-sub">🆘 A lista abre em {Math.ceil(listLeft / 1000)} s · The list opens as a lifeline</div> : <div className="kicker">🆘 Ou escolhe da lista · Or pick from the list</div>}
    </div>
  );
}
