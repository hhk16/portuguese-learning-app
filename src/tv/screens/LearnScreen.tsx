/** Aprender on the TV: both players' progress lanes, hearts, streaks, and the lesson's words. */
import type { LearnActivity } from "../../games/learn/learn.ts";
import { START_HEARTS } from "../../games/learn/learn.ts";
import { Avatar } from "../../ui/Avatar.tsx";

const KIND_LABEL: Record<string, string> = {
  tip: "📘 a ler a dica",
  intro: "✨ palavra nova",
  listen: "👂 a ouvir",
  read: "👀 a ler",
  write: "✍️ a traduzir",
  pairs: "🧩 pares",
  gap: "🕳️ completar",
  build: "🧱 construir a frase",
  speak: "🎤 a falar",
};

export function LearnScreen({ a }: { a: LearnActivity }) {
  return (
    <div className="tv-overlay learn-screen">
      <div className="learn-head">
        <div className="aula-kicker">APRENDER</div>
        <h1>{a.lesson.title}</h1>
      </div>
      <div className="lanes">
        {a.lanes.map((s) => {
          const ex = s.queue[s.index];
          const pct = Math.round((Math.min(s.index, s.queue.length) / s.queue.length) * 100);
          return (
            <div key={s.p.playerId} className={`panel lane ${s.done ? "done" : ""}`} data-color={s.p.color}>
              <div className="lane-top">
                <Avatar kind={s.p.avatar} color={s.p.color} size={64} mood={s.flash && !s.flash.ok ? "sad" : "happy"} />
                <div className="lane-name">{s.p.name}</div>
                <div className="hearts">
                  {Array.from({ length: START_HEARTS }, (_, i) => (
                    <span key={i} className={i < s.hearts ? "" : "lost"}>
                      ❤️
                    </span>
                  ))}
                </div>
                {s.streak >= 2 && <div className="streak">🔥 {s.streak}</div>}
                <div className="xp">{s.xp} XP</div>
              </div>
              <div className="track">
                <div className="fill" style={{ width: `${pct}%` }} />
                <div className="runner" style={{ left: `${pct}%` }}>
                  <Avatar kind={s.p.avatar} color={s.p.color} size={40} />
                </div>
                <div className="goal">🏁</div>
              </div>
              <div className="lane-bottom">
                <span className="doing">{s.done ? "🎉 Lição completa!" : s.result ? (s.result.ok ? "✅ certo!" : "❌ quase…") : ex ? KIND_LABEL[ex.kind] : ""}</span>
                {s.flash && (
                  <span key={s.flash.seq} className={`flash ${s.flash.ok ? "ok" : "bad"}`}>
                    {s.flash.ok ? "✓" : "✗"} {s.flash.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {a.words.length > 0 && (
        <div className="word-wall">
          <div className="review-tag">PALAVRAS NOVAS</div>
          <div className="chips-row">
            {a.words.map((w) => (
              <span key={w.itemId} className="word-chip">
                {w.emoji && w.emoji !== w.en && <b>{w.emoji}</b>}
                {w.pt} <i>= {w.en}</i>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
