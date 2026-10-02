/** Stop! on the phone: one word per category with the round's letter, then vote on your partner's new words. */
import { useEffect, useRef, useState } from "react";
import type { ControllerView } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";
import { useCountdown } from "./useCountdown.ts";

type V = Extract<ControllerView, { mode: "stop" }>;

const bare = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/^(o|a|os|as|um|uma)\s+/, "");

export function StopPad({ v, send }: { v: V; send: Send }) {
  return v.phase === "vote" ? <Vote v={v} send={send} /> : <Write v={v} send={send} />;
}

function Write({ v, send }: { v: V; send: Send }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stopped, setStopped] = useState(false);
  const left = useCountdown(v.msLeft);
  const timer = useRef<number | null>(null);
  const latest = useRef(answers);
  latest.current = answers;
  const letter = v.letter.toLowerCase();
  const save = (a: Record<string, string>, stop = false) => send({ mode: "stop", action: { a: "save", answers: a, stop } });
  useEffect(
    () => () => {
      // Leaving the screen: make sure the TV has the last words.
      if (timer.current) clearTimeout(timer.current);
      save(latest.current);
    },
    [],
  );
  const change = (id: string, text: string) => {
    const next = { ...answers, [id]: text };
    setAnswers(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(next), 450);
  };
  const full = v.categories.every((c) => answers[c.id]?.trim());
  const hurry = v.phase === "hurry";
  return (
    <div className="p-col stop-pad">
      <div className="stop-head">
        <span className="stop-tile display">{v.letter}</span>
        <span className="stop-instr">
          <b>Palavras com {v.letter}</b>
          <small>Words starting with {v.letter}{v.double ? " · ×2 points!" : ""}</small>
        </span>
        <span className="stop-time display">{Math.ceil(left / 1000)}s</span>
      </div>
      {hurry && v.stoppedBy && !stopped && <div className="p-warn">STOP! {v.stoppedBy} acabou — depressa! ⏱️ · Hurry!</div>}
      {v.categories.map((c) => {
        const val = answers[c.id] ?? "";
        const bad = val.trim() !== "" && !bare(val).startsWith(letter);
        return (
          <label key={c.id} className={`stop-field ${bad ? "bad" : ""} ${val.trim() && !bad ? "ok" : ""}`}>
            <span className="cat">
              <Picture glyph={c.pic} size="26px" />
              {c.label}
              {c.en && <small> · {c.en}</small>}
              {v.help?.[c.id] ? (
                <em className="help-shown">💡 {v.help[c.id]}</em>
              ) : (
                <button type="button" className="help-btn" onClick={() => send({ mode: "stop", action: { a: "help", cat: c.id } })} aria-label="Ajuda">
                  💡<small>½</small>
                </button>
              )}
            </span>
            <input value={val} onChange={(e) => change(c.id, e.target.value)} placeholder={`${v.letter}…`} autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} disabled={left <= 0} />
          </label>
        );
      })}
      <div className="p-grow" />
      <button
        className="btn block player p-hero-btn"
        disabled={!full || stopped || hurry}
        onClick={() => {
          setStopped(true);
          play("countdown-go");
          navigator.vibrate?.([30, 40, 30]);
          if (timer.current) clearTimeout(timer.current);
          save(answers, true);
        }}
      >
        <span className="bi">
          {stopped ? "Enviado ✓" : "STOP!"}
          <small>{stopped ? "Sent" : full ? "Done? Stop the round (+5)" : "Fill every word first"}</small>
        </span>
      </button>
    </div>
  );
}

function Vote({ v, send }: { v: V; send: Send }) {
  // Only an explicit YES lets a word in: everything starts at ✗.
  const [ok, setOk] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(!!v.voted);
  const votes = v.votes ?? [];
  const partner = v.partner ?? "O teu par";
  if (sent || votes.length === 0)
    return v.mine?.length ? (
      <div className="p-col">
        <div className="p-status">
          <b>{partner} está a ver as tuas palavras…</b>
          <span>{partner} is checking your words — then the scores</span>
        </div>
        <div className="p-callout">
          <b className="display">Defende as tuas palavras! 🗣️</b>
          <span>Say out loud why they count: “É um animal!”</span>
        </div>
        {v.mine.map((w) => (
          <div key={w.id} className="vote-row card">
            <span>
              <small>{w.category}</small>
              <b className="display">{w.word}</b>
            </span>
            <span className={`vote-hint ${w.likely ? "likely" : ""}`}>{w.likely ? "📖 Pipo conhece" : "❓ Pipo não conhece"}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="p-center">
        <div className="p-bob">
          <Picture glyph="🧐" size="96px" />
        </div>
        {/* Nothing of yours is under review: the scores come next. */}
        <div className="p-big">{sent ? "Votado ✓" : "Nada para votar"}</div>
        <div className="p-sub">A seguir: os pontos na TV · Next: the scores on the TV</div>
      </div>
    );
  return (
    <div className="p-col">
      <div className="p-callout">
        <b className="display">Estas palavras existem?</b>
        <span>Tap ✓ for real words, ✗ for made-up ones.</span>
      </div>
      {votes.map((w) => {
        const yes = ok[w.id] === true;
        return (
          <div key={w.id} className="vote-row card">
            <span>
              <small>{w.category}</small>
              <b className="display">{w.word}</b>
              <small className={`vote-hint ${w.likely ? "likely" : ""}`}>{w.likely ? "📖 Pipo conhece · Pipo knows it" : "❓ Pipo não conhece · you judge"}</small>
            </span>
            <div className="vote-btns">
              <button className={`vbtn ${yes ? "sel yes" : ""}`} onClick={() => setOk({ ...ok, [w.id]: true })}>
                ✓
              </button>
              <button className={`vbtn ${!yes ? "sel no" : ""}`} onClick={() => setOk({ ...ok, [w.id]: false })}>
                ✗
              </button>
            </div>
          </div>
        );
      })}
      <div className="p-grow" />
      <button
        className="btn block player p-hero-btn"
        onClick={() => {
          setSent(true);
          play("lock");
          send({ mode: "stop", action: { a: "vote", ok: Object.fromEntries(votes.map((w) => [w.id, ok[w.id] === true])) } });
        }}
      >
        <span className="bi">
          Confirmar<small>Confirm</small>
        </span>
      </button>
    </div>
  );
}
