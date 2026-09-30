/**
 * The Arcade Pop backdrop: gradient sky dome, striped retro sun, scrolling neon grid and a swarm
 * of floating low-poly toys. All procedural (no downloaded assets) for one coherent visual language.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const skyVert = /* glsl */ `
  varying vec3 vPos;
  void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const skyFrag = /* glsl */ `
  varying vec3 vPos;
  uniform float uTime;
  void main() {
    float h = normalize(vPos).y;
    vec3 top = vec3(0.04, 0.01, 0.12);
    vec3 mid = vec3(0.20, 0.05, 0.38);
    vec3 horizon = vec3(0.95, 0.22, 0.56);
    vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.22, h));
    col = mix(col, top, smoothstep(0.2, 0.8, h));
    col = mix(col, vec3(0.05, 0.02, 0.12), smoothstep(0.0, -0.3, h));
    // soft twinkle bands
    col += 0.015 * sin(h * 80.0 + uTime * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const sunFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float y = vUv.y;
    // stripes that widen toward the bottom and scroll
    float stripes = step(0.5, fract(y * 14.0 - uTime * 0.25)) ;
    float cut = y < 0.55 ? stripes : 1.0;
    if (cut < 0.5) discard;
    vec3 col = mix(vec3(1.0, 0.25, 0.55), vec3(1.0, 0.85, 0.25), y);
    gl_FragColor = vec4(col * 1.6, 1.0);
  }
`;
const uvVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const gridFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uColor;
  void main() {
    vec2 g = vec2(vUv.x * 60.0, vUv.y * 60.0 + uTime * uSpeed);
    vec2 f = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(f.x, f.y), 1.0);
    float fade = smoothstep(0.0, 0.55, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y));
    vec3 col = uColor * line * 1.8 + vec3(0.06, 0.02, 0.14);
    gl_FragColor = vec4(col, max(line * fade, 0.0) + 0.0);
  }
`;

export interface WorldProps {
  /** Grid scroll speed (race makes it fly). */
  speed?: number;
  /** Increments trigger a colored burst of the toys. */
  pulse?: number;
  pulseColor?: string;
  lowFx?: boolean;
}

const TOY_COLORS = ["#2de2ff", "#ff3fa4", "#ffd23f", "#8dff4a", "#9b5cff", "#ff8a3d"];

export function ArcadeWorld({ speed = 1, pulse = 0, pulseColor = "#ffd23f", lowFx = false }: WorldProps) {
  const skyMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: { uTime: { value: 0 } }, side: THREE.BackSide, depthWrite: false }), []);
  const sunMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: uvVert, fragmentShader: sunFrag, uniforms: { uTime: { value: 0 } }, transparent: true, depthWrite: false }), []);
  const gridMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: uvVert,
        fragmentShader: gridFrag,
        uniforms: { uTime: { value: 0 }, uSpeed: { value: 1 }, uColor: { value: new THREE.Color("#ff3fa4") } },
        transparent: true,
        depthWrite: false,
        extensions: { derivatives: true } as never,
      }),
    [],
  );

  const toyCount = lowFx ? 14 : 30;
  const toys = useMemo(() => {
    const geos = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1, 0), new THREE.TorusGeometry(0.8, 0.32, 8, 16), new THREE.DodecahedronGeometry(1, 0), new THREE.ConeGeometry(0.9, 1.6, 5)];
    return Array.from({ length: toyCount }, (_, i) => {
      const angle = (i / toyCount) * Math.PI * 2 + Math.random() * 0.4;
      const r = 14 + Math.random() * 16;
      return {
        geo: geos[i % geos.length]!,
        color: TOY_COLORS[i % TOY_COLORS.length]!,
        base: new THREE.Vector3(Math.cos(angle) * r, 1 + Math.random() * 12, -10 - Math.abs(Math.sin(angle)) * r),
        scale: 0.6 + Math.random() * 1.1,
        spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.2),
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [toyCount]);
  const toyRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseState = useRef({ last: pulse, t: 0 });

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    skyMat.uniforms.uTime!.value = t;
    sunMat.uniforms.uTime!.value = t;
    gridMat.uniforms.uTime!.value = t;
    gridMat.uniforms.uSpeed!.value += (speed - gridMat.uniforms.uSpeed!.value) * Math.min(1, dt * 3);
    if (pulse !== pulseState.current.last) {
      pulseState.current.last = pulse;
      pulseState.current.t = 1;
    }
    pulseState.current.t = Math.max(0, pulseState.current.t - dt * 1.6);
    const burst = pulseState.current.t;
    toys.forEach((toy, i) => {
      const m = toyRefs.current[i];
      if (!m) return;
      m.rotation.x += toy.spin.x * dt * (1 + burst * 6);
      m.rotation.y += toy.spin.y * dt * (1 + burst * 6);
      m.position.set(toy.base.x * (1 + burst * 0.15), toy.base.y + Math.sin(t * 0.8 + toy.phase) * 0.8 + burst * 2, toy.base.z);
      const s = toy.scale * (1 + burst * 0.5);
      m.scale.setScalar(s);
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissive.set(burst > 0.05 ? pulseColor : toy.color);
      mat.emissiveIntensity = 0.35 + burst * 1.8;
    });
  });

  return (
    <group>
      <mesh material={skyMat}>
        <sphereGeometry args={[120, 32, 16]} />
      </mesh>
      <mesh material={sunMat} position={[0, 7, -90]}>
        <planeGeometry args={[46, 46]} />
      </mesh>
      <mesh material={gridMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -40]}>
        <planeGeometry args={[240, 120]} />
      </mesh>
      {toys.map((toy, i) => (
        <mesh key={i} ref={(el) => (toyRefs.current[i] = el)} geometry={toy.geo} position={toy.base}>
          <meshStandardMaterial color={toy.color} emissive={toy.color} emissiveIntensity={0.35} flatShading roughness={0.4} />
        </mesh>
      ))}
      <ambientLight intensity={0.55} color="#b9a4ff" />
      <directionalLight position={[6, 12, 8]} intensity={1.4} color="#fff2f8" />
      <pointLight position={[0, 4, 6]} intensity={30} color="#ff3fa4" distance={40} />
    </group>
  );
}
