/** Title menu, lobby, results and pause — calm white cards on the toy-world stage. */
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { publicBaseUrl } from "../../net/socket.ts";
import { Picture } from "../../ui/Picture.tsx";
import { PlayerChip } from "../../ui/Face.tsx";
import { GAMES, HOW_TO, specPic, type LobbyActivity, type ResultsActivity, type TitleActivity } from "../activities.ts";
import { gameNow } from "../clock.ts";
import { useRuntime } from "../runtime.ts";

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
            <span className="hint">← Voltar</span>
          </div>
        )}
        <div className={`menu grid-${grid}`}>
          {shown.map(({ it, i }) => (
            <div key={it.id} className={`menu-card card ${i === a.focus ? "focus" : ""} ${it.disabled ? "disabled" : ""}`}>
              {it.pic && <Picture glyph={it.pic} size={grid === 1 ? "3.4em" : "2.8em"} />}
              <div className="mc-text">
                <div className="mc-label display">{it.label}</div>
                {it.sub && <div className="mc-sub">{it.sub}</div>}
              </div>
              {it.badge && <span className="badge">{it.badge}</span>}
              {it.stars !== undefined && it.stars > 0 && <Stars n={it.stars} />}
            </div>
          ))}
        </div>
        {a.menu === "learn" && <div className="menu-foot">Aprendam uma lição e depois joguem com as palavras novas.</div>}
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
          {HOW_TO[a.spec.mode].map((s, i) => (
            <li key={i}>
              <span className="n display">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="ready-row">
          {players.map((p) => (
            <PlayerChip key={p.playerId} p={p} size="2.4em" extra={<span className={`ready-tag ${p.ready ? "on" : ""}`}>{p.ready ? "Pronto!" : "…"}</span>} />
          ))}
          {players.length === 0 && <span className="muted">Entrem com o telemóvel →</span>}
        </div>
        <div className="lobby-foot">{need ? "Este jogo precisa de duas pessoas." : "Carreguem em “Estou pronto” no telemóvel."}</div>
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
        <h1 className="display">{info.headline}</h1>
        {info.sub && <p className="muted">{info.sub}</p>}
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
            <div className="kicker">Palavras novas</div>
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
            <div className="kicker">Para rever</div>
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
        <div className="muted">Também podes usar o telemóvel</div>
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
