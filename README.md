# Party Português 🎮🇵🇹

A couch party game for learning **A1 European Portuguese** together, built around *Português a Valer 1* (Livro do Aluno + Caderno de Exercícios).
The **TV** is the stage (three.js). **Phones are the controllers**: scan the QR code, pick a creature, play.

- **Noite de Festa**: a continuous game show with no menus between segments: Micro Loucura rush → Mini Aula → Turbo Race → results.
- **Micro Loucura**: 5–8 second microgames (ESCOLHE · COMPLETA · CORRIGE · ARRASTA · NÃO TOQUES · DIZ). The phone turns into buttons, letter tiles, word chips, a drag board, one big button, or a microphone.
- **Turbo Race**: answers are physical. A fast answer gives TURBO, 3 in a row gives COMBO, a wrong answer spins you out. There's an item round with shield, nitro and ink sabotage.
- **Mini Aula**: a 60–90 s animated lesson and a quick check. The race then uses what it taught.
- **Blip**, the MC, reacts to everything (in PT-PT, with optional English subtitles).

The learning engine underneath is built from atomic knowledge items. Each has provenance back to the book, and is generated at four tiers (recognise → recall → transform → use). A tier goes up only after correct answers in **two different games**. Language evidence is stored separately from game performance, so winning races doesn't count as knowing Portuguese.

## Run locally

```bash
npm install
npm run build && npm start      # http://localhost:8787/tv  (phones: /play)
# or, for development with hot reload:
npm run dev                     # TV: http://localhost:5173/tv
```

Phones must reach the same host. On a LAN, open the TV page via your computer's IP (not `localhost`) so the QR code works.
Set `VITE_PUBLIC_URL` at build time to force the URL the QR code encodes.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run content:check
npm run build && npm run e2e    # Playwright: TV + 2 bot phones play a full Party Night; screenshots in e2e-output/
E2E_MODE=race npm run e2e       # micro | race | aula
```

## Architecture

| Path | What |
|---|---|
| `server/` | One Node process: static web build + WebSocket relay (`/ws`) + household persistence API (`/api`). |
| `src/shared/` | zod protocol (validated on every hop), clock sync, SRS, answer checking, RNG. |
| `src/curriculum/` | Knowledge items with provenance, tier generators, lessons, can-dos, PT-PT lint, book source map. |
| `src/learner/` | Evidence vs performance events, mastery model (≥2 contexts to promote), item selector. |
| `src/games/` | Pure game logic: `micro/rush.ts`, `race/race.ts`, `aula/aula.ts`. |
| `src/tv/` | TV runtime (authoritative host), activities, 3D stage (`three/`), DOM screens. |
| `src/phone/` | The controller: one component per controller mode. |

- **Realtime:** the TV is authoritative. The relay owns rooms, codes, **epochs** and tokens. Every message carries `protocolVersion, roomId, roomEpoch, messageId, sequence`. Inputs are de-duplicated by `messageId`, and phones retry until the TV acks them. A host reconnect bumps the epoch, and stale-epoch traffic is dropped.
- **Clock:** phones keep an NTP-style offset to the TV's monotonic `performance.now()`. Buzzers are resolved by synced timestamp.
- **Persistence:** the TV holds the learner model locally and syncs events and snapshots to Postgres (`DATABASE_URL`), authenticated with a household secret. The server stores only its hash. Phones never get household credentials.

### Hosting

- **Railway** (primary): the full server (static build + WebSocket relay + API) and Postgres.
- **Vercel** (optional, for previews): `vercel.json` builds only the static client. It connects to the Railway relay (`VITE_WS_URL`) and proxies `/api` to Railway, because Vercel can't host a persistent WebSocket server.

### Environment

| Var | Purpose |
|---|---|
| `PORT` | HTTP/WebSocket port (default 8787). |
| `DATABASE_URL` | Postgres. Without it, an in-memory store is used. |
| `TOKEN_SIGNING_KEY` | HMAC key for household tokens (set it in production). |
| `VITE_PUBLIC_URL` | (build time) URL encoded in the QR code. |

## Curriculum sources

`docs/curriculum-map.md` and `src/curriculum/source/source-map.json` map every section of the book (structure, objectives, vocabulary, grammar, exercise patterns). The book pipeline is in `scripts/book-pipeline.md`. Book PDFs and page images are **never** committed; all game content is original wording.

Assets and licences: see `ASSETS.md`.
