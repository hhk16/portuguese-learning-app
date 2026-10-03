/** Guarda-roupa on the TV: Ana big in the middle in her look, the pieces named in Portuguese either side. */
import { BOTTOMS, bottomsFor, TOPS } from "../../art/wardrobe.ts";
import type { WardrobeActivity } from "../activities.ts";
import { Picture } from "../../ui/Picture.tsx";

export function WardrobeScreen({ a }: { a: WardrobeActivity }) {
  const top = TOPS.find((t) => t.id === a.top)!;
  const bottom = BOTTOMS.find((b) => b.id === a.bottom)!;
  const who = a.dresser?.name ?? "Ana";
  const bottoms = bottomsFor(a.top);
  return (
    <div className={`tv-overlay wardrobe-screen ${a.rt.moment ? "revealing" : ""}`}>
      <div className="card wardrobe-card left">
        <div className="kicker">Guarda-roupa · Wardrobe</div>
        <h2 className="display">👗 O look da {who}</h2>
        <div className="wardrobe-piece" key={`t${a.seq}-${a.top}`}>
          <small>Em cima · Top</small>
          <span>
            <Picture glyph={top.pic} size="1.6em" /> <b className="display">{top.pt}</b>
          </span>
          <i>{top.en}</i>
        </div>
        <div className="wardrobe-piece" key={`b${a.seq}-${a.bottom}`}>
          <small>Em baixo · Bottom</small>
          <span>
            <Picture glyph={bottom.pic} size="1.6em" /> <b className="display">{bottom.pt}</b>
          </span>
          <i>{bottom.en}</i>
        </div>
        <p className="muted">
          Escolhe no telemóvel · Pick on your phone <i>(TV: ◀ ▶ em cima · ▲ ▼ em baixo · OK = pronto)</i>
        </p>
      </div>
      <div className="card wardrobe-card right">
        <div className="kicker">Em cima · Tops</div>
        <div className="wardrobe-list">
          {TOPS.filter((t) => bottomsFor(t.id).length).map((t) => (
            <span key={t.id} className={`wardrobe-chip ${t.id === a.top ? "on" : ""}`}>
              <Picture glyph={t.pic} size="1.3em" /> {t.pt}
            </span>
          ))}
        </div>
        <div className="kicker">Em baixo · Bottoms</div>
        <div className="wardrobe-list">
          {BOTTOMS.map((b) => (
            <span key={b.id} className={`wardrobe-chip ${b.id === a.bottom ? "on" : ""} ${bottoms.includes(b.id) ? "" : "off"}`}>
              <Picture glyph={b.pic} size="1.3em" /> {b.pt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
