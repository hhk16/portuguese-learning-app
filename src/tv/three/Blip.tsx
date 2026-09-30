/**
 * Blip, the MC: a chunky procedural arcade creature. Mood drives pose/eyes; talking drives the mouth.
 */
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Line } from "../../engine/mc/lines.ts";

export interface BlipProps {
  mood: Line["mood"];
  talkingUntil: number; // performance.now() ms
  position?: [number, number, number];
  scale?: number;
  /** Increment to trigger a hop. */
  hop?: number;
}

const BODY = "#9b5cff";

export function Blip({ mood, talkingUntil, position = [0, 0, 0], scale = 1, hop = 0 }: BlipProps) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const pupilL = useRef<THREE.Mesh>(null);
  const pupilR = useRef<THREE.Mesh>(null);
  const antenna = useRef<THREE.Mesh>(null);
  const hat = useRef<THREE.Group>(null);
  const hopState = useRef({ last: hop, t: 0 });

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const now = performance.now();
    const talking = now < talkingUntil;
    if (hop !== hopState.current.last) {
      hopState.current.last = hop;
      hopState.current.t = 1;
    }
    hopState.current.t = Math.max(0, hopState.current.t - dt * 2.2);
    const h = hopState.current.t;
    const hype = mood === "hype";
    const bounce = Math.abs(Math.sin(t * (hype ? 7 : 2.4))) * (hype ? 0.35 : 0.12) + Math.sin(h * Math.PI) * 0.9;
    if (root.current) {
      root.current.position.set(position[0], position[1] + bounce * scale, position[2]);
      root.current.rotation.z = mood === "smug" ? 0.18 : mood === "sad" ? -0.1 : Math.sin(t * 1.3) * 0.06;
      root.current.rotation.y = Math.sin(t * 0.7) * 0.35 + h * Math.PI * 2;
    }
    if (body.current) {
      // squash & stretch on bounce
      const sq = 1 + Math.sin(t * (hype ? 14 : 4.8)) * 0.05 * (hype ? 2 : 1);
      body.current.scale.set(1.05 / Math.sqrt(sq), 0.95 * sq * (mood === "sad" ? 0.9 : 1), 1.05 / Math.sqrt(sq));
    }
    if (mouth.current) {
      const open = talking ? 0.35 + Math.abs(Math.sin(t * 22)) * 0.9 : mood === "shock" ? 1.1 : 0.25;
      mouth.current.scale.set(mood === "smug" ? 1.4 : 1, open, 1);
      mouth.current.position.y = mood === "sad" ? -0.32 : -0.26;
    }
    const lid = mood === "smug" ? 0.55 : mood === "sad" ? 0.35 : 0;
    const blink = Math.sin(t * 1.1) > 0.985 ? 1 : 0;
    for (const l of [lidL.current, lidR.current]) if (l) l.scale.y = Math.max(0.01, Math.max(lid, blink));
    const eyeScale = mood === "shock" ? 1.3 : 1;
    for (const p of [pupilL.current, pupilR.current]) if (p) p.scale.setScalar(mood === "shock" ? 0.6 : eyeScale);
    if (antenna.current) {
      const m = antenna.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.5 + Math.sin(t * 6) * 0.8 + (talking ? 1.5 : 0);
    }
    if (hat.current) hat.current.visible = mood === "teach";
  });

  return (
    <group ref={root} scale={scale}>
      <mesh ref={body} castShadow>
        <sphereGeometry args={[0.8, 24, 18]} />
        <meshStandardMaterial color={BODY} roughness={0.35} emissive={BODY} emissiveIntensity={0.25} />
      </mesh>
      {/* belly */}
      <mesh position={[0, -0.18, 0.55]} scale={[0.55, 0.45, 0.3]}>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshStandardMaterial color="#d9c6ff" roughness={0.5} />
      </mesh>
      {/* eyes */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={x} position={[x, 0.22, 0.66]}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh ref={i === 0 ? pupilL : pupilR} position={[0, 0, 0.14]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshStandardMaterial color="#12052e" roughness={0.2} />
          </mesh>
          <mesh ref={i === 0 ? lidL : lidR} position={[0, 0.1, 0.06]} scale={[1, 0.01, 1]}>
            <boxGeometry args={[0.44, 0.24, 0.3]} />
            <meshStandardMaterial color={BODY} />
          </mesh>
        </group>
      ))}
      {/* mouth */}
      <mesh ref={mouth} position={[0, -0.26, 0.72]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#2a0636" />
      </mesh>
      {/* antenna */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.4, 8]} />
        <meshStandardMaterial color="#12052e" />
      </mesh>
      <mesh ref={antenna} position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={2} />
      </mesh>
      {/* feet */}
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, -0.78, 0.15]} scale={[1, 0.5, 1.3]}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshStandardMaterial color="#6a2fd6" />
        </mesh>
      ))}
      {/* teacher hat (Mini Aula) */}
      <group ref={hat} position={[0, 0.9, 0]} rotation={[0.15, 0, -0.12]} visible={false}>
        <mesh>
          <boxGeometry args={[0.9, 0.06, 0.9]} />
          <meshStandardMaterial color="#12052e" />
        </mesh>
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.3, 0.34, 0.26, 12]} />
          <meshStandardMaterial color="#12052e" />
        </mesh>
        <mesh position={[0.38, -0.1, 0.38]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.5} />
        </mesh>
      </group>
    </group>
  );
}
