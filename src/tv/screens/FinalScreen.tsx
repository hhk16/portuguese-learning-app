/** Grande Final on the TV: the question (picture or 🔊), who answered, and the race for the crown. */
import { answerText, QUESTIONS, type GrandeFinal } from "../../games/final/final.ts";
import { PERSON_LABEL, VERB_PICS } from "../../games/verbs/verbs.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { DoNow, GameTop } from "./Menus.tsx";
import { RoundPill } from "./ScorePill.tsx";
import { useTick } from "./useTick.ts";

export function FinalScreen({ a }: { a: GrandeFinal }) {
  useTick(200, a.phase === "ask");
  const q = a.q;
  if (!q) return null;
  const secs = Math.ceil(a.msLeft / 1000);
  const pts = (id: string) => a.points.get(id) ?? 0;
  const top = Math.max(1, ...a.players.map((p) => pts(p.playerId)));
  // The one instruction for this question (first right answer wins).
  const ask = q.stop
    ? { pt: `Uma palavra com ${q.stop.letter}!`, en: `Write a word starting with ${q.stop.letter} — first right wins` }
    : q.verb
      ? { pt: "Escrevam o verbo!", en: "Write the verb for this person — first right wins" }
      : q.opp
        ? { pt: "Escrevam o contrário!", en: "Write the opposite — first right wins" }
        : q.num
          ? { pt: "Escrevam o número!", en: "Write the number in words — first right wins" }
          : q.link
            ? { pt: "Uma palavra para os dois!", en: "One word that fits both pictures — first right wins" }
            : q.fits
              ? { pt: "Qual é a imagem?", en: "Tap the picture it fits — first right wins" }
              : q.kind === "see"
                ? { pt: "Como se diz?", en: `${a.rules.typeSee ? "Type" : "Tap"} its name — first right wins` }
                : q.kind === "frase"
                  ? { pt: "O que pediu o cliente?", en: "Listen: what was ordered? Tap it — first right wins" }
                  : { pt: "Ouçam e toquem!", en: "Listen and tap the picture — first right wins" };
  return (
    <div className="tv-overlay game-screen centered final-screen">
      <GameTop title="Grande Final" pic="🏆">
        <RoundPill label={a.tieBreak ? "Desempate! · Tie-break" : `Pergunta ${Math.min(a.index + 1, QUESTIONS)}/${QUESTIONS}`} double={a.last} />
        {a.phase === "ask" && <span className={`pill clock ${a.msLeft < 4000 ? "low" : ""}`}>⏱ {secs}</span>}
      </GameTop>
      {a.phase === "ask" ? (
        <DoNow pt={ask.pt} en={ask.en} phone />
      ) : (
        <DoNow tone="calm" pt="Vejam a resposta" en="Here's the answer — who got it first?" />
      )}
      <div className="final-stage">
        <div className={`card final-q ${a.phase}`}>
          {q.remix && <span className="final-remix display">🔁 {q.remix}</span>}
          {q.stop ? (
            <>
              <span className="final-stop display">
                <b>{q.stop.letter}</b> <Picture glyph={q.stop.pic} size="1.2em" /> {q.stop.label}
              </span>
            </>
          ) : q.verb ? (
            <>
              <span className="final-stop display">
                <Picture glyph={PERSON_LABEL[q.verb.person].pic} size="1.4em" /> {PERSON_LABEL[q.verb.person].pt} + <Picture glyph={VERB_PICS[q.verb.verb]!.pic} size="1.4em" />
              </span>
              <i className="final-en">{VERB_PICS[q.verb.verb]!.en}</i>
            </>
          ) : q.opp ? (
            <>
              <span className="final-stop display">
                <Picture glyph={q.opp.pic} size="1.4em" /> {q.opp.from} ↔ ?
              </span>
              <i className="final-en">{q.opp.fromEn}</i>
            </>
          ) : q.num ? (
            <>
              <span className="final-stop display final-num">{q.num.value}</span>
            </>
          ) : q.link ? (
            <>
              <span className="final-stop display">
                <Picture glyph={q.link.a.emoji} size="2.2em" /> + <Picture glyph={q.link.b.emoji} size="2.2em" /> = ?
              </span>
            </>
          ) : q.fits ? (
            <>
              <span className="final-stop display">“{q.fits.pt}”</span>
              {a.level === 1 && <i className="final-en">{q.fits.en}</i>}
            </>
          ) : q.kind === "see" ? (
            <>
              <Picture glyph={q.word.emoji} size="7em" />
              <i className="final-en">{q.word.en}</i>
            </>
          ) : q.kind === "frase" ? (
            <>
              <span className="final-ear">🔊☕</span>
            </>
          ) : (
            <>
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
              ) : q.stop || q.verb || q.opp || q.num || q.link ? (
                <>
                  <b className="display">{answerText(q)}</b>
                  <i>{[...a.answers.values()].filter((x) => x.ok).map((x) => x.text).join(" · ") || "ninguém · nobody"}</i>
                </>
              ) : (
                <>
                  {(q.kind === "hear" || q.kind === "fits") && <Picture glyph={q.word.emoji} size="3em" />}
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
