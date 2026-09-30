/**
 * The phone as a toy: one component per controller mode. Every mode is huge, one-thumb and
 * immediate. Inputs are stamped with the host-synchronised clock.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { PhoneConnection } from "../net/phone.ts";
import { SPEEDS, type ControllerView, type InputValue, type PromptCard, type Speed } from "../shared/protocol.ts";
import { unlockAudio } from "../audio/sfx.ts";

type ViewOf<M extends ControllerView["mode"]> = Extract<ControllerView, { mode: M }>;
type Send = (value: InputValue) => void;

export function Controller({ view, conn }: { view: ControllerView; conn: PhoneConnection }) {
  const send: Send = (value) => {
    if ("roundId" in view && "promptId" in view) conn.input(view.roundId, view.promptId, value);
  };
  // Remount per prompt so local state (selected tiles etc.) resets.
  const key = "promptId" in view ? `${view.mode}:${view.promptId}` : view.mode + ("title" in view ? view.title : "");
  return (
    <div key={key} style={{ display: "contents" }} onPointerDown={unlockAudio}>
      {"title" in view && view.mode !== "wait" && view.mode !== "results" && view.mode !== "paused" && view.title && <h1 className="p-title">{view.title}</h1>}
      {"deadline" in view && <Timer conn={conn} deadline={view.deadline} />}
      <Body view={view} conn={conn} send={send} />
    </div>
  );
}

function Body({ view, conn, send }: { view: ControllerView; conn: PhoneConnection; send: Send }) {
  switch (view.mode) {
    case "wait":
      return <Wait v={view} />;
    case "lobby":
      return <Lobby v={view} conn={conn} />;
    case "paused":
      return <Paused v={view} conn={conn} />;
    case "remote":
      return <Remote conn={conn} hint={view.hint} />;
    case "choices":
      return <Choices v={view} send={send} />;
    case "tiles":
      return <Tiles v={view} send={send} />;
    case "errorTap":
      return <ErrorTap v={view} send={send} />;
    case "merge":
      return <Merge v={view} send={send} />;
    case "tapStream":
      return <TapStream v={view} conn={conn} send={send} />;
    case "mic":
      return <Mic v={view} send={send} />;
    case "judge":
      return <Judge v={view} send={send} />;
    case "itemPick":
      return <ItemPick v={view} send={send} />;
    case "lesson":
      return <LessonStep v={view} conn={conn} send={send} />;
    case "results":
      return <Results v={view} conn={conn} />;
  }
}

/* ------------------------------------------------------------------------ */

function Timer({ conn, deadline }: { conn: PhoneConnection; deadline: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const localDeadline = conn.clock.toLocal(deadline);
    if (localDeadline === null) return;
    const total = Math.max(500, localDeadline - performance.now());
    let raf = 0;
    const loop = () => {
      const p = Math.max(0, Math.min(1, (localDeadline - performance.now()) / total));
      ref.current?.style.setProperty("--p", String(p));
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [conn, deadline]);
  return (
    <div className="timer" ref={ref}>
      <div />
    </div>
  );
}

/* ------------------------------ prompt card ------------------------------ */

const SPEED_UI: Record<Speed, { label: string; sub: string }> = {
  calma: { label: "🐢 Calma", sub: "mais tempo" },
  normal: { label: "Normal", sub: "" },
  turbo: { label: "⚡ Turbo", sub: "menos tempo" },
};

/** Renders "___" as a highlighted gap. */
function Gap({ text }: { text: string }) {
  const parts = text.split(/_{3,}/);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <span className="gap">?</span>}
        </span>
      ))}
    </>
  );
}

/** The prompt as the TV shows it — so nobody has to look back and forth between screens. */
function Card({ card, fallback }: { card?: PromptCard; fallback?: string }) {
  if (!card) return fallback ? <div className="p-question">{fallback}</div> : null;
  const long = card.headline.length > 38;
  return (
    <div className="p-card">
      {card.kicker && <div className="pc-kicker">{card.kicker}</div>}
      {card.visual && <div className="pc-visual">{card.visual}</div>}
      <div className={`pc-head ${long ? "long" : ""}`}>
        <Gap text={card.headline} />
      </div>
      {card.sub && <div className="pc-sub">{card.sub}</div>}
    </div>
  );
}

