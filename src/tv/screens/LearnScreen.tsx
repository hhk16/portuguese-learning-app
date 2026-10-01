/** Aprender juntos on the TV: the exercise everyone is answering, then everyone's answers together. */
import { answerOf, isGraded } from "../../curriculum/learn.ts";
import { RUSH_GOAL, RUSH_HEARTS, type LearnActivity } from "../../games/learn/learn.ts";
import { Face, PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";
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
      <div className={`card stage-card rush-card ${r.last ? (r.last.ok ? "ok" : "miss") : ""}`} key={r.asked}>
        {!r.wordEnd ? (
          <h2 className="display">
            ⚡ {RUSH_GOAL} certas juntos para passar! <i>Get {RUSH_GOAL} right together to pass — {RUSH_HEARTS} hearts</i>
          </h2>
        ) : (
          <>
            <Picture glyph="🔊" size="4em" />
            <div className="rush-options">
              {r.options.map((o) => (
                <span key={o.itemId} className="rush-opt">
                  {r.pictures ? <Picture glyph={o.emoji} size="3.4em" /> : <b className="display">{o.pt}</b>}
                </span>
              ))}
            </div>
            <div className="rush-players">
              {a.players.map((p) => (
                <PlayerChip key={p.playerId} p={p} size="1.8em" extra={<b>{r.answers.has(p.playerId) ? "✓" : "…"}</b>} />
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
          <div className="kicker">Dica</div>
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
            <div className="kicker">Palavra nova</div>
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
          <h2 className="display">Ouve e escolhe</h2>
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
            <div className="kicker">Como se diz?</div>
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
          <div className="kicker center">Traduz</div>
          <div className="big-en quote center">“{ex.en}”</div>
          {reveal && <div className="big-pt display center">{ex.pt}</div>}
        </>
      );
      break;
    case "pairs":
      body = (
        <>
          <h2 className="display center">Juntem os pares no telemóvel</h2>
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
            <div className="kicker">{speaker ? `${speaker.name}, diz em voz alta:` : "Diz em voz alta:"}</div>
            <div className="big-pt display">{ex.pt}</div>
            <div className="big-en">{ex.en}</div>
          </div>
        </div>
      );
      break;
  }

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
