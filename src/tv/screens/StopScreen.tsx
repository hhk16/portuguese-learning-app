/** Stop! on the TV: the letter, who's filled what, STOP!, then the score table with hints. */
import { ROUNDS, HURRY_MS, type Stop } from "../../games/stop/stop.ts";
import { Face, PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

const CAT_EN: Record<string, string> = { comida: "Food or drink", animal: "Animal", coisa: "Thing", profissao: "Job", pais: "Country / nationality", lugar: "Place / nature" };
const MARK: Record<string, string> = { known: "✓", spelling: "✓", "voted-yes": "✓", "voted-no": "✗", letter: "✗", empty: "—", pending: "?" };

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
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Stop!" pic="⏱️">
        <span className="pill">{a.suddenDeath ? "Desempate! · Tie-breaker" : `Letra ${Math.min(a.round + 1, ROUNDS)}/${ROUNDS}`}</span>
        {a.double && <span className="pill double-pill">×2</span>}
        {a.players.map((p) => (
          <span key={p.playerId} className="pill">
            <Face avatar={p.avatar} color={p.color} size="1.4em" name={p.name} /> {a.totals.get(p.playerId) ?? 0}
          </span>
        ))}
      </GameTop>
      {!table && (
        <div className="stop-stage">
          <div className={`card stop-letter ${a.phase === "hurry" ? "hurry" : ""}`}>
            <span className="display">{a.letter}</span>
            <div className="stop-ring" style={{ ["--p" as string]: `${(a.msLeft / total) * 100}` }} />
            <b className="display secs">{secs}</b>
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
          {a.phase === "hurry" && a.stoppedBy && (
            <div className="stop-shout display">
              STOP! · {a.stoppedBy.name} acabou <i>{a.stoppedBy.name} finished — hurry!</i>
            </div>
          )}
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
                      {cell?.helped && <small className="fix">💡</small>}
                      {a.phase === "score" && ok && <em className="display">+{cell.points}</em>}
                    </span>
                  );
                })}
                {a.phase === "score" && hints.length > 0 && <span className="hint">ex.: {hints.map((h) => h.pt).join(", ")} · other words you could use</span>}
              </div>
            );
          })}
          {a.phase === "vote" && (
            <div className="stop-vote-note">
              Palavras novas? O teu par decide no telemóvel… ({secsLeft(a)} s)
              <i>New words? Your partner decides on their phone — only a YES counts.</i>
            </div>
          )}
          {a.phase === "score" && (
            <div className="stop-round-sum">
              {a.players.map((p) => (
                <span key={p.playerId} className="pill">
                  {p.name} +{a.roundPoints(p)}
                  {a.stoppedBy === p ? " (STOP +5)" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function secsLeft(a: Stop) {
  return Math.ceil(a.msLeft / 1000);
}
