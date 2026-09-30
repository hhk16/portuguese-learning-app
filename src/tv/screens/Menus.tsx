/** Title menu, lobby, results and pause — calm white cards on the toy-world stage. */
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { publicBaseUrl } from "../../net/socket.ts";
import { Picture } from "../../ui/Picture.tsx";
import { PlayerChip } from "../../ui/Face.tsx";
import { GAMES, HOW_TO, specPic, toNextStar, type LobbyActivity, type ResultsActivity, type TitleActivity } from "../activities.ts";
import { gameNow } from "../clock.ts";
import { useRuntime } from "../runtime.ts";
import { LEVELS } from "../progress.ts";

export function joinUrl(code: string) {
  return `${publicBaseUrl()}/play?room=${code}`;
}

export function JoinCard({ big = false }: { big?: boolean }) {
  const rt = useRuntime();
  return (
    <div className={`card join-card ${big ? "big" : ""}`}>
      <div className="kicker">Entra com o telemóvel</div>
      {rt.code ? (
        <>
          <div className="qr">
            <QRCodeSVG value={joinUrl(rt.code)} size={512} level="M" bgColor="#ffffff" fgColor="#1f2a44" style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="room-code display">{rt.code}</div>
          <div className="join-url">{publicBaseUrl().replace(/^https?:\/\//, "")}/play</div>
        </>
      ) : (
        <div className="join-url">A preparar a sala…</div>
      )}
    </div>
  );
}

/** Small join reminder in the corner during games. */
export function JoinBadge() {
  const rt = useRuntime();
  if (!rt.code) return null;
  return (
    <div className="join-badge card">
      <QRCodeSVG value={joinUrl(rt.code)} size={128} fgColor="#1f2a44" style={{ width: "3.2em", height: "3.2em" }} />
      <span className="display">{rt.code}</span>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} estrelas`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? "on" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

/** A scrolling window of at most `n` items around the focused one, whole rows at a time. */
function windowed<T>(items: T[], focus: number, rows: number, cols: number): { it: T; i: number }[] {
  const n = rows * cols;
  const row = Math.floor(focus / cols);
  const startRow = Math.max(0, Math.min(Math.ceil(items.length / cols) - rows, row - Math.floor(rows / 2)));
  const start = startRow * cols;
  return items.slice(start, start + n).map((it, k) => ({ it, i: start + k }));
}

export function TitleScreen({ a }: { a: TitleActivity }) {
  const items = a.items;
  const grid = a.menu === "learn" ? 4 : a.menu === "play" ? 3 : 1;
  const shown = a.menu === "learn" ? windowed(items, a.focus, 2, 4) : items.map((it, i) => ({ it, i }));
  return (
    <div className="tv-overlay title-screen">
      <div className="title-left">
        <div className="logo display">
          Party <span>Português</span>
        </div>
        {a.menu !== "main" && (
          <div className="crumb">
            <span className="kicker">{{ learn: "Aprender juntos", play: "Jogar", settings: "Definições", main: "" }[a.menu]}</span>
            <span className="hint">← Voltar · Back</span>
          </div>
        )}
        <div className={`menu grid-${grid}`}>
          {shown.map(({ it, i }) => (
            <div key={it.id} className={`menu-card card ${i === a.focus ? "focus" : ""} ${it.disabled ? "disabled" : ""}`}>
              {it.pic && <Picture glyph={it.pic} size={grid === 1 ? "3.4em" : "2.8em"} />}
              <div className="mc-text">
                <div className="mc-label display">{it.label}</div>
                {it.sub && <div className="mc-sub">{it.sub}</div>}
                {it.subEn && <div className="mc-en">{it.subEn}</div>}
              </div>
              {it.badge && <span className="badge">{it.badge}</span>}
              {it.stars !== undefined && it.stars > 0 && <Stars n={it.stars} />}
            </div>
          ))}
        </div>
        {a.menu === "learn" && <div className="menu-foot">
            Aprendam uma lição e depois joguem com as palavras novas.
            <i> · Learn a lesson, then play with the new words.</i>
          </div>}
      </div>
      <div className="title-right">
        <JoinCard />
      </div>
    </div>
  );
}

export function LobbyScreen({ a }: { a: LobbyActivity }) {
  const rt = useRuntime();
  const [, force] = useState(0);
  useEffect(() => {
    if (a.countdownAt === null) return;
    const id = setInterval(() => force((x) => x + 1), 100);
    return () => clearInterval(id);
  }, [a.countdownAt]);
  const secs = a.countdownAt !== null ? Math.max(1, Math.ceil((a.countdownAt - gameNow()) / 1000)) : null;
  const players = rt.activePlayers;
  const need = a.needsTwo && players.length < 2;
  return (
    <div className="tv-overlay lobby-screen">
      <div className="card lobby-card">
        <div className="lobby-title">
          <Picture glyph={specPic(a.spec)} size="3.6em" />
          <div>
            <div className="kicker">{a.spec.mode === "lesson" ? "Aprender juntos" : "Jogo a dois"}</div>
            <h1 className="display">{a.title}</h1>
          </div>
        </div>
        <ol className="how">
          {HOW_TO[a.spec.mode].map((l, i) => (
            <li key={i} className={rt.hostLine?.pt === l.pt ? "speaking" : ""}>
              <span className="n display">{i + 1}</span>
              <span className="rule">
                <b>{l.pt}</b>
                <i>{l.en}</i>
              </span>
            </li>
          ))}
        </ol>
        {a.spec.mode !== "lesson" && (
          <div className="level-row">
            <span className="kicker">Dificuldade · Difficulty</span>
            <div className="level-pills">
              {([1, 2, 3] as const).map((l) => (
                <span key={l} className={`level-pill ${a.level === l ? "on" : ""}`}>
                  <b>{LEVELS[l - 1]!.pt}</b>
                  <i>
                    {LEVELS[l - 1]!.en} {LEVELS[l - 1]!.stars}
                  </i>
                </span>
              ))}
            </div>
            <span className="muted">{a.best !== null ? `Recorde · Best: ${a.best}` : "◀ ▶ no telemóvel · on your phone"}</span>
          </div>
        )}
        <div className="ready-row">
          {players.map((p) => (
            <PlayerChip key={p.playerId} p={p} size="2.4em" extra={<span className={`ready-tag ${p.ready ? "on" : ""}`}>{p.ready ? "Pronto!" : "…"}</span>} />
          ))}
          {players.length === 0 && <span className="muted">Entrem com o telemóvel →</span>}
        </div>
        <div className="lobby-foot">
          {need ? "Este jogo precisa de duas pessoas." : "Carreguem em “Estou pronto” no telemóvel."}
          <i>{need ? "This game needs two players." : "Press “Estou pronto” (I'm ready) on your phone."}</i>
        </div>
      </div>
      <div className="lobby-side">
        <JoinCard />
      </div>
      {secs !== null && (
        <div className="countdown display">
          <span key={secs}>{secs}</span>
        </div>
      )}
    </div>
  );
}

export function ResultsScreen({ a }: { a: ResultsActivity }) {
  const rt = useRuntime();
  const info = a.info;
  const per = info.lesson?.perPlayer;
  return (
    <div className="tv-overlay results-screen">
      <div className="card results-card">
        <div className="kicker">{info.title}</div>
        {info.stars !== undefined && (
          <div className="result-stars">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`rstar ${i < info.stars! ? "on" : ""}`} style={{ animationDelay: `${0.9 + i * 0.45}s` }}>
                ★
              </span>
            ))}
          </div>
        )}
        {a.record?.isNew && a.record.previous !== null && (
          <div className="record-banner display">
            Novo recorde! <i>New record! (antes · before: {a.record.previous})</i>
          </div>
        )}
        <h1 className="display">{info.headline}</h1>
        {info.headlineEn && <p className="en-line">{info.headlineEn}</p>}
        {info.sub && (
          <p className="muted">
            {info.sub}
            {info.subEn && <i> · {info.subEn}</i>}
          </p>
        )}
        {info.score !== undefined && info.max !== undefined && info.stars !== undefined && info.stars < 3 && (
          <p className="muted next-star">
            Faltam {toNextStar(info.score, info.max)} pontos para a próxima estrela · {toNextStar(info.score, info.max)} points to the next star
          </p>
        )}
        {info.practiced && info.practiced.length > 0 && (
          <div className="words">
            <div className="kicker">Palavras do jogo · Words you used</div>
            <div className="word-chips">
              {info.practiced.slice(0, 8).map((w, i) => (
                <span key={`${w.pt}-${i}`} className="word-chip">
                  {w.pic && <Picture glyph={w.pic} size="1.6em" />}
                  <b>{w.pt}</b>
                  {w.en && <i>{w.en}</i>}
                </span>
              ))}
            </div>
          </div>
        )}
        {per && per.length > 0 && (
          <div className="per-player">
            {per.map((pp) => {
              const p = rt.players.get(pp.playerId);
              return p ? <PlayerChip key={pp.playerId} p={p} size="2.2em" extra={<b className="pp-score">{pp.correct}/{pp.graded}</b>} /> : null;
            })}
          </div>
        )}
        {info.words && info.words.length > 0 && (
          <div className="words">
            <div className="kicker">Palavras novas · New words</div>
            <div className="word-chips">
              {info.words.slice(0, 8).map((w) => (
                <span key={w.itemId} className="word-chip">
                  <Picture glyph={w.emoji} size="1.6em" />
                  <b>{w.pt}</b>
                  <i>{w.en}</i>
                </span>
              ))}
            </div>
          </div>
        )}
        {!info.lesson && rt.activePlayers.some((p) => p.missed.length) && (
          <div className="words">
            <div className="kicker">Para rever · To review</div>
            <div className="word-chips">
              {[...new Map(rt.activePlayers.flatMap((p) => p.missed).map((m) => [m.itemId, m])).values()].slice(0, 6).map((m) => (
                <span key={m.itemId} className="word-chip">
                  <b>{m.pt}</b>
                  {m.en && <i>{m.en}</i>}
                </span>
              ))}
            </div>
          </div>
        )}
        {rt.activePlayers.length >= 2 && (
          <div className="tonight">
            <span className="kicker">Quem manda hoje? · Tonight's points</span>
            <div className="tonight-row">
              {[...rt.activePlayers]
                .sort((x, y) => y.score - x.score)
                .map((p, i, all) => (
                  <PlayerChip key={p.playerId} p={p} size="2em" extra={<b className="pp-score">{i === 0 && p.score > (all[1]?.score ?? 0) ? "👑 " : ""}{p.score}</b>} />
                ))}
            </div>
          </div>
        )}
        <div className="next-list">
          {info.options.map((o, i) => (
            <div key={o.id} className={`next-item ${i === a.focus ? "focus" : ""}`}>
              {o.pic && <Picture glyph={o.pic} size="2em" />}
              <span>
                <b>{o.label}</b>
                {o.sub && <small>{o.sub}</small>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PauseScreen() {
  const rt = useRuntime();
  return (
    <div className="tv-overlay pause-screen">
      <div className="card pause-card">
        <h1 className="display">Pausa</h1>
        <div className="pause-menu">
          {rt.pauseItems.map((it, i) => (
            <div key={it.id} className={`next-item ${i === rt.pauseFocus ? "focus" : ""}`}>
              <b>{it.label}</b>
            </div>
          ))}
        </div>
        <div className="muted">Também podes usar o telemóvel · You can use your phone too</div>
      </div>
    </div>
  );
}

/** Game header: title pill on the left, a status slot in the middle, the join badge on the right. */
export function GameTop({ title, pic, children }: { title: string; pic?: string; children?: React.ReactNode }) {
  return (
    <div className="game-top">
      <span className="title-pill card">
        {pic && <Picture glyph={pic} size="1.8em" />}
        <b className="display">{title}</b>
      </span>
      <div className="game-status">{children}</div>
      <JoinBadge />
    </div>
  );
}

export { GAMES };

/** The host's subtitle bubble: what the TV is saying, in Portuguese with English underneath. */
export function HostBubble() {
  const rt = useRuntime();
  const l = rt.hostLine;
  if (!l || rt.activity?.id === "lobby") return null;
  return (
    <div className="host-bubble card" key={l.seq}>
      <span className="host-mic">🎙️</span>
      <span>
        <b className="display">{l.pt}</b>
        <i>{l.en}</i>
      </span>
    </div>
  );
}

/** Emoji reactions from the phones, floating up the TV in the sender's colour. */
export function Reactions() {
  const rt = useRuntime();
  const now = performance.now();
  return (
    <div className="reactions" aria-hidden>
      {rt.reactions
        .filter((r) => now - r.at < 3000)
        .map((r) => {
          const p = rt.players.get(r.playerId);
          return (
            <span key={r.id} className="reaction" data-color={p?.color} style={{ left: `${r.x}%` }}>
              {r.emoji}
              {p && <small>{p.name}</small>}
            </span>
          );
        })}
    </div>
  );
}
