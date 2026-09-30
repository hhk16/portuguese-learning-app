import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { createApi } from "../server/api.ts";
import { TokenSigner } from "../server/auth.ts";
import { MemoryStore } from "../server/store.ts";

async function withServer(fn: (base: string) => Promise<void>) {
  const api = createApi(new MemoryStore(), new TokenSigner("test-key"));
  const server = createServer(async (req, res) => {
    if (!(await api(req, res))) res.writeHead(404).end();
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as { port: number }).port;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

const creds = { householdId: "hh_aaaaaaaaaaaaaaaa", secret: "s".repeat(40) };
const post = (base: string, path: string, body: unknown, token?: string) =>
  fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });

describe("household auth", () => {
  it("token signer rejects tampering and expiry", () => {
    const s = new TokenSigner("k");
    const { token } = s.sign("hh1", 1000);
    expect(s.verify(token, 2000)).toBe("hh1");
    expect(s.verify(token, 1000 + 61 * 60_000)).toBeNull();
    expect(s.verify(token.replace(/.$/, (c) => (c === "A" ? "B" : "A")), 2000)).toBeNull();
    expect(new TokenSigner("other").verify(token, 2000)).toBeNull();
  });

  it("no endpoint reads or writes learner data without a household token", async () => {
    await withServer(async (base) => {
      expect((await fetch(base + "/api/snapshot")).status).toBe(401);
      expect((await post(base, "/api/evidence", { events: [] })).status).toBe(401);
      expect((await post(base, "/api/evidence", { events: [] }, "random-player-token-abcdefghijklmnop")).status).toBe(401);
      expect((await fetch(base + "/api/snapshot", { method: "PUT", body: "{}" })).status).toBe(401);
    });
  });

  it("register → token → scoped writes; wrong secret rejected; households isolated", async () => {
    await withServer(async (base) => {
      expect((await post(base, "/api/household/register", creds)).status).toBe(201);
      expect((await post(base, "/api/household/register", creds)).status).toBe(409);
      expect((await post(base, "/api/auth/token", { ...creds, secret: "x".repeat(40) })).status).toBe(401);
      const { token } = await (await post(base, "/api/auth/token", creds)).json();
      const ev = { profileId: "p1", itemId: "grammar.ter.eles", context: "micro.escolhe", tier: 1, outcome: "correct", at: Date.now() };
      expect((await post(base, "/api/evidence", { events: [ev] }, token)).status).toBe(200);

      const other = { householdId: "hh_bbbbbbbbbbbbbbbb", secret: "t".repeat(40) };
      await post(base, "/api/household/register", other);
      const t2 = (await (await post(base, "/api/auth/token", other)).json()).token;
      const put = await fetch(base + "/api/snapshot", { method: "PUT", headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ baseVersion: 0, doc: { a: 1 } }) });
      expect(put.status).toBe(200);
      const snap2 = await (await fetch(base + "/api/snapshot", { headers: { authorization: `Bearer ${t2}` } })).json();
      expect(snap2.doc).toBeNull(); // other household sees nothing
      const conflict = await fetch(base + "/api/snapshot", { method: "PUT", headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ baseVersion: 0, doc: {} }) });
      expect(conflict.status).toBe(409);
    });
  });
});
