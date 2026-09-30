/**
 * Micro Loucura — WarioWare-style rush of 5–8 second microgames.
 *
 * Loop per microgame:  intro (verb slam) → play → [judge, DIZ only] → reveal → next
 * Every 4 microgames the speed goes up. Each microgame turns the phone into a different toy:
 * choice buttons, letter tiles, word chips, a merge board, a single big button, a microphone.
 *
 * Nonsense-word test: swap the Portuguese for gibberish and it still works as a reflex/panic game
 * (race the clock, race your partner, don't tap the traps). The Portuguese makes it teach.
 */
import { ALL_ITEMS } from "../../curriculum/index.ts";
import { FORMAT_KINDS, generate, mergeForm, spellTiles, streamPrompt, type Prompt, type PromptFormat, type StreamPrompt } from "../../curriculum/generators.ts";
import type { KnowledgeItem } from "../../curriculum/schema.ts";
import type { Outcome } from "../../learner/events.ts";
import { isCorrectOutcome } from "../../learner/events.ts";
import { selectItem } from "../../learner/selector.ts";
import { matchAnswer, matchSpeech } from "../../shared/answer-check.ts";
import { randomId } from "../../shared/ids.ts";
import type { ControllerView, InputValue, NavDir } from "../../shared/protocol.ts";
import { sfx } from "../../audio/sfx.ts";
import { playMusic, setTempo } from "../../audio/music.ts";
import type { Activity, RuntimePlayer, TvRuntime } from "../../tv/runtime.ts";

export type MicroKind = "escolhe" | "completa" | "corrige" | "arrasta" | "naotoques" | "diz";

export const MICRO_DEFS: Record<MicroKind, { title: string; hint: string; format: PromptFormat; baseMs: number; icon: string }> = {
  escolhe: { title: "ESCOLHE!", hint: "Escolhe a certa no telemóvel!", format: "choice", baseMs: 5200, icon: "👆" },
  completa: { title: "COMPLETA!", hint: "Monta a palavra com as letras!", format: "tiles", baseMs: 8500, icon: "🔤" },
  corrige: { title: "CORRIGE!", hint: "Toca na palavra errada!", format: "errorTap", baseMs: 6500, icon: "🔍" },
  arrasta: { title: "ARRASTA!", hint: "Junta a preposição ao artigo!", format: "merge", baseMs: 7000, icon: "🧲" },
  naotoques: { title: "NÃO TOQUES!", hint: "", format: "stream", baseMs: 0, icon: "✋" },
  diz: { title: "DIZ!", hint: "Diz em voz alta!", format: "say", baseMs: 6000, icon: "🎤" },
};

const INTRO_MS = 1100;
const REVEAL_MS = 2300;
const JUDGE_MS = 4500;
const SPEEDUP_MS = 1700;
const STREAM_WORD_MS = 900;

export type MicroPhase = "intro" | "play" | "judge" | "reveal" | "speedup" | "finale";

export interface PlayerRound {
  answeredAt: number | null;
  outcome: Outcome | null;
  points: number;
  /** For DIZ: what the recogniser heard. */
  heard?: string;
  needsJudge?: boolean;
  /** For NÃO TOQUES: tap log. */
  taps: { at: number; wordIndex: number; hit: boolean }[];
  /** Chosen option / spelled word, for the reveal. */
  given?: string;
}

export interface MicroRound {
  roundId: string;
  promptId: string;
  kind: MicroKind;
  prompt: Prompt;
  startAt: number;
  endAt: number;
  per: Map<string, PlayerRound>;
  reviewFor?: string;
}

export class MicroRush implements Activity {
  readonly id = "micro";
  rt!: TvRuntime;
  phase: MicroPhase = "intro";
  phaseStart = 0;
  phaseEnd = 0;
  round: MicroRound | null = null;
  index = 0;
  speed = 1;
  private used: string[] = [];
  private kinds: MicroKind[];
  private readonly total: number;
  private readonly onDone: () => void;
  private streaks = new Map<string, number>();
  /** Visual pulse counters read by the 3D scene. */
  pulse = { correct: 0, wrong: 0, slam: 0 };

  constructor(onDone: () => void, total = 10, kinds?: MicroKind[]) {
    this.onDone = onDone;
    this.total = total;
    this.kinds = kinds ?? ["escolhe", "completa", "corrige", "arrasta", "naotoques", "diz"];
  }

  start(rt: TvRuntime) {
    this.rt = rt;
    playMusic("party");
    rt.say({ type: "microStart" }, true, 2400);
    this.next(performance.now() + 600);
  }

