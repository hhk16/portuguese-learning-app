/**
 * TV-side learner persistence. Profiles live locally (localStorage — small documents) and sync
 * to the server: evidence/performance events are queued and POSTed in batches with the household
 * token; the full profile snapshot is PUT with optimistic versioning at the end of a session.
 */
import { randomId } from "../shared/ids.ts";
import type { EvidenceEvent, PerformanceEvent } from "../learner/events.ts";
import { applyEvidence, newProfile, type LearnerProfile } from "../learner/model.ts";

const PROFILES_KEY = "pp.tv.profiles";
const HOUSEHOLD_KEY = "pp.tv.household";
const QUEUE_KEY = "pp.tv.queue";

interface Household {
  householdId: string;
  secret: string;
  registered: boolean;
  snapshotVersion: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage full / private */
  }
}

export class LearnerStore {
  profiles: Record<string, LearnerProfile> = read(PROFILES_KEY, {});
  private household: Household = read(HOUSEHOLD_KEY, null as unknown as Household) ?? {
    householdId: `hh_${randomId(12)}`,
    secret: randomId(32),
    registered: false,
    snapshotVersion: 0,
  };
  private queue: { evidence: EvidenceEvent[]; performance: PerformanceEvent[] } = read(QUEUE_KEY, { evidence: [], performance: [] });
  private token: { token: string; expiresAt: number } | null = null;
  private syncing = false;

  constructor() {
    write(HOUSEHOLD_KEY, this.household);
    setInterval(() => void this.sync(), 15_000);
  }

  /** Find or create the learner profile for a phone's stable profile hint. */
  profileFor(profileHint: string | undefined, name: string): LearnerProfile {
    const id = profileHint && /^[A-Za-z0-9_-]{6,64}$/.test(profileHint) ? profileHint : `p_${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    const existing = this.profiles[id];
    if (existing) {
      if (existing.name !== name) existing.name = name;
      return existing;
    }
    const p = newProfile(id, name);
    this.profiles[id] = p;
    this.persist();
    return p;
  }

  record(e: EvidenceEvent) {
    const p = this.profiles[e.profileId];
    if (!p) return;
    p.items[e.itemId] = applyEvidence(p.items[e.itemId], e);
    this.queue.evidence.push(e);
    this.persist();
  }

  recordPerformance(e: PerformanceEvent) {
    this.queue.performance.push(e);
  }

  persist() {
    write(PROFILES_KEY, this.profiles);
    write(QUEUE_KEY, this.queue);
  }

  private async authToken(): Promise<string | null> {
    if (this.token && this.token.expiresAt - Date.now() > 60_000) return this.token.token;
    const creds = { householdId: this.household.householdId, secret: this.household.secret };
    if (!this.household.registered) {
      const r = await fetch("/api/household/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(creds) });
      if (r.status === 201 || r.status === 409) {
        this.household.registered = true;
        write(HOUSEHOLD_KEY, this.household);
      } else return null;
    }
    const r = await fetch("/api/auth/token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(creds) });
    if (!r.ok) return null;
    this.token = await r.json();
    return this.token!.token;
  }

  /** Push queued events; failures keep the queue for the next attempt (offline-friendly). */
  async sync(): Promise<void> {
    if (this.syncing) return;
    if (this.queue.evidence.length === 0 && this.queue.performance.length === 0) return;
    this.syncing = true;
    try {
      const token = await this.authToken();
      if (!token) return;
      const headers = { "content-type": "application/json", authorization: `Bearer ${token}` };
      const ev = this.queue.evidence.slice(0, 500);
      if (ev.length) {
        const r = await fetch("/api/evidence", { method: "POST", headers, body: JSON.stringify({ events: ev }) });
        if (r.ok) this.queue.evidence.splice(0, ev.length);
      }
      const pf = this.queue.performance.slice(0, 500);
      if (pf.length) {
        const r = await fetch("/api/performance", { method: "POST", headers, body: JSON.stringify({ events: pf }) });
        if (r.ok) this.queue.performance.splice(0, pf.length);
      }
      this.persist();
    } catch {
      /* offline: retry later */
    } finally {
      this.syncing = false;
    }
  }

  private pushing = false;

  /** Save the profile snapshot (optimistic versioning; this TV wins on conflict — the evidence log is the source of truth). */
  async pushSnapshot(): Promise<void> {
    if (this.pushing) return;
    this.pushing = true;
    try {
      const token = await this.authToken();
      if (!token) return;
      const headers = { "content-type": "application/json", authorization: `Bearer ${token}` };
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await fetch("/api/snapshot", {
          method: "PUT",
          headers,
          body: JSON.stringify({ baseVersion: this.household.snapshotVersion, doc: { profiles: this.profiles } }),
        });
        if (r.ok) {
          this.household.snapshotVersion = (await r.json()).version;
          break;
        }
        if (r.status !== 409) break;
        // Someone else saved in between: take their version number and save ours on top.
        const cur = await (await fetch("/api/snapshot", { headers })).json();
        this.household.snapshotVersion = cur.version;
      }
      write(HOUSEHOLD_KEY, this.household);
    } catch {
      /* offline */
    } finally {
      this.pushing = false;
    }
  }
}
