/**
 * Aprender on the phone: one Duolingo-style exercise at a time, at your own pace.
 * Select → VERIFICAR → green/red sheet with the answer, English and a tip → CONTINUAR.
 * Audio plays on this phone (each player hears their own exercise).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { hasPortugueseVoice, speak } from "../audio/tts.ts";
import type { PhoneConnection } from "../net/phone.ts";
import type { ControllerView, InputValue } from "../shared/protocol.ts";
import { stripAccents } from "../shared/answer-check.ts";
import { recognizeOnce } from "./speech.ts";

const loose = (s: string) => stripAccents(s.toLowerCase().replace(/[.,!?¿¡…]/g, "").replace(/\s+/g, " ").trim());

type LearnView = Extract<ControllerView, { mode: "learn" }>;
type Answer = Extract<InputValue, { mode: "learn" }>["answer"];

/** Say Portuguese on this phone; if it has no Portuguese voice, ask the TV to say it. */
export function sayHere(conn: PhoneConnection, text: string | undefined, slow = false) {
  if (!text) return;
  if (hasPortugueseVoice() === false) conn.menu("repeat");
  else void speak(text, { slow });
}

export function Learn({ v, conn }: { v: LearnView; conn: PhoneConnection }) {
  const send = (answer: Answer) => {
    navigator.vibrate?.(12);
    conn.input(v.roundId, v.promptId, { mode: "learn", answer });
  };
  const ex = v.ex;
  const say = "say" in ex ? ex.say : undefined;

  // Auto-play the exercise audio when it appears (not for "write": that would give it away).
  useEffect(() => {
    if (say && ex.kind !== "tip") sayHere(conn, say, ex.kind === "listen");
  }, [v.promptId]);
  useEffect(() => {
    if (v.result?.say) sayHere(conn, v.result.say);
  }, [!!v.result]);

  return (
    <div className="learn">
      <div className="learn-top">
        <div className="learn-progress">
          <div style={{ width: `${Math.round((v.step / v.total) * 100)}%` }} />
        </div>
        <span className="hearts">❤️ {v.hearts}</span>
        {v.streak >= 2 && <span className="streak">🔥 {v.streak}</span>}
      </div>
      <div className="learn-instr">
        {v.instr}
        {v.instrEn && <small>{v.instrEn}</small>}
      </div>
      <div className="learn-body">
        <Exercise v={v} conn={conn} send={send} locked={!!v.result} />
      </div>
      {v.result && (
        <div className={`learn-sheet ${v.result.ok ? "ok" : "bad"}`}>
          <div className="verdict">{v.result.ok ? "Muito bem! 🎉" : "Resposta certa:"}</div>
          <div className="ans">
            {v.result.pt}
            {v.result.say && (
              <button className="spk" onClick={() => sayHere(conn, v.result!.say, true)} aria-label="Ouvir devagar">
                🐢
              </button>
            )}
          </div>
          {v.result.en && <div className="en">{v.result.en}</div>}
          {v.result.why && !v.result.ok && <div className="why">💡 {v.result.why}</div>}
          <button className="bbtn" onClick={() => send({ t: "next" })}>
            CONTINUAR
          </button>
        </div>
      )}
    </div>
  );
}

function Speaker({ conn, text }: { conn: PhoneConnection; text: string }) {
  return (
    <span className="speakers">
      <button className="spk big" onClick={() => sayHere(conn, text)} aria-label="Ouvir">
        🔊
      </button>
      <button className="spk" onClick={() => sayHere(conn, text, true)} aria-label="Ouvir devagar">
        🐢
      </button>
    </span>
  );
}

/** English that's shown for beginners and one tap away for everyone else. */
function En({ text, show }: { text: string; show: boolean }) {
  const [open, setOpen] = useState(show);
  if (open) return <div className="learn-en">{text}</div>;
  return (
    <button className="learn-en hidden" onClick={() => setOpen(true)}>
      🇬🇧 ver em inglês
    </button>
  );
}

function Exercise({ v, conn, send, locked }: { v: LearnView; conn: PhoneConnection; send: (a: Answer) => void; locked: boolean }) {
  const ex = v.ex;
  switch (ex.kind) {
    case "tip":
      return (
        <>
          <div className="learn-card">
            <div className="kicker">📘 {ex.title}</div>
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
            {ex.say && <Speaker conn={conn} text={ex.say} />}
          </div>
          <div style={{ flex: 1 }} />
          <button className="bbtn" onClick={() => send({ t: "next" })}>
            PERCEBI 👍
          </button>
        </>
      );
    case "intro":
      return (
        <>
          <div className="learn-card intro">
            <div className="kicker">✨ PALAVRA NOVA</div>
            {ex.emoji && ex.emoji !== ex.en && <div className="pic">{ex.emoji}</div>}
            <div className="pt">{ex.pt}</div>
            <Speaker conn={conn} text={ex.say} />
            <div className="learn-en">{ex.en}</div>
            {ex.note && <div className="note">{ex.note}</div>}
          </div>
          <div style={{ flex: 1 }} />
          <button className="bbtn" onClick={() => send({ t: "next" })}>
            CONTINUAR
          </button>
        </>
      );
    case "listen":
      return (
        <>
          <div className="learn-card center">
            <button className="listen-btn" onClick={() => sayHere(conn, ex.say)}>
              🔊
            </button>
            <button className="spk" onClick={() => sayHere(conn, ex.say, true)}>
              🐢 devagar
            </button>
          </div>
          <Choose options={ex.options} send={send} locked={locked} />
        </>
      );
    case "read":
      return (
        <>
          <div className="learn-card">
            <div className="pt">
              {ex.pt} <Speaker conn={conn} text={ex.say} />
            </div>
          </div>
          <Choose options={ex.options} send={send} locked={locked} />
        </>
      );
    case "write":
      return (
        <>
          <div className="learn-card">
            {ex.emoji && ex.emoji !== ex.en && <div className="pic small">{ex.emoji}</div>}
            <div className="en-prompt">“{ex.en}”</div>
          </div>
          <Choose options={ex.options} send={send} locked={locked} />
        </>
      );
    case "gap":
      return (
        <>
          <div className="learn-card">
            <div className="pt gap-text">
              {ex.text.split("___").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="gap">?</span>}
                </span>
              ))}
            </div>
            <En text={ex.en} show={v.showEn} />
          </div>
          <Choose options={ex.options} send={send} locked={locked} />
        </>
      );
    case "build":
      return <Build key={v.promptId} ex={ex} send={send} locked={locked} />;
    case "pairs":
      return <Pairs key={v.promptId} ex={ex} conn={conn} send={send} />;
    case "speak":
      return <Speak key={v.promptId} ex={ex} conn={conn} send={send} locked={locked} showEn={v.showEn} />;
  }
}

