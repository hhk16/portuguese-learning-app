/**
 * End-to-end playtest: real server + TV (1920×1080) + two phones, driven by fallible bots through
 * the real phone UI. Plays a lesson, then each game picked from the results screen, and saves
 * screenshots (first sighting of every screen/role on TV and phone) to e2e-output/.
 *
 *   npm run build && npm run e2e                      # lesson → secret → wave → sync
 *   E2E_MODES=wave npm run e2e                        # one game only
 *   E2E_MODES=lesson,sync E2E_LESSON=5 npm run e2e    # 6th lesson, then Em Sintonia
 *
 * Also checks pause: Back on the TV mid-game → pause on TV + phones → resume from a phone.
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { chromium, type Page } from "playwright-core";

const PORT = 8799;
const REMOTE = process.env.E2E_BASE;
const BASE = REMOTE ?? `http://localhost:${PORT}`;
const OUT = "e2e-output";
type M = "lesson" | "secret" | "wave" | "sync" | "draw" | "stop" | "kitchen" | "bomb" | "night";
const MODES = (process.env.E2E_MODES ?? "lesson,secret,wave,sync,draw,stop,kitchen,bomb").split(",") as M[];
/** Position of each game in the Jogar menu. */
const MENU_INDEX: Record<string, number> = { secret: 0, wave: 1, sync: 2, draw: 3, stop: 4, kitchen: 5, bomb: 6 };
/** E2E_MODES=night: a whole game night (three games + the Grande Final) from the main menu. */
const NIGHT = MODES[0] === "night";
const LESSON_INDEX = Number(process.env.E2E_LESSON ?? 0);
/** E2E_VIDEO=1 records the TV and both phones (plus a sound log) for scripts/e2e-video.py. */
const VIDEO = !!process.env.E2E_VIDEO;
/** Bot think-time multiplier (videos default to a human-ish pace). */
const PACE = Number(process.env.E2E_PACE ?? (VIDEO ? 2.2 : 1));
const nap = (p: Page, ms: number) => p.waitForTimeout(ms * PACE);
const starts: Record<string, number> = {};
const EXE = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/video`, { recursive: true });

const server = REMOTE ? null : spawn(process.execPath, ["server/index.ts"], { env: { ...process.env, PORT: String(PORT), TOKEN_SIGNING_KEY: "e2e" }, stdio: "inherit" });
if (server) await new Promise((r) => setTimeout(r, 1200));

const proxy = REMOTE && process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({
  executablePath: EXE,
  proxy,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
});
const errors: string[] = [];
const watch = (p: Page, name: string) => {
  p.on("pageerror", (e) => errors.push(`[${name}] ${e.message}`));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("favicon") && errors.push(`[${name}] console: ${m.text()}`));
};

const tvCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ...(VIDEO ? { recordVideo: { dir: `${OUT}/video`, size: { width: 1280, height: 720 } } } : {}) });
const tv = await tvCtx.newPage();
starts.tv = Date.now();
watch(tv, "tv");
await tv.goto(`${BASE}/tv?test=1${VIDEO ? "&clock=1" : ""}`);
await tv.waitForSelector(".room-code", { timeout: 20000 });
const code = (await tv.textContent(".room-code"))!.trim();
console.log("room", code);
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${OUT}/00-tv-title-empty.png` });

type Bot = { page: Page; name: string; skill: number };
async function makePhone(name: string, avatarIdx: number, colorIdx: number, skill: number): Promise<Bot> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, ...(VIDEO ? { recordVideo: { dir: `${OUT}/video`, size: { width: 390, height: 844 } } } : {}) });
  const page = await ctx.newPage();
  starts[name] = Date.now();
  watch(page, name);
  await page.goto(`${BASE}/play?room=${code}${VIDEO ? "&clock=1" : ""}`);
  await page.fill('input[autocomplete="nickname"]', name);
  await page.locator(".avatar-grid button").nth(avatarIdx).click();
  await page.locator(".color-row button").nth(colorIdx).click();
  await page.waitForTimeout(300);
  if (name === "Ana") await page.screenshot({ path: `${OUT}/01-phone-join.png` });
  await page.click('button[type="submit"]');
  return { page, name, skill };
}

// A1 learners: right most of the time, not always.
// E2E_LOSE=1: a rough night — both bots get most things wrong, so the losing screens get seen too.
const LOSE = !!process.env.E2E_LOSE;
const bots = [await makePhone("Hadi", 0, 1, LOSE ? 0.3 : 0.75), await makePhone("Ana", 1, 0, LOSE ? 0.25 : 0.65)];
await tv.waitForTimeout(2000);
await tv.screenshot({ path: `${OUT}/02-tv-title-joined.png` });
await bots[0]!.page.screenshot({ path: `${OUT}/03-phone-remote.png` });

