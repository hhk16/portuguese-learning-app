/** Quem faz o quê? on the TV: both messages side by side — picking, writing, the written verbs, then the whole rows. */
import { useEffect, useState } from "react";
import { HEARTS, PERSON_LABEL, PERSONS, ROUNDS, VERB_PICS, type Msg, type QuemFazOQue } from "../../games/verbs/verbs.ts";
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

const CUES: Record<string, { pt: string; en: string }> = {
  pick: { pt: "Fácil ×1 ou arriscada ×2 🔥?", en: "Each picks a card: a regular verb, or an irregular one for double" },
  write: { pt: "Escrevam o verbo! Só o verbo.", en: "Write only the verb — the ending must tell your partner who" },
  read: { pt: "Troquem! Quem? O quê?", en: "Read your partner's verb: who does it, and what?" },
};

function Message({ a, m }: { a: QuemFazOQue; m: Msg }) {
  const writer = a.rt.players.get(m.writer);
  const reader = a.rt.players.get(m.reader);
  const c = m.card;
  const res = m.result;
  if ((a.phase === "reveal" || a.phase === "end") && c && res) {
    const ok = res.form && res.person && res.verb;
    return (
      <div className={`card verbs-card reveal ${ok ? "ok" : ""}`}>
        <span className="kicker">
          {writer && <PlayerChip p={writer} size="1.4em" />} → {reader?.name}
          {c.risky && <span className="verbs-risky">🔥 ×2</span>}
        </span>
        <div className="verbs-target">
          <Picture glyph={PERSON_LABEL[c.person].pic} size="2.2em" />
          <b className="display">{PERSON_LABEL[c.person].pt}</b>
          <span className="display">+</span>
          <Picture glyph={VERB_PICS[c.verb]!.pic} size="2.2em" />
          <b className="display">{c.verb}</b>
        </div>
        <div className="verbs-marks">
          <span className={res.form ? "ok" : "miss"}>
            {res.form ? "✓" : "✗"} “{m.written || "—"}”{!res.form && <b> → {c.item.form}</b>}
            {res.accent && <i> (acento!)</i>}
          </span>
          <span className={res.person ? "ok" : "miss"}>
            {res.person ? "✓" : "✗"} {m.pick?.person ? PERSON_LABEL[m.pick.person].pt : "—"}
          </span>
          <span className={res.verb ? "ok" : "miss"}>
            {res.verb ? "✓" : "✗"} {m.pick?.verb ? `${VERB_PICS[m.pick.verb]?.pic ?? ""} ${m.pick.verb}` : "—"}
          </span>
          <b className="verbs-points">+{res.points * (a.final ? 2 : 1)}</b>
        </div>
        {/* The whole present-tense row, the one that was asked lit up. */}
        <div className="verbs-row">
          {a.rowOf(c.verb).map((x) => (
            <span key={x.person} className={x.person === c.person ? "on" : ""}>
              <small>{PERSON_LABEL[x.person].pt.split(" / ")[0]}</small>
              <b>{x.form}</b>
            </span>
          ))}
        </div>
      </div>
    );
  }
  // Before the reveal the TV never shows the card itself: the reader must decode it from the word.
  const status =
    a.phase === "pick"
      ? c
        ? { big: c.risky ? "🔥" : "🃏", line: c.risky ? "arriscada! ×2" : "fácil ×1" }
        : { big: "🤔", line: "escolhe a carta… · picking" }
      : a.phase === "write"
        ? m.written !== undefined
          ? { big: "✉️", line: "escrito! · written" }
          : { big: "✍️", line: "a escrever… · writing" }
        : null;
  return (
    <div className={`card verbs-card ${c?.risky ? "risky" : ""}`}>
      <span className="kicker">
        {writer && <PlayerChip p={writer} size="1.4em" />} {status ? "" : `→ ${reader?.name} lê · reads`}
        {c?.risky && a.phase !== "pick" && <span className="verbs-risky">🔥 ×2</span>}
      </span>
      {status ? (
        <>
          <b className={`display verbs-written ${m.card && a.phase === "pick" ? "" : "pending"}`}>{status.big}</b>
          <i>{status.line}</i>
        </>
      ) : (
        <>
          <b className="display verbs-written">“{m.written || "—"}”</b>
          <i>{m.pick ? "✓ lido! · read" : "Quem? O quê? · who, doing what?"}</i>
        </>
      )}
    </div>
  );
}

export function VerbsScreen({ a }: { a: QuemFazOQue }) {
  const [, force] = useState(0);
  const timed = a.phase === "pick" || a.phase === "write" || a.phase === "read";
  useEffect(() => {
    if (!timed) return;
    const id = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [timed]);
  if (!a.msgs.length) return null;
  const cue = CUES[a.phase];
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
        {timed && !a.inPractice && <span className={`pill clock ${a.msLeft < 8000 ? "low" : ""}`}>⏱ {Math.ceil(a.msLeft / 1000)}</span>}
        <span className="pill star-pill">{a.score} pontos</span>
        {!a.inPractice && <MetaBar score={a.score} max={a.maxScore} />}
      </GameTop>
      <div className="goal-line">
        🎯 <b>{cue?.pt ?? "Escrever o verbo certo · ler quem o faz"}</b> <i>{cue?.en ?? "Write the right verb form — read who's doing it from the ending"}</i>
      </div>
      <div className="verbs-stage">
        <div className="verbs-duo">
          {a.msgs.map((m) => (
            <Message key={m.writer} a={a} m={m} />
          ))}
        </div>
        {a.rules.endings && (a.phase === "write" || a.phase === "read") && (
          <div className="card verbs-endings">
            <span className="kicker">Terminações · endings (falar · comer)</span>
            {ENDINGS.map((e) => (
              <span key={e.person}>
                <small>{e.person}</small> <b>{e.ar}</b> · <b>{e.er}</b>
              </span>
            ))}
          </div>
        )}
        {a.phase === "read" && (
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
