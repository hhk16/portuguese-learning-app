/** TV app: 3D stage + DOM overlay per activity + Blip bubble + input (keyboard / D-pad / phones). */
import { gameNow } from "./clock.ts";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { audio, unlockAudio, setVolumes } from "../audio/sfx.ts";
import { loadAudioManifest } from "../audio/tts.ts";
import { stopMusic } from "../audio/music.ts";
import { DizMe } from "../games/dizme/dizme.ts";
import { LearnActivity } from "../games/learn/learn.ts";
import { MicroRush } from "../games/micro/rush.ts";
import { TurboRace } from "../games/race/race.ts";
import { Apanha } from "../games/snap/snap.ts";
import { publicBaseUrl } from "../net/socket.ts";
import type { NavDir } from "../shared/protocol.ts";
import { Avatar } from "../ui/Avatar.tsx";
import { IntroActivity, LobbyActivity, ResultsActivity, TitleActivity } from "./activities.ts";
import { getRuntime, SPEED_LABEL, useRuntime, type RuntimePlayer } from "./runtime.ts";
import { DizMeScreen } from "./screens/DizMeScreen.tsx";
import { LearnScreen } from "./screens/LearnScreen.tsx";
import { SnapScreen } from "./screens/SnapScreen.tsx";
import { MicroScreen } from "./screens/MicroScreen.tsx";
import { RaceHud } from "./screens/RaceHud.tsx";
import { blipLayout, Stage } from "./three/Stage.tsx";

const KEYMAP: Record<string, NavDir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "ok",
  " ": "ok",
  Escape: "back",
  Backspace: "back",
  GoBack: "back",
  BrowserBack: "back",
};

export function TvApp() {
  const rt = useRuntime();
  const [gate, setGate] = useState(() => audio()?.ctx.state !== "running");

  useEffect(() => {
    void loadAudioManifest();
    if (!rt.activity) rt.run(new TitleActivity());
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYMAP[e.key];
      if (!dir) return;
      e.preventDefault();
      unlockAudio();
      setGate(false);
      rt.tvNav(dir);
    };
    window.addEventListener("keydown", onKey);
    const onClick = () => {
      unlockAudio();
      setGate(false);
    };
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [rt]);

  useEffect(() => {
    setVolumes({ music: rt.settings.music ? 0.22 : 0 });
    if (!rt.settings.music) stopMusic();
  }, [rt.settings.music]);

  // Test mode (automated screenshots) never blocks on the audio gate.
  const showGate = gate && !rt.testMode;
  const a = rt.activity;
  return (
    <div className="tv">
      <Stage />
      {a instanceof TitleActivity && <TitleScreen a={a} />}
      {a instanceof LobbyActivity && <LobbyScreen a={a} />}
      {a instanceof IntroActivity && <IntroScreen a={a} />}
      {a instanceof MicroRush && <MicroScreen a={a} />}
      {a instanceof TurboRace && <RaceHud a={a} />}
      {a instanceof LearnActivity && <LearnScreen a={a} />}
      {a instanceof DizMe && <DizMeScreen a={a} />}
      {a instanceof Apanha && <SnapScreen a={a} />}
      {a instanceof ResultsActivity && <ResultsScreen a={a} />}
      <BlipBubble />
      {rt.paused && <PauseScreen />}
      {!(a instanceof TitleActivity || a instanceof LobbyActivity) && rt.code && <JoinBadge code={rt.code} />}
      {rt.socket !== "open" && <div className="conn-warn">A ligar ao servidor…</div>}
      {rt.tvVoiceMissing && <div className="voice-warn">🔇 Esta TV não tem voz portuguesa · o telemóvel lê em voz alta</div>}
      {showGate && (
        <div className="start-gate" onClick={() => setGate(false)}>
          <div>
            <div className="logo">PARTY PORTUGUÊS</div>
            <p>Carrega OK para começar 🔊</p>
          </div>
        </div>
      )}
    </div>
  );
}

function joinUrl(code: string) {
  return `${publicBaseUrl()}/play?room=${code}`;
}

function PlayerChips({ players, scores }: { players: RuntimePlayer[]; scores?: boolean }) {
  return (
    <div className="player-row">
      {players.map((p) => (
        <div key={p.playerId} className={`player-chip ${p.connected ? "" : "off"}`} data-color={p.color}>
          <Avatar kind={p.avatar} color={p.color} size={44} />
          {p.name}
          {scores && <span className="score">{p.score}</span>}
        </div>
      ))}
    </div>
  );
}

