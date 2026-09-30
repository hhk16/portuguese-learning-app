# Party Português 🎮🇵🇹

A couch party game for learning **A1 European Portuguese** together, built around *Português a Valer 1* (Livro do Aluno + Caderno de Exercícios).
The **TV** is the stage (three.js). **Phones are the controllers**: scan the QR code, pick a creature, play.

- **Aprender**: Duolingo-style lessons, played side by side. Each of you plays at your own pace on your own phone, with no timers, while the TV shows both progress lanes, hearts, streaks and the new words. There are 11 lessons covering Units 0–1 in book order: greetings, survival phrases, ser, ter, -ar verbs, chamar-se, nationalities, professions, de/do/da, em/no/na, and numbers 0–20.
  - **A lesson runs:** tip → new words (picture + Portuguese + English + audio) → exercises that ramp up: listen and tap, what does it mean?, how do you say it?, match the pairs, complete the sentence, build the sentence, say it out loud.
  - **Feedback:** select → VERIFICAR → a green or red sheet with the answer, its English and a tip.
  - **Mistakes** come back once at the end.
  - **English is adaptive:** shown while a word is new, then one tap away.
- **After a lesson, play with its words:**
  - **Diz-me!** (co-op): one of you sees a word and must *say* it in Portuguese; the other taps the matching picture. Beat your record.
  - **Apanha!** (versus): the TV says a word, then pictures flip one by one, and the first to slam their phone on the right one takes it. A false slam freezes you. Warm-up rounds show the word written; later rounds are ear-only and worth ×2.
- **Noite de Festa**: a continuous game show with no menus between segments: Micro Loucura → Apanha! → Diz-me! → Turbo Race → results, using the words from the lessons you've done.
- **Micro Loucura** and **Turbo Race**: the fast arcade games. Every question is also read aloud, with 🔊 to hear it again, and the English meaning is shown while a word is new.
- **Audio:** everything Portuguese is spoken aloud (European Portuguese voice when the device has one; 🐢 for slow). If the TV has no Portuguese voice, a phone reads instead.
- **The phone is a second screen.** Every prompt is mirrored on the phone, so nobody has to look back and forth.
- **Pause and speed.** Back on the TV remote (or ⏸ on any phone) pauses the game clock: Continuar · Velocidade · Recomeçar · Sair para o menu. Speed is **Calma 🐢** (the default, ≈1.7× time), **Normal** or **Turbo ⚡**.
- **Installable controller.** `/play` is a PWA: "Adicionar ao ecrã principal" on Android or iPhone gives a full-screen app icon, and the screen stays awake while you play.
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
E2E_MODE=lesson E2E_NEXT=dizme npm run e2e   # lesson → Diz-me! (modes: party | lesson | dizme | snap | micro | race)
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