function SpeedPicker({ speed, conn }: { speed: Speed; conn: PhoneConnection }) {
  return (
    <div className="speed-seg" role="radiogroup" aria-label="Velocidade">
      {SPEEDS.map((sp) => (
        <button
          key={sp}
          role="radio"
          aria-checked={sp === speed}
          className={sp === speed ? "on" : ""}
          onClick={() => {
            navigator.vibrate?.(10);
            conn.menu("speed", sp);
          }}
        >
          {SPEED_UI[sp].label}
          {SPEED_UI[sp].sub && <small>{SPEED_UI[sp].sub}</small>}
        </button>
      ))}
    </div>
  );
}

function Paused({ v, conn }: { v: ViewOf<"paused">; conn: PhoneConnection }) {
  return (
    <div className="wait">
      <div className="emoji">⏸️</div>
      <h2>{v.title}</h2>
      <button className="bbtn good" style={{ minHeight: 96, fontSize: 28 }} onClick={() => conn.menu("resume")}>
        ▶ Continuar
      </button>
      <div className="p-sub">Velocidade</div>
      <SpeedPicker speed={v.speed} conn={conn} />
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button className="bbtn alt" onClick={() => conn.menu("restart")}>
          ↺ Recomeçar
        </button>
        <button className="bbtn ghost" onClick={() => conn.menu("quit")}>
          ⏏ Sair
        </button>
      </div>
    </div>
  );
}

function Wait({ v }: { v: ViewOf<"wait"> }) {
  return (
    <div className="wait">
      {v.emoji && <div className="emoji">{v.emoji}</div>}
      <h2>{v.title}</h2>
      {v.subtitle && !v.feedback && <div className="p-sub">{v.subtitle}</div>}
      {v.feedback && (
        <div className={`feedback ${v.feedback.status}`}>
          {v.feedback.text}
          {v.feedback.detail && <small>💡 {v.feedback.detail}</small>}
        </div>
      )}
    </div>
  );
}

function Lobby({ v, conn }: { v: ViewOf<"lobby">; conn: PhoneConnection }) {
  return (
    <div className="wait">
      <div className="emoji">{v.ready ? "😎" : "🎮"}</div>
      <h2>{v.hint ?? "Prepara-te!"}</h2>
      <button
        className={`bbtn ${v.ready ? "good" : ""}`}
        style={{ minHeight: 120, fontSize: 30 }}
        onClick={() => {
          conn.ready(!v.ready);
          navigator.vibrate?.(20);
        }}
      >
        {v.ready ? "PRONTO! ✅" : "ESTOU PRONTO!"}
      </button>
      {v.ready && <div className="p-sub">Toca outra vez para cancelar</div>}
      <div className="p-sub">Velocidade do jogo</div>
      <SpeedPicker speed={v.speed} conn={conn} />
      <button className="bbtn ghost" onClick={() => conn.nav("back")}>
        ← Menu
      </button>
    </div>
  );
}

function Remote({ conn, hint }: { conn: PhoneConnection; hint?: string }) {
  const b = (dir: Parameters<PhoneConnection["nav"]>[0], label: string, cls = "") => (
    <button
      className={cls}
      onClick={() => {
        conn.nav(dir);
        navigator.vibrate?.(10);
      }}
    >
      {label}
    </button>
  );
  return (
    <div className="wait">
      <div className="p-sub">{hint}</div>
      <div className="dpad">
        <span />
        {b("up", "▲")}
        <span />
        {b("left", "◀")}
        {b("ok", "OK", "ok")}
        {b("right", "▶")}
        <span />
        {b("down", "▼")}
        <span />
      </div>
      <button className="bbtn ghost" onClick={() => conn.nav("back")}>
        ← Voltar
      </button>
    </div>
  );
}

/* --------------------------------- choices -------------------------------- */

function Splat({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path
        d="M50 8 C62 20 70 4 78 18 C84 30 98 30 92 46 C88 58 100 66 88 76 C78 84 80 98 64 92 C54 88 46 100 36 90 C26 82 10 92 10 76 C10 64 0 58 8 46 C14 36 2 24 18 18 C30 12 36 0 50 8Z"
        fill={color}
      />
      <circle cx="88" cy="12" r="5" fill={color} />
      <circle cx="10" cy="92" r="4" fill={color} />
    </svg>
  );
}

