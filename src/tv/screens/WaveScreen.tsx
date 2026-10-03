/** Na Mesma Onda on the TV: the big dial between two opposites, moving live as the guesser turns it. */
import type { NaMesmaOnda } from "../../games/wave/wave.ts";
import { ROUNDS } from "../../games/wave/wave.ts";
import { DialFace } from "../../ui/DialFace.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { DoNow, GameTop } from "./Menus.tsx";
import { RoundPill, ScorePill } from "./ScorePill.tsx";
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
        {!a.inPractice && <RoundPill label={`Mostrador ${Math.min(a.round + 1, ROUNDS)}/${ROUNDS}`} double={a.final} />}
        {!a.inPractice && a.signals >= 0 && (
          <span className={`pill lives-pill signal-pill ${a.phase === "reveal" && a.signalDelta ? (a.signalDelta > 0 ? "gain" : "loss") : ""}`} key={`${a.round}-${a.signals}`} title="Sinais · Signals">
            📻 {"📶".repeat(Math.max(0, a.signals))}
            {"🔇".repeat(Math.max(0, a.rules.signals - a.signals))}
          </span>
        )}
        {timed && <span className={`pill clock ${a.msLeft < 10_000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
        <ScorePill score={a.score} max={a.maxScore} meta={!a.inPractice} />
      </GameTop>
      {a.phase === "clue" && psychic ? (
        <DoNow
          who={psychic}
          pt={`${a.typedClues ? "Escreve" : "Escolhe"} uma pista!`}
          en={a.round <= 0 ? "Only you see the hidden target — pick a clue for it" : `${a.typedClues ? "Write" : "Pick"} a clue for the hidden target`}
          phone
        />
      ) : a.phase === "guess" && guesser ? (
        <DoNow who={guesser} pt="Roda o mostrador!" en="Turn the dial to where the clue fits" phone />
      ) : a.phase === "suspense" ? (
        <DoNow tone="calm" pt={a.sure ? "🥁 Tem a certeza! ×2…" : "🥁 Onde está o alvo?"} en={a.sure ? "Sure — bullseye or nothing" : "Where's the target?"} />
      ) : reveal ? (
        <DoNow
          tone="calm"
          pt={a.lastDial ? `+${a.lastDial} pontos!` : a.sure ? "Aposta perdida!" : "Longe… 0 pontos"}
          en={a.lastDial ? (a.sure ? "Bullseye — “Tenho a certeza” doubled it!" : a.lastDial >= 4 * (a.final ? 2 : 1) ? "Em cheio! · Bullseye!" : `+${a.lastDial} points`) : a.sure ? "“Tenho a certeza” lost — bullseye or nothing" : "Far off — no points"}
        />
      ) : (
        <DoNow tone="calm" pt="Fim do jogo!" en="Game over" />
      )}
      {reveal && a.signalDelta !== 0 && (
        <div className={`turn-banner card signal-note ${a.signalDelta < 0 ? "loss" : "gain"}`}>
          {a.signalDelta < 0 ? `📶 −1 ${a.signals > 0 ? "Perderam um sinal! · Signal lost" : "Sem sinal! · Off the air!"}` : "📶 +1 Recuperaram um sinal! · Signal back"}
        </div>
      )}
      <div className="wave-stage card">
        {(a.phase === "guess" || a.phase === "suspense" || reveal) && a.clue && (
          <div className="wave-clue display">
            <Picture glyph={a.clue.pic} size="1.2em" /> “{a.clue.pt}”{a.clueTyped && <small className="typed-badge"> ✍️</small>}
            {a.clue.en && <i>{a.clue.en}</i>}
          </div>
        )}
        <div className="wave-end left">
          <Picture glyph={s.left.emoji} size="5em" />
          <b className="display">{s.left.m}</b>
          <i>{s.left.en}</i>
        </div>
        <div className="wave-dial">
          <DialFace value={a.value} target={reveal || a.phase === "end" ? a.target : undefined} widths={a.rules.bands} />
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