  stop() {
    setTempo(1);
  }

  /* ------------------------------ sequencing ------------------------------ */

  private pickKind(): MicroKind {
    // Never the same interaction twice in a row; cycle through all kinds before repeating.
    const prev = this.round?.kind;
    const recent = this.used.slice(-4);
    const options = this.kinds.filter((k) => k !== prev && !recent.includes(`kind:${k}`));
    const pick = this.rt.rng.pick(options.length ? options : this.kinds.filter((k) => k !== prev));
    this.used.push(`kind:${pick}`);
    return pick;
  }

  private buildRound(kind: MicroKind): MicroRound | null {
    const def = MICRO_DEFS[kind];
    let prompt: Prompt | null = null;
    let reviewFor: string | undefined;
    if (kind === "naotoques") {
      prompt = streamPrompt(this.rt.rng, ALL_ITEMS, 7);
    } else {
      const candidates = ALL_ITEMS.filter((i) => FORMAT_KINDS[def.format].includes(i.kind) && canGenerate(def.format, i));
      for (let tries = 0; tries < 8 && !prompt; tries++) {
        const sel = selectItem(
          {
            candidates,
            lessonItemIds: new Set(candidates.filter((c) => c.source.unit === "u01").map((c) => c.id)),
            profiles: this.rt.activePlayers.map((p) => p.profile),
            recent: this.used,
          },
          this.rt.rng,
        );
        if (!sel) break;
        prompt = generate(def.format, sel.item, this.rt.rng, ALL_ITEMS);
        if (prompt) {
          this.used.push(sel.item.id);
          if (sel.reason === "review") reviewFor = sel.forProfileId;
        }
      }
    }
    if (!prompt) return null;
    const dur = kind === "naotoques" ? (prompt as StreamPrompt).words.length * STREAM_WORD_MS + 600 : def.baseMs;
    return {
      roundId: randomId(6),
      promptId: randomId(6),
      kind,
      prompt,
      startAt: 0,
      endAt: 0,
      per: new Map(this.rt.activePlayers.map((p) => [p.playerId, { answeredAt: null, outcome: null, points: 0, taps: [] }])),
      reviewFor,
    };
  }

  private next(at: number): void {
    if (this.index >= this.total) {
      this.setPhase("finale", at, 2600);
      sfx.fanfare();
      this.rt.view("all", { mode: "wait", title: "Fim da Micro Loucura!", emoji: "🏁" });
      return;
    }
    if (this.index > 0 && this.index % 4 === 0 && this.phase !== "speedup") {
      this.speed = Math.min(1.6, this.speed + 0.15);
      setTempo(1 + (this.speed - 1) * 0.6);
      this.setPhase("speedup", at, SPEEDUP_MS);
      sfx.whoosh();
      this.rt.say({ type: "speedUp" }, true, 1600);
      this.rt.view("all", { mode: "wait", title: "MAIS RÁPIDO!", emoji: "⚡" });
      return;
    }
    let r: MicroRound | null = null;
    for (let i = 0; i < 6 && !r; i++) r = this.buildRound(this.pickKind());
    if (!r) {
      this.index = this.total;
      return this.next(at);
    }
    this.round = r;
    this.index++;
    this.setPhase("intro", at, INTRO_MS / Math.sqrt(this.speed));
    this.pulse.slam++;
    sfx.slam();
    this.rt.view("all", { mode: "wait", title: MICRO_DEFS[r.kind].title, subtitle: "Olha para a TV!", emoji: MICRO_DEFS[r.kind].icon });
  }

  private setPhase(phase: MicroPhase, at: number, dur: number) {
    this.phase = phase;
    this.phaseStart = at;
    this.phaseEnd = at + dur;
    this.rt.bump();
  }

  tick(now: number) {
    if (now < this.phaseEnd) {
      if (this.phase === "play" && this.round?.kind === "naotoques") this.rt.bump(); // word flashes
      return;
    }
    switch (this.phase) {
      case "intro":
        return this.beginPlay(now);
      case "play":
        return this.endPlay(now);
      case "judge":
        return this.reveal(now);
      case "reveal":
      case "speedup":
        return this.next(now);
      case "finale":
        this.phase = "intro";
        this.phaseEnd = Infinity;
        this.onDone();
    }
  }

