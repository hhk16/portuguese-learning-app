/** Diz-me! on the TV: who says / who guesses, the clock, the team score and the words found. */
import type { DizMe } from "../../games/dizme/dizme.ts";
import { Avatar } from "../../ui/Avatar.tsx";
import { Fuse } from "./Fuse.tsx";

export function DizMeScreen({ a }: { a: DizMe }) {
  const d = a.describer;
  const guessers = a.phase === "solo" ? [] : a.guessers;
  return (
    <div className="tv-overlay dizme-screen">
      <div className="dz-head">
        <div className="dz-title">DIZ-ME!</div>
        <div className="dz-score">
          <span className="n" key={a.score}>
            {a.score}
          </span>
          <span className="lbl">palavras · recorde {a.record}</span>
        </div>
      </div>
      {a.phase === "solo" && (
        <div className="center-stack">
          <div className="slam" style={{ fontSize: "6rem" }}>
            PRECISA DE 2!
          </div>
          <div className="slam-hint">Chama o teu par: um diz, o outro adivinha.</div>
        </div>
      )}
      {d && a.phase !== "solo" && (
        <div className="dz-roles">
          <div className="dz-role say" data-color={d.color}>
            <Avatar kind={d.avatar} color={d.color} size={72} mood="happy" />
            <div>
              <div className="who">{d.name}</div>
              <div className="what">🗣️ diz em português</div>
            </div>
          </div>
          {guessers.map((g) => (
            <div key={g.playerId} className="dz-role guess" data-color={g.color}>
              <Avatar kind={g.avatar} color={g.color} size={72} mood="happy" />
              <div>
                <div className="who">{g.name}</div>
                <div className="what">👂 ouve e toca na imagem</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {a.phase === "intro" && (
        <div className="panel dz-rules">
          <div>📱 {d?.name} vê uma palavra no telemóvel</div>
          <div>🗣️ Diz a palavra em português — sem inglês, sem apontar!</div>
          <div>👆 Quem adivinha toca na imagem certa</div>
          <div>⏭️ Muito difícil? Passa à próxima</div>
        </div>
      )}
      {a.phase === "play" && (
        <div className="dz-play">
          <div className="dz-mystery">
            <span className="q">?</span>
            <span className="wave">🔊</span>
          </div>
          <div style={{ width: "70rem" }}>
            <Fuse start={a.phaseStart} end={a.phaseEnd} />
          </div>
        </div>
      )}
      {a.phase === "turnEnd" && (
        <div className="center-stack">
          <div className="slam" style={{ fontSize: "8rem" }}>
            TEMPO!
          </div>
        </div>
      )}
      {a.hit && a.phase === "play" && (
        <div key={a.hit.seq} className="dz-hit">
          {a.hit.card.emoji && a.hit.card.emoji !== a.hit.card.en && <span className="e">{a.hit.card.emoji}</span>}
          <span className="pt">{a.hit.card.pt}</span>
          <span className="en">{a.hit.card.en}</span>
        </div>
      )}
      {a.found.length > 0 && (
        <div className="word-wall">
          <div className="chips-row">
            {a.found.slice(-10).map((f, i) => (
              <span key={`${f.card.itemId}${i}`} className="word-chip">
                {f.card.emoji && f.card.emoji !== f.card.en && <b>{f.card.emoji}</b>}
                {f.card.pt} <i>= {f.card.en}</i>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
