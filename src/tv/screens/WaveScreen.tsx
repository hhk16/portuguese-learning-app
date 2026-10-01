/** Na Mesma Onda on the TV: the big dial between two opposites, moving live as the guesser turns it. */
import type { NaMesmaOnda } from "../../games/wave/wave.ts";
import { ROUNDS } from "../../games/wave/wave.ts";
import { DialFace } from "../../ui/DialFace.tsx";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop, MetaBar } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

export function WaveScreen({ a }: { a: NaMesmaOnda }) {
  useTick(250, a.phase === "clue" || a.phase === "guess");
  const s = a.spectrum;
  if (!s) return null;
  const psychic = a.psychic;
  const guesser = a.guesser;
  const reveal = a.phase === "reveal";
  const timed = (a.phase === "clue" || a.phase === "guess") && !a.inPractice;
  return (
    <div className={`tv-overlay game-screen centered ${a.phase === "suspense" ? "suspense" : ""}`}>
      <GameTop title="Na Mesma Onda" pic="🔮">
        {!a.inPractice && (
          <span className="pill">
            Mostrador {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
          </span>
        )}
        {a.final && <span className="pill double-pill">×2</span>}
        {!a.inPractice && a.signals >= 0 && (
          <span className={`pill lives-pill signal-pill ${a.phase === "reveal" && a.signalDelta ? (a.signalDelta > 0 ? "gain" : "loss") : ""}`} key={`${a.round}-${a.signals}`} title="Sinais · Signals">
            📻 {"📶".repeat(Math.max(0, a.signals))}
            {"🔇".repeat(Math.max(0, a.rules.signals - a.signals))}
          </span>
        )}
        {timed && <span className={`pill clock ${a.msLeft < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
        <span className="pill star-pill">{a.score} pontos</span>
        {!a.inPractice && <MetaBar score={a.score} max={a.maxScore} />}
      </GameTop>
      {a.phase === "clue" && a.round <= 0 && (
        <div className="goal-line">
          🎯 <b>Há um alvo escondido no mostrador. Acertem nele!</b>{" "}
          <i>
            One sees the target and picks a clue, the other turns the dial. Far off loses a signal 📶 — lose them all and the radio show goes off-air!
          </i>
        </div>
      )}
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
            <b className="display big-points">{a.lastDial ? `+${a.lastDial} pontos!` : a.sure ? "Aposta perdida!" : "Longe… 0 pontos"}</b>
            <i>{a.lastDial ? (a.sure ? "Bullseye — “Tenho a certeza” doubled it!" : a.lastDial >= 4 * (a.final ? 2 : 1) ? "Em cheio! · Bullseye!" : `+${a.lastDial} points`) : a.sure ? "“Tenho a certeza” lost — bullseye or nothing" : "Far off — no points"}</i>
            {a.signalDelta < 0 && <b className="signal-note loss">📶 −1 {a.signals > 0 ? "Perderam um sinal! · Signal lost" : "Sem sinal! · Off the air!"}</b>}
            {a.signalDelta > 0 && <b className="signal-note gain">📶 +1 Recuperaram um sinal! · Signal back</b>}
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
