/**
 * The TV stage (three.js via react-three-fiber): the toy-world backdrop, the players' cartoon
 * characters standing in it, and confetti. Orthographic camera in CSS pixels, so the DOM overlay
 * and the scene share one coordinate system.
 *
 * Characters react to the game: idle bob, cheer (jump), oops (wobble), think (sway), wave.
 * During games they stand in the bottom corners so the question card owns the centre.
 */
import { useFrame, useLoader, useThree, Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { poseUrl, type Pose } from "../../art/avatars.ts";
import { lookUrl } from "../../art/wardrobe.ts";
import type { Avatar } from "../../shared/protocol.ts";
import { useRuntime, type Emote, type RuntimePlayer, type TvRuntime } from "../runtime.ts";

const POSES: Pose[] = ["stand", "wave", "cheer", "oops", "think"];
const EMOTE_POSE: Record<Emote, Pose> = { idle: "stand", wave: "wave", cheer: "cheer", sad: "oops", think: "think" };

function useTex(url: string): THREE.Texture {
  const t = useLoader(THREE.TextureLoader, url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** One themed set per game (public/art/sets), the meadow for menus. */
const SETS = ["menu", "learn", "secret", "wave", "sync", "draw", "stop", "kitchen", "final", "bomb"] as const;
type SetId = (typeof SETS)[number];
const setUrl = (id: SetId) => (id === "menu" ? "/art/backdrop.webp" : `/art/sets/${id}.webp`);

/** Which set an activity plays in (lobby and results use their game's set). */
export function setOf(a: { id: string } | null | undefined): SetId {
  if (!a || a.id === "title") return "menu";
  if (a.id === "champion") return "final";
  const spec = (a as { spec?: { mode?: string } }).spec ?? (a as { info?: { spec?: { mode?: string } } }).info?.spec;
  const mode = a.id === "lobby" || a.id === "results" ? (spec?.mode ?? "menu") : a.id;
  if (mode === "lesson" || mode === "learn") return "learn";
  return (SETS as readonly string[]).includes(mode) ? (mode as SetId) : "menu";
}

function Backdrop({ set }: { set: SetId }) {
  const textures = SETS.map((id) => useTex(setUrl(id))); // eslint-disable-line react-hooks/rules-of-hooks
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const top = useRef<THREE.MeshBasicMaterial>(null);
  const under = useRef<THREE.MeshBasicMaterial>(null);
  // Crossfade: the previous set stays underneath while the new one fades in on top.
  const fade = useRef({ current: set, prev: set, t: 1 });
  if (fade.current.current !== set) fade.current = { current: set, prev: fade.current.current, t: 0 };
  // Cover the viewport (3:2 art), with a little overscan for the drift.
  const aspect = 1536 / 1024;
  const w = Math.max(size.width, size.height * aspect) * 1.06;
  const h = w / aspect;
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.position.x = Math.sin(t * 0.05) * size.width * 0.012;
      group.current.position.y = Math.cos(t * 0.04) * size.height * 0.006;
    }
    const f = fade.current;
    f.t = Math.min(1, f.t + dt / 0.9);
    if (top.current) {
      const tex = textures[SETS.indexOf(f.current)]!;
      if (top.current.map !== tex) {
        top.current.map = tex;
        top.current.needsUpdate = true;
      }
      top.current.opacity = f.t;
    }
    if (under.current) {
      const tex = textures[SETS.indexOf(f.prev)]!;
      if (under.current.map !== tex) {
        under.current.map = tex;
        under.current.needsUpdate = true;
      }
    }
  });
  return (
    <group ref={group}>
      <mesh position={[0, 0, -11]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={under} map={textures[SETS.indexOf(set)]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={top} map={textures[SETS.indexOf(set)]} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}

/** Soft oval shadow under a character. */
const shadowTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 16, 2, 64, 16, 62);
  grad.addColorStop(0, "rgba(31,42,68,0.45)");
  grad.addColorStop(1, "rgba(31,42,68,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 32);
  const t = new THREE.CanvasTexture(c);
  return t;
})();

/** The star of the night's crown: flies from `from` (world px) onto the head, then sits there. */
type CrownFrom = { x: number; y: number } | null;

function Character({ rt, p, x, y, height, flip, crown = null }: { rt: TvRuntime; p: RuntimePlayer; x: number; y: number; height: number; flip: boolean; crown?: CrownFrom }) {
  // Ana's character wears the look she picked in the wardrobe.
  const look = p.avatar === "ana" ? rt.settings.look : undefined;
  const textures = POSES.map((pose) => useTex(lookUrl(look, pose) ?? poseUrl(p.avatar as Avatar, pose))); // eslint-disable-line react-hooks/rules-of-hooks
  const crownTex = useTex("/art/pet/crown.webp");
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const crownMesh = useRef<THREE.Mesh>(null);
  const crownAnim = useRef<{ t0: number; from: { x: number; y: number } } | null>(null);
  if (crown && !crownAnim.current) crownAnim.current = { t0: -1, from: crown };
  if (!crown && crownAnim.current) crownAnim.current = null;
  const seed = useMemo(() => Math.random() * 10, []);
  const pos = useRef({ x, y, h: height });
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + seed;
    const emote = rt.emoteOf(p.playerId);
    const pose = EMOTE_POSE[emote];
    const tex = textures[POSES.indexOf(pose)]!;
    if (mat.current && mat.current.map !== tex) {
      mat.current.map = tex;
      mat.current.needsUpdate = true;
    }
    // Glide to the target spot.
    pos.current.x += (x - pos.current.x) * Math.min(1, dt * 4);
    pos.current.y += (y - pos.current.y) * Math.min(1, dt * 4);
    pos.current.h += (height - pos.current.h) * Math.min(1, dt * 3);
    const hh = pos.current.h;
    const img = tex.image as { width: number; height: number } | undefined;
    const w = img ? (hh * img.width) / img.height : hh * 0.5;
    if (!group.current || !body.current) return;
    let dy = Math.sin(t * 2.2) * hh * 0.008;
    let rot = 0;
    let sx = 1;
    let sy = 1 + Math.sin(t * 2.2) * 0.008;
    if (emote === "cheer") {
      const j = Math.abs(Math.sin(t * 6));
      dy = j * hh * 0.08;
      sy = 1 + (1 - j) * 0.03;
      sx = 1 - (1 - j) * 0.02;
    } else if (emote === "sad") rot = Math.sin(t * 16) * 0.035;
    else if (emote === "think") rot = Math.sin(t * 1.5) * 0.04;
    else if (emote === "wave") rot = Math.sin(t * 3) * 0.02;
    group.current.position.set(pos.current.x, pos.current.y, 0);
    body.current.scale.set(w * sx * (flip ? -1 : 1), hh * sy, 1);
    body.current.position.set(0, hh / 2 + dy, 0);
    body.current.rotation.z = rot;
    const cm = crownMesh.current;
    const ca = crownAnim.current;
    if (cm) {
      cm.visible = !!ca;
      if (ca) {
        if (ca.t0 < 0) ca.t0 = clock.elapsedTime;
        // Arc from the puppy's mouth to the top of the head, with a spin, then a gentle bob.
        const k = Math.min(1, (clock.elapsedTime - ca.t0) / 1.3);
        const e = 1 - Math.pow(1 - k, 3);
        const headX = 0;
        const headY = hh * sy * 0.985 + dy + hh * 0.03;
        const fx = ca.from.x - pos.current.x;
        const fy = ca.from.y - pos.current.y;
        const cw = hh * 0.2;
        cm.position.set(fx + (headX - fx) * e, fy + (headY - fy) * e + Math.sin(k * Math.PI) * hh * 0.35, 0.3);
        cm.rotation.z = (1 - e) * Math.PI * 2 + (k >= 1 ? Math.sin(clock.elapsedTime * 3) * 0.05 : 0);
        const sc = 0.5 + 0.5 * e;
        cm.scale.set(cw * sc, cw * sc * (300 / 386), 1);
      }
    }
  });
  return (
    <group ref={group}>
      {shadowTex && (
        <mesh position={[0, 2, -0.5]} scale={[height * 0.42, height * 0.1, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      <mesh ref={body}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={mat} map={textures[0]} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
      <mesh ref={crownMesh} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={crownTex} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* The puppy: sits next to Ana and reacts to whatever is happening.            */
/* -------------------------------------------------------------------------- */

const PET_POSES = ["idle", "cheer", "oops", "think", "wave", "sleep", "hide", "sniff", "crown"] as const;
type PetPose = (typeof PET_POSES)[number];
/** Lying and curled-up poses are shorter than sitting ones. */
const PET_HEIGHT: Record<PetPose, number> = { idle: 1, cheer: 1.05, oops: 0.55, think: 1, wave: 1.08, sleep: 0.72, hide: 0.9, sniff: 0.85, crown: 0.95 };

/** A little name tag under the puppy (canvas texture). */
function useNameTag(name: string | undefined): { tex: THREE.CanvasTexture; aspect: number } | null {
  return useMemo(() => {
    if (!name || typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    const g = c.getContext("2d")!;
    // A system font: a web font still loading would be measured narrower than it draws.
    const font = "800 44px system-ui, sans-serif";
    g.font = font;
    const tw = Math.ceil(g.measureText(name).width);
    c.width = tw + 64;
    c.height = 68;
    g.font = font;
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.beginPath();
    g.roundRect(2, 2, c.width - 4, c.height - 4, 32);
    g.fill();
    g.strokeStyle = "#f2994a";
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = "#1f2a44";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(name, c.width / 2, c.height / 2 + 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { tex, aspect: c.width / c.height };
  }, [name]);
}

function Pet({ rt, x, y, height, flip, force }: { rt: TvRuntime; x: number; y: number; height: number; flip: boolean; force?: PetPose }) {
  const textures = PET_POSES.map((p) => useTex(`/art/pet/pup-${p}.webp`)); // eslint-disable-line react-hooks/rules-of-hooks
  const tag = useNameTag(rt.settings.petName);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const pos = useRef({ x, y, h: height });
  const joy = useRef({ seen: rt.petJoy, until: 0, confetti: rt.confetti });
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const now = performance.now();
    // Excited when named, when someone sends ❤️, and with every confetti burst.
    if (rt.petJoy !== joy.current.seen || rt.confetti !== joy.current.confetti) {
      joy.current = { seen: rt.petJoy, confetti: rt.confetti, until: now + 2600 };
    }
    const emotes = rt.activePlayers.map((p) => rt.emoteOf(p.playerId));
    const owner = rt.petOwner();
    const sleepy = now - rt.lastInputAt > 45_000 && (rt.activity?.id === "title" || rt.activity?.id === "lobby" || rt.paused);
    const act = rt.petAct && now < rt.petAct.until ? rt.petAct.pose : null;
    const pose: PetPose = force
      ? force
      : act
        ? act
        : now < joy.current.until || emotes.includes("cheer")
        ? "cheer"
        : emotes.includes("sad")
          ? "oops"
          : emotes.includes("think")
            ? "think"
            : owner && rt.emoteOf(owner.playerId) === "wave"
              ? "wave"
              : sleepy
                ? "sleep"
                : "idle";
    const tex = textures[PET_POSES.indexOf(pose)]!;
    if (mat.current && mat.current.map !== tex) {
      mat.current.map = tex;
      mat.current.needsUpdate = true;
    }
    // Its big moments are drawn over the game (PetStar, in the DOM); here it stays by its person.
    pos.current.x += (x - pos.current.x) * Math.min(1, dt * 3);
    pos.current.y += (y - pos.current.y) * Math.min(1, dt * 3);
    pos.current.h += (height - pos.current.h) * Math.min(1, dt * 3);
    const h = pos.current.h * PET_HEIGHT[pose];
    const img = tex.image as { width: number; height: number } | undefined;
    const w = img ? (h * img.width) / img.height : h;
    if (!group.current || !body.current) return;
    let dy = 0;
    let rot = 0;
    let sx = 1;
    let sy = 1;
    if (pose === "cheer") {
      // Bouncy hops.
      const j = Math.abs(Math.sin(t * 7));
      dy = j * h * 0.22;
      sy = 1 + (1 - j) * 0.06;
      sx = 1 - (1 - j) * 0.04;
      rot = Math.sin(t * 7) * 0.08;
    } else if (pose === "oops") {
      rot = Math.sin(t * 14) * 0.03;
      sy = 0.97;
    } else if (pose === "think") rot = Math.sin(t * 1.2) * 0.1;
    else if (pose === "hide") {
      // Trembling.
      rot = Math.sin(t * 40) * 0.025;
      sx = 1 + Math.sin(t * 33) * 0.015;
    } else if (pose === "sniff") {
      rot = Math.sin(t * 3) * 0.04;
      dy = Math.abs(Math.sin(t * 9)) * h * 0.02;
    } else if (pose === "crown") {
      // Proud trot.
      dy = Math.abs(Math.sin(t * 8)) * h * 0.06;
      rot = Math.sin(t * 8) * 0.04;
    } else if (pose === "wave") rot = Math.sin(t * 5) * 0.06;
    else if (pose === "sleep") sy = 1 + Math.sin(t * 1.4) * 0.03;
    else {
      // Idle: breathing, and a little hop every few seconds.
      sy = 1 + Math.sin(t * 2.6) * 0.015;
      const k = (t % 4.5) / 4.5;
      if (k > 0.9) dy = Math.sin(((k - 0.9) / 0.1) * Math.PI) * h * 0.08;
    }
    group.current.position.set(pos.current.x, pos.current.y, 0.5);
    body.current.scale.set(w * sx * (flip ? -1 : 1), h * sy, 1);
    body.current.position.set(0, (h * sy) / 2 + dy, 0);
    body.current.rotation.z = rot;
  });
  return (
    <group ref={group}>
      {shadowTex && (
        <mesh position={[0, 2, -0.5]} scale={[height * 0.7, height * 0.14, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      <mesh ref={body}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={mat} map={textures[0]} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
      {tag && (
        <mesh position={[0, height * 1.2, 0.2]} scale={[height * 0.25 * tag.aspect, height * 0.25, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tag.tex} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

const CONFETTI_COLORS = ["#ff6b6b", "#4ba3f5", "#3ecf95", "#ffc23d", "#ffffff", "#ff9fb2"];

function Confetti({ burst, count }: { burst: number; count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { size } = useThree();
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number }[]>([]);
  const alive = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    if (!burst) return;
    parts.current = Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * size.width * 0.9,
      y: size.height / 2 + Math.random() * size.height * 0.3,
      vx: (Math.random() - 0.5) * 120,
      vy: -(150 + Math.random() * 250),
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 8,
      s: 8 + (i % 5) * 2,
    }));
    alive.current = 4.5;
    if (mesh.current) {
      for (let i = 0; i < count; i++) mesh.current.setColorAt(i, new THREE.Color(CONFETTI_COLORS[i % CONFETTI_COLORS.length]));
      if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    }
  }, [burst, count, size.width, size.height]);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    alive.current = Math.max(0, alive.current - dt);
    mesh.current.visible = alive.current > 0;
    if (!mesh.current.visible) return;
    parts.current.forEach((p, i) => {
      p.vy -= 40 * dt;
      p.x += (p.vx + Math.sin(p.r * 2) * 40) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      dummy.position.set(p.x, p.y, 5);
      dummy.rotation.set(p.r, p.r * 0.7, p.r * 0.3);
      dummy.scale.set(p.s, p.s * 0.55, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} visible={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  );
}

/** Where characters stand for each activity (in CSS px relative to the screen centre). */
function layout(activityId: string | undefined, n: number, w: number, h: number, star = -1): { x: number; y: number; height: number }[] {
  if (activityId === "wardrobe") {
    // The wardrobe: whoever is dressing up stands big in the middle; the others watch from the side.
    let k = 0;
    return Array.from({ length: n }, (_, i) => (i === star ? { x: 0, y: -h * 0.5 + h * 0.03, height: h * 0.78 } : { x: (k++ % 2 === 0 ? 1 : -1) * w * 0.38, y: -h * 0.5 + h * 0.03, height: h * 0.42 }));
  }
  const onStage = activityId === "title" || activityId === "lobby" || activityId === "results" || activityId === "champion";
  if (activityId === "champion") {
    // The crowning: players stand either side of the podium, big — and the star walks to centre stage for the crown.
    const height = h * 0.46;
    return Array.from({ length: n }, (_, i) =>
      i === star ? { x: 0, y: -h * 0.5 + h * 0.02, height: h * 0.56 } : { x: (i % 2 === 0 ? -1 : 1) * (w * 0.36 + Math.floor(i / 2) * height * 0.4), y: -h * 0.5 + h * 0.03, height },
    );
  }
  if (onStage) {
    const height = h * 0.42;
    const gap = Math.min(w * 0.14, height * 0.62);
    const cx = activityId === "title" ? w * 0.26 : activityId === "results" ? -w * 0.3 : activityId === "champion" ? 0 : w * 0.24;
    return Array.from({ length: n }, (_, i) => ({ x: cx + (i - (n - 1) / 2) * gap, y: -h * 0.5 + h * 0.06, height }));
  }
  const height = h * 0.34;
  return Array.from({ length: n }, (_, i) => {
    const left = i % 2 === 0;
    const k = Math.floor(i / 2);
    return { x: (left ? -1 : 1) * (w * 0.5 - height * 0.28 - k * height * 0.4), y: -h * 0.5 + h * 0.01, height };
  });
}

function Scene() {
  const rt = useRuntime();
  const { size } = useThree();
  const players = rt.activePlayers;
  // The crowning: the star of the night (not on a tie) takes centre stage while the crown drops.
  const champ = rt.activity?.id === "champion" ? (rt.activity as unknown as { stage: number; tie: boolean; standings: { p: RuntimePlayer }[] }) : null;
  const dresser = rt.activity?.id === "wardrobe" ? (rt.activity as unknown as { dresser?: RuntimePlayer }).dresser : undefined;
  const star = dresser ? players.indexOf(dresser) : champ && champ.stage === 1 && !champ.tie ? players.indexOf(champ.standings[0]!.p) : -1;
  const spots = layout(rt.activity?.id, players.length, size.width, size.height, star);
  // The puppy brings the crown: it trots to centre stage during the drumroll and the crown flies to the star's head.
  const crowned = champ && champ.stage >= 1 && !champ.tie ? players.indexOf(champ.standings[0]!.p) : -1;
  const petCarry = champ && !champ.tie && champ.stage === 0 && !!rt.petOwner();
  const carrySpot = { x: size.height * 0.27, y: -size.height * 0.5 + size.height * 0.02 };
  const crownFrom = { x: carrySpot.x, y: carrySpot.y + size.height * 0.1 };
  return (
    <>
      <Backdrop set={setOf(rt.activity)} />
      {players.map((p, i) => (
        <Suspense key={p.playerId} fallback={null}>
          <Character
            rt={rt}
            p={p}
            x={spots[i]!.x}
            y={spots[i]!.y}
            height={spots[i]!.height}
            flip={!["title", "lobby", "results", "wardrobe"].includes(rt.activity?.id ?? "") && i % 2 === 1}
            crown={i === crowned ? crownFrom : null}
          />
        </Suspense>
      ))}
      {(() => {
        // The puppy sits next to its person, on the side towards the middle of the screen.
        const owner = rt.petOwner();
        const i = owner ? players.indexOf(owner) : -1;
        const spot = spots[i];
        if (!spot) return null;
        // In games (players in the corners) it sits on the inner side; on menu stages, on the outer side.
        const id = rt.activity?.id;
        const onStage = id === "title" || id === "lobby" || id === "results";
        const centre = spots.reduce((sum, p) => sum + p.x, 0) / Math.max(1, spots.length);
        const side = id === "wardrobe" ? -1 : onStage ? (spot.x >= centre ? 1 : -1) : spot.x > 0 ? -1 : 1;
        const h = spot.height * 0.42;
        // Results: the card fills the right of the screen, so the puppy sits close in, just before it.
        if (id === "results") {
          const right = Math.max(...spots.map((s) => s.x));
          return (
            <Suspense fallback={null}>
              <Pet rt={rt} x={right + spot.height * 0.26} y={spot.y} height={h} flip={false} />
            </Suspense>
          );
        }
        if (champ && !champ.tie && (champ.stage === 0 || champ.stage === 1)) {
          // Centre stage, next to where the star will stand: crown in its mouth, then hopping for joy.
          return (
            <Suspense fallback={null}>
              <Pet rt={rt} x={carrySpot.x} y={carrySpot.y} height={size.height * 0.2} flip={false} force={petCarry ? "crown" : "cheer"} />
            </Suspense>
          );
        }
        return (
          <Suspense fallback={null}>
            <Pet rt={rt} x={spot.x + side * spot.height * 0.4} y={spot.y} height={h} flip={side < 0} />
          </Suspense>
        );
      })()}
      <Confetti burst={rt.confetti} count={rt.settings.lowFx ? 60 : 160} />
    </>
  );
}

export function Stage() {
  return (
    <Canvas orthographic dpr={[1, 1.5]} camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }} gl={{ antialias: true, alpha: false }} style={{ position: "absolute", inset: 0 }}>
      <color attach="background" args={["#bfe6ff"]} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
