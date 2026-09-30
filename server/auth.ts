/**
 * Household identity.
 *
 * On first setup the TV generates a random householdId and a high-entropy secret and registers
 * them. The server stores only sha256(secret) — the secret itself is 32 random bytes, so a fast
 * hash is sufficient (nothing to brute-force). The TV exchanges the secret for a short-lived
 * HMAC-signed token and sends that as a Bearer token on persistence requests.
 *
 * Phones never see any of this: their room-scoped player tokens are random strings known only to
 * the relay, and they are not valid household tokens.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function verifySecret(secret: string, storedHash: string): boolean {
  const a = Buffer.from(hashSecret(secret), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export class TokenSigner {
  private readonly key: Buffer;
  constructor(key?: string) {
    this.key = key ? Buffer.from(key, "utf8") : randomBytes(32);
  }

  sign(householdId: string, now = Date.now()): { token: string; expiresAt: number } {
    const expiresAt = now + TOKEN_TTL_MS;
    const payload = `${householdId}.${expiresAt}`;
    const mac = createHmac("sha256", this.key).update(payload).digest("base64url");
    return { token: `${Buffer.from(payload).toString("base64url")}.${mac}`, expiresAt };
  }

  /** Returns the householdId for a valid, unexpired token, else null. */
  verify(token: string, now = Date.now()): string | null {
    const [p64, mac] = token.split(".");
    if (!p64 || !mac) return null;
    let payload: string;
    try {
      payload = Buffer.from(p64, "base64url").toString("utf8");
    } catch {
      return null;
    }
    const expected = createHmac("sha256", this.key).update(payload).digest();
    const got = Buffer.from(mac, "base64url");
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
    const dot = payload.lastIndexOf(".");
    const householdId = payload.slice(0, dot);
    const expiresAt = Number(payload.slice(dot + 1));
    if (!householdId || !Number.isFinite(expiresAt) || expiresAt < now) return null;
    return householdId;
  }
}
