/**
 * Turbo Race scene: a neon ribbon track floating over the grid, arches, and chunky karts driven by
 * the players' avatars. Reads the race's mutable state every frame (no React re-render per frame).
 */
import { gameNow } from "../clock.ts";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { TurboRace } from "../../games/race/race.ts";
import { useRuntime, type RuntimePlayer } from "../runtime.ts";
import { COLOR_HEX } from "../../ui/Avatar.tsx";
import { AvatarMesh } from "./AvatarMesh.tsx";

const TRACK_WIDTH = 5.2;

export function makeTrackCurve(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 30 + Math.sin(a * 3) * 7 + Math.cos(a * 2) * 4;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 1.2 + Math.sin(a * 2 + 1) * 2.4, Math.sin(a) * r * 0.75));
  }
  return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
}

function ribbon(curve: THREE.CatmullRomCurve3, width: number, segments = 400): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t % 1);
    const tan = curve.getTangentAt(t % 1);
    const side = new THREE.Vector3().crossVectors(tan, up).normalize().multiplyScalar(width / 2);
    pos.push(p.x - side.x, p.y, p.z - side.z, p.x + side.x, p.y, p.z + side.z);
    uv.push(0, t * 80, 1, t * 80);
    if (i < segments) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const trackFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    float edge = smoothstep(0.06, 0.0, vUv.x) + smoothstep(0.94, 1.0, vUv.x);
    float dash = step(0.5, fract(vUv.y * 0.5)) * step(abs(vUv.x - 0.5), 0.015);
    float chev = step(0.85, fract(vUv.y - uTime * 0.6 + abs(vUv.x - 0.5) * 1.5));
    vec3 base = vec3(0.08, 0.03, 0.2);
    vec3 col = base + vec3(0.18, 0.88, 1.0) * edge * 2.2 + vec3(1.0, 0.25, 0.64) * chev * 0.18 + vec3(1.0) * dash * 0.6;
    // start/finish checker
    float start = step(fract(vUv.y / 80.0 + 0.0005), 0.004);
    float checker = mod(floor(vUv.x * 8.0) + floor(vUv.y * 8.0), 2.0);
    col = mix(col, vec3(checker), start);
    gl_FragColor = vec4(col, 1.0);
  }
