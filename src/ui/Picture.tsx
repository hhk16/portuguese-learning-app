/**
 * A vocabulary picture: Microsoft Fluent 3D art (or a round flag) for an emoji glyph, so every
 * device shows the same polished image. Numbers render as big type. Falls back to the glyph.
 */
import { useState } from "react";
import { pictureUrl } from "../art/pictures.ts";

export function Picture({ glyph, size = "3em", alt = "" }: { glyph?: string; size?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  if (!glyph) return null;
  if (/^\d{1,4}$/.test(glyph)) {
    return (
      <span className="pic-number" style={{ width: size, height: size }} aria-label={alt || glyph}>
        <span style={{ fontSize: `calc(${size} * ${glyph.length > 2 ? 0.42 : 0.62})` }}>{glyph}</span>
      </span>
    );
  }
  const url = failed ? null : pictureUrl(glyph);
  if (!url)
    return (
      <span className="pic-glyph" style={{ width: size, height: size }} aria-label={alt}>
        <span style={{ fontSize: `calc(${size} * 0.8)` }}>{glyph}</span>
      </span>
    );
  return <img className="pic-img" src={url} alt={alt} width={256} height={256} style={{ width: size, height: size }} onError={() => setFailed(true)} draggable={false} />;
}