const press = async (key: string, n = 1) => {
  for (let i = 0; i < n; i++) {
    await tv.keyboard.press(key);
    await tv.waitForTimeout(120);
  }
};

// First run on a fresh TV: Ana names the puppy before anything else.
{
  const ana = bots[1]!.page;
  const named = await ana
    .waitForSelector(".pet-ideas .btn", { timeout: 6000 })
    .then(() => true)
    .catch(() => false);
  if (named) {
    await ana.waitForTimeout(1200 * PACE);
    await ana.screenshot({ path: `${OUT}/03-phone-pet-name.png` });
    await ana.locator(".pet-ideas .btn", { hasText: "Bolacha" }).first().click({ timeout: 2500 }).catch(() => {});
    await tv.waitForTimeout(3500 * PACE);
    await tv.screenshot({ path: `${OUT}/03-tv-pet-named.png` });
  }
}

// E2E_MODES=wardrobe: Ana dresses up (Guarda-roupa is the 5th item of the main menu), then the run ends.
if (process.env.E2E_MODES === "wardrobe") {
  await press("ArrowDown", 4);
  await tv.waitForTimeout(400);
  await press("Enter");
  const ana = bots[1]!.page;
  await ana.waitForSelector(".wardrobe-opt", { timeout: 8000 });
  await tv.waitForTimeout(2500 * PACE);
  await tv.screenshot({ path: `${OUT}/w0-tv.png` });
  await ana.screenshot({ path: `${OUT}/w0-phone.png` });
  const picks: [string, string][] = [["top", "a t-shirt branca"], ["bottom", "a saia"], ["top", "a camisa branca"], ["top", "a camisola preta"], ["bottom", "os calções pretos"], ["top", "o casaco de aviador"], ["top", "a t-shirt preta"]];
  for (const [i, [, label]] of picks.entries()) {
    await ana.locator(".wardrobe-opt:not([disabled])", { hasText: label }).first().click({ timeout: 2500 }).catch(() => console.log("not available:", label));
    await tv.waitForTimeout(2600 * PACE);
    await tv.screenshot({ path: `${OUT}/w${i + 1}-tv.png` });
    await ana.screenshot({ path: `${OUT}/w${i + 1}-phone.png` });
  }
  await ana.locator(".btn", { hasText: "Pronto" }).click();
  await tv.waitForTimeout(1500 * PACE);
  if (VIDEO) {
    const sounds = await tv.evaluate(() => (window as unknown as { __ppSoundLog?: unknown[] }).__ppSoundLog ?? []);
    const pages = { tv, Hadi: bots[0]!.page, Ana: bots[1]!.page };
    const end = Date.now();
    for (const pg of Object.values(pages)) await pg.context().close();
    const videos: Record<string, string> = {};
    for (const [k, pg] of Object.entries(pages)) videos[k] = (await pg.video()?.path()) ?? "";
    writeFileSync(`${OUT}/video/meta.json`, JSON.stringify({ modes: MODES, starts, end, videos, sounds }, null, 1));
  }
  console.log(errors.length ? errors.join("\n") : "no page errors");
  console.log("PLAYED wardrobe ✓");
  await browser.close();
  server?.kill();
  process.exit(errors.length ? 1 : 0);
}

// Main menu: Noite de jogos · Aprender juntos · Jogar · Definições
const first = MODES[0]!;
if (first === "night") {
  await tv.screenshot({ path: `${OUT}/04-tv-main-menu.png` });
} else if (first === "lesson") {
  await press("ArrowDown");
  await press("Enter");
  await tv.waitForTimeout(400);
  // Units first (focus starts on the unit of the next lesson), then that unit's lessons.
  await press("Enter");
  await tv.waitForTimeout(400);
  await press("ArrowRight", LESSON_INDEX);
  await tv.screenshot({ path: `${OUT}/04-tv-learn-menu.png` });
} else {
  await press("ArrowDown", 2);
  await press("Enter");
  await tv.waitForTimeout(400);
  await press("ArrowRight", MENU_INDEX[first]);
  await tv.screenshot({ path: `${OUT}/04-tv-play-menu.png` });
}
await press("Enter");

type View = Record<string, unknown> & { mode: string; promptId?: string; roundId?: string; debugAnswer?: Record<string, unknown> };
const viewOf = (b: Bot) => b.page.evaluate(() => JSON.parse(JSON.stringify((window as unknown as { __pp?: { view: unknown } }).__pp?.view ?? null)) as View | null);
const input = (b: Bot, v: View, value: unknown) =>
  b.page.evaluate(
    ({ value, roundId, promptId }) => (window as unknown as { __pp: { conn: { input: (r: string, p: string, v: unknown) => void } } }).__pp.conn.input(roundId, promptId, value),
    { value, roundId: v.roundId!, promptId: v.promptId! },
  );
