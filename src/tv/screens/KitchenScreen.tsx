/** Cozinha Caótica on the TV: order tickets with patience bars, the shared tray, the clock. */
import { HEARTS, SHIFT_MS, type Cozinha } from "../../games/kitchen/kitchen.ts";
import { Picture } from "../../ui/Picture.tsx";
import { gameNow } from "../clock.ts";
import { GameTop } from "./Menus.tsx";
import { useTick } from "./useTick.ts";

const CUSTOMERS = ["👩", "👨", "👵", "👴", "🧑", "👧", "👦", "👱"];

export function KitchenScreen({ a }: { a: Cozinha }) {
  useTick(200, a.phase === "shift");
  if (a.players.length < 2)
    return (
      <div className="tv-overlay game-screen centered">
        <GameTop title="Cozinha Caótica" pic="🧑‍🍳" />
        <div className="card stage-card center">
          <h2 className="display">Este jogo precisa de duas pessoas</h2>
          <p>This game needs two players.</p>
        </div>
      </div>
    );
  const now = gameNow();
  const left = a.msLeft;
  const mm = Math.floor(left / 60000);
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  const flash = a.flash && now - a.flash.at < 1600 ? a.flash : null;
  const tray = a.trayList();
  return (
    <div className="tv-overlay game-screen centered">
      <GameTop title={`Cozinha Caótica · ${a.menu.name}`} pic="🧑‍🍳">
        {!a.inPractice && (
          <span className={`pill clock ${left < 20_000 ? "low" : ""}`}>
            ⏱ {mm}:{ss}
          </span>
        )}
        <span className="pill hearts" aria-label={`${a.hearts} corações`}>
          {Array.from({ length: HEARTS }, (_, i) => (
            <span key={i} className={i < a.hearts ? "on" : ""}>
              ♥
            </span>
          ))}
        </span>
        <span className="pill star-pill">{a.score} pontos</span>
      </GameTop>
      <div className="kitchen-tickets">
        {a.tickets.map((t, i) => {
          const total = t.deadline - t.arrived;
          const p = t.done ? 0 : Math.max(0, (t.deadline - now) / total);
          return (
            <div key={t.id} className={`card ticket ${t.done ?? ""} ${i === 0 && !t.done ? "first" : ""}`}>
              {/* The customer waiting at the table: happy → impatient → cross. */}
              <div className={`customer ${t.done === "served" ? "happy" : t.done === "left" ? "gone" : p < 0.3 ? "cross" : ""}`}>
                <Picture glyph={CUSTOMERS[t.id.charCodeAt(0) % CUSTOMERS.length]} size="2.6em" />
                <span className="mood">{t.done === "served" ? "😋" : t.done === "left" ? "😤" : p > 0.6 ? "🙂" : p > 0.3 ? "😐" : "😠"}</span>
              </div>
              <div className="ticket-no display">
                {a.rules.tables ? `Mesa ${t.table}` : `#${i + 1}`}
                {t.done === "served" && t.points ? <b className="ticket-pts">+{t.points}</b> : null}
              </div>
              {a.ticketShows(t).text ? (
                <div className="ticket-text">“{t.order.text}”</div>
              ) : (
                <div className="ticket-text listen">
                  🔊 <span>{a.itemCount(t) === 1 ? "1 item" : `${a.itemCount(t)} itens`}</span>
                  <i>{a.itemCount(t) === 1 ? "1 item" : `${a.itemCount(t)} items`} — listen! {a.rules.show === "audio" ? "Replay on your phone to see it (−3 s)" : ""}</i>
                </div>
              )}
              {a.ticketShows(t).pictures && (
                <div className="ticket-items">
                  {a.lines(t.order).map((l) => (
                    <span key={l.dish.id} className="ticket-item">
                      <Picture glyph={l.dish.pic} size="2.4em" />
                      <b>×{l.n}</b>
                    </span>
                  ))}
                </div>
              )}
              {!t.done && (
                <div className="patience">
                  <div style={{ width: `${p * 100}%` }} className={p < 0.3 ? "low" : p < 0.6 ? "mid" : ""} />
                </div>
              )}
              {t.done === "served" && <div className="ticket-stamp ok display">Servido! ✓</div>}
              {t.done === "left" && <div className="ticket-stamp bad display">Foi-se embora…</div>}
            </div>
          );
        })}
      </div>
      <div className={`card kitchen-tray ${flash?.kind === "wrong" ? "wrong" : ""} ${flash?.kind === "served" ? "served" : ""}`} key={flash?.seq ?? 0}>
        <span className="kicker">Tabuleiro · Tray</span>
        <div className="tray-items">
          {tray.length === 0 && <span className="muted">vazio — toquem na comida no telemóvel · empty: tap the food on your phones</span>}
          {tray.map(({ dish, n }) => (
            <span key={dish.id} className="tray-item">
              <Picture glyph={dish.pic} size="2.8em" />
              <b>×{n}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="kitchen-clock">
        <div style={{ width: `${(left / SHIFT_MS) * 100}%` }} />
      </div>
      {a.rush && <div className="rush-banner display">🔥 Hora de ponta! ×2 <i>Rush hour!</i></div>}
      {flash?.kind === "swap" && (
        <div className="kitchen-swap display">
          Troca! 🔄 <i>Swap pantries!</i>
        </div>
      )}
      {flash?.kind === "wrong" && (
        <div className="kitchen-swap bad display">
          Não é isso! <i>Not that!</i>
        </div>
      )}
    </div>
  );
}
