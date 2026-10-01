/** Title menu, lobby, results and pause — calm white cards on the toy-world stage. */
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { paintStrokes } from "../../ui/Sketch.tsx";
import { publicBaseUrl } from "../../net/socket.ts";
import { Picture } from "../../ui/Picture.tsx";
import { PlayerChip } from "../../ui/Face.tsx";
import { GAMES, HOW_TO, specPic, toNextStar, type ChampionActivity, type GalleryItem, type LobbyActivity, type ResultsActivity, type TitleActivity } from "../activities.ts";
import { gameNow } from "../clock.ts";
import { useRuntime } from "../runtime.ts";
import { LEVELS } from "../progress.ts";
import { BADGES, dayKey, levelOf, levelProgress, levelTitle, statsOf, streakOf, wordsKnown, xpForLevel } from "../stats.ts";
import { unitOf, UNITS } from "../../curriculum/units.ts";
import { LESSONS } from "../../curriculum/lessons.ts";
import { lessonsDone } from "../progress.ts";
import { useTick } from "./useTick.ts";

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
  const grid = a.menu === "unit" ? 4 : a.menu === "learn" || a.menu === "play" ? 3 : 1;
  const shown = a.menu === "unit" ? windowed(items, a.focus, 2, 4) : a.menu === "learn" ? windowed(items, a.focus, 3, 3) : items.map((it, i) => ({ it, i }));
  return (
    <div className="tv-overlay title-screen">
      <div className="title-left">
        <div className="logo display">
          Party <span>Português</span>
        </div>
        {a.menu !== "main" && (
          <div className="crumb">
            <span className="kicker">{{ learn: "Aprender juntos · Unidades", unit: `Aprender juntos · ${unitOf(a.unitId)?.short ?? ""}`, play: "Jogar", settings: "Definições", progress: "Progresso", main: "" }[a.menu]}</span>
            <span className="hint">← Voltar · Back</span>
          </div>
        )}
        {a.menu === "progress" && <ProgressPanel />}
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

/** Levels, streaks, words and badges for each player, and the book's units done. */
function ProgressPanel() {
  const rt = useRuntime();
  const people = rt.activePlayers.length ? rt.activePlayers.map((p) => ({ id: p.profile.profileId, name: p.name, profile: p.profile, p })) : Object.values(rt.learner.profiles).map((pr) => ({ id: pr.profileId, name: pr.name, profile: pr, p: undefined }));
  const done = lessonsDone();
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return dayKey(d);
  });
  return (
    <div className="progress-panel">
      <div className="progress-people">
        {people.slice(0, 4).map((x) => {
          const st = statsOf(x.id);
          const lvl = levelOf(st.xp);
          const t = levelTitle(lvl);
          const streak = streakOf(st);
          return (
            <div key={x.id} className="card progress-card">
              <div className="pc-head">
                {x.p ? <PlayerChip p={x.p} size="2.4em" /> : <b className="display">{x.name}</b>}
                <span className="pc-level display">
                  Nível {lvl} <i>{t.pt}</i>
                </span>
              </div>
              <div className="xp-bar big">
                <span style={{ width: `${Math.round(levelProgress(st.xp) * 100)}%` }} />
              </div>
              <small className="muted">
                {st.xp} XP · faltam {xpForLevel(lvl + 1) - st.xp} para o nível {lvl + 1} <i>· {t.en}</i>
              </small>
              <div className="pc-stats">
                <span>🔥 <b>{streak}</b> {streak === 1 ? "dia" : "dias"} seguidos</span>
                <span>🧠 <b>{wordsKnown(x.profile)}</b> palavras</span>
                <span>📖 <b>{st.lessons}</b> lições</span>
                <span>🎲 <b>{st.games}</b> jogos</span>
                <span>👑 <b>{st.crowns}</b></span>
              </div>
              <div className="pc-days" title="Últimos 14 dias">
                {last14.map((d) => (
                  <span key={d} className={st.days.includes(d) ? "on" : ""} />
                ))}
              </div>
              <div className="pc-badges">
                {BADGES.map((b) => (
                  <span key={b.id} className={`badge-dot ${st.badges.includes(b.id) ? "on" : ""}`} title={`${b.pt} · ${b.en}`}>
                    {b.pic}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {people.length === 0 && <p className="muted">Entrem com o telemóvel para ver o vosso progresso. · Join with your phones to see your progress.</p>}
      </div>
      <div className="card progress-units">
        <span className="kicker">O livro · The book</span>
        {UNITS.filter((u) => LESSONS.some((l) => unitOf(l.unit)?.id === u.id)).map((u) => {
          const ls = LESSONS.filter((l) => unitOf(l.unit)?.id === u.id);
          const n = ls.filter((l) => done.has(l.id)).length;
          return (
            <div key={u.id} className="pu-row">
              <span>
                {u.pic} {u.short}
              </span>
              <span className="xp-bar">
                <span style={{ width: `${Math.round((n / ls.length) * 100)}%` }} />
              </span>
              <small>
                {n}/{ls.length}
              </small>
            </div>
          );
        })}
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
            <div className="kicker">
              {rt.night
                ? `Noite de jogos · ${rt.night.index < rt.night.games.length ? `${rt.night.index + 1}/${rt.night.games.length}` : "Grande Final"} · Game night`
                : a.spec.mode === "lesson"
                  ? "Aprender juntos"
                  : "Jogo a dois"}
            </div>
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
        {a.picksLevel && (
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
        {a.picksTopic && (
          <div className="level-row topic-row">
            <span className="kicker">Palavras · Words</span>
            <span className="level-pill on">
              <b>{a.topic.pt}</b>
              <i>{a.topic.en}</i>
            </span>
            <span className="muted">▲ ▼ no telemóvel · choose a unit on your phone</span>
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
  useTick(500, !!info.autoGo);
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
            {toNextStar(info.score, info.max) === 1
              ? "Falta 1 ponto para a próxima estrela · 1 point to the next star"
              : `Faltam ${toNextStar(info.score, info.max)} pontos para a próxima estrela · ${toNextStar(info.score, info.max)} points to the next star`}
          </p>
        )}
        {a.awards.size > 0 && (
          <div className="xp-row">
            {rt.activePlayers.map((p) => {
              const aw = a.awards.get(p.playerId);
              if (!aw) return null;
              const lvl = levelOf(aw.after);
              const t = levelTitle(lvl);
              return (
                <div key={p.playerId} className={`xp-card ${aw.levelUp ? "up" : ""}`}>
                  <PlayerChip p={p} size="1.8em" />
                  <span className="xp-gain display">+{aw.gain} XP</span>
                  <span className="xp-level">
                    <b>Nível {lvl}</b> <i>{t.pt}</i>
                    <span className="xp-bar">
                      <span style={{ width: `${Math.round(levelProgress(aw.after) * 100)}%` }} />
                    </span>
                  </span>
                  {aw.streak >= 1 && <span className="xp-streak">🔥 {aw.streak}</span>}
                  {aw.newBadges.slice(0, 2).map((b) => (
                    <span key={b.pt} className="xp-badge" title={b.en}>
                      {b.pic} {b.pt}
                    </span>
                  ))}
                  {aw.levelUp && <span className="xp-up display">Subiu de nível! 🎉</span>}
                </div>
              );
            })}
          </div>
        )}
        {info.gallery && info.gallery.length > 0 && (
          <div className="words">
            <div className="kicker">Galeria · Your drawings</div>
            <div className="gallery">
              {info.gallery.map((g, i) => (
                <GalleryThumb key={i} g={g} delay={i * 600} />
              ))}
            </div>
          </div>
        )}
        {!info.gallery?.length && info.practiced && info.practiced.length > 0 && (
          <div className="words">
            <div className="kicker">Palavras do jogo · Words you used</div>
            <div className="word-chips">
              {[...new Map(info.practiced.map((w) => [w.pt, w])).values()].slice(0, 8).map((w, i) => (
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
        {info.nightTotals && rt.activePlayers.length >= 2 && (
          <div className={`tonight ${info.champion ? "champion" : ""}`}>
            <span className="kicker">{info.champion ? "Estrela da noite · Tonight's star" : "Pontos da noite · Tonight's points"}</span>
            <div className="tonight-row">
              {[...rt.activePlayers]
                .sort((x, y) => (info.nightTotals![y.playerId] ?? 0) - (info.nightTotals![x.playerId] ?? 0))
                .map((p, i, all) => {
                  const total = info.nightTotals![p.playerId] ?? 0;
                  const lead = i === 0 && total > (info.nightTotals![all[1]?.playerId ?? ""] ?? -1);
                  const gain = info.nightGain?.[p.playerId];
                  return <PlayerChip key={p.playerId} p={p} size="2em" extra={<b className="pp-score">{lead ? "👑 " : ""}{total}{gain !== undefined && <small className="gain"> +{gain}</small>}</b>} />;
                })}
            </div>
          </div>
        )}
        <div className={`next-list ${info.options.length <= 4 ? "few" : ""}`}>
          {info.options.map((o, i) => (
            <div key={o.id} className={`next-item ${i === a.focus ? "focus" : ""}`}>
              {o.pic && <Picture glyph={o.pic} size="2em" />}
              <span>
                <b>{o.label}</b>
                {o.sub && <small>{o.sub}</small>}
              </span>
              {i === 0 && info.autoGo && <span className="auto-go">{Math.max(0, Math.ceil((info.autoGo - (gameNow() - a.startAt)) / 1000))}s</span>}
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

/**
 * The co-op target: a bar filling towards the three stars (35 / 60 / 85% of the game's maximum),
 * so the goal is on screen the whole game — "get to ⭐⭐⭐".
 */
export function MetaBar({ score, max }: { score: number; max: number }) {
  const f = Math.max(0, Math.min(1, score / Math.max(1, max)));
  const stars = [0.35, 0.6, 0.85];
  return (
    <span className="meta-bar pill" title="Meta · Target">
      <span className="meta-label">Meta</span>
      <span className="meta-track">
        <span className="meta-fill" style={{ width: `${f * 100}%` }} />
        {stars.map((s, i) => (
          <span key={i} className={`meta-star ${f >= s ? "on" : ""}`} style={{ left: `${s * 100}%` }}>
            ★
          </span>
        ))}
      </span>
    </span>
  );
}

/** Game header: title pill on the left, a status slot in the middle, the join badge on the right. */
export function GameTop({ title, pic, children }: { title: string; pic?: string; children?: React.ReactNode }) {
  const rt = useRuntime();
  const practicing = !!(rt.activity as { inPractice?: boolean } | null)?.inPractice;
  return (
    <div className="game-top">
      <span className="title-pill card">
        {pic && <Picture glyph={pic} size="1.8em" />}
        <b className="display">{title}</b>
      </span>
      <div className="game-status">
        {practicing && (
          <span className="pill practice-pill">
            🎓 Ensaio <i>Practice — doesn't count</i>
          </span>
        )}
        {children}
      </div>
      <JoinBadge />
    </div>
  );
}

export { GAMES };

/** The host's subtitle bubble: what the TV is saying, in Portuguese with English underneath. */
export function HostBubble() {
  const rt = useRuntime();
  const l = rt.hostLine;
  const speaking = !!l;
  // Beak flaps while Pipo talks.
  const [flap, setFlap] = useState(false);
  useEffect(() => {
    if (!speaking) return;
    const id = setInterval(() => setFlap((f) => !f), 170);
    return () => clearInterval(id);
  }, [speaking]);
  if (rt.activity?.id === "title") return null;
  const mood = l?.mood ?? "idle";
  const pose = mood === "cheer" ? "cheer" : mood === "oops" ? "oops" : speaking && flap ? "talk" : "idle";
  return (
    <>
      <img className={`pipo pose-${pose} at-${rt.activity?.id ?? "none"} ${speaking ? "speaking" : ""} ${l?.spotlight ? "spotlight" : ""}`} src={`/art/host/pipo-${pose}.webp`} alt="Pipo" />
      {l && rt.activity?.id !== "lobby" && (
        <div className={`host-bubble card ${l.spotlight ? "spotlight" : ""}`} key={l.seq}>
          <span>
            <b className="display">{l.pt}</b>
            <i>{l.en}</i>
          </span>
        </div>
      )}
    </>
  );
}

/** The big one-verb command ("Ana: Roda o mostrador! · Turn the dial!"), with a phone pointer. */
export function Command() {
  const rt = useRuntime();
  const c = rt.command;
  const [, force] = useState(0);
  useEffect(() => {
    if (!c) return;
    const id = setTimeout(() => force((x) => x + 1), 3000);
    return () => clearTimeout(id);
  }, [c]);
  if (!c || performance.now() - c.at > 2900) return null;
  const p = c.playerId ? rt.players.get(c.playerId) : undefined;
  return (
    <div className={`command at-${rt.activity?.id ?? "none"}`} key={c.seq}>
      {p && <PlayerChip p={p} size="2.2em" />}
      <span className="bi-line">
        <b className="display">{c.pt}</b>
        <i>{c.en}</i>
      </span>
      <span className="command-phone">📱</span>
    </div>
  );
}

/** A side bet / prediction flipping over on the TV after the reveal ("Ana apostou: Longe… ✗"). */
export function BetCard() {
  const rt = useRuntime();
  const b = rt.betCard;
  if (!b) return null;
  const won = b.rows.some((r) => r.won);
  return (
    <div className={`bet-card card ${won ? "won" : "lost"}`} key={b.seq}>
      <span className="kicker">🎲 Aposta · Side bet</span>
      <b className="display bet-title">{b.title.pt}</b>
      <i className="bet-en">{b.title.en}</i>
      <div className="bet-rows">
        {b.rows.map((r) => {
          const p = rt.players.get(r.playerId);
          return (
            <span key={r.playerId + r.pt} className={`bet-row ${r.won ? "ok" : "bad"}`}>
              {p && <PlayerChip p={p} size="1.6em" />}
              <b className="display">{r.won ? "✓" : "✗"} {r.pt}</b>
            </span>
          );
        })}
      </div>
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

/** One drawing, replayed stroke by stroke (Telestrations-style gallery). */
export function GalleryThumb({ g, delay }: { g: GalleryItem; delay: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let n = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      id = setInterval(() => {
        n++;
        const c = ref.current?.getContext("2d");
        if (c) paintStrokes(c, 240, g.strokes.slice(0, n));
        if (n >= g.strokes.length && id) clearInterval(id);
      }, 180);
    }, 1500 + delay);
    const c = ref.current?.getContext("2d");
    if (c) paintStrokes(c, 240, []);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [g, delay]);
  return (
    <figure className={`gallery-item ${g.guessed ? "ok" : ""}`}>
      <canvas ref={ref} width={240} height={240} />
      <figcaption>
        <b>{g.pt}</b> {g.guessed ? "✓" : "✗"}
      </figcaption>
    </figure>
  );
}

/** The end of a game night: tonight in numbers, drumroll, the star crowned on stage, then the best moments. */
export function ChampionScreen({ a }: { a: ChampionActivity }) {
  useTick(200, a.stage === -1);
  const rt = useRuntime();
  const [top, second] = a.standings;
  const word = a.wordOfNight;
  const drawing = a.drawing;
  const players = rt.activePlayers;
  if (a.stage === -1) {
    const shown = a.night.log.slice(0, a.rows);
    const sum = (id: string) => shown.reduce((s, r) => s + (r.gains[id] ?? 0), 0);
    return (
      <div className="tv-overlay champion-screen stage--1">
        <div className="champion-lights" />
        <div className="card recap-card">
          <div className="kicker">A noite em números · Tonight in numbers</div>
          <table className="recap">
            <thead>
              <tr>
                <th />
                {players.map((p) => (
                  <th key={p.playerId}>
                    <PlayerChip p={p} size="2em" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const best = Math.max(...players.map((p) => r.gains[p.playerId] ?? 0));
                return (
                  <tr key={i} className="recap-row">
                    <td className="recap-game">
                      <Picture glyph={r.pic} size="1.8em" /> <b>{r.title}</b>
                    </td>
                    {players.map((p) => (
                      <td key={p.playerId} className={`recap-pts ${(r.gains[p.playerId] ?? 0) === best && players.length > 1 ? "lead" : ""}`}>
                        +{r.gains[p.playerId] ?? 0}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="recap-game">
                  <b>Total</b>
                </td>
                {players.map((p) => (
                  <td key={p.playerId} className="recap-total display">
                    {sum(p.playerId)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }
  return (
    <div className={`tv-overlay champion-screen stage-${a.stage}`}>
      <div className="champion-lights" />
      <div className="champion-title display">
        {a.stage === 0 ? "E a estrela da noite é… 🥁" : a.tie ? "Dois campeões! 👑👑" : `👑 ${top?.p.name ?? ""}!`}
        <i>{a.stage === 0 ? "And tonight's star is…" : a.tie ? "A tie — two champions!" : "Estrela da noite · Tonight's star"}</i>
      </div>
      {a.stage > 0 && (
        <div className="podium">
          {[top, second].filter(Boolean).map((s) => {
            const first = s === top || a.tie;
            return (
              <div key={s!.p.playerId} className={`podium-step ${first ? "first" : "second"}`}>
                {first && a.tie && <span className="crown">👑</span>}
                <PlayerChip p={s!.p} size={first ? "2.4em" : "2em"} />
                <b className="display">{s!.pts}</b>
                <small>pontos da noite</small>
              </div>
            );
          })}
        </div>
      )}
      {a.stage === 2 && (
        <div className="moments">
          <span className="kicker">Melhores momentos · Best moments</span>
          <div className="moment-row">
            {drawing && (
              <div className="moment card">
                <GalleryThumb g={drawing} delay={-1200} />
                <small>O melhor desenho · Best drawing</small>
              </div>
            )}
            {a.night.moments
              .filter((m) => !(drawing && m.pic === "🎨"))
              .slice(0, 2)
              .map((m, i) => (
              <div key={i} className="moment card" style={{ animationDelay: `${0.3 + i * 0.3}s` }}>
                {m.pic && <Picture glyph={m.pic} size="2.4em" />}
                <b>{m.pt}</b>
                <small>{m.en}</small>
              </div>
            ))}
            {word && (
              <div className="moment card word" style={{ animationDelay: "0.9s" }}>
                {word.pic && <Picture glyph={word.pic} size="2.4em" />}
                <b className="display">{word.pt}</b>
                <small>Palavra da noite · Word of the night{word.en ? ` — ${word.en}` : ""}</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
