/**
 * HTTP API for household persistence. Every learner-data route requires a valid household
 * Bearer token; the householdId used for queries always comes from the verified token.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { EvidenceEvent, PerformanceEvent } from "../src/learner/events.ts";
import { hashSecret, TokenSigner, verifySecret } from "./auth.ts";
import type { Store } from "./store.ts";

const HouseholdCreds = z.object({
  householdId: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
  secret: z.string().min(32).max(128),
});
const EvidenceBatch = z.object({ events: z.array(EvidenceEvent).max(500) });
const PerformanceBatch = z.object({ events: z.array(PerformanceEvent).max(500) });
const SnapshotPut = z.object({ baseVersion: z.number().int().nonnegative(), doc: z.unknown() });

const MAX_BODY = 512_000;

export function createApi(store: Store, signer: TokenSigner) {
  async function readJson(req: IncomingMessage): Promise<unknown> {
    let size = 0;
    const chunks: Buffer[] = [];
    for await (const c of req) {
      size += (c as Buffer).length;
      if (size > MAX_BODY) throw new HttpError(413, "body too large");
      chunks.push(c as Buffer);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8") || "null");
    } catch {
      throw new HttpError(400, "invalid json");
    }
  }

  function auth(req: IncomingMessage): string {
    const h = req.headers.authorization ?? "";
    const m = /^Bearer (.+)$/.exec(h);
    const householdId = m ? signer.verify(m[1]!) : null;
    if (!householdId) throw new HttpError(401, "unauthorized");
    return householdId;
  }

  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url ?? "/", "http://x");
    if (!url.pathname.startsWith("/api/")) return false;
    try {
      const route = `${req.method} ${url.pathname}`;
      switch (route) {
        case "GET /api/health":
          return send(res, 200, { ok: true });
        case "POST /api/household/register": {
          const c = HouseholdCreds.parse(await readJson(req));
          const r = await store.registerHousehold(c.householdId, hashSecret(c.secret));
          if (r === "exists") throw new HttpError(409, "household exists");
          return send(res, 201, { ok: true });
        }
        case "POST /api/auth/token": {
          const c = HouseholdCreds.parse(await readJson(req));
          const hash = await store.getSecretHash(c.householdId);
          if (!hash || !verifySecret(c.secret, hash)) throw new HttpError(401, "bad credentials");
          return send(res, 200, signer.sign(c.householdId));
        }
        case "POST /api/evidence": {
          const hh = auth(req);
          const b = EvidenceBatch.parse(await readJson(req));
          await store.appendEvidence(hh, b.events);
          return send(res, 200, { ok: true, stored: b.events.length });
        }
        case "POST /api/performance": {
          const hh = auth(req);
          const b = PerformanceBatch.parse(await readJson(req));
          await store.appendPerformance(hh, b.events);
          return send(res, 200, { ok: true, stored: b.events.length });
        }
        case "GET /api/snapshot": {
          const hh = auth(req);
          return send(res, 200, (await store.getSnapshot(hh)) ?? { version: 0, doc: null, updatedAt: 0 });
        }
        case "PUT /api/snapshot": {
          const hh = auth(req);
          const b = SnapshotPut.parse(await readJson(req));
          const r = await store.putSnapshot(hh, b.doc, b.baseVersion);
          if (r === "conflict") throw new HttpError(409, "version conflict");
          return send(res, 200, { version: r.version });
        }
        default:
          throw new HttpError(404, "not found");
      }
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      if (e instanceof z.ZodError) return send(res, 400, { error: "invalid request" });
      console.error(e);
      return send(res, 500, { error: "internal" });
    }
  };
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function send(res: ServerResponse, status: number, body: unknown): true {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
  return true;
}
