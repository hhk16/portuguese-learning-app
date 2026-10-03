/**
 * Host-synchronised clock for phones.
 *
 * The TV host is authoritative; its clock is its own monotonic `performance.now()`.
 * Each phone estimates `offset = hostTime - phoneTime` from ping/pong round trips
 * (NTP-style): for a sample with send time t0, receive time t1 and host stamp h,
 * offset ≈ h - (t0 + t1) / 2, with error bounded by RTT/2. We keep recent samples and
 * trust the lowest-RTT ones, which are least affected by queueing jitter.
 */
export interface ClockSample {
  rtt: number;
  offset: number;
  at: number;
}

export class ClockSync {
  private samples: ClockSample[] = [];
  private readonly maxSamples: number;
  constructor(maxSamples = 24) {
    this.maxSamples = maxSamples;
  }

  addSample(t0: number, hostTime: number, t1: number): ClockSample | null {
    const rtt = t1 - t0;
    if (!(rtt >= 0) || rtt > 5000) return null; // garbage / stale
    const sample = { rtt, offset: hostTime - (t0 + t1) / 2, at: t1 };
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) this.samples.shift();
    return sample;
  }

  /** Reset when the host's clock origin changes (host reload → new room epoch). */
  reset(): void {
    this.samples = [];
  }

  get sampleCount(): number {
    return this.samples.length;
  }

  /** Best estimate of hostTime - localTime, or null before any sample. */
  get offset(): number | null {
    if (this.samples.length === 0) return null;
    const sorted = [...this.samples].sort((a, b) => a.rtt - b.rtt);
    const best = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3)));
    const offsets = best.map((s) => s.offset).sort((a, b) => a - b);
    return offsets[Math.floor(offsets.length / 2)]!;
  }

  /** Uncertainty bound (ms): half the best RTT seen. */
  get uncertainty(): number | null {
    if (this.samples.length === 0) return null;
    return Math.min(...this.samples.map((s) => s.rtt)) / 2;
  }

  toHost(localTime: number): number | null {
    const o = this.offset;
    return o === null ? null : localTime + o;
  }

  toLocal(hostTime: number): number | null {
    const o = this.offset;
    return o === null ? null : hostTime - o;
  }
}
