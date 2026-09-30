/**
 * The TV canvas: one WebGL context for everything 3D. The backdrop is always on; activities add
 * their own scene. Blip is anchored to the camera so he stays in frame whatever the camera does.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { MicroRush } from "../../games/micro/rush.ts";
import { TurboRace } from "../../games/race/race.ts";
import { COLOR_HEX } from "../../ui/Avatar.tsx";
import { ResultsActivity } from "../activities.ts";
import { useRuntime, type TvRuntime } from "../runtime.ts";
import { ArcadeWorld } from "./ArcadeWorld.tsx";
import { AvatarMesh } from "./AvatarMesh.tsx";
import { Blip } from "./Blip.tsx";
import { RaceScene } from "./RaceScene.tsx";

function CameraAnchored({ offset, children }: { offset: [number, number, number]; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const v = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!g.current) return;
    // keep a constant screen position regardless of aspect
    const aspect = size.width / size.height;
    v.current.set(offset[0] * (aspect / (16 / 9)), offset[1], offset[2]);
    g.current.position.copy(camera.localToWorld(v.current.clone()));
    g.current.quaternion.copy(camera.quaternion);
  });
  return <group ref={g}>{children}</group>;
}

function DefaultCamera({ active }: { active: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!active) return;
    t.current += dt;
    const target = new THREE.Vector3(Math.sin(t.current * 0.15) * 1.2, 3.2 + Math.sin(t.current * 0.2) * 0.3, 14);
    camera.position.lerp(target, Math.min(1, dt * 2));
    camera.lookAt(0, 3, 0);
    const pc = camera as THREE.PerspectiveCamera;
    if (Math.abs(pc.fov - 55) > 0.1) {
      pc.fov += (55 - pc.fov) * Math.min(1, dt * 3);
      pc.updateProjectionMatrix();
    }
  });
  return null;
}

/** Players standing on glowing pedestals (lobby / title / results podium). */
function Pedestals({ rt, podium }: { rt: TvRuntime; podium?: string[] }) {
  const players = podium ? podium.map((id) => rt.players.get(id)!).filter(Boolean) : rt.activePlayers;
  const n = players.length;
  return (
    <group position={[0, 0, 2]}>
      {players.map((p, i) => {
        const x = (i - (n - 1) / 2) * 3.2;
        const spacing = podium ? 2.3 : 3.2;
        const h = podium ? [2.2, 1.4, 0.9, 0.6][i]! : 0.6;
        const px = podium && n > 1 ? [0, -spacing, spacing, spacing * 2][i]! : x;
        return <Pedestal key={p.playerId} x={px} h={h} color={COLOR_HEX[p.color]} avatar={p.avatar} playerColor={p.color} ready={p.ready} />;
      })}
    </group>
  );
}

function Pedestal({ x, h, color, avatar, playerColor, ready }: { x: number; h: number; color: string; avatar: Parameters<typeof AvatarMesh>[0]["kind"]; playerColor: Parameters<typeof AvatarMesh>[0]["color"]; ready: boolean }) {
  const g = useRef<THREE.Group>(null);
  const seed = useRef(Math.random() * 10);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime + seed.current;
    g.current.position.y = h + 0.9 + Math.abs(Math.sin(t * (ready ? 6 : 2))) * (ready ? 0.5 : 0.15);
    g.current.rotation.y = Math.sin(t * 0.8) * 0.4;
  });
  return (
    <group position={[x, -1.5, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[1.1, 1.3, h, 24]} />
        <meshStandardMaterial color="#1a0b3d" emissive={color} emissiveIntensity={ready ? 0.9 : 0.25} />
      </mesh>
      <mesh position={[0, h + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.1, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
      </mesh>
      <group ref={g}>
        <AvatarMesh kind={avatar} color={playerColor} scale={1.6} />
      </group>
    </group>
  );
}

/** Where Blip stands per screen (camera space) — kept clear of each screen's panels. */
export function blipLayout(activityId: string | undefined): { offset: [number, number, number]; scale: number; bubble: string } {
  switch (activityId) {
    case "title":
      return { offset: [0.3, 1.75, -8], scale: 0.95, bubble: "top" };
    case "lobby":
      return { offset: [5.3, -2.4, -8], scale: 0.85, bubble: "corner-right" };
    case "results":
      return { offset: [-5.1, 1.7, -8], scale: 0.7, bubble: "left-top" };
    default:
      return { offset: [-5.4, -2.3, -8], scale: 0.85, bubble: "corner" };
  }
}

function Scene() {
  const rt = useRuntime();
  const a = rt.activity;
  const race = a instanceof TurboRace ? a : null;
  const micro = a instanceof MicroRush ? a : null;
  const results = a instanceof ResultsActivity ? a : null;
  const pulse = micro ? micro.pulse.correct * 2 + micro.pulse.wrong * 2 + micro.pulse.slam : 0;
  const pulseColor = micro && micro.phase === "reveal" ? (micro.pulse.wrong > 0 && micro.round && [...micro.round.per.values()].every((x) => !x.outcome || x.outcome === "wrong" || x.outcome === "timeout") ? "#ff4d6d" : "#8dff4a") : "#ffd23f";
  const layout = blipLayout(a?.id);
  const showPedestals = a?.id === "title" || a?.id === "lobby";
  return (
    <>
      <DefaultCamera active={!race} />
      <ArcadeWorld speed={race ? 8 : micro ? 2.2 * micro.speed : 1} pulse={pulse} pulseColor={pulseColor} lowFx={rt.settings.lowFx} far={!!race} />
      {race && <RaceScene race={race} players={rt.activePlayers.filter((p) => race.karts.has(p.playerId))} />}
      {showPedestals && <Pedestals rt={rt} />}
      {results && <Pedestals rt={rt} podium={results.ranking.map((p) => p.playerId)} />}
      <CameraAnchored offset={layout.offset}>
        <Blip mood={rt.mcMood} talkingUntil={rt.mcTalkUntil} scale={layout.scale} hop={rt.mc?.seq ?? 0} />
      </CameraAnchored>
    </>
  );
}

export function Stage() {
  const rt = useRuntime();
  const low = rt.settings.lowFx;
  return (
    <Canvas
      dpr={1}
      gl={{ antialias: low, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 3.2, 14], fov: 55, near: 0.1, far: 400 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#0b0420"]} />
      <Scene />
      {!low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.35} luminanceSmoothing={0.2} intensity={1.1} radius={0.7} />
          <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0006)} radialModulation={false} modulationOffset={0} />
          <Noise opacity={0.05} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
