/**
 * End-to-end playtest: real server + TV (1920×1080) + two phone contexts, driven by bots.
 * Plays a full Party Night (lobby → Micro Loucura → Mini Aula → Turbo Race → results) and saves
 * screenshots (and a TV video) to e2e-output/ for visual review.
 *
 *   npm run build && npm run e2e            # full party night
 *   E2E_MODE=race npm run e2e               # one mode only (micro | race | snap | dizme | lesson)
 *   E2E_MODE=lesson E2E_LESSON=3 E2E_NEXT=dizme npm run e2e  # 4th lesson, then Diz-me! with its words
 *
 * Also checks pause: Back on the TV mid-game → pause menu on TV and phones → change speed → resume.
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { chromium, type Page } from "playwright-core";

const PORT = 8799;
/** E2E_BASE=https://… runs against a deployed server instead of spawning one. */
const REMOTE = process.env.E2E_BASE;
const BASE = REMOTE ?? `http://localhost:${PORT}`;
const OUT = "e2e-output";
const MODE = (process.env.E2E_MODE ?? "party") as "party" | "micro" | "race" | "lesson" | "snap" | "dizme";
const LESSON_INDEX = Number(process.env.E2E_LESSON ?? 0);
/** After a lesson: which game to pick on the results screen (from a phone). */
const NEXT = process.env.E2E_NEXT ?? "dizme";
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
  p.on("console", (m) => m.type() === "error" && errors.push(`[${name}] console: ${m.text()}`));
};

const tvCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: `${OUT}/video`, size: { width: 1280, height: 720 } } });
const tv = await tvCtx.newPage();
watch(tv, "tv");
await tv.goto(`${BASE}/tv?test=1`);
await tv.waitForSelector(".room-code", { timeout: 20000 });
const code = (await tv.textContent(".room-code"))!.trim();
console.log("room", code);
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${OUT}/01-tv-title.png` });

type Bot = { page: Page; name: string; skill: number };
async function makePhone(name: string, avatarIdx: number, colorIdx: number, skill: number): Promise<Bot> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  watch(page, name);
  await page.goto(`${BASE}/play?room=${code}`);
  await page.fill('input[autocomplete="nickname"]', name);
  await page.locator(".avatar-grid button").nth(avatarIdx).click();
  await page.locator(".color-row button").nth(colorIdx).click();
  if (name === "Hadi") await page.screenshot({ path: `${OUT}/02-phone-join.png` });
  await page.click('button[type="submit"]');
  return { page, name, skill };
}

const bots = [await makePhone("Hadi", 1, 0, 0.85), await makePhone("Ana", 2, 1, 0.65)];
await tv.waitForTimeout(1500);
await tv.screenshot({ path: `${OUT}/03-tv-title-joined.png` });
await bots[0]!.page.screenshot({ path: `${OUT}/04-phone-remote.png` });

// Choose the mode on the TV with the keyboard (D-pad equivalent).
// Main menu: Aprender · Noite de Festa · Jogos (Diz-me! · Apanha! · Micro Loucura · Turbo Corrida) · Definições
const press = async (key: string, n = 1) => {
  for (let i = 0; i < n; i++) await tv.keyboard.press(key);
};
if (MODE === "lesson") {
  await press("Enter"); // Aprender (focus starts on the next lesson)
  await tv.waitForTimeout(400);
  await press("ArrowDown", LESSON_INDEX);
  await tv.screenshot({ path: `${OUT}/04b-tv-aprender.png` });
} else if (MODE === "party") {
  await press("ArrowDown");
} else {
  await press("ArrowDown", 2);
  await press("Enter"); // Jogos
  await tv.waitForTimeout(300);
  await press("ArrowDown", { dizme: 0, snap: 1, micro: 2, race: 3 }[MODE]);
}
await press("Enter");
await tv.waitForTimeout(1200);
await tv.screenshot({ path: `${OUT}/05-tv-lobby.png` });
// Tests run at Turbo to keep them short (Calma is the default for people).
await press("ArrowRight", process.env.E2E_SPEED === "calma" ? 0 : 2);
for (const b of bots) await b.page.click("text=ESTOU PRONTO!");
await tv.waitForTimeout(800);
await tv.screenshot({ path: `${OUT}/06-tv-lobby-ready.png` });
await bots[1]!.page.screenshot({ path: `${OUT}/07-phone-ready.png` });

type LearnV = {
  promptId: string;
  ex: { kind: string; options?: { id: string; label: string }[]; bank?: { id: string; text: string }[]; pairs?: { id: string; pt: string; en: string }[] };
  result?: unknown;
  debugAnswer?: { t: string; id?: string; words?: string[] };
};
let pickedNext = "";
let allowPick = false;
let learnShots = 0;

/** Aprender: play through the real phone UI (select → VERIFICAR → CONTINUAR). */
async function learnStep(b: Bot, v: LearnV, seen: Set<string>) {
  const key = `learn:${v.promptId}:${v.result ? "r" : "q"}`;
  if (seen.has(key)) return;
  seen.add(key);
  const pg = b.page;
  await pg.waitForTimeout(500 + Math.random() * 900);
  if (b.name === "Hadi" && learnShots < 14 && Math.random() < 0.6) await pg.screenshot({ path: `${OUT}/L${String(learnShots++).padStart(2, "0")}-phone-${v.ex.kind}${v.result ? "-result" : ""}.png` });
  const click = (sel: string, text?: string) => pg.locator(sel, text ? { hasText: text } : {}).first().click({ timeout: 2000 }).catch(() => {});
  if (v.result || v.ex.kind === "intro") return click(".bbtn", "CONTINUAR");
  if (v.ex.kind === "tip") return click(".bbtn", "PERCEBI");
  const right = Math.random() < b.skill;
  const d = v.debugAnswer;
  switch (v.ex.kind) {
    case "pairs":
      for (const p of v.ex.pairs ?? []) {
        await pg.locator(".pairs .col:first-child .pair", { hasText: p.pt }).first().click({ timeout: 2000 }).catch(() => {});
        await pg.locator(".pairs .col:last-child .pair", { hasText: p.en }).first().click({ timeout: 2000 }).catch(() => {});
      }
      return;
    case "build": {
      const words = right ? (d?.words ?? []) : [...(d?.words ?? [])].reverse();
      for (const w of words) await pg.locator(".build-bank .word:not(.used)", { hasText: new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }).first().click({ timeout: 2000 }).catch(() => {});
      return click(".bbtn", "VERIFICAR");
    }
    case "speak":
      return click(".bbtn", right ? "Disse bem" : "Ainda não");
    default: {
      const opts = v.ex.options ?? [];
      const opt = right ? opts.find((o) => o.id === d?.id) : opts.find((o) => o.id !== d?.id);
      if (opt) await click(".lopt", opt.label);
      return click(".bbtn", "VERIFICAR");
    }
  }
}

/** Bot brain: reads the phone view (test hook) and acts like a (fallible) player. */
async function botStep(b: Bot, seen: Set<string>) {
  const info = await b.page.evaluate(() => {
    const pp = (window as unknown as { __pp?: { view: Record<string, unknown> } }).__pp;
    return pp ? JSON.parse(JSON.stringify(pp.view)) : null;
  });
  if (!info) return;
  const v = info as { mode: string; promptId?: string; roundId?: string; debugAnswer?: Record<string, unknown>; options?: { id: string; label: string }[]; items?: { id: string }[]; canContinue?: boolean };
  // Diz-me! re-sends the same prompt with fewer options after a wrong guess: that's a new turn for the bot.
  const key = `${v.mode}:${v.promptId ?? ""}:${v.options?.length ?? ""}`;
  if (v.mode === "tapStream") {
    if (Math.random() < 0.35) await b.page.locator(".mega button").click({ timeout: 500 }).catch(() => {});
    return;
  }
  if (v.mode === "buzzer") {
    const d = v.debugAnswer as { startAt: number; per: number; targetIndex: number } | undefined;
    if ((v as { state?: string }).state !== "go" || !d || seen.has(key)) return;
    const now = await b.page.evaluate(() => (window as unknown as { __pp: { conn: { hostNow(): number | null } } }).__pp.conn.hostNow() ?? 0);
    const t0 = d.startAt + d.per * d.targetIndex;
    const early = Math.random() > b.skill;
    if ((early && now > d.startAt + 100) || (now > t0 + 150 + Math.random() * 300 && now < t0 + d.per - 100)) {
      seen.add(key);
      await b.page.locator("button.buzzer").dispatchEvent("pointerdown");
    }
    return;
  }
  if (v.mode === "learn") return learnStep(b, v as unknown as LearnV, seen);
  if (v.mode === "describe") {
    if (seen.has(key)) return;
    seen.add(key);
    if (Math.random() < 0.1) await b.page.click("text=Passar", { timeout: 1000 }).catch(() => {});
    return;
  }
  if (v.mode === "pick") {
    // Only after the harness has captured the results screen, and only once.
    if (seen.has(key) || !allowPick) return;
    allowPick = false;
    seen.add(key);
    await b.page.waitForTimeout(1200);
    const opts = (v as unknown as { options: { id: string; label: string }[] }).options;
    const want = opts.find((o) => o.id === NEXT) ?? opts.find((o) => o.id === "menu") ?? opts[0]!;
    pickedNext = want.id;
    await b.page.locator(".choice-stack .bbtn", { hasText: want.label }).first().click({ timeout: 2000 }).catch(() => {});
    return;
  }
  if (seen.has(key)) return;
  const right = Math.random() < b.skill;
  const think = 500 + Math.random() * (right ? 1800 : 2600);
  switch (v.mode) {
    case "choices": {
      seen.add(key);
      await b.page.waitForTimeout(think);
      const correct = (v.debugAnswer as { choice?: string } | undefined)?.choice;
      const opt = right ? v.options!.find((o) => o.id === correct) : v.options!.find((o) => o.id !== correct);
      if (opt) await b.page.locator(".choice-stack .bbtn", { hasText: opt.label }).first().click({ timeout: 2000 }).catch(() => {});
      return;
    }
    case "lesson":
      if (!v.canContinue) return;
      seen.add(key);
      await b.page.waitForTimeout(1500 + Math.random() * 1500);
      await b.page.click("text=Percebi!", { timeout: 1000 }).catch(() => {});
      return;
    case "itemPick":
      seen.add(key);
      await b.page.waitForTimeout(think);
      await b.page.locator(".item-cards .bbtn").nth(b.name === "Ana" ? 2 : 1).click({ timeout: 1000 }).catch(() => {});
      return;
    case "judge":
      seen.add(key);
      await b.page.waitForTimeout(800);
      await b.page.click(right ? "text=Bem!" : "text=Mal!", { timeout: 1000 }).catch(() => {});
      return;
    case "tiles":
    case "errorTap":
    case "merge":
    case "mic": {
      seen.add(key);
      await b.page.waitForTimeout(think);
      const d = v.debugAnswer ?? {};
      const value =
        v.mode === "tiles"
          ? { mode: "tiles", seq: right ? d.seq : [...((d.seq as string[]) ?? [])].reverse() }
          : v.mode === "errorTap"
            ? { mode: "errorTap", wordId: right ? d.wordId : "w0" }
            : v.mode === "merge"
              ? { mode: "merge", ...(right ? d : { top: "em", bottom: "as" }) }
              : { mode: "mic", transcripts: right ? d.transcripts : [], unsupported: !right };
      await b.page.evaluate(
        ({ value, roundId, promptId }) => {
          const pp = (window as unknown as { __pp: { conn: { input: (r: string, p: string, v: unknown) => void } } }).__pp;
          pp.conn.input(roundId, promptId, value);
        },
        { value, roundId: v.roundId!, promptId: v.promptId! },
      );
      return;
    }
  }
}

const seen = bots.map(() => new Set<string>());
const start = Date.now();
let shot = 10;
let phoneShots = 0;
const LIMIT = { party: 480_000, micro: 200_000, race: 150_000, lesson: 420_000, snap: 200_000, dizme: 240_000 }[MODE];
let resultsSeen = 0;
let lastActivity = "";
let pauseChecked = false;
const phoneMode = (b: Bot) => b.page.evaluate(() => (window as unknown as { __pp?: { view: { mode: string } } }).__pp?.view.mode ?? "");

/** Back on the TV mid-game → everyone sees the pause menu → change speed → resume from a phone. */
async function checkPause() {
  await tv.keyboard.press("Escape");
  await tv.waitForTimeout(900);
  if (!(await tv.$(".pause-screen"))) errors.push("[e2e] TV pause overlay did not appear");
  const modes = await Promise.all(bots.map(phoneMode));
  if (modes.some((m) => m !== "paused")) errors.push(`[e2e] phones not paused: ${modes.join(",")}`);
  await tv.screenshot({ path: `${OUT}/50-tv-paused.png` });
  await bots[0]!.page.screenshot({ path: `${OUT}/51-phone-paused.png` });
  // Probe: fuse progress + race HUD text must not move while paused.
  const probe = () => tv.evaluate(() => `${(document.querySelector(".fuse") as HTMLElement | null)?.style.getPropertyValue("--p") ?? ""}|${document.querySelector(".race-hud")?.textContent ?? ""}`);
  const clockBefore = await probe();
  await tv.waitForTimeout(2500);
  const clockAfter = await probe();
  if (clockBefore !== clockAfter) errors.push("[e2e] game kept running while paused");
  await bots[1]!.page.click("text=Turbo", { timeout: 2000 }).catch(() => errors.push("[e2e] no speed picker on the paused phone"));
  await tv.waitForTimeout(400);
  const label = await tv.textContent(".pause-screen");
  if (!label?.includes("Turbo")) errors.push("[e2e] speed change from the phone did not reach the TV");
  await bots[0]!.page.click("text=Continuar", { timeout: 2000 });
  await tv.waitForTimeout(900);
  if (await tv.$(".pause-screen")) errors.push("[e2e] resume from the phone did not close the pause overlay");
  console.log("pause/resume checked");
}

while (Date.now() - start < LIMIT) {
  if (!pauseChecked && Date.now() - start > 20_000) {
    pauseChecked = true;
    await checkPause();
  }
  await Promise.all(bots.map((b, i) => botStep(b, seen[i]!)));
  const act = await tv.evaluate(() => (document.querySelector(".results-screen") ? "results" : ""));
  if (act === "results" && lastActivity !== "results") {
    resultsSeen++;
    await tv.waitForTimeout(2500);
    await tv.screenshot({ path: `${OUT}/9${resultsSeen}-tv-results.png` });
    await bots[0]!.page.screenshot({ path: `${OUT}/9${resultsSeen}-phone-results.png` });
    // After a lesson, the phones pick the game to play with its words; then play it to results.
    if (!(MODE === "lesson" && resultsSeen === 1 && NEXT !== "menu")) {
      lastActivity = "done";
      break;
    }
    allowPick = true;
  }
  lastActivity = act;
  if ((Date.now() - start) / 4000 > shot - 10) {
    await tv.screenshot({ path: `${OUT}/${String(shot).padStart(2, "0")}-tv.png` });
    if (phoneShots < 40 && shot % 2 === 0) {
      await bots[shot % 4 === 0 ? 0 : 1]!.page.screenshot({ path: `${OUT}/${String(shot).padStart(2, "0")}-phone.png` });
      phoneShots++;
    }
    shot++;
  }
  await tv.waitForTimeout(150);
}

const fps = await tv.evaluate(
  () =>
    new Promise<number>((resolve) => {
      let n = 0;
      const t0 = performance.now();
      const f = () => {
        n++;
        if (performance.now() - t0 < 2000) requestAnimationFrame(f);
        else resolve((n * 1000) / (performance.now() - t0));
      };
      requestAnimationFrame(f);
    }),
);
console.log(`TV fps (headless SwiftShader, not representative of GPU hardware): ${fps.toFixed(1)}`);
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
console.log(lastActivity === "done" ? `REACHED RESULTS ✓${pickedNext ? ` (after the lesson: ${pickedNext})` : ""}` : "did NOT reach results ✗");
await tvCtx.close();
await browser.close();
server?.kill();
process.exit(lastActivity === "done" && errors.length === 0 ? 0 : 1);
