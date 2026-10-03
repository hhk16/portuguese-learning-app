/** Stop! on the TV: the letter, who's filled what, STOP!, then the score table with hints. */
import { ROUNDS, HURRY_MS, type Stop } from "../../games/stop/stop.ts";
import { Face, PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { DoNow, GameTop } from "./Menus.tsx";
import { RoundPill } from "./ScorePill.tsx";
import { useTick } from "./useTick.ts";

const CAT_EN: Record<string, string> = { comida: "Food or drink", animal: "Animal", coisa: "Thing", profissao: "Job", pais: "Country / nationality", lugar: "Place / nature" };
const MARK: Record<string, string> = { known: "✓", spelling: "✓", "voted-yes": "✓", "voted-no": "✗", letter: "✗", empty: "—", pending: "?", wrongcat: "✗", notword: "✗" };
/** "É uma coisa!" — what a word from the wrong category really is. */
const CAT_PT: Record<string, string> = { comida: "uma comida", animal: "um animal", coisa: "uma coisa", profissao: "uma profissão", pais: "um país", lugar: "um lugar" };

export function StopScreen({ a }: { a: Stop }) {
  useTick(250, a.phase === "write" || a.phase === "hurry" || a.phase === "vote");
  if (a.players.length < 2)
    return (
      <div className="tv-overlay game-screen centered">
        <GameTop title="Stop!" pic="⏱️" />
        <div className="card stage-card center">
          <h2 className="display">Este jogo precisa de duas pessoas</h2>
        </div>
      </div>
    );
  const total = a.phase === "hurry" ? HURRY_MS : a.rules.writeMs;
  const secs = Math.ceil(a.msLeft / 1000);
  const table = a.phase === "score" || a.phase === "vote";
  const timed = a.phase === "write" || a.phase === "hurry" || a.phase === "vote";
  const hurrying = a.phase === "hurry" && a.stoppedBy ? a.players.find((p) => p !== a.stoppedBy) : undefined;
  // Vote: who still has to judge their partner's new words, and which words.
  const voters = a.phase === "vote" ? a.players.filter((p) => !a.voted.has(p.playerId)) : [];
  const pendingOf = (p: (typeof a.players)[number]) => {
    const partner = a.rt.partnerOf(p);
    return Object.values((partner && a.cells.get(partner.playerId)) ?? {}).filter((c) => c.status === "pending").map((c) => c.word);
  };
  const oneVoter = voters.length === 1 ? voters[0] : undefined;
  const oneWord = oneVoter && pendingOf(oneVoter).length === 1 ? pendingOf(oneVoter)[0] : undefined;
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Stop!" pic="⏱️">
        {!a.inPractice && <RoundPill label={a.suddenDeath ? "Desempate! · Tie-breaker" : `Letra ${Math.min(a.round + 1, ROUNDS)}/${ROUNDS}`} double={a.double} />}
        {a.players.map((p) => (
          <span key={p.playerId} className="pill">
            <Face avatar={p.avatar} color={p.color} size="1.4em" name={p.name} /> {a.totals.get(p.playerId) ?? 0}
          </span>
        ))}
        {timed && <span className={`pill clock ${a.msLeft < 10_000 ? "low" : ""}`}>⏱ {secs}</span>}
      </GameTop>
      {a.phase === "write" ? (
        <DoNow pt={`Palavras com ${a.letter} para cada categoria!`} en={`Write a ${a.letter}-word for each category`} phone />
      ) : hurrying && a.stoppedBy ? (
        <DoNow tone="alert" who={hurrying} pt="Depressa! Acaba as palavras!" en={`${a.stoppedBy.name} hit STOP — finish your words!`} phone />
      ) : a.phase === "hurry" || a.phase === "lock" ? (
        <DoNow tone="calm" pt="Tempo! Vamos ver…" en="Time's up — checking your words" />
      ) : a.phase === "vote" ? (
        oneVoter ? (
          <DoNow who={oneVoter} pt={oneWord ? `«${oneWord}» existe? Decide!` : "Estas palavras contam? Decide!"} en="Real word? Vote on your phone" phone />
        ) : (
          <DoNow pt="Palavras novas: contam? Votem!" en="Vote on your partner's new words on your phone" phone />
        )
      ) : a.phase === "score" ? (
        <DoNow tone="calm" pt="Pontos desta letra" en="This letter's points" />
      ) : (
        <DoNow tone="calm" pt="Pontuação final" en={`Final score — ${ROUNDS} letters`} />
      )}
      {a.phase === "end" && <StopFinal a={a} />}
      {!table && a.phase !== "end" && (
        <div className="stop-stage">
          <div key={a.letter + a.round} className={`card stop-letter spin-in ${a.phase === "hurry" ? "hurry" : ""}`}>
            <span className="display">{a.letter}</span>
            <div className="stop-ring" style={{ ["--p" as string]: `${(a.msLeft / total) * 100}` }} />
          </div>
          <div className="card stop-cats">
            {a.categories.map((c) => (
              <div key={c.id} className="stop-cat">
                <Picture glyph={c.pic} size="2.2em" />
                <span className="display">{c.label}</span>
                <i>{CAT_EN[c.id]}</i>
              </div>
            ))}
          </div>
          <div className="status-row">
            {a.players.map((p) => (
              <PlayerChip key={p.playerId} p={p} size="2em" extra={<span className={`st ${a.filled(p) === a.categories.length ? "st-right" : "st-thinking"}`}>{a.filled(p)}/{a.categories.length}</span>} />
            ))}
          </div>
          {a.phase === "hurry" && a.stoppedBy && <div className="stop-shout display">STOP!</div>}
        </div>
      )}
      {table && (
        <div className="card stop-table">
          <div className="stop-row head">
            <span className="display letter-mini">{a.letter}</span>
            {a.players.map((p) => (
              <span key={p.playerId} className="who">
                <PlayerChip p={p} size="1.8em" />
              </span>
            ))}
          </div>
          {a.categories.map((c) => {
            const hints = a.hints(c.id);
            return (
              <div key={c.id} className="stop-row">
                <span className="cat">
                  <Picture glyph={c.pic} size="1.6em" />
                  {c.label}
                </span>
                {a.players.map((p) => {
                  const cell = a.cells.get(p.playerId)?.[c.id];
                  const ok = cell && (cell.status === "known" || cell.status === "voted-yes");
                  return (
                    <span key={p.playerId} className={`cell ${cell?.status ?? "empty"}`}>
                      <b>{cell?.word || "—"}</b>
                      <i>{cell ? MARK[cell.status] : ""}</i>
                      {cell?.status === "spelling" && cell.dict && <small className="fix">Quase! Querias dizer {cell.dict.pt}?</small>}
                      {cell?.status === "wrongcat" && cell.realCat && <small className="fix">É {CAT_PT[cell.realCat] ?? cell.realCat}!</small>}
                      {cell?.status === "notword" && <small className="fix">Isso não é português! 🦜</small>}
                      {cell?.helped && <small className="fix">💡</small>}
                      {a.phase === "score" && ok && <em className="display">+{cell.points}</em>}
                    </span>
                  );
                })}
                {a.phase === "score" && hints.length > 0 && (
                  <span className="hint">
                    ex.:{" "}
                    {hints.map((h, i) => (
                      <span key={h.pt}>
                        {i > 0 && ", "}
                        <b>{h.pt}</b>
                        {h.en && <i> ({h.en})</i>}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            );
          })}
          {a.phase === "vote" && (
            <div className="stop-legend">
              <span>
                <b className="ok">✓</b> certo · right
              </span>
              <span>
                <b className="pending">?</b> a votar · voting
              </span>
              <span>
                <b>✗</b> não conta · doesn't count
              </span>
              <span>
                <b>—</b> vazio · empty
              </span>
            </div>
          )}
          {a.phase === "score" && (
            <div className="stop-round-sum">
              {a.players.map((p) => (
                <span key={p.playerId} className="pill">
                  {p.name} +{a.roundPoints(p)}
                  {a.stopBonusTo === p ? " (STOP +5)" : a.stoppedBy === p ? " (STOP ✗ — not every word held up)" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** The final tally under the winner's beat: two bars fill to the totals, the crown on the winner. */
function StopFinal({ a }: { a: Stop }) {
  const rows = a.players.map((p) => ({ p, pts: a.totals.get(p.playerId) ?? 0 }));
  const top = Math.max(1, ...rows.map((r) => r.pts));
  const tie = rows.length === 2 && rows[0]!.pts === rows[1]!.pts;
  return (
    <div className="card stop-final">
      {rows.map(({ p, pts }) => (
        <div key={p.playerId} className="stop-final-row">
          <PlayerChip p={p} size="2.2em" />
          <div className="stop-final-bar">
            <div data-color={p.color} style={{ width: `${(pts / top) * 100}%`, background: "var(--pc)" }} />
          </div>
          <b className="display">
            {pts}
            {!tie && pts === top ? " 👑" : ""}
          </b>
        </div>
      ))}
    </div>
  );
}