  private beginPlay(now: number) {
    const r = this.round!;
    const def = MICRO_DEFS[r.kind];
    const base = r.kind === "naotoques" ? (r.prompt as StreamPrompt).words.length * STREAM_WORD_MS + 600 : def.baseMs;
    const dur = r.kind === "naotoques" ? base / this.speed : base / this.speed;
    r.startAt = now;
    r.endAt = now + dur;
    this.setPhase("play", now, dur);
    for (const p of this.rt.activePlayers) {
      if (!r.per.has(p.playerId)) r.per.set(p.playerId, { answeredAt: null, outcome: null, points: 0, taps: [] });
      this.rt.conn.sendView(p.playerId, this.playView(p));
    }
  }

  private playView(p: RuntimePlayer): ControllerView {
    const r = this.round!;
    const pr = r.per.get(p.playerId);
    const base = { roundId: r.roundId, promptId: r.promptId, deadline: r.endAt, title: MICRO_DEFS[r.kind].title, debugAnswer: this.rt.testMode ? debugAnswer(r.prompt) : undefined };
    if (pr?.answeredAt !== null && pr?.answeredAt !== undefined && r.kind !== "naotoques") {
      return { mode: "wait", title: "Resposta enviada!", subtitle: "Olha para a TV…", emoji: "📨" };
    }
    const q = r.prompt;
    switch (q.format) {
      case "choice":
        return { mode: "choices", ...base, question: q.sub ? `${q.headline} — ${q.sub}` : q.headline, options: q.options };
      case "tiles":
        return { mode: "tiles", ...base, question: q.headline, tiles: q.tiles, length: q.correctSeq.length };
      case "errorTap":
        return { mode: "errorTap", ...base, question: "Qual está errada?", words: q.words };
      case "merge":
        return { mode: "merge", ...base, question: q.headline, top: q.top, bottom: q.bottom };
      case "stream":
        return { mode: "tapStream", ...base, rule: q.rule };
      case "say":
        return { mode: "mic", ...base, target: q.target, lang: "pt-PT", question: q.sub };
    }
  }

  /** Which stream word is on screen at host time t. */
  streamIndexAt(t: number): number {
    const r = this.round!;
    const words = (r.prompt as StreamPrompt).words;
    const per = (r.endAt - r.startAt - 600 / this.speed) / words.length;
    const i = Math.floor((t - r.startAt - 300 / this.speed) / per);
    return i >= 0 && i < words.length ? i : -1;
  }

  onInput(p: RuntimePlayer, promptId: string, roundId: string, value: InputValue, t: number) {
    const r = this.round;
    if (!r || r.promptId !== promptId || r.roundId !== roundId) return;
    const pr = r.per.get(p.playerId) ?? { answeredAt: null, outcome: null, points: 0, taps: [] };
    r.per.set(p.playerId, pr);

    if (this.phase === "judge" && value.mode === "judge") {
      // p judged the OTHER player (or themselves when solo)
      const target = [...r.per.entries()].find(([id, x]) => x.needsJudge && (id !== p.playerId || this.rt.activePlayers.length === 1));
      if (!target) return;
      const [tid, tr] = target;
      tr.needsJudge = false;
      tr.outcome = value.verdict ? "judged-correct" : "judged-wrong";
      tr.points = value.verdict ? 80 : 0;
      const tp = this.rt.players.get(tid);
      if (tp) this.rt.view(p, { mode: "wait", title: value.verdict ? "Aprovado! ✅" : "Chumbado! ❌", emoji: "⚖️" });
      if (![...r.per.values()].some((x) => x.needsJudge)) this.phaseEnd = performance.now() + 150;
      this.rt.bump();
      return;
    }
    if (this.phase !== "play") return;
    const late = t > r.endAt + 120; // small grace for network
    if (late) return;
    const q = r.prompt;

    if (q.format === "stream" && value.mode === "tapStream") {
      const i = this.streamIndexAt(value.tapHostTime || t);
      if (i < 0 || pr.taps.some((x) => x.wordIndex === i)) return;
      const hit = q.words[i]!.isTarget;
      pr.taps.push({ at: t, wordIndex: i, hit });
      pr.points += hit ? 40 : -30;
      if (hit) {
        sfx.coin();
        this.pulse.correct++;
      } else {
        sfx.wrong();
        this.pulse.wrong++;
        this.rt.conn.fx(p.playerId, "fail");
      }
      this.rt.bump();
      return;
    }
    if (pr.answeredAt !== null) return; // one answer per microgame (idempotent)

    let outcome: Outcome = "wrong";
    if (q.format === "choice" && value.mode === "choices") {
      outcome = value.choice === q.correctId ? "correct" : "wrong";
      pr.given = q.options.find((o) => o.id === value.choice)?.label;
    } else if (q.format === "tiles" && value.mode === "tiles") {
      const spelled = spellTiles(q, value.seq);
      pr.given = spelled;
      const m = matchAnswer(spelled, q.answerText);
      outcome = m === "correct" ? "correct" : m === "accent-slip" ? "accent-slip" : "wrong";
    } else if (q.format === "errorTap" && value.mode === "errorTap") {
      outcome = value.wordId === q.wrongId ? "correct" : "wrong";
      pr.given = q.words.find((w) => w.id === value.wordId)?.text;
    } else if (q.format === "merge" && value.mode === "merge") {
      const form = mergeForm(value.top, value.bottom);
      pr.given = form;
      outcome = form === q.answerText ? "correct" : "wrong";
    } else if (q.format === "say" && value.mode === "mic") {
      const m = value.unsupported ? "unclear" : matchSpeech(value.transcripts, q.target, q.contrast);
      pr.heard = value.transcripts[0];
      if (m === "match") outcome = "correct";
      else if (m === "contrast") outcome = "wrong";
      else {
        pr.needsJudge = true;
        outcome = "timeout"; // placeholder until judged
      }
    } else return;

    pr.answeredAt = t;
    pr.outcome = pr.needsJudge ? null : outcome;
    if (!pr.needsJudge) {
      const frac = Math.max(0, (r.endAt - t) / (r.endAt - r.startAt));
      const firstCorrect = isCorrectOutcome(outcome) && ![...r.per.entries()].some(([id, x]) => id !== p.playerId && x.outcome && isCorrectOutcome(x.outcome));
      pr.points = isCorrectOutcome(outcome) ? 100 + Math.round(50 * frac) + (firstCorrect && this.rt.activePlayers.length > 1 ? 30 : 0) : outcome === "accent-slip" ? 30 : 0;
    }
    sfx.pop();
    this.rt.conn.sendView(p.playerId, { mode: "wait", title: "Resposta enviada!", subtitle: "Olha para a TV…", emoji: "📨" });
    // Everyone answered → cut the timer short (keeps the pace frantic).
    const pending = this.rt.activePlayers.some((x) => r.per.get(x.playerId)?.answeredAt === null);
    if (!pending) this.phaseEnd = Math.min(this.phaseEnd, t + 350);
    this.rt.bump();
  }