function Choose({ options, send, locked }: { options: { id: string; label: string; emoji?: string }[]; send: (a: Answer) => void; locked: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <>
      <div className="learn-options">
        {options.map((o) => (
          <button key={o.id} className={`lopt ${sel === o.id ? "sel" : ""}`} disabled={locked} onClick={() => setSel(o.id)}>
            {o.emoji && <span className="e">{o.emoji}</span>}
            {o.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {!locked && (
        <button className="bbtn" disabled={!sel} onClick={() => sel && send({ t: "choice", id: sel })}>
          VERIFICAR
        </button>
      )}
    </>
  );
}

function Build({ ex, send, locked }: { ex: Extract<LearnView["ex"], { kind: "build" }>; send: (a: Answer) => void; locked: boolean }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const text = (id: string) => ex.bank.find((w) => w.id === id)?.text ?? "";
  return (
    <>
      <div className="learn-card">
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
          <button key={w.id} className={`word ${chosen.includes(w.id) ? "used" : ""}`} disabled={locked || chosen.includes(w.id)} onClick={() => setChosen([...chosen, w.id])}>
            {w.text}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {!locked && (
        <button className="bbtn" disabled={chosen.length === 0} onClick={() => send({ t: "build", words: chosen.map(text) })}>
          VERIFICAR
        </button>
      )}
    </>
  );
}

function Pairs({ ex, conn, send }: { ex: Extract<LearnView["ex"], { kind: "pairs" }>; conn: PhoneConnection; send: (a: Answer) => void }) {
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
      navigator.vibrate?.(15);
      if (next.length === ex.pairs.length && !sent.current) {
        sent.current = true;
        setTimeout(() => send({ t: "pairs", missed: [...missed.current] }), 350);
      }
    } else {
      missed.current.add(l);
      setBad(`${l}|${r}`);
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
            className={`pair ${left === p.id ? "sel" : ""} ${matched.includes(p.id) ? "done" : ""} ${bad?.startsWith(`${p.id}|`) ? "bad" : ""}`}
            disabled={matched.includes(p.id)}
            onClick={() => {
              sayHere(conn, p.pt);
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
            className={`pair en ${rightSel === p.id ? "sel" : ""} ${matched.includes(p.id) ? "done" : ""} ${bad?.endsWith(`|${p.id}`) ? "bad" : ""}`}
            disabled={matched.includes(p.id)}
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

function Speak({ ex, conn, send, locked, showEn }: { ex: Extract<LearnView["ex"], { kind: "speak" }>; conn: PhoneConnection; send: (a: Answer) => void; locked: boolean; showEn: boolean }) {
  const [state, setState] = useState<"idle" | "listening" | "unsupported">("idle");
  const [heard, setHeard] = useState("");
  const [miss, setMiss] = useState(false);
  const abort = useRef<() => void>(() => {});
  useEffect(() => () => abort.current(), []);

  const listen = () => {
    const r = recognizeOnce("pt-PT", setHeard);
    abort.current = r.abort;
    setState("listening");
    navigator.vibrate?.(20);
    void r.done.then((alts) => {
      if (alts === null) return setState("unsupported");
      setState("idle");
      // Recognisers make mistakes: only a clear match submits by itself. Otherwise try again,
      // or judge yourself honestly.
      if (alts.some((a) => loose(a).includes(loose(ex.say)))) send({ t: "speak", transcripts: alts.slice(0, 8), self: null });
      else if (alts.length) setMiss(true);
    });
  };

  return (
    <>
      <div className="learn-card">
        {ex.emoji && ex.emoji !== ex.en && <div className="pic small">{ex.emoji}</div>}
        <div className="pt">
          {ex.pt} <Speaker conn={conn} text={ex.say} />
        </div>
        <En text={ex.en} show={showEn} />
      </div>
      {!locked && (
        <>
          {state !== "unsupported" && (
            <div className="mega">
              <button className={state === "listening" ? "mic-on" : ""} onClick={listen} disabled={state === "listening"}>
                {state === "listening" ? "A OUVIR…" : "🎤 FALA"}
              </button>
            </div>
          )}
          <div className="heard-line">
            {heard ? `Ouvi: “${heard}”` : state === "unsupported" ? "Sem microfone aqui: diz em voz alta!" : "Toca e diz a frase"}
            {miss && <small>Não percebi bem — tenta outra vez, ou decide tu.</small>}
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button className="bbtn good" onClick={() => send({ t: "speak", transcripts: heard ? [heard] : [], self: true })}>
              ✅ Disse bem
            </button>
            <button className="bbtn ghost" onClick={() => send({ t: "speak", transcripts: heard ? [heard] : [], self: false })}>
              Ainda não
            </button>
          </div>
        </>
      )}
    </>
  );
}
