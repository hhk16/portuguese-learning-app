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
import { mkdirSync, rmSync } from "node:fs";
import { chromium, type Page } from "playwright-core";

const PORT = 8799;
const REMOTE = process.env.E2E_BASE;
const BASE = REMOTE ?? `http://localhost:${PORT}`;
const OUT = "e2e-output";
const MODES = (process.env.E2E_MODES ?? "lesson,secret,wave,sync").split(",") as ("lesson" | "secret" | "wave" | "sync")[];
const LESSON_INDEX = Number(process.env.E2E_LESSON ?? 0);
const EXE = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

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

const tvCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const tv = await tvCtx.newPage();
watch(tv, "tv");
await tv.goto(`${BASE}/tv?test=1`);
await tv.waitForSelector(".room-code", { timeout: 20000 });
const code = (await tv.textContent(".room-code"))!.trim();
console.log("room", code);
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${OUT}/00-tv-title-empty.png` });

type Bot = { page: Page; name: string; skill: number };
async function makePhone(name: string, avatarIdx: number, colorIdx: number, skill: number): Promise<Bot> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  watch(page, name);
  await page.goto(`${BASE}/play?room=${code}`);
  await page.fill('input[autocomplete="nickname"]', name);
  await page.locator(".avatar-grid button").nth(avatarIdx).click();
  await page.locator(".color-row button").nth(colorIdx).click();
  await page.waitForTimeout(300);
  if (name === "Ana") await page.screenshot({ path: `${OUT}/01-phone-join.png` });
  await page.click('button[type="submit"]');
  return { page, name, skill };
}

const bots = [await makePhone("Hadi", 0, 1, 0.85), await makePhone("Ana", 1, 0, 0.75)];
await tv.waitForTimeout(2000);
await tv.screenshot({ path: `${OUT}/02-tv-title-joined.png` });
await bots[0]!.page.screenshot({ path: `${OUT}/03-phone-remote.png` });

const press = async (key: string, n = 1) => {
  for (let i = 0; i < n; i++) {
    await tv.keyboard.press(key);
    await tv.waitForTimeout(120);
  }
};

// Main menu: Aprender juntos · Jogar · Definições
const first = MODES[0]!;
if (first === "lesson") {
  await press("Enter");
  await tv.waitForTimeout(400);
  await press("Home"); // no-op; focus starts on the next lesson (the first on a fresh TV)
  await press("ArrowRight", LESSON_INDEX);
  await tv.screenshot({ path: `${OUT}/04-tv-learn-menu.png` });
} else {
  await press("ArrowDown");
  await press("Enter");
  await tv.waitForTimeout(400);
  await press("ArrowRight", { secret: 0, wave: 1, sync: 2 }[first]);
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
    .catch(() => {});

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
let allowPick = false;

async function learnStep(b: Bot, v: View, seen: Set<string>) {
  const ex = v.ex as { kind: string; options?: { id: string; label: string }[]; pairs?: { id: string; pt: string; en: string }[] };
  const result = v.result as { ok: boolean } | undefined;
  const key = `learn:${v.promptId}:${result ? "r" : "q"}:${v.waiting ? "w" : ""}`;
  if (seen.has(key) || v.waiting) return;
  seen.add(key);
  const pg = b.page;
  await pg.waitForTimeout(400 + Math.random() * 800);
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
      if (!v.ready && !seen.has(`lobby:${modeIndex}`)) {
        seen.add(`lobby:${modeIndex}`);
        await pg.waitForTimeout(700);
        await shoot(`lobby-${MODES[modeIndex]}`, b);
        await click(pg, ".btn", "Estou pronto");
      }
      return;
    case "pick": {
      const key = `pick:${v.promptId}`;
      if (!allowPick || seen.has(key) || b.name !== "Hadi") return;
      seen.add(key);
      allowPick = false;
      await pg.waitForTimeout(1200);
      const opts = v.options as { id: string; label: string }[];
      const want = opts.find((o) => o.id === MODES[modeIndex]) ?? opts.find((o) => o.id === "menu")!;
      console.log("picked next:", want.id);
      await click(pg, ".pick-item", want.label);
      return;
    }
    case "learn":
      return learnStep(b, v, seen);
    case "secret": {
      const key = `secret:${v.promptId}:${v.role}`;
      if (seen.has(key)) return;
      seen.add(key);
      await pg.waitForTimeout(600 + Math.random() * 900);
      await shoot(`secret-${v.role}`, b);
      const d = v.debugAnswer as { cardId?: string; targets?: number } | undefined;
      if (v.role === "clue") {
        const n = Math.max(1, Math.min(2, d?.targets ?? 1));
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
      const key = `dial:${v.promptId}:${v.role}:${v.phase}`;
      if (seen.has(key)) return;
      if (v.phase === "reveal") {
        if (b.name !== "Hadi") return;
        seen.add(key);
        await pg.waitForTimeout(2500);
        await shoot("wave-reveal", b);
        return click(pg, ".btn", "Próximo");
      }
      if (v.role === "psychic" && v.phase === "clue") {
        seen.add(key);
        await pg.waitForTimeout(1200);
        await shoot("wave-psychic", b);
        return click(pg, ".btn", "Já disse a pista");
      }
      if (v.role === "guess" && v.phase === "guess") {
        seen.add(key);
        const target = (v.debugAnswer as { target: number }).target;
        const aim = Math.max(0, Math.min(100, Math.round(target + (Math.random() - 0.5) * (Math.random() < b.skill ? 12 : 40))));
        // Turn the dial in a few steps so the TV shows it moving.
        const from = v.value as number;
        for (let s = 1; s <= 6; s++) {
          await input(b, v, { mode: "dial", action: { a: "move", value: Math.round(from + ((aim - from) * s) / 6) } });
          await pg.waitForTimeout(250);
        }
        await shoot("wave-guess", b);
        await input(b, v, { mode: "dial", action: { a: "lock" } });
      }
      return;
    }
    case "sync": {
      const key = `sync:${v.promptId}`;
      if (v.submitted || seen.has(key)) return;
      seen.add(key);
      await pg.waitForTimeout(800 + Math.random() * 1500);
      const bank = v.bank as { pt: string }[];
      const d = v.debugAnswer as { word?: string } | undefined;
      const word = b.name === "Ana" && Math.random() > b.skill ? (bank[1]?.pt ?? "casa") : (d?.word ?? bank[0]?.pt ?? "casa");
      await pg.fill(".sync-form input", word).catch(() => {});
      await shoot("sync-write", b);
      return click(pg, ".sync-form .btn");
    }
  }
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
const LIMIT = 150_000 * MODES.length;
let inResults = false;
let finished = false;
let pauseChecked = false;
let gameStart = 0;
let periodic = 0;

while (Date.now() - start < LIMIT) {
  await Promise.all(bots.map((b, i) => botStep(b, seen[i]!)));
  const screen = await tv.evaluate(() => (document.querySelector(".results-screen") ? "results" : document.querySelector(".game-screen") ? "game" : "other"));
  if (screen === "game" && !gameStart) gameStart = Date.now();
  if (!pauseChecked && gameStart && Date.now() - gameStart > 12_000) {
    pauseChecked = true;
    await checkPause();
  }
  if (screen === "results" && !inResults) {
    inResults = true;
    await tv.waitForTimeout(2500);
    await shoot(`results-${MODES[modeIndex]}`, bots[0]);
    console.log(`results after ${MODES[modeIndex]}: ${(await tv.textContent(".results-card h1"))?.trim()}`);
    modeIndex++;
    if (modeIndex >= MODES.length) {
      finished = true;
      break;
    }
    allowPick = true;
  }
  if (screen !== "results") inResults = false;
  if (Date.now() - start > periodic * 6000) {
    await tv.screenshot({ path: `${OUT}/t${String(periodic).padStart(3, "0")}.png` });
    periodic++;
  }
  await tv.waitForTimeout(150);
}

console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
console.log(finished ? `PLAYED ${MODES.join(" → ")} ✓` : `did NOT finish (stopped in ${MODES[modeIndex]}) ✗`);
await browser.close();
server?.kill();
process.exit(finished && errors.length === 0 ? 0 : 1);