  private endPlay(now: number) {
    const r = this.round!;
    const needJudge = [...r.per.entries()].filter(([, x]) => x.needsJudge);
    if (r.kind === "diz" && needJudge.length > 0) {
      this.setPhase("judge", now, JUDGE_MS);
      const solo = this.rt.activePlayers.length === 1;
      for (const p of this.rt.activePlayers) {
        const target = needJudge.find(([id]) => solo || id !== p.playerId);
        if (!target) {
          this.rt.view(p, { mode: "wait", title: "O teu par está a julgar…", emoji: "⚖️" });
          continue;
        }
        const tp = this.rt.players.get(target[0]);
        this.rt.view(p, {
          mode: "judge",
          roundId: r.roundId,
          promptId: r.promptId,
          deadline: now + JUDGE_MS,
          title: "JUIZ!",
          targetPlayerName: solo ? "tu" : (tp?.name ?? "?"),
          target: (r.prompt as { target: string }).target,
          heard: target[1].heard,
          question: solo ? "Disseste bem? Sê honesto!" : `${tp?.name} disse bem?`,
        });
      }
      return;
    }
    this.reveal(now);
  }

  private reveal(now: number) {
    const r = this.round!;
    const q = r.prompt;
    const context = `micro.${r.kind}`;
    let anyRight = false;
    let allWrong = true;
    const n = this.rt.activePlayers.length;
    for (const p of this.rt.activePlayers) {
      const pr = r.per.get(p.playerId)!;
      if (pr.needsJudge) {
        pr.needsJudge = false;
        pr.outcome = "timeout"; // nobody judged: no evidence either way beyond "not confirmed"
      }
      if (q.format === "stream") {
        const hits = new Set(pr.taps.filter((x) => x.hit).map((x) => x.wordIndex));
        q.words.forEach((w, i) => {
          if (!w.itemId) return;
          const single: Prompt = { ...q, itemIds: [w.itemId], answerText: w.text };
          if (w.isTarget) this.rt.evidence(p, single, context, hits.has(i) ? "correct" : "wrong");
          else if (pr.taps.some((x) => x.wordIndex === i)) this.rt.evidence(p, single, context, "wrong");
        });
        const targets = q.words.filter((w) => w.isTarget).length;
        const clean = hits.size === targets && pr.taps.every((x) => x.hit);
        if (clean) pr.points += 60;
        pr.outcome = clean ? "correct" : hits.size > 0 ? "close" : "wrong";
        pr.points = Math.max(0, pr.points);
      } else {
        const outcome = pr.outcome ?? "timeout";
        pr.outcome = outcome;
        this.rt.evidence(p, q, context, outcome, pr.answeredAt ? pr.answeredAt - r.startAt : undefined);
        if (outcome === "accent-slip") this.rt.say({ type: "accentSlip", name: p.name, answer: q.answerText });
      }
      const ok = pr.outcome !== null && isCorrectOutcome(pr.outcome);
      anyRight ||= ok;
      if (ok) allWrong = false;
      this.rt.addScore(p, pr.points, "micro");
      // streaks & repeat-miss jokes
      const st = ok ? (this.streaks.get(p.playerId) ?? 0) + 1 : 0;
      this.streaks.set(p.playerId, st);
      if (st >= 3 && st % 3 === 0) {
        this.rt.say({ type: "streak", name: p.name, n: st });
        this.rt.perf(p, "micro", "streak", st);
      }
      if (!ok && q.itemIds[0]) {
        const s = p.profile.items[q.itemIds[0]];
        if (s && s.missStreak >= 2) {
          const verb = q.itemIds.find((id) => id.startsWith("grammar.ser.")) ? "ser" : q.itemIds.find((id) => id.startsWith("grammar.ter.")) ? "ter" : undefined;
          this.rt.say({ type: "missAgain", name: p.name, answer: q.answerText, verb: verb ?? "ser" }, true);
        }
      }
      this.rt.view(p, {
        mode: "wait",
        title: ok ? `+${pr.points}` : pr.outcome === "accent-slip" ? "Quase! Acento!" : "Ups!",
        subtitle: q.answerText,
        emoji: ok ? "🎉" : pr.outcome === "accent-slip" ? "🎩" : "💥",
        feedback: { status: ok ? "correct" : "wrong", text: q.answerText, detail: q.why },
      });
      this.rt.conn.fx(p.playerId, ok ? "success" : "fail");
    }
    if (n > 1 && allWrong) this.rt.say({ type: "bothWrong" });
    else if (n > 1 && [...r.per.values()].every((x) => x.outcome && isCorrectOutcome(x.outcome)) && q.format !== "stream") this.rt.say({ type: "bothRight" });
    else if (n > 1) {
      const fastest = [...r.per.entries()]
        .filter(([, x]) => x.outcome && isCorrectOutcome(x.outcome) && x.answeredAt !== null)
        .sort((a, b) => a[1].answeredAt! - b[1].answeredAt!)[0];
      if (fastest && fastest[1].answeredAt! - r.startAt < 1500) {
        const fp = this.rt.players.get(fastest[0]);
        if (fp) {
          this.rt.say({ type: "fastest", name: fp.name });
          this.rt.perf(fp, "micro", "fastest");
        }
      }
    }
    if (anyRight) {
      sfx.correct();
      this.pulse.correct++;
    } else {
      sfx.wrong();
      this.pulse.wrong++;
    }
    this.setPhase("reveal", now, REVEAL_MS);
    setTimeout(() => this.rt.speakPt(q.audio ?? q.answerText), 250);
  }

