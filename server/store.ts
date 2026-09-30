/**
 * Persistence for household learner data. Two adapters: in-memory (dev / tests) and Postgres
 * (Railway, selected when DATABASE_URL is set). Every method is scoped by householdId, which the
 * HTTP layer only ever takes from a verified token — never from the request body.
 */
import pg from "pg";
import type { EvidenceEvent, PerformanceEvent } from "../src/learner/events.ts";

export interface Snapshot {
  version: number;
  doc: unknown;
  updatedAt: number;
}

export interface Store {
  registerHousehold(householdId: string, secretHash: string): Promise<"created" | "exists">;
  getSecretHash(householdId: string): Promise<string | null>;
  appendEvidence(householdId: string, events: EvidenceEvent[]): Promise<void>;
  appendPerformance(householdId: string, events: PerformanceEvent[]): Promise<void>;
  getSnapshot(householdId: string): Promise<Snapshot | null>;
  /** Optimistic concurrency: only writes when baseVersion matches. */
  putSnapshot(householdId: string, doc: unknown, baseVersion: number): Promise<Snapshot | "conflict">;
  countEvidence(householdId: string): Promise<number>;
}

export class MemoryStore implements Store {
  private households = new Map<string, string>();
  private evidence = new Map<string, EvidenceEvent[]>();
  private performance = new Map<string, PerformanceEvent[]>();
  private snapshots = new Map<string, Snapshot>();

  async registerHousehold(id: string, hash: string) {
    if (this.households.has(id)) return "exists" as const;
    this.households.set(id, hash);
    return "created" as const;
  }
  async getSecretHash(id: string) {
    return this.households.get(id) ?? null;
  }
  async appendEvidence(id: string, events: EvidenceEvent[]) {
    this.evidence.set(id, [...(this.evidence.get(id) ?? []), ...events]);
  }
  async appendPerformance(id: string, events: PerformanceEvent[]) {
    this.performance.set(id, [...(this.performance.get(id) ?? []), ...events]);
  }
  async getSnapshot(id: string) {
    return this.snapshots.get(id) ?? null;
  }
  async putSnapshot(id: string, doc: unknown, baseVersion: number) {
    const cur = this.snapshots.get(id);
    if ((cur?.version ?? 0) !== baseVersion) return "conflict" as const;
    const next = { version: baseVersion + 1, doc, updatedAt: Date.now() };
    this.snapshots.set(id, next);
    return next;
  }
  async countEvidence(id: string) {
    return this.evidence.get(id)?.length ?? 0;
  }
}

const SCHEMA = `
create table if not exists households (
  id text primary key,
  secret_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists item_evidence (
  id bigserial primary key,
  household_id text not null references households(id) on delete cascade,
  profile_id text not null,
  item_id text not null,
  context text not null,
  tier smallint not null,
  outcome text not null,
  at timestamptz not null
);
create index if not exists item_evidence_hh on item_evidence(household_id, profile_id, item_id);
create table if not exists game_performance (
  id bigserial primary key,
  household_id text not null references households(id) on delete cascade,
  profile_id text not null,
  game text not null,
  metric text not null,
  value double precision not null,
  at timestamptz not null
);
create table if not exists snapshots (
  household_id text primary key references households(id) on delete cascade,
  version integer not null,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);
`;

export class PgStore implements Store {
  private pool: pg.Pool;
  private ready: Promise<void>;
  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url, max: 5 });
    this.ready = this.pool.query(SCHEMA).then(() => undefined);
  }
  async registerHousehold(id: string, hash: string) {
    await this.ready;
    const r = await this.pool.query("insert into households (id, secret_hash) values ($1,$2) on conflict do nothing", [id, hash]);
    return r.rowCount === 1 ? ("created" as const) : ("exists" as const);
  }
  async getSecretHash(id: string) {
    await this.ready;
    const r = await this.pool.query("select secret_hash from households where id=$1", [id]);
    return (r.rows[0]?.secret_hash as string | undefined) ?? null;
  }
  async appendEvidence(id: string, events: EvidenceEvent[]) {
    await this.ready;
    for (const e of events) {
      await this.pool.query(
        "insert into item_evidence (household_id, profile_id, item_id, context, tier, outcome, at) values ($1,$2,$3,$4,$5,$6,to_timestamp($7/1000.0))",
        [id, e.profileId, e.itemId, e.context, e.tier, e.outcome, e.at],
      );
    }
  }
  async appendPerformance(id: string, events: PerformanceEvent[]) {
    await this.ready;
    for (const e of events) {
      await this.pool.query(
        "insert into game_performance (household_id, profile_id, game, metric, value, at) values ($1,$2,$3,$4,$5,to_timestamp($6/1000.0))",
        [id, e.profileId, e.game, e.metric, e.value, e.at],
      );
    }
  }
  async getSnapshot(id: string) {
    await this.ready;
    const r = await this.pool.query("select version, doc, extract(epoch from updated_at)*1000 as u from snapshots where household_id=$1", [id]);
    const row = r.rows[0];
    return row ? { version: row.version as number, doc: row.doc as unknown, updatedAt: Number(row.u) } : null;
  }
  async putSnapshot(id: string, doc: unknown, baseVersion: number) {
    await this.ready;
    const r =
      baseVersion === 0
        ? await this.pool.query(
            "insert into snapshots (household_id, version, doc) values ($1, 1, $2) on conflict do nothing returning version",
            [id, JSON.stringify(doc)],
          )
        : await this.pool.query(
            "update snapshots set version=version+1, doc=$2, updated_at=now() where household_id=$1 and version=$3 returning version",
            [id, JSON.stringify(doc), baseVersion],
          );
    if (r.rowCount !== 1) return "conflict" as const;
    return { version: r.rows[0].version as number, doc, updatedAt: Date.now() };
  }
  async countEvidence(id: string) {
    await this.ready;
    const r = await this.pool.query("select count(*)::int as n from item_evidence where household_id=$1", [id]);
    return r.rows[0].n as number;
  }
}
