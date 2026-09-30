/** 3D versions of the player avatars, built from primitives so they match the SVG creatures. */
import type { Avatar, PlayerColor } from "../../shared/protocol.ts";
import { COLOR_HEX } from "../../ui/Avatar.tsx";

function Eyes({ y = 0.1, z = 0.42, spread = 0.18 }: { y?: number; z?: number; spread?: number }) {
  return (
    <>
      {[-spread, spread].map((x) => (
        <group key={x} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[0.11, 12, 10]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial color="#12052e" />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function AvatarMesh({ kind, color, scale = 1 }: { kind: Avatar; color: PlayerColor; scale?: number }) {
  const c = COLOR_HEX[color];
  const mat = <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.35} />;
  let head: React.ReactNode;
  switch (kind) {
    case "bot":
    case "robo":
      head = (
        <>
          <mesh>
            <boxGeometry args={[0.8, 0.72, 0.72]} />
            {mat}
          </mesh>
          {kind === "bot" ? (
            <>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
                <meshStandardMaterial color="#12052e" />
              </mesh>
              <mesh position={[0, 0.68, 0]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={2} />
              </mesh>
              <Eyes y={0.05} z={0.37} />
            </>
          ) : (
            <mesh position={[0, 0.06, 0.37]}>
              <boxGeometry args={[0.6, 0.18, 0.04]} />
              <meshStandardMaterial color="#ff3fa4" emissive="#ff3fa4" emissiveIntensity={2} />
            </mesh>
          )}
        </>
      );
      break;
    case "cat":
      head = (
        <>
          <mesh>
            <sphereGeometry args={[0.45, 16, 12]} />
            {mat}
          </mesh>
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, 0.42, 0]} rotation={[0, 0, x < 0 ? 0.3 : -0.3]}>
              <coneGeometry args={[0.14, 0.3, 4]} />
              {mat}
            </mesh>
          ))}
          <Eyes />
        </>
      );
      break;
    case "ghost":
      head = (
        <>
          <mesh>
            <capsuleGeometry args={[0.38, 0.35, 6, 12]} />
            {mat}
          </mesh>
          <Eyes y={0.18} z={0.35} />
        </>
      );
      break;
    case "alien":
      head = (
        <>
          <mesh scale={[1, 0.9, 0.9]}>
            <sphereGeometry args={[0.46, 16, 12]} />
            {mat}
          </mesh>
          {[-0.18, 0.18].map((x) => (
            <mesh key={x} position={[x, 0.05, 0.36]} rotation={[0, 0, x < 0 ? -0.4 : 0.4]} scale={[0.7, 1, 0.4]}>
              <sphereGeometry args={[0.14, 10, 8]} />
              <meshStandardMaterial color="#12052e" />
            </mesh>
          ))}
        </>
      );
      break;
    default:
      head = (
        <>
          <mesh scale={[1, 0.9, 1]}>
            <sphereGeometry args={[0.46, 16, 12]} />
            {mat}
          </mesh>
          <Eyes />
        </>
      );
  }
  return <group scale={scale}>{head}</group>;
}