  onNav(_d: NavDir) {}

  viewFor(p: RuntimePlayer): ControllerView {
    if (this.phase === "play" && this.round) return this.playView(p);
    return { mode: "wait", title: "Olha para a TV!", emoji: "📺" };
  }
}

function canGenerate(format: PromptFormat, item: KnowledgeItem): boolean {
  if (format === "tiles") return (item.kind === "frame" && item.answer.length <= 8 && !item.answer.includes(" ")) || (item.kind === "conjugation" && item.form.length <= 8 && !item.form.includes("-"));
  if (format === "merge") return item.kind === "frame" && ["do", "da", "dos", "das", "no", "na", "nos", "nas", "de", "em"].includes(item.answer);
  if (format === "say") return item.kind === "minimalPair" || (item.kind === "number" && item.value <= 20) || (item.kind === "phrase" && item.pt.length <= 20 && !item.pt.includes("…"));
  return true;
}

/** Test-mode only: lets the e2e harness answer correctly. */
function debugAnswer(p: Prompt): unknown {
  switch (p.format) {
    case "choice":
      return { choice: p.correctId };
    case "tiles":
      return { seq: p.correctSeq };
    case "errorTap":
      return { wordId: p.wrongId };
    case "merge":
      return p.correct;
    case "say":
      return { transcripts: [p.target] };
    case "stream":
      return { targets: p.words.map((w, i) => (w.isTarget ? i : -1)).filter((i) => i >= 0) };
  }
}
