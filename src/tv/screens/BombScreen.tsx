/** Batata Quente on the TV: the hot potato flying between the two players, the holder's question, the boom. */
import { ROUNDS, type BatataQuente } from "../../games/bomb/bomb.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { gameNow } from "../clock.ts";
import { DoNow, GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

const KIND: Record<string, { pt: string; en: string }> = {
  hear: { pt: "Ouve e toca!", en: "Listen and tap the picture" },
  see: { pt: "Como se diz?", en: "Name the picture" },
  number: { pt: "Que número é?", en: "Read the number" },
  hearNumber: { pt: "Ouve o número!", en: "Listen: which number?" },
  opposite: { pt: "O contrário de…", en: "The opposite of…" },
  phrase: { pt: "Ouve e escolhe!", en: "Listen: which one did the TV say?" },
};
/** The written versions (harder levels): same question, typed on the phone. */
const KIND_TYPED: Record<string, { pt: string; en: string }> = {
  see: { pt: "Como se diz? Escreve!", en: "Type its name in Portuguese" },
  number: { pt: "Escreve o número!", en: "Type the number in words" },
  opposite: { pt: "Escreve o contrário!", en: "Type the opposite in Portuguese" },
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
  const ask = q ? ((q.typed && KIND_TYPED[q.kind]) || KIND[q.kind]!) : null;
  const fuseLeft = Math.max(0, (1 - heat) * 100);
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
      {a.phase === "play" && holder && ask ? (
        <DoNow who={holder} pt={ask.pt} en={`${ask.en} — right answer passes the potato`} phone />
      ) : a.phase === "intro" && holder ? (
        <DoNow tone="calm" who={holder} pt="começa com a batata!" en={`${holder.name} starts${a.final && !a.inPractice ? " — this one counts double" : ""}`} />
      ) : a.phase === "boom" && a.burned ? (
        <DoNow tone="alert" who={a.burned} pt="perde esta batata!" en={`${a.burned.name} loses this potato${a.inPractice ? " (practice — doesn't count)" : ""}`} />
      ) : (
        <DoNow tone="calm" pt="Fim do jogo!" en="Game over" />
      )}
      <div className="bomb-arena">
        {players.map((p, i) => (
          <div key={p.playerId} className={`bomb-seat ${i === 0 ? "left" : "right"} ${p === holder && a.phase !== "boom" ? "hot" : ""} ${a.burned === p ? "burned" : ""}`}>
            <PlayerChip p={p} size="2.4em" />
            {a.phase === "play" && p === a.other && a.stealQ && a.hurryLeft > 0 && <StealCard a={a} />}
            {hurrier && hurrier === p && (
              <span className="hurry-bubble display" key={a.hurrySeq}>
                Aquece! 🔥 −1s
              </span>
            )}
          </div>
        ))}
        <div className={`potato ${side} ${a.phase}`} style={{ ["--heat" as string]: heat, display: a.phase === "end" ? "none" : undefined }} key={a.phase === "boom" ? "boom" : "potato"}>
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
          <span className="wick-rope" style={{ width: `${fuseLeft}%` }} />
          <span className="wick-spark" style={{ left: `${fuseLeft}%` }}>
            ✨
          </span>
          {a.fuseEnd - gameNow() < 5000 && (
            <span className="wick-secs display" style={{ left: `${fuseLeft}%` }}>
              {Math.max(0, Math.ceil((a.fuseEnd - gameNow()) / 1000))}
            </span>
          )}
          {fast && (
            <span className="wick-fast display" key={fast.at}>
              🔥 Rápido! −1s <i>Fast answer: hotter potato!</i>
            </span>
          )}
        </div>
      )}
      {a.phase === "intro" && holder && (
        <div className="bomb-intro display">🥔 {a.inPractice ? "Ensaio!" : a.final ? "Última batata — vale a dobrar!" : "Batata quente!"}</div>
      )}
      {a.phase === "play" && q && holder && (
        <div className={`card bomb-question ${side} ${a.lockedMs > 0 ? "wrong" : ""}`} key={`${a.passSeq}-${a.promptId}`}>
          <div className="bq-body">
            {q.kind === "hear" || q.kind === "hearNumber" || q.kind === "phrase" ? (
              <span className="bq-prompt display">🔊</span>
            ) : q.prompt?.pic ? (
              <Picture glyph={q.prompt.pic} size="3.6em" />
            ) : null}
            {q.kind === "opposite" && q.prompt && <b className="display bq-word">{q.prompt.pt}</b>}
            {q.typed ? (
              <span className="bq-typed display">✍️ …</span>
            ) : (
            <div className="bq-options">
              {q.options.map((o) => (
                <span key={o.pt} className="bq-opt">
                  {o.pic ? <Picture glyph={o.pic} size="2.2em" /> : <b>{o.pt}</b>}
                </span>
              ))}
            </div>
            )}
          </div>
          {a.lockedMs > 0 && <span className="bq-wrong display">✗</span>}
          {a.lockedMs > 0 && a.lastHold && gameNow() - a.lastHold.at < 2000 && (
            <b className="bs-res">
              ✗ {a.lastHold.wrote} — era «{a.lastHold.answer}» <i>it was «{a.lastHold.answer}»</i>
            </b>
          )}
        </div>
      )}
      {a.phase === "boom" && a.burned && (
        <div className="bomb-boom display">BUM!</div>
      )}
    </div>
  );
}

/** The safe player's "Aquece!" question on the TV, so the room sees the duel (and the answer after a try). */
function StealCard({ a }: { a: BatataQuente }) {
  const sq = a.stealQ!;
  const last = a.lastSteal && gameNow() - a.lastSteal.at < 1800 ? a.lastSteal : null;
  const who = a.other;
  return (
    <div className={`card bomb-steal ${last ? (last.ok ? "ok" : "miss") : ""}`}>
      <span className="kicker">
        {who ? `${who.name} aquece` : "Aquece"} 🔥 · {a.hurryLeft}× {sq.typed ? "✍️" : ""}
      </span>
      <span className="bs-q">
        {sq.prompt?.pic && <Picture glyph={sq.prompt.pic} size="1.8em" />}
        {sq.kind === "opposite" && sq.prompt && <b>≠ {sq.prompt.pt}</b>}
      </span>
      {last && (
        <b className="bs-res">
          {last.ok ? (
            <>✓ {last.wrote}</>
          ) : (
            <>
              ✗ {last.wrote} — era «{last.answer}»<i>it was «{last.answer}»</i>
            </>
          )}
        </b>
      )}
    </div>
  );
}
