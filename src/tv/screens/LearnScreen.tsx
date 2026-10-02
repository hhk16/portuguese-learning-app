/** Aprender juntos on the TV: the exercise everyone is answering, then everyone's answers together. */
import { answerOf, isGraded } from "../../curriculum/learn.ts";
import { RUSH_GOAL, RUSH_HEARTS, type LearnActivity } from "../../games/learn/learn.ts";
import { Face, PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { DoNow, GameTop } from "./Menus.tsx";
import { lessonPic } from "../activities.ts";
import { gameNow } from "../clock.ts";
import { useTick } from "./useTick.ts";

/** The lesson's lightning round: the TV says a word, both tap it — how many together in 40 s? */
function RushView({ a }: { a: LearnActivity }) {
  useTick(100, true);
  const r = a.rush!;
  const left = Math.max(0, r.endAt - gameNow());
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title={a.lesson.title} pic={lessonPic(a.lesson)}>
        <span className="pill twist-pill">⚡ Desafio relâmpago <i>Lightning round</i></span>
        <span className={`pill clock ${left < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(left / 1000)}</span>
        <span className="pill star-pill">
          {r.team}/{RUSH_GOAL} ⭐
        </span>
        <span className="pill lives-pill">
          {"❤️".repeat(Math.max(0, r.hearts))}
          {"🖤".repeat(Math.max(0, RUSH_HEARTS - r.hearts))}
        </span>
        {r.combo >= 2 && <span className="pill double-pill">Combo ×{r.combo}</span>}
      </GameTop>
      {a.rushResult ? (
        <DoNow tone="calm" pt="Vejam o resultado" en="Here's how the lightning round went" />
      ) : r.typed ? (
        <DoNow pt="A última: ouçam e escrevam!" en="The last star: both type the word you hear" phone />
      ) : (
        <DoNow pt={`Ouçam e toquem — ${RUSH_GOAL} certas!`} en={`Listen and tap — ${RUSH_GOAL} right together to pass`} phone />
      )}
      {a.rushResult && (
        <div className={`card rush-result ${a.rushResult}`}>
          <div className="display rush-result-title">{a.rushResult === "won" ? "⚡ Relâmpago superado!" : "⚡ Relâmpago perdido!"}</div>
          <div className="rush-result-sub">
            <b className="display">
              {r.team}/{RUSH_GOAL} ⭐
            </b>{" "}
            <span>
              {"❤️".repeat(Math.max(0, r.hearts))}
              {"🖤".repeat(Math.max(0, RUSH_HEARTS - r.hearts))}
            </span>
          </div>
          <b className="display rush-result-pt">{a.rushResult === "won" ? "Lição completa!" : "Tentem outra vez o relâmpago!"}</b>
          <i>{a.rushResult === "won" ? "Lesson complete!" : "The lesson isn't complete yet — try the lightning round again"}</i>
        </div>
      )}
      <div className={`card stage-card rush-card ${r.last ? (r.last.ok ? "ok" : "miss") : ""}`} key={r.asked} style={a.rushResult ? { visibility: "hidden" } : undefined}>
        {!r.wordEnd ? (
          <Picture glyph="⚡" size="5em" />
        ) : (
          <>
            <Picture glyph="🔊" size="4em" />
            {r.typed ? (
              <div className="rush-typed">
                {!r.settled && (
                  <div className="rush-slots display" aria-label="letters">
                    {r.card.pt
                      .replace(/^(o|a|os|as) /, "")
                      .replace(/[?!.,¿¡]/g, "")
                      .split("")
                      .map((ch, i) => (ch === " " ? <span key={i} className="slot-gap" /> : <span key={i}>_</span>))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rush-options">
                {r.options.map((o) => (
                  <span key={o.itemId} className={`rush-opt ${r.settled ? (o.itemId === r.card.itemId ? "right" : "dim") : ""}`}>
                    {r.pictures ? <Picture glyph={o.emoji} size="3.4em" /> : <b className="display">{o.pt}</b>}
                  </span>
                ))}
              </div>
            )}
            {r.settled && r.last?.pt && (
              <div className={`rush-said display ${r.last.ok ? "ok" : "miss"}`}>
                {r.last.ok ? "✓" : "✗"} {r.last.pt} {!r.last.ok && <i>era esta · that was it</i>}
              </div>
            )}
            <div className="rush-players">
              {a.players.map((p) => (
                <PlayerChip key={p.playerId} p={p} size="1.8em" extra={
                    <b>
                      {!r.answers.has(p.playerId) ? (r.settled ? "✗" : "…") : r.settled ? (r.answers.get(p.playerId) ? "✓" : "✗") : "🔒"}
                      {r.settled && r.typedBy.get(p.playerId) && <i className="rush-wrote"> “{r.typedBy.get(p.playerId)}”</i>}
                    </b>
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LearnScreen({ a }: { a: LearnActivity }) {
  if (a.rush) return <RushView a={a} />;
  const ex = a.ex;
  if (!ex) return null;
  const reveal = a.phase === "reveal";
  const players = a.players;
  const opts = "options" in ex ? ex.options : null;
  const correctId = "correctId" in ex ? ex.correctId : null;
  const speaker = players.find((p) => p.playerId === a.speakerId);

  let body: React.ReactNode = null;
  switch (ex.kind) {
    case "tip":
      body = (
        <>
          <h2 className="display">{ex.title}</h2>
          <div className="tip-grid">
            {ex.rows.map(([l, r]) => (
              <div key={l} className="tip-row">
                <span>{l}</span>
                <b>{r}</b>
              </div>
            ))}
          </div>
          {ex.note && <p className="muted">{ex.note}</p>}
        </>
      );
      break;
    case "intro":
      body = (
        <div className="intro">
          <Picture glyph={ex.emoji} size="9em" />
          <div>
            <div className="big-pt display">{ex.pt}</div>
            <div className="big-en">{ex.en}</div>
            {ex.note && <p className="muted">{ex.note}</p>}
          </div>
        </div>
      );
      break;
    case "listen":
      body = (
        <>
          <div className="listen-icon">
            <Picture glyph="🔊" size="5em" />
          </div>
        </>
      );
      break;
    case "read":
      body = <div className="big-pt display center">{ex.pt}</div>;
      break;
    case "write":
      body = (
        <div className="intro">
          {ex.emoji && ex.emoji !== ex.en && <Picture glyph={ex.emoji} size="6em" />}
          <div>
            <div className="big-en quote">“{ex.en}”</div>
          </div>
        </div>
      );
      break;
    case "gap":
      body = (
        <>
          <div className="big-pt display center gap-line">
            {ex.text.split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="gap">{reveal ? ex.answer : "?"}</span>}
              </span>
            ))}
          </div>
          <div className="big-en center">{ex.en}</div>
        </>
      );
      break;
    case "build":
      body = (
        <>
          <div className="big-en quote center">“{ex.en}”</div>
          {reveal && <div className="big-pt display center">{ex.pt}</div>}
        </>
      );
      break;
    case "pairs":
      body = (
        <>
          <div className="pairs-tv">
            {ex.pairs.map((p) => (
              <span key={p.id} className="word-chip">
                <b>{p.pt}</b>
                {reveal && <i>{p.en}</i>}
              </span>
            ))}
          </div>
        </>
      );
      break;
    case "speak":
      body = (
        <div className="intro">
          {ex.emoji && ex.emoji !== ex.en && <Picture glyph={ex.emoji} size="6em" />}
          <div>
            <div className="big-pt display">{ex.pt}</div>
            <div className="big-en">{ex.en}</div>
          </div>
        </div>
      );
      break;
  }

  const listener = players.find((p) => p.playerId !== a.speakerId);
  const doNow: { pt: string; en: string; phone?: boolean } = reveal
    ? { pt: "Vejam a resposta", en: "Then tap Continuar on your phone", phone: true }
    : {
        tip: { pt: "Leiam a dica", en: "Read the tip, then tap Percebi", phone: true },
        intro: { pt: "Palavra nova — ouçam e repitam", en: "New word: listen and repeat" },
        listen: { pt: "Ouçam e toquem no telemóvel", en: "Listen, then tap on your phone", phone: true },
        read: { pt: "O que quer dizer?", en: "What does it mean? Tap on your phone", phone: true },
        write: { pt: "Como se diz em português?", en: "How do you say it? Answer on your phone", phone: true },
        gap: { pt: "Completem a frase", en: "Fill the gap on your phone", phone: true },
        build: { pt: "Traduzam a frase", en: "Build the sentence on your phone", phone: true },
        pairs: { pt: "Juntem os pares no telemóvel", en: "Match the pairs on your phone", phone: true },
        speak:
          speaker && listener
            ? { pt: `${speaker.name}, diz em voz alta! ${listener.name}, ouve.`, en: `${speaker.name}, say it out loud — ${listener.name}, listen` }
            : { pt: "Diz em voz alta!", en: "Say it out loud", phone: true },
      }[ex.kind];

  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title={a.lesson.title} pic={lessonPic(a.lesson)}>
        <div className="progress-dots">
          {a.queue.map((_, i) => (
            <span key={i} className={i < a.index ? "done" : i === a.index ? "now" : ""} />
          ))}
        </div>
        {a.combo >= 2 && <span className="pill double-pill">Combo ×{a.combo}</span>}
        <span className="pill star-pill">★ {a.stars}</span>
      </GameTop>
      <DoNow tone={reveal ? "calm" : undefined} pt={doNow.pt} en={doNow.en} phone={doNow.phone} />
      <div className={`card stage-card ex-${ex.kind}`} key={`${a.index}-${a.phase}`}>
        {body}
        {opts && (
          <div className={`tv-options n-${opts.length} ${opts.every((o) => o.emoji) ? "pictures" : ""}`}>
            {opts.map((o) => {
              const by = a.pickedBy(o.id);
              const right = reveal && o.id === correctId;
              return (
                <div key={o.id} className={`tv-opt ${right ? "right" : reveal ? "dim" : ""}`}>
                  {o.emoji && <Picture glyph={o.emoji} size="3.2em" />}
                  <span>{o.label}</span>
                  {reveal && by.length > 0 && (
                    <span className="picked">
                      {by.map((p) => (
                        <Face key={p.playerId} avatar={p.avatar} color={p.color} size="2.2em" name={p.name} />
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {reveal && isGraded(ex) && !opts && (
          <div className="reveal-line">
            <b>{answerOf(ex).pt}</b>
          </div>
        )}
      </div>
      <div className="status-row">
        {players.map((p) => {
          const ans = a.answerOf(p);
          const graded = isGraded(ex);
          const judgedSpeaker = ex.kind === "speak" && p.playerId === a.speakerId;
          const state = reveal
            ? ans
              ? ans.ok
                ? "right"
                : "wrong"
              : ""
            : !graded
              ? ""
              : ex.kind === "speak"
                ? judgedSpeaker
                  ? "speaking"
                  : "judging"
                : ans
                  ? "done"
                  : "thinking";
          const label = { right: "Certo!", wrong: "Quase", done: "Respondeu", thinking: "A pensar…", speaking: "A falar", judging: "A ouvir", "": "" }[state];
          return label ? <PlayerChip key={p.playerId} p={p} size="2em" extra={<span className={`st st-${state}`}>{label}</span>} /> : null;
        })}
      </div>
    </div>
  );
}
