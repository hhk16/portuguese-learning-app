/**
 * End-to-end playtest: real server + TV (1920×1080) + two phone contexts, driven by bots.
 * Plays a full Party Night (lobby → Micro Loucura → Mini Aula → Turbo Race → results) and saves
 * screenshots (and a TV video) to e2e-output/ for visual review.
 *
 *   npm run build && npm run e2e            # full party night
 *   E2E_MODE=race npm run e2e               # arcade mode only (micro | race | aula)
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { chromium, type Page } from "playwright-core";

const PORT = 8799;
/** E2E_BASE=https://… runs against a deployed server instead of spawning one. */
const REMOTE = process.env.E2E_BASE;
const BASE = REMOTE ?? `http://localhost:${PORT}`;
const OUT = "e2e-output";
const MODE = (process.env.E2E_MODE ?? "party") as "party" | "micro" | "race" | "aula";
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
const menuIndex = { party: 0, micro: 0, race: 1, aula: 2 }[MODE];
if (MODE !== "party") {
  await tv.keyboard.press("ArrowDown");
  await tv.keyboard.press("Enter"); // Arcade
  await tv.waitForTimeout(300);
}
for (let i = 0; i < menuIndex; i++) await tv.keyboard.press("ArrowDown");
await tv.keyboard.press("Enter");
await tv.waitForTimeout(1200);
await tv.screenshot({ path: `${OUT}/05-tv-lobby.png` });
for (const b of bots) await b.page.click("text=ESTOU PRONTO!");
await tv.waitForTimeout(800);
await tv.screenshot({ path: `${OUT}/06-tv-lobby-ready.png` });
await bots[1]!.page.screenshot({ path: `${OUT}/07-phone-ready.png` });

/** Bot brain: reads the phone view (test hook) and acts like a (fallible) player. */
async function botStep(b: Bot, seen: Set<string>) {
  const info = await b.page.evaluate(() => {
    const pp = (window as unknown as { __pp?: { view: Record<string, unknown> } }).__pp;
    return pp ? JSON.parse(JSON.stringify(pp.view)) : null;
  });
  if (!info) return;
  const v = info as { mode: string; promptId?: string; roundId?: string; debugAnswer?: Record<string, unknown>; options?: { id: string; label: string }[]; items?: { id: string }[]; canContinue?: boolean };
  const key = `${v.mode}:${v.promptId ?? ""}`;
  if (v.mode === "tapStream") {
    if (Math.random() < 0.35) await b.page.locator(".mega button").click({ timeout: 500 }).catch(() => {});
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
const LIMIT = { party: 420_000, micro: 200_000, race: 150_000, aula: 120_000 }[MODE];
let lastActivity = "";
while (Date.now() - start < LIMIT) {
  await Promise.all(bots.map((b, i) => botStep(b, seen[i]!)));
  const act = await tv.evaluate(() => document.querySelector(".results-screen") ? "results" : "");
  if (act === "results" && lastActivity !== "results") {
    await tv.waitForTimeout(2500);
    await tv.screenshot({ path: `${OUT}/99-tv-results.png` });
    await bots[0]!.page.screenshot({ path: `${OUT}/99-phone-results.png` });
    lastActivity = act;
    break;
  }
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
console.log(lastActivity === "results" ? "REACHED RESULTS ✓" : "did NOT reach results ✗");
await tvCtx.close();
await browser.close();
server?.kill();
process.exit(lastActivity === "results" && errors.length === 0 ? 0 : 1);
