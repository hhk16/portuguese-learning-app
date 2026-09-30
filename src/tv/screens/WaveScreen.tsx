/** Na Mesma Onda on the TV: the big dial between two opposites, moving live as the guesser turns it. */
import type { NaMesmaOnda } from "../../games/wave/wave.ts";
import { ROUNDS } from "../../games/wave/wave.ts";
import { DialFace } from "../../ui/DialFace.tsx";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

export function WaveScreen({ a }: { a: NaMesmaOnda }) {
  useTick(250, a.phase === "clue" || a.phase === "guess");
  const s = a.spectrum;
  if (!s) return null;
  const psychic = a.psychic;
  const guesser = a.guesser;
  const reveal = a.phase === "reveal";
  const timed = a.phase === "clue" || a.phase === "guess";
  return (
    <div className={`tv-overlay game-screen centered ${a.phase === "suspense" ? "suspense" : ""}`}>
      <GameTop title="Na Mesma Onda" pic="🔮">
        <span className="pill">
          Mostrador {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
        </span>
        {a.final && <span className="pill double-pill">×2</span>}
        {timed && <span className={`pill clock ${a.msLeft < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
        <span className="pill star-pill">{a.score} pontos</span>
      </GameTop>
      <div className="turn-banner card">
        {a.phase === "clue" && psychic && (
          <>
            <PlayerChip p={psychic} size="2em" />
            <span className="bi-line">
              <b>vê o alvo e escolhe uma pista</b>
              <i>sees the target and picks a clue</i>
            </span>
          </>
        )}
        {a.phase === "guess" && guesser && a.clue && (
          <>
            <span className="clue-big display">
              <Picture glyph={a.clue.pic} size="1.2em" /> “{a.clue.pt}”
            </span>
            <span className="bi-line">
              <b>
                <PlayerChip p={guesser} size="1.4em" /> roda o mostrador
              </b>
              <i>{a.clue.en} — turn the dial</i>
            </span>
          </>
        )}
        {a.phase === "suspense" && (
          <span className="display big-points">
            🥁 {a.sure ? "Tem a certeza! ×2…" : "…"}
          </span>
        )}
        {reveal && (
          <span className="bi-line">
            <b className="display big-points">{a.lastPoints ? `+${a.lastPoints} pontos!` : a.sure ? "Aposta perdida!" : "Longe… 0 pontos"}</b>
            <i>{a.lastPoints ? (a.sure ? "Bullseye — the bet paid off!" : a.lastPoints >= 4 * (a.final ? 2 : 1) ? "Em cheio! · Bullseye!" : `+${a.lastPoints} points`) : a.sure ? "Bet lost — bullseye or nothing" : "Far off — no points"}</i>
          </span>
        )}
      </div>
      <div className="wave-stage card">
        <div className="wave-end left">
          <Picture glyph={s.left.emoji} size="5em" />
          <b className="display">{s.left.m}</b>
          <i>{s.left.en}</i>
        </div>
        <div className="wave-dial">
          <DialFace value={a.value} target={reveal ? a.target : undefined} widths={a.rules.bands} />
        </div>
        <div className="wave-end right">
          <Picture glyph={s.right.emoji} size="5em" />
          <b className="display">{s.right.m}</b>
          <i>{s.right.en}</i>
        </div>
      </div>
    </div>
  );
}
