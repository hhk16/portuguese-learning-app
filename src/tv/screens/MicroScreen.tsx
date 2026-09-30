/** Micro Loucura overlay: verb slam → prompt + fuse → (judge) → reveal stamps. */
import { gameNow } from "../clock.ts";
import { useEffect, useState } from "react";
import { MICRO_DEFS, tvEnglish, type MicroRush } from "../../games/micro/rush.ts";
import { isCorrectOutcome } from "../../learner/events.ts";
import { Avatar } from "../../ui/Avatar.tsx";
import { getRuntime } from "../runtime.ts";
import { Fuse, Headline } from "./Fuse.tsx";

export function MicroScreen({ a }: { a: MicroRush }) {
  const rt = getRuntime();
  const r = a.round;
  const [, tick] = useState(0);
  // NÃO TOQUES flashes words on a timer: re-render at word cadence during play.
  useEffect(() => {
    if (a.phase !== "play" || r?.kind !== "naotoques") return;
    const id = setInterval(() => tick((x) => x + 1), 80);
    return () => clearInterval(id);
  }, [a.phase, r?.kind]);

  const players = rt.activePlayers;
  const top = (
    <div className="hud-top">
      <div className="pips">
        {Array.from({ length: a.total }, (_, i) => (
          <div key={i} className={`pip ${i < a.index - 1 || (i === a.index - 1 && a.phase === "reveal") ? "done" : i === a.index - 1 ? "now" : ""}`} />
        ))}
      </div>
      <div className="player-row">
        {players.map((p) => (
          <div key={p.playerId} className="player-chip" data-color={p.color}>
            <Avatar kind={p.avatar} color={p.color} size={40} />
            {p.name}
            <span className="score">{p.score}</span>
          </div>
        ))}
      </div>
      <div className="chip pixel" style={{ fontSize: "1.1rem" }}>
        MICRO LOUCURA {a.speed > 1 ? `· x${a.speed.toFixed(2)}` : ""}
      </div>
    </div>
  );

  if (a.phase === "speedup")
    return (
      <div className="tv-overlay micro-screen">
        {top}
        <div className="center-stack">
          <div className="slam" style={{ color: "var(--pink)" }}>
            MAIS RÁPIDO!
          </div>
        </div>
      </div>
    );
  if (a.phase === "finale")
    return (
      <div className="tv-overlay micro-screen">
        {top}
        <div className="center-stack">
          <div className="slam">FIM!</div>
        </div>
      </div>
    );
  if (!r) return <div className="tv-overlay micro-screen">{top}</div>;
  const def = MICRO_DEFS[r.kind];
  const q = r.prompt;

  if (a.phase === "intro")
    return (
      <div className="tv-overlay micro-screen">
        {top}
        <div className="center-stack" key={r.roundId}>
          <div style={{ fontSize: "7rem" }}>{def.icon}</div>
          <div className="slam">{def.title}</div>
          <div className="slam-hint">{q.format === "stream" ? q.rule : def.hint}</div>
        </div>
      </div>
    );

  const reveal = a.phase === "reveal";
  const reviewName = r.reviewFor ? players.find((p) => p.profile.profileId === r.reviewFor)?.name : undefined;

  const en = tvEnglish(q, players);
  const enLine = en ? <div className="prompt-en">🇬🇧 {en}</div> : null;
  let body: React.ReactNode;
  switch (q.format) {
    case "choice":
      body = (
        <>
          {q.visual && <div className="prompt-visual">{q.visual}</div>}
          <div className="prompt-headline">
            <Headline text={q.headline} fill={reveal ? q.answerText.split(" ")[0] : undefined} />
          </div>
          {q.sub && <div className="prompt-sub">{q.sub}</div>}
          {enLine}
          <div className="options">
            {q.options.map((o) => (
              <div key={o.id} className={`option ${reveal ? (o.id === q.correctId ? "right" : "dim") : ""}`}>
                {o.label}
              </div>
            ))}
          </div>
        </>
      );
      break;
    case "tiles":
      body = (
        <>
          <div className="prompt-headline">
            <Headline text={q.headline.includes("___") ? q.headline : `${q.headline} → ___`} fill={reveal ? q.answerText : undefined} />
          </div>
          {enLine}
          <div className="options">
            {q.tiles.map((t) => (
              <div key={t.id} className="option" style={{ minWidth: "5rem" }}>
                {t.ch}
              </div>
            ))}
          </div>
        </>
      );
      break;
    case "errorTap":
      body = (
        <>
          <div className="prompt-sub">Uma palavra está errada…</div>
          <div className="word-blocks" style={{ marginTop: "1.6rem" }}>
            {q.words.map((w) => (
              <div key={w.id} className={`word-block ${reveal && w.id === q.wrongId ? "bad" : ""}`}>
                {w.text}
              </div>
            ))}
          </div>
          {reveal && <div className="reveal-answer" style={{ marginTop: "1.6rem" }}>{q.answerText}</div>}
          {reveal && enLine}
        </>
      );
      break;
    case "merge":
      body = (
        <>
          <div className="prompt-headline">
            <Headline text={q.headline} fill={reveal ? q.answerText : undefined} />
          </div>
          {enLine}
          <div className="merge-row" style={{ fontSize: "4.4rem", marginTop: "1.4rem" }}>
            {reveal ? (
              <>
                <span className="tile a">{q.correct.top}</span>+<span className="tile b">{q.correct.bottom === "none" ? "∅" : q.correct.bottom}</span>=<span className="tile r">{q.answerText}</span>
              </>
            ) : (
              <>
                <span className="tile">de · em</span>+<span className="tile" style={{ borderColor: "var(--pink)" }}>o · a · os · as · ∅</span>
              </>
            )}
          </div>
        </>
      );
      break;
    case "stream": {
      const i = a.phase === "play" ? a.streamIndexAt(gameNow()) : -1;
      const w = i >= 0 ? q.words[i] : null;
      body = (
        <>
          <div className="stream-rule">{q.rule}</div>
          <div style={{ minHeight: "16rem", display: "grid", placeItems: "center" }}>
            {reveal ? (
              <div className="reveal-answer">{q.answerText}</div>
            ) : w ? (
              <div key={i} className="stream-word">
                {w.visual ? `${w.visual} ` : ""}
                {w.text}
              </div>
            ) : (
              <div className="stream-word" style={{ opacity: 0.3 }}>
                …
              </div>
            )}
          </div>
          <div className="taps">
            {players.flatMap((p) =>
              (r.per.get(p.playerId)?.taps ?? []).map((t) => (
                <span key={`${p.playerId}${t.wordIndex}`} className="tap-hand" data-color={p.color}>
                  {t.hit ? "👍" : "👎"}
                </span>
              )),
            )}
          </div>
        </>
      );
      break;
    }
    case "say":
      body = (
        <>
          {q.visual && <div className="prompt-visual">{q.visual}</div>}
          <div className="prompt-headline" style={{ fontSize: "8rem" }}>
            {q.headline}
          </div>
          {q.sub && <div className="prompt-sub">{q.sub}</div>}
          {a.phase === "judge" && <div className="slam" style={{ fontSize: "5rem", color: "var(--cyan)" }}>⚖️ JUIZ!</div>}
          {reveal && <div className="reveal-answer">🔊 {q.answerText}</div>}
          {!reveal && (
            <div className="mic-row">
              {players.map((p) => {
                const pr = r.per.get(p.playerId);
                return (
                  <div key={p.playerId} className="mic" data-color={p.color}>
                    <div className="bubble">{pr?.answeredAt ? "✅" : "🎤"}</div>
                    {p.name}
                    {pr?.heard && <span className="heard">ouvi: “{pr.heard}”</span>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      );
      break;
  }

  return (
    <div className="tv-overlay micro-screen">
      {top}
      <div className="panel prompt-card" key={r.roundId}>
        <div className="prompt-verb">{def.title}</div>
        {reviewName && <div className="review-tag">REVISÃO PARA {reviewName.toUpperCase()}</div>}
        {body}
        {reveal && q.why && <div className="why">💡 {q.why}</div>}
        <div className="status-row">
          {players.map((p) => {
            const pr = r.per.get(p.playerId);
            if (reveal && pr) {
              const ok = pr.outcome && isCorrectOutcome(pr.outcome);
              const cls = ok ? "good" : pr.outcome === "accent-slip" || pr.outcome === "close" ? "meh" : "bad";
              return (
                <div key={p.playerId} className="status" data-color={p.color}>
                  <Avatar kind={p.avatar} color={p.color} size={40} mood={ok ? "happy" : "sad"} />
                  {p.name}
                  <span className={`stamp ${cls}`}>{ok ? `+${pr.points}` : pr.outcome === "accent-slip" ? "ACENTO!" : pr.points > 0 ? `+${pr.points}` : "✗"}</span>
                </div>
              );
            }
            const done = q.format !== "stream" && pr?.answeredAt != null;
            return (
              <div key={p.playerId} className={`status ${done ? "done" : ""}`} data-color={p.color}>
                <Avatar kind={p.avatar} color={p.color} size={40} />
                {p.name} {done ? "✓" : "…"}
              </div>
            );
          })}
        </div>
      </div>
      <div>{(a.phase === "play" || a.phase === "judge") && <Fuse start={a.phaseStart} end={a.phaseEnd} />}</div>
    </div>
  );
}
