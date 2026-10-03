/** Phone app: join screen → a controller that changes with the game. Silent: the TV does the talking. */
import { useEffect, useRef, useState } from "react";
import { PhoneConnection, type PhoneState } from "../net/phone.ts";
import type { SocketStatus } from "../net/socket.ts";
import { randomId } from "../shared/ids.ts";
import { PLAYER_COLORS, type Avatar, type ControllerView, type PlayerColor } from "../shared/protocol.ts";
import { AVAILABLE_AVATARS } from "../art/avatars.ts";
import { Face } from "../ui/Face.tsx";
import { Controller } from "./Controller.tsx";

const PROFILE_KEY = "pp.phone.profile.v2";
/** Screens where ⏸ makes no sense (menus, results, already paused). */
const NO_PAUSE = new Set<ControllerView["mode"]>(["lobby", "remote", "pick", "paused"]);

export const COLOR_NAME: Record<PlayerColor, string> = { coral: "Coral", sky: "Céu", mint: "Menta", sun: "Sol" };

interface Profile {
  id: string;
  name: string;
  color: PlayerColor;
  avatar: Avatar;
}

function loadProfile(): Profile {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
    if (p?.id && PLAYER_COLORS.includes(p.color) && AVAILABLE_AVATARS.includes(p.avatar)) return p;
  } catch {
    /* ignore */
  }
  return { id: `p_${randomId(9)}`, name: "", color: PLAYER_COLORS[Math.floor(Math.random() * 4)]!, avatar: AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)]! };
}

export function PhoneApp() {
  const params = new URLSearchParams(location.search);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [code, setCode] = useState((params.get("room") ?? "").toUpperCase());
  const [conn, setConn] = useState<PhoneConnection | null>(null);
  const [state, setState] = useState<PhoneState>({ status: "connecting" });
  const [socket, setSocket] = useState<SocketStatus>("connecting");
  const [view, setView] = useState<ControllerView>({ mode: "wait", title: "Olha para a TV!", pic: "📺" });
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
      navigator.vibrate?.(fx === "success" ? [25, 40, 25] : fx === "fail" ? [90] : [15]);
      const el = flashRef.current;
      if (el) {
        el.style.background = fx === "fail" ? "rgba(255,107,107,.28)" : "rgba(62,207,149,.28)";
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380 });
      }
    };
    setConn(c);
    history.replaceState(null, "", `/play?room=${code}`);
  };

  // Auto-rejoin after a reload when we already have a name and a code.
  useEffect(() => {
    if (!conn && profile.name && code.length >= 4 && localStorage.getItem("pp.phone.resume")) join();
     
  }, []);

  // Keep the screen awake while connected.
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
        <div className="p-center">
          <div className="p-big">A sala fechou</div>
          <button className="btn block" onClick={() => location.assign("/play")}>
            Entrar noutra sala
          </button>
        </div>
      </div>
    );
  }
  const online = socket === "open" && state.status === "joined" && !state.hostAway;
  return (
    <div className="phone" data-color={profile.color}>
      <header className="p-top">
        <Face avatar={profile.avatar} color={profile.color} size="38px" name={profile.name} />
        <span className="p-name">{profile.name}</span>
        <span className={`p-dot ${online ? "" : "off"}`} title={online ? "ligado" : "a ligar…"} />
        {!NO_PAUSE.has(view.mode) && (
          <button className="p-pause" aria-label="Pausa" onClick={() => conn.menu("pause")}>
            <i />
            <i />
          </button>
        )}
      </header>
      {!online && state.status === "joined" && state.hostAway && <div className="p-warn">A TV desligou-se… à espera 📺</div>}
      <main className="p-main">
        <Controller view={view} conn={conn} />
      </main>
      <div ref={flashRef} className="p-flash" />
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
      <div className="join-hero">
        <Face avatar={profile.avatar} color={profile.color} size="96px" name={profile.name} />
        <div className="display join-title">Party Português</div>
      </div>
      <label className="field">
        <span className="kicker">Código da sala</span>
        <input className="code" value={code} maxLength={4} inputMode="text" autoCapitalize="characters" onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} placeholder="ABCD" />
      </label>
      <label className="field">
        <span className="kicker">O teu nome</span>
        <input value={profile.name} maxLength={16} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="O teu nome" autoComplete="nickname" />
      </label>
      <div className="field">
        <span className="kicker">A tua personagem</span>
        <div className="avatar-grid">
          {AVAILABLE_AVATARS.map((a) => (
            <button type="button" key={a} className={a === profile.avatar ? "sel" : ""} onClick={() => setProfile({ ...profile, avatar: a })} aria-label={`Personagem ${a}`}>
              <Face avatar={a} color={profile.color} size="100%" />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="kicker">A tua cor · {COLOR_NAME[profile.color]}</span>
        <div className="color-row">
          {PLAYER_COLORS.map((c) => (
            <button type="button" key={c} data-color={c} className={c === profile.color ? "sel" : ""} onClick={() => setProfile({ ...profile, color: c })} aria-label={COLOR_NAME[c]} />
          ))}
        </div>
      </div>
      {error && <div className="p-error">{error === "no-room" ? "Sala não encontrada — confirma o código na TV." : error === "full" ? "A sala está cheia." : "Não foi possível entrar."}</div>}
      <button className="btn block player" type="submit" disabled={!ok}>
        Entrar
      </button>
    </form>
  );
}
