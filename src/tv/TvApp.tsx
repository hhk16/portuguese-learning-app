/** TV app: the toy-world stage (three.js) + one calm DOM overlay per activity + keyboard/D-pad input. */
import { useEffect, useState } from "react";
import { audio, unlockAudio } from "../audio/sfx.ts";
import { loadAudioManifest } from "../audio/tts.ts";
import { LearnActivity } from "../games/learn/learn.ts";
import { ParesSecretos } from "../games/secret/secret.ts";
import { EmSintonia } from "../games/sync/sync.ts";
import { NaMesmaOnda } from "../games/wave/wave.ts";
import { Desenha } from "../games/draw/draw.ts";
import { Stop } from "../games/stop/stop.ts";
import { Cozinha } from "../games/kitchen/kitchen.ts";
import type { NavDir } from "../shared/protocol.ts";
import { LobbyActivity, ResultsActivity, TitleActivity } from "./activities.ts";
import { useRuntime } from "./runtime.ts";
import { LearnScreen } from "./screens/LearnScreen.tsx";
import { LobbyScreen, PauseScreen, ResultsScreen, TitleScreen } from "./screens/Menus.tsx";
import { SecretScreen } from "./screens/SecretScreen.tsx";
import { SyncScreen } from "./screens/SyncScreen.tsx";
import { WaveScreen } from "./screens/WaveScreen.tsx";
import { DrawScreen } from "./screens/DrawScreen.tsx";
import { StopScreen } from "./screens/StopScreen.tsx";
import { KitchenScreen } from "./screens/KitchenScreen.tsx";
import { Stage } from "./three/Stage.tsx";

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
    document.documentElement.classList.add("tv-root");
    if (rt.testMode) (window as unknown as { __ppSoundLog?: unknown[] }).__ppSoundLog ??= [];
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

  const showGate = gate && !rt.testMode;
  const a = rt.activity;
  return (
    <div className="tv">
      <Stage />
      {a instanceof TitleActivity && <TitleScreen a={a} />}
      {a instanceof LobbyActivity && <LobbyScreen a={a} />}
      {a instanceof ResultsActivity && <ResultsScreen a={a} />}
      {a instanceof LearnActivity && <LearnScreen a={a} />}
      {a instanceof ParesSecretos && <SecretScreen a={a} />}
      {a instanceof NaMesmaOnda && <WaveScreen a={a} />}
      {a instanceof EmSintonia && <SyncScreen a={a} />}
      {a instanceof Desenha && <DrawScreen a={a} />}
      {a instanceof Stop && <StopScreen a={a} />}
      {a instanceof Cozinha && <KitchenScreen a={a} />}
      {rt.paused && <PauseScreen />}
      {rt.socket !== "open" && <div className="conn-warn">A ligar ao servidor…</div>}
      {showGate && (
        <button className="start-gate" onClick={() => setGate(false)}>
          <span className="card gate-card">
            <span className="display">Party Português</span>
            <span>Carrega OK para começar 🔊</span>
          </span>
        </button>
      )}
    </div>
  );
}
