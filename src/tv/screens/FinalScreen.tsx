/** Grande Final on the TV: the question (picture or 🔊), who answered, and the race for the crown. */
import { answerText, QUESTIONS, type GrandeFinal } from "../../games/final/final.ts";
import { PERSON_LABEL, VERB_PICS } from "../../games/verbs/verbs.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

export function FinalScreen({ a }: { a: GrandeFinal }) {
  useTick(200, a.phase === "ask");
  const q = a.q;
  if (!q) return null;
  const secs = Math.ceil(a.msLeft / 1000);
  const pts = (id: string) => a.points.get(id) ?? 0;
  const top = Math.max(1, ...a.players.map((p) => pts(p.playerId)));
  return (
    <div className="tv-overlay game-screen centered final-screen">
      <GameTop title="Grande Final" pic="🏆">
        <span className="pill">
          {a.tieBreak ? "Desempate! · Tie-break" : `Pergunta ${Math.min(a.index + 1, QUESTIONS)}/${QUESTIONS}`}
        </span>
        {a.last && <span className="pill double-pill">×2</span>}
        {a.phase === "ask" && <span className={`pill clock ${a.msLeft < 4000 ? "low" : ""}`}>⏱ {secs}</span>}
      </GameTop>
      <div className="final-stage">
        <div className={`card final-q ${a.phase}`}>
          {q.remix && <span className="final-remix display">🔁 {q.remix}</span>}
          {q.stop ? (
            <>
              <span className="kicker">Stop! Uma palavra com… · a word starting with…</span>
              <span className="final-stop display">
                <b>{q.stop.letter}</b> <Picture glyph={q.stop.pic} size="1.2em" /> {q.stop.label}
              </span>
            </>
          ) : q.verb ? (
            <>
              <span className="kicker">Escreve o verbo · write the verb</span>
              <span className="final-stop display">
                <Picture glyph={PERSON_LABEL[q.verb.person].pic} size="1.4em" /> {PERSON_LABEL[q.verb.person].pt} + <Picture glyph={VERB_PICS[q.verb.verb]!.pic} size="1.4em" />
              </span>
              <i className="final-en">{VERB_PICS[q.verb.verb]!.en}</i>
            </>
          ) : q.opp ? (
            <>
              <span className="kicker">O contrário de… · the opposite of…</span>
              <span className="final-stop display">
                <Picture glyph={q.opp.pic} size="1.4em" /> {q.opp.from} ↔ ?
              </span>
              <i className="final-en">{q.opp.fromEn}</i>
            </>
          ) : q.kind === "see" ? (
            <>
              <span className="kicker">Vê · See — como se diz? · how do you say it?</span>
              <Picture glyph={q.word.emoji} size="7em" />
              <i className="final-en">{q.word.en}</i>
            </>
          ) : q.kind === "frase" ? (
            <>
              <span className="kicker">Frase · Sentence — o que pediu o cliente? · what was ordered?</span>
              <span className="final-ear">🔊☕</span>
            </>
          ) : (
            <>
              <span className="kicker">Ouve · Listen — toca na imagem · tap the picture</span>
              <span className="final-ear">🔊</span>
            </>
          )}
          {a.phase === "reveal" && (
            <div className="final-answer">
              {q.frase ? (
                <>
                  <b className="display">
                    {q.frase.answer.split("×")[0]} × <Picture glyph={q.frase.options.find((o) => o.id === q.frase!.answer)?.pic} size="1em" />
                  </b>
                  <i>“{q.frase.text}”</i>
                </>
              ) : q.stop || q.verb || q.opp ? (
                <>
                  <b className="display">{answerText(q)}</b>
                  <i>{[...a.answers.values()].filter((x) => x.ok).map((x) => x.text).join(" · ") || "ninguém · nobody"}</i>
                </>
              ) : (
                <>
                  {q.kind === "hear" && <Picture glyph={q.word.emoji} size="3em" />}
                  <b className="display">{q.word.pt}</b>
                  <i>{q.word.en}</i>
                </>
              )}
            </div>
          )}
        </div>
        <div className="final-race">
          {a.players.map((p) => {
            const ans = a.answers.get(p.playerId);
            const first = a.firstRight === p.playerId;
            return (
              <div key={p.playerId} className="race-row">
                <PlayerChip p={p} size="2.2em" />
                <div className="race-bar">
                  <div data-color={p.color} style={{ width: `${(pts(p.playerId) / top) * 100}%` }} />
                </div>
                <b className="pp-score">{pts(p.playerId)}</b>
                <span className={`race-tag ${ans ? (a.phase === "reveal" ? (ans.ok ? "ok" : "bad") : "in") : ""}`}>
                  {ans ? (a.phase === "reveal" ? (ans.ok ? (first ? "1.º ⚡" : "✓") : "✗") : "🔒") : "…"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
