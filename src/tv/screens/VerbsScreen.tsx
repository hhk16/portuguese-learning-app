/** Quem faz o quê? on the TV: who's writing, then the written verb, then the whole present-tense row. */
import { useEffect, useState } from "react";
import { HEARTS, PERSON_LABEL, PERSONS, ROUNDS, VERB_PICS, type QuemFazOQue } from "../../games/verbs/verbs.ts";
import { PlayerChip } from "../../ui/Face.tsx";
import { Picture } from "../../ui/Picture.tsx";
import { GameTop, MetaBar } from "./Menus.tsx";

/** The endings that say who (regular verbs): the key to reading the word. */
export const ENDINGS: { person: string; ar: string; er: string }[] = [
  { person: "eu", ar: "-o", er: "-o" },
  { person: "tu", ar: "-as", er: "-es" },
  { person: "ele / ela", ar: "-a", er: "-e" },
  { person: "nós", ar: "-amos", er: "-emos / -imos" },
  { person: "eles / elas", ar: "-am", er: "-em" },
];

export function VerbsScreen({ a }: { a: QuemFazOQue }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (a.phase !== "write" && a.phase !== "guess") return;
    const id = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [a.phase]);
  const r = a.r;
  if (!r) return null;
  const writer = a.rt.players.get(r.writer);
  const reader = a.rt.players.get(r.reader);
  const res = r.result;
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title="Quem faz o quê?" pic="🧩">
        {!a.inPractice && (
          <span className="pill">
            Ronda {Math.min(a.round + 1, ROUNDS)}/{ROUNDS}
          </span>
        )}
        {a.final && <span className="pill double-pill">×2</span>}
        {!a.inPractice && (
          <span className="pill lives-pill">
            {"❤️".repeat(Math.max(0, a.hearts))}
            {"🖤".repeat(Math.max(0, HEARTS - a.hearts))}
          </span>
        )}
        {(a.phase === "write" || a.phase === "guess") && !a.inPractice && <span className={`pill clock ${a.msLeft < 8000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
        <span className="pill star-pill">{a.score} pontos</span>
        {!a.inPractice && <MetaBar score={a.score} max={a.maxScore} />}
      </GameTop>
      <div className="goal-line">
        🎯 <b>Escrever o verbo certo · ler quem o faz</b> <i>Write the right verb form — read who's doing it from the ending</i>
      </div>
      <div className="verbs-stage">
        {a.phase === "write" && (
          <div className="card verbs-card">
            <span className="kicker">{writer && <PlayerChip p={writer} size="1.6em" />} escreve o verbo… · writes the verb</span>
            <b className="display verbs-written pending">✍️ …</b>
            <i>{reader?.name}: prepara-te para ler a terminação! · get ready to read the ending</i>
          </div>
        )}
        {a.phase === "guess" && (
          <div className="card verbs-card">
            <span className="kicker">{writer?.name} escreveu · wrote</span>
            <b className="display verbs-written">“{r.written || "—"}”</b>
            <span className="kicker">{reader && <PlayerChip p={reader} size="1.6em" />} Quem? O quê? · Who? Doing what?</span>
          </div>
        )}
        {(a.phase === "reveal" || a.phase === "end") && res && (
          <div className={`card verbs-card reveal ${res.form && res.person && res.verb ? "ok" : ""}`}>
            <div className="verbs-target">
              <Picture glyph={PERSON_LABEL[r.person].pic} size="3em" />
              <b className="display">{PERSON_LABEL[r.person].pt}</b>
              <span className="display">+</span>
              <Picture glyph={VERB_PICS[r.verb]!.pic} size="3em" />
              <b className="display">{r.verb}</b>
              <i>{VERB_PICS[r.verb]!.en}</i>
            </div>
            <div className="verbs-marks">
              <span className={res.form ? "ok" : "miss"}>
                {res.form ? "✓" : "✗"} {writer?.name}: “{r.written || "—"}”{!res.form && <b> → {r.item.form}</b>}
                {res.accent && <i> (atenção ao acento!)</i>}
              </span>
              <span className={res.person ? "ok" : "miss"}>
                {res.person ? "✓" : "✗"} {reader?.name}: {r.pick?.person ? PERSON_LABEL[r.pick.person].pt : "—"}
              </span>
              <span className={res.verb ? "ok" : "miss"}>
                {res.verb ? "✓" : "✗"} {r.pick?.verb ? `${VERB_PICS[r.pick.verb]?.pic ?? ""} ${r.pick.verb}` : "—"}
              </span>
              <b className="verbs-points">+{res.points * (a.final ? 2 : 1)}</b>
            </div>
            {/* The whole present-tense row, the one that was asked lit up. */}
            <div className="verbs-row">
              {a.row.map((x) => (
                <span key={x.person} className={x.person === r.person ? "on" : ""}>
                  <small>{PERSON_LABEL[x.person].pt}</small>
                  <b>{x.form}</b>
                </span>
              ))}
            </div>
          </div>
        )}
        {a.rules.endings && (a.phase === "write" || a.phase === "guess") && (
          <div className="card verbs-endings">
            <span className="kicker">Terminações · endings (falar · comer)</span>
            {ENDINGS.map((e) => (
              <span key={e.person}>
                <small>{e.person}</small> <b>{e.ar}</b> · <b>{e.er}</b>
              </span>
            ))}
          </div>
        )}
        {a.phase === "guess" && (
          <div className="verbs-persons">
            {PERSONS.map((p) => (
              <span key={p} className="verbs-person">
                <Picture glyph={PERSON_LABEL[p].pic} size="1.8em" />
                {PERSON_LABEL[p].pt}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