function Choices({ v, send }: { v: ViewOf<"choices">; send: Send }) {
  const [picked, setPicked] = useState<string | null>(null);
  const splats = useMemo(
    () =>
      Array.from({ length: v.ink ?? 0 }, (_, i) => ({
        id: i,
        left: 5 + ((i * 37) % 60),
        top: 5 + ((i * 53) % 70),
        size: 44 + ((i * 17) % 20),
        color: ["#12052e", "#2a0a5e", "#3b1070"][i % 3]!,
      })),
    [v.ink],
  );
  const [wiped, setWiped] = useState<Set<number>>(new Set());
  return (
    <>
      {v.hud && <div className="p-sub pixel" style={{ fontSize: 11 }}>{v.hud}</div>}
      <Card card={v.card} fallback={v.question} />
      <div className="choice-stack">
        {v.options.map((o) => (
          <button
            key={o.id}
            className={`bbtn ${picked === o.id ? "pressed" : ""}`}
            disabled={picked !== null}
            onClick={() => {
              setPicked(o.id);
              navigator.vibrate?.(15);
              send({ mode: "choices", choice: o.id });
            }}
          >
            {o.emoji && <span>{o.emoji}</span>}
            {o.label}
          </button>
        ))}
        {splats
          .filter((s) => !wiped.has(s.id))
          .map((s) => (
            <button
              key={s.id}
              className="splat"
              aria-label="Limpar tinta"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}%`, height: `${s.size}%` }}
              onClick={() => {
                navigator.vibrate?.(8);
                setWiped(new Set([...wiped, s.id]));
              }}
            >
              <Splat color={s.color} />
            </button>
          ))}
      </div>
      {splats.length > 0 && wiped.size < splats.length && <div className="p-sub">🎨 Tinta! Toca nas manchas para limpar!</div>}
    </>
  );
}

/* ---------------------------------- tiles --------------------------------- */

function Tiles({ v, send }: { v: ViewOf<"tiles">; send: Send }) {
  const [seq, setSeq] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const add = (id: string) => {
    if (sent || seq.includes(id) || seq.length >= v.length) return;
    const next = [...seq, id];
    setSeq(next);
    navigator.vibrate?.(8);
    if (next.length === v.length) {
      setSent(true);
      setTimeout(() => send({ mode: "tiles", seq: next }), 180);
    }
  };
  const ch = (id: string) => v.tiles.find((t) => t.id === id)?.ch ?? "";
  return (
    <>
      <Card card={v.card} fallback={v.question} />
      <div className="slots">
        {Array.from({ length: v.length }, (_, i) => (
          <button key={i} className={`slot ${seq[i] ? "full" : ""}`} style={{ background: "none", color: "inherit" }} onClick={() => !sent && setSeq(seq.slice(0, i))}>
            {seq[i] ? ch(seq[i]!) : ""}
          </button>
        ))}
      </div>
      <div className="tile-grid">
        {v.tiles.map((t) => (
          <button key={t.id} className={`tile-btn ${seq.includes(t.id) ? "used" : ""}`} onClick={() => add(t.id)}>
            {t.ch}
          </button>
        ))}
      </div>
      <button className="bbtn ghost" disabled={sent || seq.length === 0} onClick={() => setSeq([])}>
        ↺ Apagar
      </button>
    </>
  );
}

/* -------------------------------- error tap ------------------------------- */

function ErrorTap({ v, send }: { v: ViewOf<"errorTap">; send: Send }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      <Card card={v.card} fallback={v.question} />
      <div className="chips">
        {v.words.map((w) => (
          <button
            key={w.id}
            className="chip-btn"
            disabled={picked !== null}
            style={picked === w.id ? { background: "var(--bad)", color: "#fff" } : undefined}
            onClick={() => {
              setPicked(w.id);
              navigator.vibrate?.(15);
              send({ mode: "errorTap", wordId: w.id });
            }}
          >
            {w.text}
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------- merge --------------------------------- */

function Merge({ v, send }: { v: ViewOf<"merge">; send: Send }) {
  const [top, setTop] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const label = (list: typeof v.top, id: string) => list.find((o) => o.id === id)?.label ?? id;

  const finish = (t: string, b: string) => {
    if (result) return;
    const table: Record<string, string> = { "de+o": "do", "de+a": "da", "de+os": "dos", "de+as": "das", "em+o": "no", "em+a": "na", "em+os": "nos", "em+as": "nas" };
    const form = b === "none" ? t : (table[`${t}+${b}`] ?? `${t} ${b}`);
    setResult(form);
    navigator.vibrate?.([10, 30, 10]);
    send({ mode: "merge", top: t, bottom: b });
  };
  const bottomAt = (x: number, y: number) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>("[data-bottom]")?.dataset.bottom ?? null;

  return (
    <>
      <Card card={v.card} fallback={v.question} />
      <div className="p-sub">Arrasta (ou toca) a preposição para o artigo</div>
      <div
        className="merge-board"
        onPointerMove={(e) => {
          if (!drag) return;
          setDrag({ ...drag, x: e.clientX, y: e.clientY });
          setOver(bottomAt(e.clientX, e.clientY));
        }}
        onPointerUp={(e) => {
          if (!drag) return;
          const b = bottomAt(e.clientX, e.clientY);
          if (b) finish(drag.id, b);
          else setTop(drag.id); // treat as a tap: select, then tap an article
          setDrag(null);
          setOver(null);
        }}
      >
        <div className="merge-row-p">
          {v.top.map((o) => (
            <button
              key={o.id}
              className={`mtile top ${top === o.id ? "sel" : ""}`}
              onPointerDown={(e) => {
                (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
                setDrag({ id: o.id, x: e.clientX, y: e.clientY });
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="merge-row-p">
          {v.bottom.map((o) => (
            <button key={o.id} data-bottom={o.id} className={`mtile bottom ${over === o.id ? "over" : ""}`} onClick={() => top && finish(top, o.id)}>
              {o.label}
            </button>
          ))}
        </div>
        {result && <div className="merge-result">{result}</div>}
      </div>
      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <span className="mtile top" style={{ display: "grid", placeItems: "center" }}>
            {label(v.top, drag.id)}
          </span>
        </div>
      )}
    </>
  );
}

/* -------------------------------- tap stream ------------------------------ */

function TapStream({ v, conn, send }: { v: ViewOf<"tapStream">; conn: PhoneConnection; send: Send }) {
  const [taps, setTaps] = useState(0);
  const word = useStreamWord(v.stream, conn);
  return (
    <>
      <div className="p-question">{v.rule}</div>
      {v.stream && (
        <div className="stream-mirror">
          {word ? (
            <span key={word.i} className="sw">
              {word.visual && <span className="sv">{word.visual}</span>}
              {word.text}
            </span>
          ) : (
            <span className="sw dim">…</span>
          )}
        </div>
      )}
      <div className="mega">
        <button
          onPointerDown={() => {
            const t = conn.hostNow() ?? 0;
            navigator.vibrate?.(12);
            setTaps((n) => n + 1);
            send({ mode: "tapStream", tapHostTime: t });
          }}
        >
          TOCA!
        </button>
      </div>
      <div className="p-sub">{v.stream ? "Toca quando a palavra certa aparecer" : "Olha para a TV"} · toques: {taps}</div>
    </>
  );
}

/** Which word of the TV's stream is showing right now, on the synced host clock. */
function useStreamWord(stream: ViewOf<"tapStream">["stream"], conn: PhoneConnection) {
  const [i, setI] = useState(-1);
  useEffect(() => {
    if (!stream) return;
    let raf = 0;
    const loop = () => {
      const now = conn.hostNow();
      const idx = now === null ? -1 : Math.floor((now - stream.startAt - stream.lead) / stream.per);
      setI(idx >= 0 && idx < stream.words.length ? idx : -1);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [stream, conn]);
  const w = stream && i >= 0 ? stream.words[i] : undefined;
  return w ? { ...w, i } : null;
}

/* ----------------------------------- mic ---------------------------------- */

type SR = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognizer(): SR | null {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

function Mic({ v, send }: { v: ViewOf<"mic">; send: Send }) {
  const [state, setState] = useState<"idle" | "listening" | "sent">("idle");
  const [heard, setHeard] = useState("");
  const rec = useRef<SR | null>(null);
  const supported = useMemo(() => getRecognizer() !== null, []);
  const done = useRef(false);

  const submit = (transcripts: string[], unsupported: boolean) => {
    if (done.current) return;
    done.current = true;
    setState("sent");
    rec.current?.abort();
    send({ mode: "mic", transcripts: transcripts.slice(0, 8), unsupported });
  };

  const start = () => {
    const r = getRecognizer();
    if (!r) return submit([], true);
    rec.current = r;
    r.lang = v.lang;
    r.interimResults = true;
    r.maxAlternatives = 5;
    r.continuous = false;
    const all: string[] = [];
    r.onresult = (e) => {
      const res = e.results[e.results.length - 1]!;
      const alts = Array.from({ length: res.length }, (_, i) => res[i]!.transcript.trim());
      setHeard(alts[0] ?? "");
      if (res.isFinal) {
        all.push(...alts);
        submit(all, false);
      }
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") submit([], true);
    };
    r.onend = () => {
      if (!done.current) setState("idle");
    };
    try {
      r.start();
      setState("listening");
      navigator.vibrate?.(20);
    } catch {
      submit([], true);
    }
  };

  useEffect(() => () => rec.current?.abort(), []);

  return (
    <>
      {v.card ? (
        <Card card={v.card} />
      ) : (
        <>
          <div className="p-question" style={{ fontSize: 34 }}>
            {v.target}
          </div>
          {v.question && <div className="p-sub">{v.question}</div>}
        </>
      )}
      <div className="mega">
        <button className={state === "listening" ? "mic-on" : ""} disabled={state === "sent"} onClick={start}>
          {state === "sent" ? "✅" : state === "listening" ? "A OUVIR…" : "🎤 DIZ!"}
        </button>
      </div>
      <div className="heard-line">{heard ? `“${heard}”` : supported ? "Toca e diz a palavra em voz alta" : "Sem microfone aqui — diz em voz alta!"}</div>
      <button className="bbtn ghost" disabled={state === "sent"} onClick={() => submit(heard ? [heard] : [], true)}>
        {supported ? "Não percebeu? O teu par julga ⚖️" : "Já disse! O meu par julga ⚖️"}
      </button>
    </>
  );
}

function Judge({ v, send }: { v: ViewOf<"judge">; send: Send }) {
  const [done, setDone] = useState(false);
  const vote = (verdict: boolean) => {
    if (done) return;
    setDone(true);
    navigator.vibrate?.(20);
    send({ mode: "judge", verdict });
  };
  return (
    <div className="wait">
      <div className="emoji">⚖️</div>
      <div className="p-question">{v.question}</div>
      <div className="p-question" style={{ fontSize: 40, color: "var(--yellow)" }}>
        “{v.target}”
      </div>
      {v.heard && <div className="p-sub">O micro ouviu: “{v.heard}”</div>}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <button className="bbtn good" disabled={done} onClick={() => vote(true)}>
          ✅ Bem!
        </button>
        <button className="bbtn bad" disabled={done} onClick={() => vote(false)}>
          ❌ Mal!
        </button>
      </div>
    </div>
  );
}

function ItemPick({ v, send }: { v: ViewOf<"itemPick">; send: Send }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      <Card card={v.card} fallback={v.question} />
      <div className="item-cards">
        {v.items.map((it) => (
          <button
            key={it.id}
            className={`bbtn alt ${picked === it.id ? "pressed" : ""}`}
            disabled={picked !== null}
            onClick={() => {
              setPicked(it.id);
              navigator.vibrate?.([10, 20, 10]);
              send({ mode: "itemPick", item: it.id });
            }}
          >
            <span style={{ fontSize: 40 }}>{it.emoji}</span>
            <span>
              {it.label}
              <small>{it.desc}</small>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function LessonStep({ v, conn, send }: { v: ViewOf<"lesson">; conn: PhoneConnection; send: Send }) {
  return (
    <>
      <Card card={v.card ?? { headline: v.step }} />
      {v.lines && v.lines.length > 0 && (
        <ul className="lesson-lines">
          {v.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
      <div style={{ flex: 1 }} />
      <button className="bbtn ghost" onClick={() => conn.menu("repeat")}>
        🔊 Ouvir outra vez
      </button>
      <button className="bbtn" disabled={!v.canContinue} onClick={() => send({ mode: "lesson", ok: true })} style={{ minHeight: 96 }}>
        {v.canContinue ? "👍 Percebi!" : "✅ À espera do teu par…"}
      </button>
    </>
  );
}

function Results({ v, conn }: { v: ViewOf<"results">; conn: PhoneConnection }) {
  return (
    <>
      <h1 className="p-title">{v.title}</h1>
      {v.lines.slice(0, 1).map((l) => (
        <div key={l} className="p-question">
          {l}
        </div>
      ))}
      {v.review.length > 0 ? (
        <>
          <div className="p-sub">Para rever 📝</div>
          <ul className="review-list">
            {v.review.map((r) => (
              <li key={r.pt}>
                {r.pt}
                {r.why && <small>{r.why}</small>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="p-sub">Sem erros! 🤯</div>
      )}
      <div style={{ flex: 1 }} />
      <button className="bbtn" onClick={() => conn.nav("ok")}>
        {v.lines[1]?.includes("Próxima aula") ? "Próxima aula ▶" : "Mais uma! 🔁"}
      </button>
      <button className="bbtn ghost" onClick={() => conn.nav("back")}>
        Menu
      </button>
    </>
  );
}
