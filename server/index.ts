/**
 * Party Português server: static web build + WebSocket relay + household persistence API.
 * One process, one Railway service.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { WebSocketServer } from "ws";
import { createApi } from "./api.ts";
import { TokenSigner } from "./auth.ts";
import { Relay } from "./relay.ts";
import { MemoryStore, PgStore } from "./store.ts";

const PORT = Number(process.env.PORT ?? process.env.PP_SERVER_PORT ?? 8787);
const DIST = resolve(import.meta.dirname, "../dist");

const store = process.env.DATABASE_URL ? new PgStore(process.env.DATABASE_URL) : new MemoryStore();
if (!process.env.DATABASE_URL) console.warn("[pp] DATABASE_URL not set — using in-memory store");
if (!process.env.TOKEN_SIGNING_KEY) console.warn("[pp] TOKEN_SIGNING_KEY not set — tokens reset on restart");
const signer = new TokenSigner(process.env.TOKEN_SIGNING_KEY);
const api = createApi(store, signer);
const relay = new Relay();

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".glb": "model/gltf-binary",
  ".webmanifest": "application/manifest+json",
};

const server = createServer(async (req, res) => {
  try {
    if (await api(req, res)) return;
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end();
      return;
    }
    const url = new URL(req.url ?? "/", "http://x");
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    let file = join(DIST, path);
    if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
      file = join(DIST, "index.html"); // SPA routes: /tv, /play, /
      path = "/index.html";
    }
    if (!existsSync(file)) {
      res.writeHead(503, { "content-type": "text/plain" }).end("Web build missing — run `npm run build`.");
      return;
    }
    const immutable = path.startsWith("/assets/");
    res.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "application/octet-stream",
      "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
    });
    if (req.method === "HEAD") return void res.end();
    createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500).end();
  }
});

const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 64 * 1024 });
wss.on("connection", (ws) => {
  const conn = relay.connect({
    send: (d) => ws.readyState === ws.OPEN && ws.send(d),
    close: (code, reason) => ws.close(code, reason),
  });
  let alive = true;
  ws.on("pong", () => (alive = true));
  const hb = setInterval(() => {
    if (!alive) return ws.terminate();
    alive = false;
    ws.ping();
  }, 15_000);
  ws.on("message", (data) => conn.onMessage(data.toString()));
  ws.on("close", () => {
    clearInterval(hb);
    conn.onClose();
  });
  ws.on("error", () => ws.terminate());
});

setInterval(() => relay.sweep(), 30_000).unref();

server.listen(PORT, () => console.log(`[pp] listening on :${PORT}`));
