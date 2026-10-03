/** Prefixes a public/ asset path with Vite's base URL ("/" by default; also safe under plain Node). */
const BASE: string = import.meta.env?.BASE_URL ?? "/";

export function assetUrl(path: string): string {
  return `${BASE.endsWith("/") ? BASE : `${BASE}/`}${path.replace(/^\//, "")}`;
}
