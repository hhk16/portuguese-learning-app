/**
 * Builds public/sfx/*.mp3 from Kenney CC0 audio packs (+ one synthesised whoosh).
 *
 *   FFMPEG=/path/to/ffmpeg node scripts/art/build-sfx.ts
 *   (ffmpeg e.g. from `python3 -m venv v && v/bin/pip install imageio-ffmpeg`, then
 *    FFMPEG=$(v/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"))
 *
 * MP3 only (Safari), 96 kbps, 44.1 kHz; UI sounds mono, jingles stereo. Levels: peak-normalised to
 * -1 dBFS, capped at -16 dB mean level (pure-tone beeps are otherwise much louder than clicks), then a
 * per-sound trim so the set sits together. Choices favour soft sine/bubble/pizzicato timbres (no 8-bit).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CACHE, REPO, ffmpeg, kb, kenneyPack, run } from "./common.ts";

type Pack = "interface-sounds" | "ui-audio" | "music-jingles" | "synth";
interface Sfx {
  pack: Pack;
  file: string;
  trimDb: number;
  stereo?: boolean;
  why: string;
}

export const SFX_SOURCES: Record<string, Sfx> = {
  tap: { pack: "ui-audio", file: "Audio/rollover5.ogg", trimDb: -4, why: "short soft tonal blip (F5)" },
  select: { pack: "interface-sounds", file: "Audio/maximize_009.ogg", trimDb: -3, why: "sine up-chirp D6→F#6" },
  back: { pack: "interface-sounds", file: "Audio/minimize_009.ogg", trimDb: -4, why: "mirror of select, G6→E6" },
  correct: { pack: "interface-sounds", file: "Audio/confirmation_001.ogg", trimDb: -1, why: "soft rising fifths G4-D5-G5-D6" },
  wrong: { pack: "interface-sounds", file: "Audio/question_004.ogg", trimDb: -2, why: "gentle descending 'uh-oh' B4→E4, not a buzzer" },
  pop: { pack: "interface-sounds", file: "Audio/drop_002.ogg", trimDb: -2, why: "bubble bloop" },
  whoosh: { pack: "synth", file: "whoosh", trimDb: -3, why: "filtered-noise swoosh (generated here, CC0)" },
  reveal: { pack: "interface-sounds", file: "Audio/maximize_006.ogg", trimDb: -1, why: "low rising arpeggio C4→D5" },
  star: { pack: "interface-sounds", file: "Audio/confirmation_004.ogg", trimDb: -2, why: "sparkly rising E-major arpeggio" },
  tick: { pack: "interface-sounds", file: "Audio/tick_004.ogg", trimDb: -5, why: "soft clock tick" },
  "countdown-go": { pack: "interface-sounds", file: "Audio/confirmation_002.ogg", trimDb: -1, why: "bright rising D6→D8 'go!'" },
  "success-jingle": { pack: "music-jingles", file: "Audio/Steel jingles/jingles_STEEL10.ogg", trimDb: -1, stereo: true, why: "steel-drum rising D-major flourish" },
  "fail-jingle": { pack: "music-jingles", file: "Audio/Pizzicato jingles/jingles_PIZZI11.ogg", trimDb: -2, stereo: true, why: "pizzicato G4→D4 descending, friendly" },
  match: { pack: "interface-sounds", file: "Audio/select_004.ogg", trimDb: -2, why: "happy two-tone A#6→G7 (major sixth up)" },
  lock: { pack: "interface-sounds", file: "Audio/drop_004.ogg", trimDb: -2, why: "round bubbly 'bloop' (C6) to lock an answer" },
};

/** Soft whoosh: white noise → two cascaded swept band-pass stages (350→1800→500 Hz) with a smooth swell. */
function synthWhoosh(path: string): void {
  const sr = 44100;
  const n = Math.round(sr * 0.5);
  const pcm = Buffer.alloc(44 + n * 2);
  let seed = 12345;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
  let low = 0;
  let band = 0;
  let low2 = 0;
  let band2 = 0;
  const samples = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const fc = t < 0.45 ? 350 + (1800 - 350) * Math.sin((t / 0.45) * (Math.PI / 2)) : 1800 - (1800 - 500) * ((t - 0.45) / 0.55);
    const f = 2 * Math.sin((Math.PI * fc) / sr);
    const q = 0.55;
    const high = rand() - low - q * band;
    band += f * high;
    low += f * band;
    // Second stage (same cutoff) → steeper skirts, no hiss.
    const high2 = band - low2 - q * band2;
    band2 += f * high2;
    low2 += f * band2;
    const env = Math.sin(Math.PI * Math.min(1, t / 0.45) * 0.5) ** 2 * (t < 0.45 ? 1 : Math.cos(((t - 0.45) / 0.55) * (Math.PI / 2)) ** 2);
    samples[i] = (band2 + 0.5 * low2) * env;
    peak = Math.max(peak, Math.abs(samples[i]!));
  }
  pcm.write("RIFF", 0);
  pcm.writeUInt32LE(36 + n * 2, 4);
  pcm.write("WAVEfmt ", 8);
  pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20);
  pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(sr, 24);
  pcm.writeUInt32LE(sr * 2, 28);
  pcm.writeUInt16LE(2, 32);
  pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36);
  pcm.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.round((samples[i]! / peak) * 0.89 * 32767), 44 + i * 2);
  writeFileSync(path, pcm);
}

function levels(file: string): { mean: number; max: number } {
  // volumedetect reports on stderr.
  const out = spawnSync(ffmpeg(), ["-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const mean = Number(/mean_volume: (-?[\d.]+) dB/.exec(out)?.[1] ?? -20);
  const max = Number(/max_volume: (-?[\d.]+) dB/.exec(out)?.[1] ?? 0);
  return { mean, max };
}

async function main(): Promise<void> {
  const outDir = join(REPO, "public/sfx");
  mkdirSync(outDir, { recursive: true });
  const packs: Partial<Record<Pack, string>> = {};
  let total = 0;
  for (const [name, s] of Object.entries(SFX_SOURCES)) {
    let src: string;
    if (s.pack === "synth") {
      src = join(CACHE, `${s.file}.wav`);
      synthWhoosh(src);
    } else {
      packs[s.pack] ??= await kenneyPack(s.pack);
      src = join(packs[s.pack]!, s.file);
    }
    const { mean, max } = levels(src);
    const gain = Math.min(-1 - max, -16 - mean) + s.trimDb;
    const dest = join(outDir, `${name}.mp3`);
    run(ffmpeg(), [
      "-hide_banner", "-loglevel", "error", "-y", "-i", src,
      "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.95:level=false`,
      "-ac", s.stereo ? "2" : "1", "-ar", "44100",
      "-codec:a", "libmp3lame", "-b:a", "96k", "-map_metadata", "-1", "-id3v2_version", "0",
      dest,
    ]);
    const size = statSync(dest).size;
    total += size;
    console.log(`${name.padEnd(15)} ${kb(size).padStart(9)}  gain ${gain.toFixed(1)} dB  ← ${s.pack}/${s.file}`);
  }
  console.log(`total ${kb(total)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
