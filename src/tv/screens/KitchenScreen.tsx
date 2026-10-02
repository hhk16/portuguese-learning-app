/** Cozinha Caótica on the TV: order tickets with patience bars, the shared tray, the clock. */
import { dishWord, HEARTS, SHIFT_MS, TARGETS, type Cozinha } from "../../games/kitchen/kitchen.ts";
import { DISHES, orderSentence } from "../../games/kitchen/menu.ts";
import { Picture } from "../../ui/Picture.tsx";
import { gameNow } from "../clock.ts";
import { DoNow, GameTop } from "./Menus.tsx";
import { ScorePill } from "./ScorePill.tsx";
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
        {a.rush && (
          <span className="pill double-pill">
            🔥 Hora de ponta! ×2 <i>Rush hour</i>
          </span>
        )}
        <ScorePill score={a.score} max={TARGETS[a.level]} meta={!a.inPractice} />
      </GameTop>
      {a.phase === "shift" ? (
        <DoNow pt="Ouçam o pedido e sirvam!" en="Listen, tap the food, then Servir" phone />
      ) : (
        <DoNow tone="calm" pt="Fim do turno!" en="The shift is over" />
      )}
      {a.tip && (
        <div className={`card kitchen-tip ${a.tip.result ? (a.tip.result.ok ? "ok" : "miss") : ""}`}>
          <Picture glyph={DISHES[a.tip.dish]!.pic} size="2em" />
          {!a.tip.result ? (
            <span>
              <b className="display">💶 Gorjeta! {a.tip.name}, como se diz?</b>
              <i>Tip: {a.tip.name}, type its name in Portuguese</i>
            </span>
          ) : (
            <span>
              <b className="display">
                {a.tip.result.ok ? `✓ ${dishWord(a.tip.dish).pt} +${a.tip.bonus}` : `✗ ${dishWord(a.tip.dish).pt}`}
              </b>
              <i>{a.tip.result.wrote ? `${a.tip.name} escreveu “${a.tip.result.wrote}”` : "Sem resposta · no answer"}</i>
            </span>
          )}
        </div>
      )}
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
              {t.phone && t.phone.wrote === undefined ? (
                <div className="ticket-text phone">
                  <span>📞 {t.phone.name} escreve o pedido…</span>
                  <i>{t.phone.name} is writing the order</i>
                </div>
              ) : t.phone?.wrote ? (
                <div className="ticket-text phone-wrote">
                  <span>📞 “{t.phone.wrote}”</span>
                  <span className="phone-marks">
                    {t.phone.marks?.map((m) => (
                      <b key={m.want} className={m.ok ? "ok" : "miss"}>
                        {m.ok ? "✓" : "✗"} {m.want}
                      </b>
                    ))}
                    {t.phone.polite && <b className="ok">✓ educado</b>}
                  </span>
                  {t.phone.marks?.some((m) => !m.ok) && <i className="phone-model">✓ {orderSentence(t.order.items)}</i>}
                </div>
              ) : a.ticketShows(t).text ? (
                <div className="ticket-text">“{t.order.text}”</div>
              ) : (
                <div className="ticket-text listen">
                  🔊 <span>{a.itemCount(t) === 1 ? "1 item" : `${a.itemCount(t)} itens`}</span>
                  <i>{a.rules.show === "audio" ? "Listen! Replay on a phone (−3 s)" : "Listen!"}</i>
                </div>
              )}
              {a.ticketShows(t).pictures && (
                <div className="ticket-items">
                  {a.lines(t.order).map((l) => (
                    <span key={l.dish.id} className={`ticket-item ${l.n === 0 ? "without" : ""}`}>
                      <Picture glyph={l.dish.pic} size="2.4em" />
                      <b>{l.n === 0 ? "🚫" : `×${l.n}`}</b>
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
          {tray.length === 0 && <span className="muted">vazio · empty</span>}
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
