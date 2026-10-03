/** Em Sintonia on the TV: two words, a countdown, and both secret words revealed together. */
import { useEffect, useState } from "react";
import type { EmSintonia } from "../../games/sync/sync.ts";
import { ROUNDS } from "../../games/sync/sync.ts";
import { Face } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { gameNow } from "../clock.ts";
import { DoNow, GameTop } from "./Menus.tsx";
import { ScorePill } from "./ScorePill.tsx";

export function SyncScreen({ a }: { a: EmSintonia }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (a.phase !== "countdown" && a.phase !== "write" && a.phase !== "sense") return;
    const id = setInterval(() => force((x) => x + 1), 100);
    return () => clearInterval(id);
  }, [a.phase]);
  if (!a.pair) return null;
  const secs = Math.max(1, Math.ceil((a.phaseEnd - gameNow()) / 1000));
  return (
    <div className={`tv-overlay game-screen centered ${a.phase === "reveal" && a.lastMatch ? "sync-match" : ""}`}>
      <GameTop title="Em Sintonia" pic="🤝">
        <span className="pill round-pill">
          {a.inPractice ? "" : `Par ${Math.min(a.round + 1, ROUNDS)}/${ROUNDS} · `}tentativa {a.attempt}/{a.rules.tries}
          {a.final && <b className="x2">×2</b>}
        </span>
        {!a.inPractice && <span className="pill lives-pill">{"❤️".repeat(Math.max(0, a.lives))}{"🖤".repeat(Math.max(0, a.rules.lives - a.lives))}</span>}
        {a.phase === "write" && !a.inPractice && <span className={`pill clock ${a.msLeft < 8000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
        <ScorePill score={a.score} max={a.maxScore} meta={!a.inPractice} />
      </GameTop>
      {a.phase === "write" ? (
        <DoNow
          pt="Uma palavra que ligue as duas!"
          en={a.final && a.rules.wordsOnlyFinal && !a.pair[0].pic ? "Words only, no pictures — both write ONE linking word" : "Both write ONE word that links them"}
          phone
        />
      ) : a.phase === "countdown" ? (
        a.inPractice ? (
          <DoNow tone="calm" pt="Vamos ver…" en="Here come your words…" />
        ) : (
          <DoNow pt="Vão coincidir? Apostem!" en="Will your words match? Predict on your phone" phone />
        )
      ) : a.phase === "sense" ? (
        <DoNow pt="Faz sentido? Votem!" en="Same word — does it really link them? Vote on your phones" phone />
      ) : a.phase === "reveal" ? (
        <DoNow
          tone="calm"
          pt={a.lastMatch ? "Em sintonia! 🎉" : `${a.closeMiss ? "Quase!" : "Nada disso!"} ${a.attempt < a.rules.tries ? "Agora liguem as vossas palavras!" : a.inPractice ? "Próximo par!" : a.lives <= 0 ? "💔 Sem vidas!" : "Menos uma vida 💔"}`}
          en={a.lastMatch ? "In sync!" : `${a.closeMiss ? "So close" : "Not quite"} — ${a.attempt < a.rules.tries ? "your two words become the next pair" : a.inPractice ? "next pair" : a.lives <= 0 ? "that was the last life" : "you lose a life"}`}
        />
      ) : (
        <DoNow tone="calm" pt="Fim do jogo!" en="Game over" />
      )}
      <div className="sync-stage">
        <div className="card sync-tv-word">
          {a.pair[0].pic && <Picture glyph={a.pair[0].pic} size="6em" />}
          <b className="display">{a.pair[0].pt}</b>
          {a.pair[0].en && <i>{a.pair[0].en}</i>}
        </div>
        <div className="sync-plus display">+</div>
        <div className="card sync-tv-word">
          {a.pair[1].pic && <Picture glyph={a.pair[1].pic} size="6em" />}
          <b className="display">{a.pair[1].pt}</b>
          {a.pair[1].en && <i>{a.pair[1].en}</i>}
        </div>
      </div>
      {a.chain.length > 0 && (a.phase === "write" || a.phase === "countdown") && (
        <div className="sync-chain">
          <span className="kicker">A corrente · The chain</span>
          {a.chain.map((c, i) => (
            <span key={i} className="chain-step">
              <i>
                {c.pair[0]} + {c.pair[1]}
              </i>{" "}
              → <b>{c.picks.map((w) => w || "—").join(" | ")}</b>
            </span>
          ))}
          <span className="chain-step now">
            → agora: <b>{a.pair[0].pt} + {a.pair[1].pt}</b>
          </span>
        </div>
      )}
      <div className="sync-answers">
        {a.players.map((p) => {
          const w = a.submittedBy(p);
          return (
            <div key={p.playerId} className={`card sync-answer ${a.phase === "reveal" ? (a.lastMatch ? "match" : "miss") : ""}`} data-color={p.color}>
              <Face avatar={p.avatar} color={p.color} size="2.6em" name={p.name} />
              <span className="display">{a.phase === "reveal" || a.phase === "sense" ? `“${w || "—"}”` : w ? "✓ Pronto" : "A pensar…"}</span>
            </div>
          );
        })}
      </div>
      {a.phase === "countdown" && (
        <div className="countdown display">
          <span key={secs}>{secs}</span>
        </div>
      )}
    </div>
  );
}