`;
const uvVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export function RaceScene({ race, players }: { race: TurboRace; players: RuntimePlayer[] }) {
  const curve = useMemo(makeTrackCurve, []);
  const trackGeo = useMemo(() => ribbon(curve, TRACK_WIDTH), [curve]);
  const trackMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: uvVert, fragmentShader: trackFrag, uniforms: { uTime: { value: 0 } }, side: THREE.DoubleSide }), []);
  const arches = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const t = i / 10;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      return { p, rotY: Math.atan2(tan.x, tan.z), color: ["#2de2ff", "#ff3fa4", "#ffd23f", "#8dff4a"][i % 4]! };
    });
  }, [curve]);

  const { camera } = useThree();
  const camTarget = useRef(new THREE.Vector3());
  const camPos = useRef(new THREE.Vector3(0, 40, 60));

  useFrame((state, dt) => {
    trackMat.uniforms.uTime!.value = state.clock.elapsedTime;
    const karts = [...race.karts.values()];
    if (karts.length === 0) return;
    // Camera: chase the pack from behind/above; wide during countdown.
    // Chase from behind the LAST kart, looking at the leader, so the whole pack stays in frame.
    const order = race.order();
    const lead = order[0]!;
    const trail = order[order.length - 1]!;
    const wrap = (u: number) => ((Math.min(u, 0.999) % 1) + 1) % 1;
    const spread = Math.min(0.25, Math.abs(lead.u - trail.u));
    const pt = curve.getPointAt(wrap(trail.u));
    const tt = curve.getTangentAt(wrap(trail.u));
    const pl = curve.getPointAt(wrap(lead.u));
    const back = race.phase === "countdown" ? 16 : 9 + spread * 30;
    const height = race.phase === "countdown" ? 8 : 5.5 + spread * 30;
    const want = new THREE.Vector3().copy(pt).addScaledVector(tt, -back).add(new THREE.Vector3(0, height, 0));
    camPos.current.lerp(want, Math.min(1, dt * 2.2));
    const look = new THREE.Vector3().copy(pl).lerp(pt, 0.35).addScaledVector(tt, 3).add(new THREE.Vector3(0, 2.2, 0));
    camTarget.current.lerp(look, Math.min(1, dt * 3));
    camera.position.copy(camPos.current);
    camera.lookAt(camTarget.current);
    const boosting = karts.some((k) => gameNow() < k.boostUntil);
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov += ((boosting ? 72 : 60) - pc.fov) * Math.min(1, dt * 3);
    pc.updateProjectionMatrix();
  });

  return (
    <group>
      <mesh geometry={trackGeo} material={trackMat} />
      {arches.map((a, i) => (
        <group key={i} position={a.p} rotation={[0, a.rotY, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <torusGeometry args={[TRACK_WIDTH * 0.72, 0.16, 8, 32, Math.PI]} />
            <meshStandardMaterial color={a.color} emissive={a.color} emissiveIntensity={2.4} />
          </mesh>
        </group>
      ))}
      {players.map((p) => (
        <KartMesh key={p.playerId} race={race} player={p} curve={curve} />
      ))}
    </group>
  );
}

function KartMesh({ race, player, curve }: { race: TurboRace; player: RuntimePlayer; curve: THREE.CatmullRomCurve3 }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const shield = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const color = COLOR_HEX[player.color];
  useRuntime(); // re-render on race events (labels)
  const label = race.karts.get(player.playerId)?.label;
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame((state, dt) => {
    const k = race.karts.get(player.playerId);
    if (!k || !root.current) return;
    const now = gameNow();
    const u = ((k.u % 1) + 1) % 1;
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    const side = new THREE.Vector3().crossVectors(tan, up).normalize();
    const laneOffset = (k.lane % 2 === 0 ? -1 : 1) * 1.15;
    root.current.position.copy(p).addScaledVector(side, laneOffset).add(new THREE.Vector3(0, 0.45, 0));
    root.current.rotation.set(0, Math.atan2(tan.x, tan.z), 0);
    const spinning = now < k.spinUntil;
    if (body.current) {
      body.current.rotation.y = spinning ? ((now - k.spinStart) / 1400) * Math.PI * 4 : 0;
      body.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 18)) * 0.05 * (k.speed / 0.02);
      body.current.rotation.x = now < k.boostUntil ? -0.08 : 0;
    }
    if (wheels.current) wheels.current.children.forEach((w) => (w.rotation.x += k.speed * dt * 900));
    if (flame.current) {
      const on = now < k.boostUntil;
      flame.current.visible = on;
      const s = 0.8 + Math.random() * 0.6 + (k.boostKind === "combo" || k.boostKind === "nitro" ? 0.8 : 0);
      flame.current.scale.set(1, s, 1);
    }
    if (shield.current) {
      shield.current.visible = k.shield;
      shield.current.rotation.y += dt * 2;
    }
    if (stars.current) {
      stars.current.visible = spinning;
      stars.current.rotation.y += dt * 6;
    }
  });

  return (
    <group ref={root}>
      {label && gameNow() - label.at < 1500 && (
        <Html center position={[0, 3.4, 0]} zIndexRange={[20, 10]}>
          <div key={label.at} className={`kart-label ${label.tone === "bad" ? "bad" : label.tone === "item" ? "item" : ""}`} data-color={player.color} style={{ position: "static", fontSize: `calc(100vh / 54 * ${label.tone === "bad" ? 3 : 3.8})` }}>
            {label.text}
          </div>
        </Html>
      )}
      <group ref={body}>
        {/* chassis */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.5, 0.45, 2.3]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.34, -0.9]}>
          <boxGeometry args={[1.7, 0.12, 0.5]} />
          <meshStandardMaterial color="#12052e" />
        </mesh>
        <mesh position={[0, 0.3, 1.05]}>
          <boxGeometry args={[1.2, 0.08, 0.3]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} />
        </mesh>
        <group ref={wheels}>
          {[
            [-0.8, -0.1, 0.75],
            [0.8, -0.1, 0.75],
            [-0.8, -0.1, -0.75],
            [0.8, -0.1, -0.75],
          ].map((w, i) => (
            <mesh key={i} position={w as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.32, 0.32, 0.28, 12]} />
              <meshStandardMaterial color="#12052e" />
            </mesh>
          ))}
        </group>
        <group position={[0, 0.85, -0.1]}>
          <AvatarMesh kind={player.avatar} color={player.color} scale={0.95} />
        </group>
        <mesh ref={flame} position={[0, 0.1, -1.55]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <coneGeometry args={[0.35, 1.4, 10]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ff8a3d" emissiveIntensity={4} transparent opacity={0.9} />
        </mesh>
        <mesh ref={shield} visible={false}>
          <icosahedronGeometry args={[1.7, 1]} />
          <meshStandardMaterial color="#2de2ff" emissive="#2de2ff" emissiveIntensity={1.5} transparent opacity={0.25} wireframe />
        </mesh>
        <group ref={stars} position={[0, 1.9, 0]} visible={false}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 0.7, 0, Math.sin((i / 4) * Math.PI * 2) * 0.7]}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={3} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