function JoinPanel({ big = false }: { big?: boolean }) {
  const rt = useRuntime();
  return (
    <div className="panel join-panel">
      <h3>Entra com o telemóvel</h3>
      {rt.code ? (
        <>
          <div className="qr">
            <QRCodeSVG value={joinUrl(rt.code)} size={big ? 300 : 220} level="M" />
          </div>
          <div className="room-code">{rt.code}</div>
          <div className="join-url">{publicBaseUrl().replace(/^https?:\/\//, "")}/play</div>
        </>
      ) : (
        <div className="join-url">A criar sala…</div>
      )}
      <PlayerChips players={rt.activePlayers} />
    </div>
  );
}

function TitleScreen({ a }: { a: TitleActivity }) {
  return (
    <div className="tv-overlay title-screen">
      <div className="title-left">
        <div>
          <div className="logo" style={{ fontSize: a.menu === "main" ? "8rem" : "5rem" }}>
            PARTY
            <span className="l2">PORTUGUÊS</span>
          </div>
          <div className="tagline">Jogos de festa · Português europeu A1 · TV + telemóveis</div>
        </div>
        {a.menu !== "main" && <div className="menu-crumb">{{ aprender: "APRENDER", jogos: "JOGOS", settings: "DEFINIÇÕES" }[a.menu]}</div>}
        <div className={`menu ${a.menu === "aprender" ? "compact" : ""}`}>
          {windowed(a.items, a.focus, a.menu === "aprender" ? 5 : 6).map(({ it, i }) => (
            <div key={it.id} className={`menu-item ${i === a.focus ? "focus" : ""} ${it.disabled ? "disabled" : ""} ${it.badge === "✓" ? "done" : ""} ${it.badge === "PRÓXIMA" ? "next" : ""}`}>
              <div>
                <div className="mi-label">{it.label}</div>
                {it.sub && <div className="mi-sub">{it.sub}</div>}
              </div>
              {it.badge && <span className="badge">{it.badge}</span>}
            </div>
          ))}
        </div>
      </div>
      <JoinPanel />
    </div>
  );
}

/** A scrolling window of at most `n` items around the focused one. */
function windowed<T>(items: T[], focus: number, n: number): { it: T; i: number }[] {
  const start = Math.max(0, Math.min(items.length - n, focus - Math.floor(n / 2)));
  return items.slice(start, start + n).map((it, k) => ({ it, i: start + k }));
}

function LobbyScreen({ a }: { a: LobbyActivity }) {
  const rt = getRuntime();
  const [, force] = useState(0);
  useEffect(() => {
    if (a.countdownAt === null) return;
    const id = setInterval(() => force((x) => x + 1), 100);
    return () => clearInterval(id);
  }, [a.countdownAt]);
  const secs = a.countdownAt !== null ? Math.max(1, Math.ceil((a.countdownAt - gameNow()) / 1000)) : null;
  return (
    <div className="tv-overlay lobby-screen">
      <JoinPanel big />
      <div className="lobby-right">
        <h1 className={a.spec.mode === "lesson" ? "small" : ""}>{a.title}</h1>
        <div className="speed-pick">
          <span className="lbl">Velocidade</span>
          {(["calma", "normal", "turbo"] as const).map((sp) => (
            <span key={sp} className={`sp ${rt.settings.speed === sp ? "on" : ""}`}>
              {SPEED_LABEL[sp]}
            </span>
          ))}
          <span className="lbl">◀ ▶</span>
        </div>
        <div className="lobby-hint">{a.hint}</div>
        <div className="steps">
          1. Aponta a câmara ao <b>código QR</b>
          <br />
          2. Escolhe o teu <b>boneco</b> e a tua <b>cor</b>
          <br />
          3. Carrega em <b>ESTOU PRONTO!</b>
        </div>
        <div className="ready-list">
          {rt.activePlayers.map((p) => (
            <div key={p.playerId} className={`ready-card ${p.ready ? "ready" : ""}`} data-color={p.color}>
              <Avatar kind={p.avatar} color={p.color} size={64} />
              <div>
                {p.name}
                <div className="st">{p.ready ? "PRONTO!" : "À espera…"}</div>
              </div>
            </div>
          ))}
          {rt.activePlayers.length === 0 && <div className="steps">Ninguém ainda… 👀</div>}
        </div>
      </div>
      {secs !== null && (
        <div className="countdown">
          <span key={secs}>{secs}</span>
        </div>
      )}
    </div>
  );
}

function IntroScreen({ a }: { a: IntroActivity }) {
  const rt = getRuntime();
  return (
    <div className="tv-overlay">
      <div className="center-stack">
        <div className="slam">{a.title}</div>
        <div className="slam-hint">
          <PlayerChips players={rt.activePlayers} />
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ a }: { a: ResultsActivity }) {
  const info = a.info;
  const lesson = info.lesson;
  const heading = lesson ? "LIÇÃO COMPLETA!" : info.coop ? (info.coop.isRecord ? "NOVO RECORDE!" : "BOA EQUIPA!") : a.ranking.length > 1 ? `${a.ranking[0]!.name} GANHA!` : "FIM!";
  return (
    <div className="tv-overlay results-screen">
      <h1>{heading}</h1>
      {info.coop && (
        <div className="coop-score">
          <span className="n">{info.coop.score}</span> palavras juntos · recorde {info.coop.record}
        </div>
      )}
      <div className="results-cols">
        {a.ranking.map((p, i) => {
          const sum = lesson?.summaries.find((s) => s.playerId === p.playerId);
          return (
            <div key={p.playerId} className="panel result-card" data-color={p.color} style={{ animationDelay: `${i * 0.2}s` }}>
              <h2>
                <Avatar kind={p.avatar} color={p.color} size={56} mood={lesson || info.coop || i === 0 ? "happy" : "sad"} />
                {lesson || info.coop ? p.name : `${i + 1}.º ${p.name}`}
              </h2>
              {sum ? (
                <>
                  <div className="pts">{"⭐".repeat(sum.stars)} {sum.xp} XP</div>
                  <div className="review-tag">
                    {sum.correct}/{sum.graded} certas · 🔥 {sum.bestStreak}
                  </div>
                </>
              ) : (
                !info.coop && <div className="pts">{a.scoreOf(p)} pts</div>
              )}
              {p.missed.length > 0 ? (
                <>
                  <div className="review-tag">PARA REVER</div>
                  <ul>
                    {p.missed.slice(0, 4).map((m) => (
                      <li key={m.answer}>
                        {m.answer} {m.why && <span>— {m.why}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="review-tag">SEM ERROS! 🤯</div>
              )}
            </div>
          );
        })}
      </div>
      {lesson && lesson.words.length > 0 && (
        <div className="word-wall static">
          <div className="review-tag">APRENDERAM</div>
          <div className="chips-row">
            {lesson.words.map((w) => (
              <span key={w.itemId} className="word-chip">
                {w.emoji && w.emoji !== w.en && <b>{w.emoji}</b>}
                {w.pt} <i>= {w.en}</i>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="next-menu">
        {info.options.map((o, i) => (
          <div key={o.id} className={`menu-item ${i === a.focus ? "focus" : ""}`}>
            <div>
              <div className="mi-label">{o.label}</div>
              {o.sub && <div className="mi-sub">{o.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PauseScreen() {
  const rt = useRuntime();
  return (
    <div className="tv-overlay pause-screen">
      <div className="panel pause-card">
        <div className="slam" style={{ fontSize: "6rem" }}>
          PAUSA
        </div>
        <div className="pause-menu">
          {rt.pauseItems.map((it, i) => (
            <div key={it.id} className={`menu-item ${i === rt.pauseFocus ? "focus" : ""}`}>
              <div className="mi-label">{it.label}</div>
              {it.id === "speed" && <span className="badge">◀ ▶</span>}
            </div>
          ))}
        </div>
        <div className="pause-hint">Também podes usar o telemóvel · Voltar = continuar</div>
      </div>
    </div>
  );
}

function BlipBubble() {
  const rt = useRuntime();
  const mc = rt.mc;
  const ref = useRef<number>(0);
  if (!mc) return null;
  ref.current = mc.seq;
  const layout = blipLayout(rt.activity?.id);
  return (
    <div key={mc.seq} className={`blip-bubble ${layout.bubble}`}>
      {mc.text}
      {rt.settings.subtitles && <span className="en">{mc.sub}</span>}
    </div>
  );
}

function JoinBadge({ code }: { code: string }) {
  return (
    <div className="join-badge">
      <div style={{ background: "#fff", padding: 4, borderRadius: 6, display: "flex" }}>
        <QRCodeSVG value={joinUrl(code)} size={72} />
      </div>
      <span className="code">{code}</span>
    </div>
  );
}
