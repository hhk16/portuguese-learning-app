/** Na Mesma Onda on the TV: the big dial between two opposites, moving live as the guesser turns it. */
import type { NaMesmaOnda } from "../../games/wave/wave.ts";
import { ROUNDS } from "../../games/wave/wave.ts";
import { DialFace } from "../../ui/DialFace.tsx";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop } from "./Menus.tsx";

export function WaveScreen({ a }: { a: NaMesmaOnda }) {
  const s = a.spectrum;
  if (!s) return null;
  const psychic = a.psychic;
  const guesser = a.guesser;
  const reveal = a.phase === "reveal";
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Na Mesma Onda" pic="🔮">
        <span className="pill">
          Mostrador {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
        </span>
        <span className="pill star-pill">{a.score} pontos</span>
      </GameTop>
      <div className="turn-banner card">
        {a.phase === "clue" && psychic && (
          <>
            <PlayerChip p={psychic} size="2em" />
            <span>vê o alvo e diz UMA palavra em português</span>
          </>
        )}
        {a.phase === "guess" && guesser && (
          <>
            <PlayerChip p={guesser} size="2em" />
            <span>roda o mostrador no telemóvel…</span>
          </>
        )}
        {reveal && <span className="display big-points">{a.lastPoints ? `+${a.lastPoints} pontos!` : "Longe… 0 pontos"}</span>}
      </div>
      <div className="wave-stage card">
        <div className="wave-end left">
          <Picture glyph={s.left.emoji} size="5em" />
          <b className="display">{s.left.m}</b>
          <i>{s.left.en}</i>
        </div>
        <div className="wave-dial">
          <DialFace value={a.value} target={reveal ? a.target : undefined} />
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