const click = (pg: Page, sel: string, text?: string | RegExp) =>
  pg
    .locator(sel, text ? { hasText: text } : {})
    .first()
    .click({ timeout: 2500 })
    .then(() => true)
    .catch(() => false);

/** First sighting of each screen gets a screenshot (TV + that phone). */
const shots = new Set<string>();
let shotN = 10;
async function shoot(key: string, b?: Bot) {
  if (shots.has(key)) return;
  shots.add(key);
  const n = String(shotN++).padStart(3, "0");
  await tv.screenshot({ path: `${OUT}/${n}-tv-${key}.png` });
  if (b) await b.page.screenshot({ path: `${OUT}/${n}-phone-${b.name}-${key}.png` });
}

let modeIndex = 0;
let viaMenu: M | null = null;
let allowPick = false;

async function learnStep(b: Bot, v: View, seen: Set<string>) {
  const ex = v.ex as { kind: string; options?: { id: string; label: string }[]; pairs?: { id: string; pt: string; en: string }[] };
  const result = v.result as { ok: boolean } | undefined;
  const key = `learn:${v.promptId}:${result ? "r" : "q"}:${v.waiting ? "w" : ""}`;
  if (seen.has(key) || v.waiting) return;
  seen.add(key);
  const pg = b.page;
  await nap(pg, 400 + Math.random() * 800);
  await shoot(`learn-${ex.kind}${result ? "-result" : ""}`, b);
  if (result) return click(pg, ".learn-sheet .btn", "Continuar");
  if (ex.kind === "intro" || ex.kind === "tip") return click(pg, ".btn", "Percebi");
  const right = Math.random() < b.skill;
  const d = v.debugAnswer as { id?: string; words?: string[] } | undefined;
  switch (ex.kind) {
    case "pairs":
      for (const p of ex.pairs ?? []) {
        await click(pg, ".pairs .col:first-child .pair", p.pt);
        await click(pg, ".pairs .col:last-child .pair", p.en);
      }
      return;
    case "build": {
      const words = right ? (d?.words ?? []) : [...(d?.words ?? [])].reverse();
      for (const w of words) await click(pg, ".build-bank .word:not(.used)", new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
      return click(pg, ".btn", "Verificar");
    }
    case "speak":
      return click(pg, ".row2 .btn", right ? "Disse bem" : "Ainda não");
    case "judge":
      return click(pg, ".row2 .btn", right ? "Sim" : "Ainda não");
    default: {
      const opts = ex.options ?? [];
      const opt = right ? opts.find((o) => o.id === d?.id) : opts.find((o) => o.id !== d?.id);
      if (opt) await click(pg, ".lopt", opt.label);
      return click(pg, ".btn", "Verificar");
    }
  }
}

async function botStep(b: Bot, seen: Set<string>) {
  const v = await viewOf(b);
  if (!v) return;
  const pg = b.page;
  switch (v.mode) {
    case "lobby":
      if (!v.ready && !seen.has(`lobby:${modeIndex}:${resultsSeen}`)) {
        seen.add(`lobby:${modeIndex}:${resultsSeen}`);
        await nap(pg, 700);
        // Hadi sets the difficulty (E2E_LEVEL, default Médio) with ◀ ▶ before getting ready.
        const want = Number(process.env.E2E_LEVEL ?? 2);
        if (b.name === "Hadi" && typeof v.level === "number") {
          for (let l = v.level as number; l !== want; l += want > l ? 1 : -1) {
            await pg.locator(".level-picker .btn").nth(want > l ? 1 : 0).click({ timeout: 2000 }).catch(() => {});
            await nap(pg, 500);
          }
        }
        await shoot(`lobby-${MODES[modeIndex]}`, b);
        await click(pg, ".btn", "Estou pronto");
      }
      return;
    case "pick": {
      const key = `pick:${v.promptId}`;
      // Desenha!'s "melhor desenho" vote: both vote, usually for a drawing that was guessed.
      const gopts = v.options as { id: string; label: string; sub?: string }[];
      if (gopts[0]?.id.startsWith("g") && /melhor desenho/i.test(String(v.title))) {
        if (seen.has(key)) return;
        seen.add(key);
        await nap(pg, 2000 + Math.random() * 2000);
        await shoot("draw-vote", b);
        const good = gopts.filter((o) => o.sub?.includes("✓"));
        const o = (good.length ? good : gopts)[Math.floor(Math.random() * (good.length || gopts.length))]!;
        return click(pg, ".pick-item", o.label);
      }
      if (!allowPick || seen.has(key) || b.name !== "Hadi") return;
      seen.add(key);
      allowPick = false;
      await nap(pg, 1200);
      const opts = v.options as { id: string; label: string }[];
      // Game night: carry on to the next game / the final.
      const want = (NIGHT ? opts.find((o) => o.id.startsWith("night-")) : undefined) ?? opts.find((o) => o.id === MODES[modeIndex]) ?? opts.find((o) => o.id === "menu")!;
      // Results suggest only three games: otherwise go back to the menu and open it from there.
      if (want.id === "menu" && !NIGHT) viaMenu = MODES[modeIndex] ?? null;
      console.log("picked next:", want.id);
      await click(pg, ".pick-item", want.label);
      return;
    }
    case "learn":
      return learnStep(b, v, seen);
    case "petName": {
      // Ana names the puppy (first run on a fresh TV).
      if (seen.has("petName")) return;
      seen.add("petName");
      await nap(pg, 1500);
      await shoot("pet-name", b);
      return click(pg, ".pet-ideas .btn", "Bolacha");
    }
    case "secret": {
      // The clue-giver bets how many their partner will find.
      if (v.role === "watch" && v.clue && v.bet === undefined && !seen.has(`bet:${v.promptId}`)) {
        seen.add(`bet:${v.promptId}`);
        await nap(pg, 1200);
        return pg.locator(".side-bet .btn").nth(1 + Math.floor(Math.random() * 2)).click({ timeout: 2000 }).catch(() => {});
      }
      const key = `secret:${v.promptId}:${v.role}:${v.found}`;
      if (seen.has(key)) return;
      seen.add(key);
      await nap(pg, 600 + Math.random() * 900);
      await shoot(`secret-${v.role}`, b);
      const d = v.debugAnswer as { cardId?: string; targets?: number; clueWord?: string } | undefined;
      if (v.role === "clue") {
        // Pick the best clue word chip, then how many pictures it covers.
        const words = (v.clueWords as { pt: string }[] | undefined) ?? [];
        const wi = Math.max(0, words.findIndex((w) => w.pt === d?.clueWord));
        await pg.locator(".clue-words .bank-word").nth(wi).click({ timeout: 2500 }).catch(() => {});
        await nap(pg, 700);
        await shoot("secret-clue-picked", b);
        const n = Math.max(1, Math.min(3, d?.targets ?? 1));
        return click(pg, ".row3 .btn", String(n));
      }
      if (v.role === "guess") {
        const cards = v.cards as { id: string; state: string }[];
        const right = Math.random() < b.skill;
        const hidden = cards.filter((c) => c.state === "hidden" && c.id !== d?.cardId);
        const id = right && d?.cardId ? d.cardId : hidden[Math.floor(Math.random() * hidden.length)]?.id;
        const i = cards.findIndex((c) => c.id === id);
        if (i >= 0) await pg.locator(".secret-grid .scard").nth(i).click({ timeout: 2500 }).catch(() => {});
      }
      return;
    }
    case "dial": {
      // The psychic's side bet while the partner turns the dial.
      if (v.role === "psychic" && v.phase === "guess" && !v.locked && !v.psychicBet && !seen.has(`bet:${v.promptId}`)) {
        seen.add(`bet:${v.promptId}`);
        await nap(pg, 1500);
        return pg.locator(".side-bet .btn").nth(Math.floor(Math.random() * 3)).click({ timeout: 2000 }).catch(() => {});
      }
      const key = `dial:${v.promptId}:${v.role}:${v.phase}`;
      if (seen.has(key)) return;
      if (v.phase === "reveal") {
        if (b.name !== "Hadi") return;
        seen.add(key);
        await nap(pg, 2500);
        await shoot("wave-reveal", b);
        // Retry on the next view if the click missed (e.g. the pause check was up).
        if (!(await click(pg, ".btn", "Próximo"))) seen.delete(key);
        return;
      }
      if (v.role === "psychic" && v.phase === "clue") {
        seen.add(key);
        await nap(pg, 1800);
        await shoot("wave-psychic", b);
        // Pick the thing that sits nearest the target (a human's judgement, with the odd lapse).
        const { target, ats } = v.debugAnswer as { target: number; ats: number[] };
        const near = ats.reduce((best, at, k) => (Math.abs(at - target) < Math.abs(ats[best]! - target) ? k : best), 0);
        const i = Math.random() < b.skill ? near : Math.floor(Math.random() * ats.length);
        return pg.locator(".clue-words .bank-word").nth(i).click({ timeout: 2500 }).catch(() => {});
      }
      if (v.role === "guess" && v.phase === "guess") {
        seen.add(key);
        const target = (v.debugAnswer as { target: number }).target;
        const aim = Math.max(0, Math.min(100, Math.round(target + (Math.random() - 0.5) * (Math.random() < b.skill ? 12 : 40))));
        // Turn the dial in a few steps so the TV shows it moving.
        const from = v.value as number;
        for (let s = 1; s <= 6; s++) {
          await input(b, v, { mode: "dial", action: { a: "move", value: Math.round(from + ((aim - from) * s) / 6) } });
          await nap(pg, 250);
        }
        const sure = Math.random() < b.skill * 0.4;
        if (sure) await click(pg, ".btn", "Tenho a certeza");
        await nap(pg, 500);
        await shoot("wave-guess", b);
        await input(b, v, { mode: "dial", action: { a: "lock", sure } });
      }
      return;
    }
    case "final": {
      const key = `final:${v.promptId}`;
      if (v.answered || seen.has(key)) return;
      seen.add(key);
      // Race: whoever "knows" it answers after a human-ish pause; sometimes a wrong pick.
      // The lesson's lightning round gives 6 s a word: real players tap within a couple of seconds.
      if (v.label) await pg.waitForTimeout(900 + Math.random() * 1600);
      else await nap(pg, 1200 + Math.random() * 2600);
      await shoot(`final-${v.kind}${v.options ? "" : "-typed"}`, b);
      const answer = (v.debugAnswer as { answer: string }).answer;
      // Lightning-round words were just taught in the lesson: a little easier than the Final.
      const right = Math.random() < b.skill + (v.label ? 0.15 : 0);
      const opts = (v.options as { pt: string }[] | undefined) ?? [];
      if (opts.length) {
        const pick = right ? opts.find((o) => o.pt === answer) : opts.find((o) => o.pt !== answer);
        const i = opts.indexOf(pick ?? opts[0]!);
        return pg.locator(v.pictures ? ".final-pics .final-pic" : ".draw-options .lopt").nth(i).click({ timeout: 2500 }).catch(() => {});
      }
      await pg.fill(".sync-form input", right ? answer.replace(/^(o|a) /, "") : "casa").catch(() => {});
      return click(pg, ".sync-form .btn");
    }
    case "draw":
      return drawStep(b, v, seen);
    case "bomb":
      return bombStep(b, v, seen);
    case "stop":
      return stopStep(b, v, seen);
    case "kitchen":
      return kitchenStep(b, v);
    case "sync": {
      if (v.sense) {
        const key = `sync:${v.promptId}:sense`;
        if ((v.sense as { voted?: boolean }).voted || seen.has(key)) return;
        seen.add(key);
        await nap(pg, 1500);
        await shoot("sync-sense", b);
        return click(pg, ".btn", Math.random() < 0.8 ? "Sim" : "Não");
      }
      const key = `sync:${v.promptId}`;
      // Locked in: "Vamos coincidir?"
      if (v.submitted && v.predicted === undefined && !v.sense && !seen.has(`${key}:predict`)) {
        seen.add(`${key}:predict`);
        await nap(pg, 900);
        return click(pg, ".side-bet .btn", Math.random() < 0.6 ? "Sim" : "Não");
      }
      if (v.submitted || seen.has(key)) return;
      seen.add(key);
      await nap(pg, 800 + Math.random() * 1500);
      const bank = v.bank as { pt: string }[];
      const d = v.debugAnswer as { word?: string } | undefined;
      // Ana often thinks of something else on the first try (then both see each other's words).
      const miss = LOSE ? Math.random() < 0.7 : b.name === "Ana" && Math.random() < (v.attempt === 1 ? 0.45 : 1 - b.skill);
      const others = bank.filter((w) => w.pt !== d?.word);
      // A miss is a random other word (two bots missing the same way would "match" by accident).
      const word = miss ? (others[Math.floor(Math.random() * others.length)]?.pt ?? "casa") : (d?.word ?? bank[0]?.pt ?? "casa");
      await pg.fill(".sync-form input", word).catch(() => {});
      await shoot("sync-write", b);
      return click(pg, ".sync-form .btn");
    }
  }
}

const cooldown = new Map<string, number>();

async function drawStep(b: Bot, v: View, seen: Set<string>) {
  const pg = b.page;
  if (v.role === "draw") {
    // The drawer steers with 🔥 quente / ❄️ frio once guesses come in.
    const guesses = (v.guesses as string[] | undefined) ?? [];
    if (guesses.length && !seen.has(`warm:${v.promptId}:${guesses.length}`)) {
      seen.add(`warm:${v.promptId}:${guesses.length}`);
      await nap(pg, 700);
      return click(pg, ".warm-row .btn", Math.random() < 0.5 ? "Frio" : "Quente");
    }
    const key = `draw:${v.promptId}:d`;
    if (seen.has(key)) return;
    seen.add(key);
    // A few strokes: a wobbly circle and a line, sent through the real protocol in pieces.
    const s0 = Math.floor(Math.random() * 1000);
    for (let s = 0; s < 3; s++) {
      const pts: number[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = (i / 24) * Math.PI * 2;
        const r = 180 + s * 90 + Math.sin(t * 5) * 20;
        pts.push(Math.round(500 + Math.cos(t) * r), Math.round(500 + Math.sin(t) * r * 0.8));
      }
      for (let seg = 0; seg < 3; seg++) {
        await input(b, v, { mode: "draw", action: { a: "stroke", s: s0 + s, seg, c: s % 5, w: 2, pts: pts.slice(seg * 16, seg * 16 + 20) } });
        await nap(pg, 90);
      }
    }
    await shoot("draw-drawer", b);
    return;
  }
  const key = `draw:${v.promptId}:g`;
  if (seen.has(key)) return;
  seen.add(key);
  // Type a wrong guess first (it pops up on the TV) unless skilled, then the word (sometimes without the article).
  const d = v.debugAnswer as { id: string; pt: string };
  await nap(pg, 3000 + Math.random() * 2500);
  await shoot("draw-guesser", b);
  const typeIt = async (text: string) => {
    for (const ch of text) {
      await pg.locator(".sync-form input").press(ch === " " ? "Space" : ch).catch(() => {});
      await pg.waitForTimeout(60 * PACE);
    }
    await nap(pg, 400);
    await click(pg, ".sync-form .btn");
  };
  if (Math.random() > b.skill) {
    await typeIt(["bola", "casa", "gato", "sol", "carro"][Math.floor(Math.random() * 5)]!);
    await nap(pg, 2500);
  }
  const word = d.pt.split(" · ")[0]!;
  await typeIt(Math.random() < 0.5 ? word.replace(/^(o|a) /, "") : word);
}

async function stopStep(b: Bot, v: View, seen: Set<string>) {
  const pg = b.page;
  if (v.phase === "vote") {
    const key = `stop:${v.promptId}:vote`;
    if (seen.has(key)) return;
    seen.add(key);
    await nap(pg, 1500);
    await shoot("stop-vote", b);
    // Votes default to ✗ (only an explicit ✓ counts): accept most words, reject the odd one.
    const rows = await pg.locator(".vote-row").count();
    for (let r = 0; r < rows; r++) {
      const row = pg.locator(".vote-row").nth(r);
      // A real partner rejects the made-up words ("…arabalho"), accepts the rest.
      const text = (await row.textContent().catch(() => "")) ?? "";
      if (!/arabalho/i.test(text)) await row.locator(".vbtn").first().click({ timeout: 1500 }).catch(() => {});
      await nap(pg, 250);
    }
    return click(pg, ".btn", "Confirmar");
  }
  const key = `stop:${v.promptId}:write`;
  if (seen.has(key)) return;
  seen.add(key);
  const d = (v.debugAnswer ?? {}) as Record<string, string>;
  const cats = v.categories as { id: string }[];
  await nap(pg, b.name === "Hadi" ? 1500 : 4000);
  for (let i = 0; i < cats.length; i++) {
    const known = d[cats[i]!.id] ?? "";
    // Sometimes a word the dictionary doesn't know (partner votes), sometimes a blank.
    const r = Math.random();
    const word = r < 0.12 ? "" : r < 0.3 ? `${String(v.letter).toLowerCase()}arabalho` : known;
    await pg.locator(".stop-field input").nth(i).fill(word).catch(() => {});
    await nap(pg, 700 + Math.random() * 900);
  }
  await shoot("stop-write", b);
  if (b.name === "Hadi") {
    for (let i = 0; i < cats.length; i++) {
      const el = pg.locator(".stop-field input").nth(i);
      if (!(await el.inputValue().catch(() => "x"))) await el.fill(`${String(v.letter).toLowerCase()}ola`).catch(() => {});
    }
    await nap(pg, 600);
    await click(pg, ".btn", "STOP!");
  }
}

async function bombStep(b: Bot, v: View, seen: Set<string>) {
  const pg = b.page;
  if (!v.holding) {
    // "Aquece!": the safe player answers their own question (usually right) to burn the fuse.
    const steal = v.steal as { options: { pt: string }[]; lockedMs?: number; typed?: boolean } | undefined;
    const key = `bomb:steal:${v.promptId}`;
    if (!steal || steal.lockedMs || seen.has(key)) return;
    seen.add(key);
    await nap(pg, 900 + Math.random() * 1500);
    await shoot(steal.typed ? "bomb-safe-typed" : "bomb-safe", b);
    const want = (v.debugAnswer as { steal?: string } | undefined)?.steal;
    if (steal.typed) {
      // Typing it: usually right (sometimes without the article or an accent), sometimes a miss.
      const typed = Math.random() < b.skill ? (want ?? "").replace(/^(o|a|os|as) /, "") : "casa";
      await pg.fill(".bomb-safe .sync-form input", typed).catch(() => {});
      return click(pg, ".bomb-safe .sync-form .btn");
    }
    const pick = Math.random() < b.skill ? steal.options.find((o) => o.pt === want) : steal.options.find((o) => o.pt !== want);
    const i = steal.options.indexOf(pick ?? steal.options[0]!);
    if (i >= 0) await pg.locator(".bomb-safe .draw-options .lopt").nth(i).click({ timeout: 2500 }).catch(() => {});
    return;
  }
  const key = `bomb:${v.promptId}:${v.lockedMs ? "l" : ""}`;
  if (seen.has(key) || v.lockedMs) return;
  seen.add(key);
  // A human-ish pause, then usually the right answer.
  await nap(pg, 700 + Math.random() * 1500);
  await shoot(`bomb-${v.kind}`, b);
  const answer = (v.debugAnswer as { answer?: string } | undefined)?.answer;
  const opts = (v.options as { pt: string }[] | undefined) ?? [];
  const right = Math.random() < b.skill + 0.1;
  const pick = right ? opts.find((o) => o.pt === answer) : opts.find((o) => o.pt !== answer);
  const i = opts.indexOf(pick ?? opts[0]!);
  if (i >= 0) await pg.locator(v.pictures ? ".final-pics .final-pic" : ".draw-options .lopt").nth(i).click({ timeout: 2500 }).catch(() => {});
}

const tipsAnswered = new Set<string>();

async function kitchenStep(b: Bot, v: View) {
  const pg = b.page;
  const now = Date.now();
  if ((cooldown.get(b.name) ?? 0) > now) return;
  cooldown.set(b.name, now + (700 + Math.random() * 600) * PACE);
  await shoot(`kitchen-${b.name}`, b);
  const d = v.debugAnswer as { add: string[]; wrongTray: boolean; serve: boolean; table?: number; tip?: string };
  const pantry = v.pantry as { id: string; pt: string }[];
  // "Gorjeta!": type the dish (usually right; sometimes without the article, sometimes wrong).
  if (v.tip && d.tip && !tipsAnswered.has(`${b.name}:${v.served}`)) {
    tipsAnswered.add(`${b.name}:${v.served}`);
    await nap(pg, 1800 + Math.random() * 2500);
    const r = Math.random();
    const text = r < b.skill - 0.15 ? d.tip : r < b.skill + 0.1 ? d.tip.replace(/^(o|a) /, "") : "o queijo";
    await pg.fill(".tip-card input", text).catch(() => {});
    await shoot("kitchen-tip", b);
    return click(pg, ".tip-card .btn", "OK");
  }
  // Listening levels: now and then ask to hear an order again (it costs patience).
  if (Array.isArray(v.replay) && v.replay.length && Math.random() < 0.06) return click(pg, ".replay-row .btn");
  if (d.serve) return v.tables ? click(pg, ".serve-tables .btn", `Mesa ${d.table}`) : click(pg, ".btn", "Servir");
  if (d.wrongTray) return click(pg, ".btn", "Deitar fora");
  const want = Math.random() < 0.08 ? pantry.find((x) => !d.add.includes(x.id)) : pantry.find((x) => d.add.includes(x.id));
  if (want) await click(pg, ".pantry-item", new RegExp(`^.?${want.pt}$`));
}

async function checkPause() {
  await tv.keyboard.press("Escape");
  await tv.waitForTimeout(900);
  if (!(await tv.$(".pause-screen"))) errors.push("[e2e] TV pause overlay did not appear");
  const modes = await Promise.all(bots.map(async (b) => (await viewOf(b))?.mode));
  if (modes.some((m) => m !== "paused")) errors.push(`[e2e] phones not paused: ${modes.join(",")}`);
  await tv.screenshot({ path: `${OUT}/050-tv-paused.png` });
  await bots[0]!.page.screenshot({ path: `${OUT}/051-phone-paused.png` });
  await click(bots[1]!.page, ".btn", "Continuar");
  await tv.waitForTimeout(900);
  if (await tv.$(".pause-screen")) errors.push("[e2e] resume from the phone did not close the pause overlay");
  console.log("pause/resume checked");
}

const seen = bots.map(() => new Set<string>());
const start = Date.now();
const LIMIT = 260_000 * (NIGHT ? 5 : MODES.length) * (VIDEO ? 2 : 1);
let inResults = false;
/** Results screens so far (a game night has several lobbies in one run). */
let resultsSeen = 0;
let finished = false;
let pauseChecked = false;
let gameStart = 0;
let periodic = 0;

while (Date.now() - start < LIMIT) {
  await Promise.all(bots.map((b, i) => botStep(b, seen[i]!)));
  const screen = await tv.evaluate(() => (document.querySelector(".results-screen") ? "results" : document.querySelector(".game-screen") ? "game" : "other"));
  if (screen === "game" && !gameStart) gameStart = Date.now();
  // The puppy's spotlight must never cover what's being celebrated (cards, chips, captions, avatars' faces).
  const covered = await tv.evaluate(() => {
    const star = document.querySelector(".pet-star");
    if (!star) return null;
    const r = star.getBoundingClientRect();
    return [...document.querySelectorAll(".sb-card, .sync-chip, .best-caption, .rush-said, .big-moment, .stop-final-row, .kitchen-tray, .bomb-verdict")]
      .filter((el) => {
        const b = el.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;
      })
      .map((el) => el.className.split(" ")[0]);
  });
  if (covered && !shots.has(`pet-star-${MODES[modeIndex]}`)) {
    await tv.waitForTimeout(500); // past the pop-in
    await shoot(`pet-star-${MODES[modeIndex]}`);
  }
  if (covered?.length) {
    console.log(`OVERLAP: the puppy's spotlight covers ${[...new Set(covered)].join(", ")}`);
    await shoot(`overlap-${covered[0]}`);
  }
  if (!VIDEO && !pauseChecked && gameStart && Date.now() - gameStart > 12_000) {
    pauseChecked = true;
    await checkPause();
  }
  if (screen === "results" && !inResults) {
    inResults = true;
    await tv.waitForTimeout(2500);
    await shoot(`results-${MODES[modeIndex]}`, bots[0]);
    const kicker = (await tv.textContent(".results-card .kicker"))?.trim() ?? "";
    // Layout check: nothing on the results card may spill out of it.
    const spill = await tv.evaluate(() => {
      const card = document.querySelector(".results-card")?.getBoundingClientRect();
      if (!card) return [];
      return [...document.querySelectorAll(".results-card, .results-card *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          // Spills past the card, or is itself cut (content taller than its box).
          const clips = getComputedStyle(el).overflowY !== "visible";
          return r.height > 0 && (r.bottom > card.bottom + 2 || r.right > card.right + 2 || (clips && el !== document.querySelector(".results-card") && el.scrollHeight > el.clientHeight + 2));
        })
        .map((el) => el.className || el.tagName)
        .slice(0, 5);
    });
    if (spill.length) console.log(`LAYOUT: results card overflow (${spill.join(", ")})`);
    resultsSeen++;
    console.log(`results after ${NIGHT ? kicker : MODES[modeIndex]}: ${(await tv.textContent(".results-card h1"))?.trim()} · ${((await tv.textContent(".results-card > p.muted").catch(() => "")) ?? "").trim().slice(0, 160)}`);
    if (NIGHT) {
      if (kicker.startsWith("Fim da noite")) {
        await tv.waitForTimeout(6000 * PACE);
        finished = true;
        break;
      }
    } else modeIndex++;
    if (modeIndex >= MODES.length) {
      finished = true;
      break;
    }
    allowPick = true;
  }
  if (screen !== "results") inResults = false;
  if (viaMenu && (await tv.$(".title-screen"))) {
    const m = viaMenu;
    viaMenu = null;
    await tv.waitForTimeout(600);
    if (m === "lesson") {
      await press("ArrowDown");
      await press("Enter");
      await tv.waitForTimeout(300);
      await press("Enter");
    } else {
      await press("ArrowDown", 2);
      await press("Enter");
      await tv.waitForTimeout(300);
      await press("ArrowRight", MENU_INDEX[m]);
    }
    await press("Enter");
  }
  if (Date.now() - start > periodic * 6000) {
    await tv.screenshot({ path: `${OUT}/t${String(periodic).padStart(3, "0")}.png` });
    periodic++;
  }
  await tv.waitForTimeout(150);
}

if (VIDEO) {
  await tv.waitForTimeout(3000); // let the results screen breathe
  const sounds = await tv.evaluate(() => (window as unknown as { __ppSoundLog?: unknown[] }).__ppSoundLog ?? []);
  const pages = { tv, Hadi: bots[0]!.page, Ana: bots[1]!.page };
  const end = Date.now();
  for (const pg of Object.values(pages)) await pg.context().close();
  const videos: Record<string, string> = {};
  for (const [k, pg] of Object.entries(pages)) videos[k] = (await pg.video()?.path()) ?? "";
  writeFileSync(`${OUT}/video/meta.json`, JSON.stringify({ modes: MODES, starts, end, videos, sounds }, null, 1));
  console.log(`video: ${Object.keys(videos).length} recordings, ${sounds.length} sounds → ${OUT}/video/meta.json`);
}
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
console.log(finished ? `PLAYED ${MODES.join(" → ")} ✓` : `did NOT finish (stopped in ${MODES[modeIndex]}) ✗`);
await browser.close();
server?.kill();
process.exit(finished && errors.length === 0 ? 0 : 1);
