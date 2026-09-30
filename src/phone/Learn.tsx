/**
 * Aprender juntos on the phone: answer privately, then see the verdict when the TV reveals both
 * answers. The phone never talks — 🔊 asks the TV to say it again, for both of you.
 */
import { useMemo, useRef, useState } from "react";
import type { PhoneConnection } from "../net/phone.ts";
import type { ControllerView, InputValue } from "../shared/protocol.ts";
import { play } from "../audio/sfx.ts";
import { Picture } from "../ui/Picture.tsx";
import type { Send } from "./Controller.tsx";

type LearnView = Extract<ControllerView, { mode: "learn" }>;
type Answer = Extract<InputValue, { mode: "learn" }>["answer"];

export function Learn({ v, conn, send }: { v: LearnView; conn: PhoneConnection; send: Send }) {
  const answer = (a: Answer) => {
    navigator.vibrate?.(12);
    play(a.t === "next" ? "tap" : "lock");
    send({ mode: "learn", answer: a });
  };
  const locked = !!v.waiting || !!v.result;
  return (
    <div className="learn">
      <div className="learn-top">
        <div className="learn-progress" aria-label={`${v.step + 1} de ${v.total}`}>
          <div style={{ width: `${Math.round(((v.step + (v.result ? 1 : 0)) / v.total) * 100)}%` }} />
        </div>
        <button className="icon-btn" onClick={() => conn.menu("repeat")} aria-label="Ouvir outra vez na TV">
          🔊
        </button>
      </div>
      <div className="learn-instr">
        <span className="display">{v.instr}</span>
        {v.instrEn && <small>{v.instrEn}</small>}
      </div>
      <Exercise v={v} answer={answer} locked={locked} />
      {v.waiting && !v.result && <div className="learn-waiting">✓ {v.waiting}</div>}
      {v.result && (
        <div className={`learn-sheet ${v.result.ok ? "ok" : "bad"}`}>
          <div className="verdict display">{v.result.ok ? "Muito bem!" : "Quase! A resposta é:"}</div>
          <div className="ans">{v.result.pt}</div>
          {v.result.en && <div className="en">{v.result.en}</div>}
          {v.result.why && <div className="why">{v.result.why}</div>}
          {v.waiting ? (
            <div className="learn-waiting inline">✓ {v.waiting}</div>
          ) : (
            <button className={`btn block ${v.result.ok ? "mint" : "white"}`} onClick={() => answer({ t: "next" })}>
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** English that's shown for beginners and one tap away for everyone else. */
function En({ text, show }: { text: string; show: boolean }) {
  const [open, setOpen] = useState(show);
  if (open) return <div className="learn-en">{text}</div>;
  return (
    <button className="learn-en hidden" onClick={() => setOpen(true)}>
      ver em inglês
    </button>
  );
}

function Exercise({ v, answer, locked }: { v: LearnView; answer: (a: Answer) => void; locked: boolean }) {
  const ex = v.ex;
  switch (ex.kind) {
    case "tip":
      return (
        <>
          <div className="learn-card card">
            <div className="kicker">{ex.title}</div>
            <table className="tip-table">
              <tbody>
                {ex.rows.map(([a, b]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ex.note && <div className="note">{ex.note}</div>}
          </div>
          <div className="p-grow" />
          {!locked && (
            <button className="btn block player" onClick={() => answer({ t: "next" })}>
              <span className="bi">
                Percebi<small>Got it</small>
              </span>
            </button>
          )}
        </>
      );
    case "intro":
      return (
        <>
          <div className="learn-card card intro">
            <div className="kicker">Palavra nova · New word</div>
            {ex.emoji && <Picture glyph={ex.emoji} size="120px" />}
            <div className="pt display">{ex.pt}</div>
            <div className="learn-en">{ex.en}</div>
            {ex.note && <div className="note">{ex.note}</div>}
          </div>
          <div className="p-grow" />
          {!locked && (
            <button className="btn block player" onClick={() => answer({ t: "next" })}>
              <span className="bi">
                Percebi<small>Got it</small>
              </span>
            </button>
          )}
        </>
      );
    case "listen":
      return (
        <>
          <div className="learn-card card center">
            <Picture glyph="🔊" size="84px" />
            <div className="note">Ouve a TV e escolhe.</div>
          </div>
          <Choose options={ex.options} answer={answer} locked={locked} />
        </>
      );
    case "read":
      return (
        <>
          <div className="learn-card card center">
            <div className="pt display">{ex.pt}</div>
          </div>
          <Choose options={ex.options} answer={answer} locked={locked} />
        </>
      );
    case "write":
      return (
        <>
          <div className="learn-card card center">
            {ex.emoji && ex.emoji !== ex.en && <Picture glyph={ex.emoji} size="84px" />}
            <div className="en-prompt">“{ex.en}”</div>
          </div>
          <Choose options={ex.options} answer={answer} locked={locked} />
        </>
      );
    case "gap":
      return (
        <>
          <div className="learn-card card">
            <div className="pt display gap-text">
              {ex.text.split("___").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="gap">?</span>}
                </span>
              ))}
            </div>
            <En text={ex.en} show={v.showEn} />
          </div>
          <Choose options={ex.options} answer={answer} locked={locked} />
        </>
      );
    case "build":
      return <Build ex={ex} answer={answer} locked={locked} />;
    case "pairs":
      return <Pairs ex={ex} answer={answer} locked={locked} />;
    case "speak":
      return (
        <>
          <div className="learn-card card intro">
            {ex.emoji && ex.emoji !== ex.en && <Picture glyph={ex.emoji} size="96px" />}
            <div className="pt display">{ex.pt}</div>
            <En text={ex.en} show={v.showEn} />
          </div>
          <div className="speak-cue">
            <Picture glyph="🗣️" size="56px" />
            <span>Diz em voz alta!</span>
          </div>
          <div className="p-grow" />
          {!v.waiting && !locked && (
            <div className="row2">
              <button className="btn mint" onClick={() => answer({ t: "judge", ok: true })}>
                Disse bem
              </button>
              <button className="btn white" onClick={() => answer({ t: "judge", ok: false })}>
                Ainda não
              </button>
            </div>
          )}
        </>
      );
    case "judge":
      return (
        <>
          <div className="learn-card card intro">
            {ex.emoji && ex.emoji !== ex.en && <Picture glyph={ex.emoji} size="84px" />}
            <div className="pt display">{ex.pt}</div>
            <div className="learn-en">{ex.en}</div>
          </div>
          <div className="speak-cue">
            <Picture glyph="👂" size="56px" />
            <span>Ouve {ex.name}. Ficou bem?</span>
          </div>
          <div className="p-grow" />
          {!locked && (
            <div className="row2">
              <button className="btn mint" onClick={() => answer({ t: "judge", ok: true })}>
                👍 Sim!
              </button>
              <button className="btn white" onClick={() => answer({ t: "judge", ok: false })}>
                Ainda não
              </button>
            </div>
          )}
        </>
      );
  }
}

function Choose({ options, answer, locked }: { options: { id: string; label: string; emoji?: string }[]; answer: (a: Answer) => void; locked: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  const pictures = options.every((o) => o.emoji);
  return (
    <>
      <div className={`learn-options ${pictures ? "pictures" : ""}`}>
        {options.map((o) => (
          <button
            key={o.id}
            className={`lopt card ${sel === o.id ? "sel" : ""}`}
            disabled={locked}
            onClick={() => {
              setSel(o.id);
              play("tap");
            }}
          >
            {o.emoji && <Picture glyph={o.emoji} size={pictures ? "64px" : "40px"} />}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      <div className="p-grow" />
      {!locked && (
        <button className="btn block player" disabled={!sel} onClick={() => sel && answer({ t: "choice", id: sel })}>
          <span className="bi">
            Verificar<small>Check</small>
          </span>
        </button>
      )}
    </>
  );
}

function Build({ ex, answer, locked }: { ex: Extract<LearnView["ex"], { kind: "build" }>; answer: (a: Answer) => void; locked: boolean }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const text = (id: string) => ex.bank.find((w) => w.id === id)?.text ?? "";
  return (
    <>
      <div className="learn-card card center">
        <div className="en-prompt">“{ex.en}”</div>
      </div>
      <div className="build-line">
        {chosen.length === 0 && <span className="placeholder">Toca nas palavras…</span>}
        {chosen.map((id) => (
          <button key={id} className="word" disabled={locked} onClick={() => setChosen(chosen.filter((x) => x !== id))}>
            {text(id)}
          </button>
        ))}
      </div>
      <div className="build-bank">
        {ex.bank.map((w) => (
          <button
            key={w.id}
            className={`word ${chosen.includes(w.id) ? "used" : ""}`}
            disabled={locked || chosen.includes(w.id)}
            onClick={() => {
              setChosen([...chosen, w.id]);
              play("tap");
            }}
          >
            {w.text}
          </button>
        ))}
      </div>
      <div className="p-grow" />
      {!locked && (
        <button className="btn block player" disabled={chosen.length === 0} onClick={() => answer({ t: "build", words: chosen.map(text) })}>
          <span className="bi">
            Verificar<small>Check</small>
          </span>
        </button>
      )}
    </>
  );
}

function Pairs({ ex, answer, locked }: { ex: Extract<LearnView["ex"], { kind: "pairs" }>; answer: (a: Answer) => void; locked: boolean }) {
  const right = useMemo(() => [...ex.pairs].sort((a, b) => a.en.localeCompare(b.en)), [ex.pairs]);
  const [left, setLeft] = useState<string | null>(null);
  const [rightSel, setRightSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const missed = useRef(new Set<string>());
  const sent = useRef(false);

  const tryMatch = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    if (l === r) {
      const next = [...matched, l];
      setMatched(next);
      play("pop");
      navigator.vibrate?.(15);
      if (next.length === ex.pairs.length && !sent.current) {
        sent.current = true;
        setTimeout(() => answer({ t: "pairs", missed: [...missed.current] }), 300);
      }
    } else {
      missed.current.add(l);
      setBad(`${l}|${r}`);
      play("wrong");
      navigator.vibrate?.([40, 30, 40]);
      setTimeout(() => setBad(null), 450);
    }
    setLeft(null);
    setRightSel(null);
  };

  return (
    <div className="pairs">
      <div className="col">
        {ex.pairs.map((p) => (
          <button
            key={p.id}
            className={`pair card ${left === p.id ? "sel" : ""} ${matched.includes(p.id) ? "done" : ""} ${bad?.startsWith(`${p.id}|`) ? "bad" : ""}`}
            disabled={locked || matched.includes(p.id)}
            onClick={() => {
              setLeft(p.id);
              tryMatch(p.id, rightSel);
            }}
          >
            {p.pt}
          </button>
        ))}
      </div>
      <div className="col">
        {right.map((p) => (
          <button
            key={p.id}
            className={`pair card en ${rightSel === p.id ? "sel" : ""} ${matched.includes(p.id) ? "done" : ""} ${bad?.endsWith(`|${p.id}`) ? "bad" : ""}`}
            disabled={locked || matched.includes(p.id)}
            onClick={() => {
              setRightSel(p.id);
              tryMatch(left, p.id);
            }}
          >
            {p.en}
          </button>
        ))}
      </div>
    </div>
  );
}
