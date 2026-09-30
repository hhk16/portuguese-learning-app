/** Phone app: join screen → controller that transforms per game mode. */
import { useEffect, useRef, useState } from "react";
import { PhoneConnection, type PhoneState } from "../net/phone.ts";
import type { SocketStatus } from "../net/socket.ts";
import { randomId } from "../shared/ids.ts";
import { AVATARS, PLAYER_COLORS, type Avatar as AvatarKind, type ControllerView, type PlayerColor } from "../shared/protocol.ts";
import { Avatar, AVATAR_NAME, COLOR_HEX, COLOR_NAME } from "../ui/Avatar.tsx";
import { Controller } from "./Controller.tsx";

const PROFILE_KEY = "pp.phone.profile";
/** Screens where ⏸ makes no sense (menus, results, already paused). */
const NO_PAUSE = new Set<ControllerView["mode"]>(["lobby", "remote", "results", "paused"]);

interface Profile {
  id: string;
  name: string;
  color: PlayerColor;
  avatar: AvatarKind;
}

function loadProfile(): Profile {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
    if (p?.id) return p;
  } catch {
    /* ignore */
  }
  return { id: `p_${randomId(9)}`, name: "", color: PLAYER_COLORS[Math.floor(Math.random() * 4)]!, avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)]! };
}

export function PhoneApp() {
  const params = new URLSearchParams(location.search);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [code, setCode] = useState((params.get("room") ?? "").toUpperCase());
  const [conn, setConn] = useState<PhoneConnection | null>(null);
  const [state, setState] = useState<PhoneState>({ status: "connecting" });
  const [socket, setSocket] = useState<SocketStatus>("connecting");
  const [view, setView] = useState<ControllerView>({ mode: "wait", title: "Olha para a TV!", emoji: "📺" });
  const flashRef = useRef<HTMLDivElement>(null);

  const join = () => {
    const name = profile.name.trim();
    if (!name || code.length < 4) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, name }));
    const c = new PhoneConnection({ code, name, color: profile.color, avatar: profile.avatar, profileHint: profile.id });
    c.onState = setState;
    c.onSocket = setSocket;
    c.onView = setView;
    c.onFx = (fx) => {
      const pattern = fx === "success" ? [30, 40, 30] : fx === "fail" ? [120] : fx === "boost" ? [20, 20, 60] : [15];
      navigator.vibrate?.(pattern);
      const el = flashRef.current;
      if (el) {
        el.style.background = fx === "fail" ? "rgba(255,77,109,.35)" : "rgba(141,255,74,.3)";
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350 });
      }
    };
    setConn(c);
    history.replaceState(null, "", `/play?room=${code}`);
  };

  // Auto-rejoin after a reload when we already have a name and a code.
  useEffect(() => {
    if (!conn && profile.name && code.length >= 4 && localStorage.getItem("pp.phone.resume")) join();
  }, []);

  // Keep the screen awake while connected (phones dim mid-round otherwise).
  useEffect(() => {
    if (!conn) return;
    type Lock = { release(): Promise<void> };
    const wl = (navigator as unknown as { wakeLock?: { request(t: "screen"): Promise<Lock> } }).wakeLock;
    if (!wl) return;
    let lock: Lock | null = null;
    const acquire = () => {
      if (document.visibilityState === "visible") wl.request("screen").then((l) => (lock = l), () => {});
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      document.removeEventListener("visibilitychange", acquire);
      void lock?.release().catch(() => {});
    };
  }, [conn]);

  // Test hook for the automated e2e harness.
  useEffect(() => {
    (window as unknown as { __pp?: unknown }).__pp = { view, conn };
  }, [view, conn]);

  if (!conn || (state.status === "failed" && state.reason !== "closed")) {
    return (
      <div className="phone" data-color={profile.color}>
        <JoinScreen profile={profile} setProfile={setProfile} code={code} setCode={setCode} onJoin={join} error={state.status === "failed" ? state.reason : undefined} />
      </div>
    );
  }
  if (state.status === "failed") {
    return (
      <div className="phone" data-color={profile.color}>
        <div className="wait">
          <div className="emoji">🚪</div>
          <h2>A sala fechou</h2>
          <button className="bbtn" onClick={() => location.assign("/play")}>
            Entrar noutra sala
          </button>
        </div>
      </div>
    );
  }
  const online = socket === "open" && state.status === "joined" && !state.hostAway;
  return (
    <div className="phone" data-color={profile.color}>
      <div className="phone-top">
        <Avatar kind={profile.avatar} color={profile.color} size={34} />
        <span className="grow">{profile.name}</span>
        <span className="pixel" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
          {code}
        </span>
        <span className={`dot ${online ? "" : "off"}`} title={online ? "ligado" : "a ligar…"} />
        {!NO_PAUSE.has(view.mode) && (
          <button className="pause-btn" aria-label="Pausa" onClick={() => conn.menu("pause")}>
            <i />
            <i />
          </button>
        )}
      </div>
      {!online && state.status === "joined" && state.hostAway && <div className="err" style={{ padding: 8 }}>A TV desligou-se… à espera 📺</div>}
      <div className="phone-main">
        <Controller view={view} conn={conn} />
      </div>
      <div ref={flashRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0 }} />
    </div>
  );
}

function JoinScreen({
  profile,
  setProfile,
  code,
  setCode,
  onJoin,
  error,
}: {
  profile: Profile;
  setProfile: (p: Profile) => void;
  code: string;
  setCode: (c: string) => void;
  onJoin: () => void;
  error?: string;
}) {
  const ok = profile.name.trim().length > 0 && code.length >= 4;
  return (
    <form
      className="join"
      onSubmit={(e) => {
        e.preventDefault();
        onJoin();
      }}
    >
      <div className="logo">
        PARTY
        <span className="l2">PORTUGUÊS</span>
      </div>
      <div className="field">
        <label>Código da sala</label>
        <input className="code" value={code} maxLength={4} inputMode="text" autoCapitalize="characters" onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} placeholder="ABCD" />
      </div>
      <div className="field">
        <label>O teu nome</label>
        <input value={profile.name} maxLength={16} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Hadi" autoComplete="nickname" />
      </div>
      <div className="field">
        <label>Boneco · {AVATAR_NAME[profile.avatar]}</label>
        <div className="avatar-grid">
          {AVATARS.map((a) => (
            <button type="button" key={a} className={a === profile.avatar ? "sel" : ""} onClick={() => setProfile({ ...profile, avatar: a })} aria-label={AVATAR_NAME[a]}>
              <Avatar kind={a} color={profile.color} size={64} />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Cor · {COLOR_NAME[profile.color]}</label>
        <div className="color-row">
          {PLAYER_COLORS.map((c) => (
            <button type="button" key={c} className={c === profile.color ? "sel" : ""} style={{ background: COLOR_HEX[c] }} onClick={() => setProfile({ ...profile, color: c })} aria-label={COLOR_NAME[c]} />
          ))}
        </div>
      </div>
      {error && <div className="err">{error === "no-room" ? "Sala não encontrada — confirma o código na TV." : error === "full" ? "A sala está cheia." : "Não foi possível entrar."}</div>}
      <button className="bbtn" type="submit" disabled={!ok}>
        ENTRAR! 🎉
      </button>
    </form>
  );
}
