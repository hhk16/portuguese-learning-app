/** A player's face: a portrait of their cartoon character on their colour. */
import { useState } from "react";
import { faceUrl } from "../art/avatars.ts";
import type { Avatar, PlayerColor } from "../shared/protocol.ts";

export function Face({ avatar, color, size = "2.2em", name }: { avatar: Avatar; color: PlayerColor; size?: string; name?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="face" data-color={color} style={{ width: size, height: size, background: "var(--pc)" }} aria-label={name}>
      {failed ? (
        <span style={{ fontFamily: "var(--display)", color: "#fff", fontSize: `calc(${size} * 0.5)` }}>{name?.[0]?.toUpperCase() ?? "?"}</span>
      ) : (
        <img src={faceUrl(avatar)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} draggable={false} />
      )}
    </span>
  );
}

export function PlayerChip({ p, size = "2.2em", extra, off }: { p: { name: string; avatar: Avatar; color: PlayerColor }; size?: string; extra?: React.ReactNode; off?: boolean }) {
  return (
    <span className={`chip ${off ? "off" : ""}`} data-color={p.color}>
      <Face avatar={p.avatar} color={p.color} size={size} name={p.name} />
      {p.name}
      {extra}
    </span>
  );
}
