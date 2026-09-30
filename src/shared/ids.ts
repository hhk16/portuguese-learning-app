/** Random identifiers (crypto-grade, works in browsers and Node 22). */
export function randomId(bytes = 12): string {
  const a = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(a);
  return base64url(a);
}

export function base64url(a: Uint8Array): string {
  let s = "";
  for (const b of a) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Room codes avoid vowels (no accidental words) and ambiguous letters. */
const CODE_ALPHABET = "BCDFGHJKLMNPQRSTVWXZ";
export function roomCode(len = 4): string {
  const a = new Uint8Array(len);
  globalThis.crypto.getRandomValues(a);
  return [...a].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}
