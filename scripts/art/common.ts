/**
 * Shared helpers for the art pipeline scripts (no npm dependencies; uses git, unzip, ffmpeg,
 * python3+Pillow and `npx @gltf-transform/cli` as external tools).
 *
 * Caches (downloads, unzipped packs, emoji index) live OUTSIDE the repo:
 *   ART_CACHE=/some/dir   (default: $TMPDIR/party-portugues-art-cache)
 */
import { spawnSync, type SpawnSyncOptions } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const CACHE = process.env.ART_CACHE ?? join(tmpdir(), "party-portugues-art-cache");
mkdirSync(CACHE, { recursive: true });

export function run(cmd: string, args: string[], opts: SpawnSyncOptions = {}): string {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (${r.status}):\n${r.stderr}`);
  return String(r.stdout ?? "");
}

export async function fetchBuffer(url: string, tries = 4): Promise<Buffer> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) throw Object.assign(new Error(`404 ${url}`), { notFound: true });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if ((e as { notFound?: boolean }).notFound) throw e;
      last = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw last;
}

export async function download(url: string, dest: string): Promise<string> {
  if (!existsSync(dest)) {
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, await fetchBuffer(url));
  }
  return dest;
}

/** Downloads + unzips a Kenney pack (slug as in https://kenney.nl/assets/<slug>) into the cache. */
export async function kenneyPack(slug: string): Promise<string> {
  const dir = join(CACHE, "kenney", slug);
  if (existsSync(dir) && readdirSync(dir).length > 0) return dir;
  const html = (await fetchBuffer(`https://kenney.nl/assets/${slug}`)).toString("utf8");
  const zipUrl = /https:\/\/kenney\.nl\/media\/pages\/assets\/[^"']+\.zip/.exec(html)?.[0];
  if (!zipUrl) throw new Error(`No zip link found on kenney.nl/assets/${slug}`);
  const zip = await download(zipUrl, join(CACHE, "kenney", `${slug}.zip`));
  mkdirSync(dir, { recursive: true });
  run("unzip", ["-q", "-o", zip, "-d", dir]);
  return dir;
}

/** ffmpeg binary: $FFMPEG, or `ffmpeg` on PATH (e.g. from `pip install imageio-ffmpeg`). */
export function ffmpeg(): string {
  return process.env.FFMPEG ?? "ffmpeg";
}

export function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
