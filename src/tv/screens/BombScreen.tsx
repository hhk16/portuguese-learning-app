/** Batata Quente on the TV: the hot potato flying between the two players, the holder's question, the boom. */
import { ROUNDS, type BatataQuente } from "../../games/bomb/bomb.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { gameNow } from "../clock.ts";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

const KIND: Record<string, { pt: string; en: string }> = {
  hear: { pt: "Ouve e toca!", en: "Listen and tap the picture" },
  see: { pt: "Como se diz?", en: "Name the picture" },
  number: { pt: "Que número é?", en: "Read the number" },
  hearNumber: { pt: "Ouve o número!", en: "Listen: which number?" },
  opposite: { pt: "O contrário de…", en: "The opposite of…" },
  phrase: { pt: "Ouve e escolhe!", en: "Listen: which one did the TV say?" },
};

export function BombScreen({ a }: { a: BatataQuente }) {
  useTick(100, a.phase === "play" || a.phase === "intro");
  const players = a.players;
  if (players.length < 2)
    return (
      <div className="tv-overlay game-screen centered">
        <GameTop title="Batata Quente" pic="🥔" />
        <div className="card stage-card center">
          <h2 className="display">Este jogo precisa de duas pessoas</h2>
          <p>This game needs two players.</p>
        </div>
      </div>
    );
  const holder = a.holder;
  const side = holder === players[0] ? "left" : "right";
  const heat = a.phase === "play" ? a.heat : 0;
  const q = a.q;
  const hurry = a.lastHurry && gameNow() - a.lastHurry.at < 1300 ? a.lastHurry : null;
  const hurrier = hurry ? a.rt.players.get(hurry.by) : undefined;
  const fast = a.lastFast && gameNow() - a.lastFast.at < 1300 ? a.lastFast : null;
  return (
    <div className={`tv-overlay game-screen centered bomb-screen ${a.phase === "boom" ? "shake-screen" : ""}`}>
      <GameTop title="Batata Quente" pic="🥔">
        {!a.inPractice && (
          <span className="pill">
            Batata {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
          </span>
        )}
        {a.final && !a.inPractice && <span className="pill double-pill">×2</span>}
        {players.map((p) => (
          <span key={p.playerId} className="pill score-pill" data-color={p.color}>
            {p.name} <b>{a.wins.get(p.playerId) ?? 0}</b> <small>pts</small>
          </span>
        ))}
      </GameTop>
      <div className="bomb-arena">
        {players.map((p, i) => (
          <div key={p.playerId} className={`bomb-seat ${i === 0 ? "left" : "right"} ${p === holder && a.phase !== "boom" ? "hot" : ""} ${a.burned === p ? "burned" : ""}`}>
            <PlayerChip p={p} size="2.4em" />
            {hurrier && hurrier === p && (
              <span className="hurry-bubble display" key={a.hurrySeq}>
                Aquece! 🔥 −1s
              </span>
            )}
          </div>
        ))}
        <div className={`potato ${side} ${a.phase}`} style={{ ["--heat" as string]: heat }} key={a.phase === "boom" ? "boom" : "potato"}>
          {a.phase === "boom" ? (
            <span className="boom-burst display">💥</span>
          ) : (
            <>
              <span className="potato-steam">♨️</span>
              <Picture glyph="🥔" size="7em" />
              <span className="potato-fuse">🔥</span>
            </>
          )}
        </div>
      </div>
      {a.phase === "play" && (
        <div className={`wick ${heat > 0.75 ? "short" : ""} ${hurry ? "jolt" : ""}`} key={`wick-${a.hurrySeq}`} aria-hidden>
          {hurry && <span className="wick-burn display">🔥 −1s</span>}
          <span className="wick-rope" style={{ width: `${Math.max(0, (1 - heat) * 100)}%` }} />
          <span className="wick-spark" style={{ left: `${Math.max(0, (1 - heat) * 100)}%` }}>
            ✨
          </span>
          {a.fuseEnd - gameNow() < 5000 && <span className="wick-secs display">{Math.max(0, Math.ceil((a.fuseEnd - gameNow()) / 1000))}</span>}
          {fast && (
            <span className="wick-fast display" key={fast.at}>
              🔥 Rápido! −1s <i>Fast answer: hotter potato!</i>
            </span>
          )}
        </div>
      )}
      {a.phase === "intro" && holder && (
        <div className="bomb-intro display">
          🥔 {a.inPractice ? "Ensaio!" : a.final ? "Última batata — vale a dobrar!" : "Batata quente!"}
          <i>
            {holder.name} começa · {holder.name} starts{a.final && !a.inPractice ? " — this one counts double" : ""}
          </i>
        </div>
      )}
      {a.phase === "play" && q && holder && (
        <div className={`card bomb-question ${side} ${a.lockedMs > 0 ? "wrong" : ""}`} key={`${a.passSeq}-${a.promptId}`}>
          <span className="kicker">
            {holder.name}: {KIND[q.kind]!.pt} <i>{KIND[q.kind]!.en}</i>
          </span>
          <div className="bq-body">
            {q.kind === "hear" || q.kind === "hearNumber" || q.kind === "phrase" ? (
              <span className="bq-prompt display">🔊</span>
            ) : q.prompt?.pic ? (
              <Picture glyph={q.prompt.pic} size="3.6em" />
            ) : null}
            {q.kind === "opposite" && q.prompt && <b className="display bq-word">{q.prompt.pt}</b>}
            <div className="bq-options">
              {q.options.map((o) => (
                <span key={o.pt} className="bq-opt">
                  {o.pic ? <Picture glyph={o.pic} size="2.2em" /> : <b>{o.pt}</b>}
                </span>
              ))}
            </div>
          </div>
          {a.lockedMs > 0 && <span className="bq-wrong display">✗</span>}
        </div>
      )}
      {a.phase === "boom" && a.burned && (
        <div className="bomb-boom display">
          BUM!
          <i>
            {a.burned.name} queimou-se! · {a.burned.name} got burned{a.inPractice ? " (Ensaio — doesn't count)" : ""}
          </i>
        </div>
      )}
    </div>
  );
}
