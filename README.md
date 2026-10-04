# Party Português — native Android TV and browser party app

## Android TV

The Android TV app has been rebuilt as a **native, offline, remote-controlled app**. It bundles 78 course lessons and European Portuguese recordings. The games now teach concrete skills: choose a reply, understand a café order, identify spoken Portuguese, and complete a sentence. Play solo or take turns with one remote.

Build, APK downloads, controls and verification: [android-tv/README.md](android-tv/README.md). Inspection findings: [docs/android-tv-audit.md](docs/android-tv-audit.md).

## Browser party app

The following describes the separate TV-browser and phone-controller experience.

A couch party game for learning **A1 European Portuguese** together, built around *Português a Valer 1* (Livro do Aluno + Caderno de Exercícios).
The **TV** is the stage (three.js): a sunny toy world where your cartoon characters stand, cheer and wobble with the game. **Phones are the controllers**: scan the QR code, pick your character, play. Only the TV speaks (pre-recorded European Portuguese), so two phones side by side never talk over each other.

- **Aprender juntos** — 16 lessons in book order (Units 0–1 plus everyday A1 words). You both answer the same exercise privately on your phones; the TV then reveals both answers together. Both right = a team star ⭐. For speaking exercises, your partner decides if you said it well.
  - **A lesson runs:** tip → new words (picture + Portuguese + English + audio) → exercises that ramp up: listen and tap, what does it mean?, how do you say it?, match the pairs, complete the sentence, build the sentence, say it out loud. Mistakes come back once; English is shown while a word is new, then one tap away.
- **Jogar** — six games for two, using the words you've learned:

  | Game | Style | What you do |
  |---|---|---|
  | **Pares Secretos** 🕵️ | co-op, Codenames Duet | Give Portuguese clues out loud; your partner finds your secret pictures. Avoid the bombs. |
  | **Na Mesma Onda** 🔮 | co-op, Wavelength | Frio ↔ quente: one sees the target on a dial and says one word; the other turns the dial. |
  | **Em Sintonia** 🤝 | co-op | Two words appear; both write one word that links them. Same word = in sync. |
  | **Desenha!** 🎨 | co-op, Pictionary | One draws the secret word on their phone (live on the TV); the other picks it from six Portuguese words. |
  | **Stop!** ⏱️ | versus | A letter, four categories, a word each. Finish first and shout STOP. Your partner votes on words the dictionary doesn't know. |
  | **Cozinha Caótica** 🍳 | co-op rush | Customers order out loud ("Queria dois cafés e um pão, por favor"). Half the food is on each phone — talk, fill the tray, serve. Watch out for *Troca!* |

- **Pause.** Back on the TV remote (or ⏸ on any phone) pauses the game clock: Continuar · Recomeçar · Sair para o menu.
- **Installable controller.** `/play` is a PWA and keeps the screen awake while you play.

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
npm run build && npm run e2e    # Playwright: TV + 2 bot phones play a lesson and all six games; screenshots in e2e-output/
E2E_MODES=draw,kitchen npm run e2e   # just some (lesson | secret | wave | sync | draw | stop | kitchen)
```

## Architecture

| Path | What |
|---|---|
| `server/` | One Node process: static web build + WebSocket relay (`/ws`) + household persistence API (`/api`). |
| `src/shared/` | zod protocol (validated on every hop), clock sync, SRS, answer checking, RNG. |
| `src/curriculum/` | Knowledge items with provenance, tier generators, lessons, can-dos, PT-PT lint, book source map. |
| `src/learner/` | Evidence vs performance events, mastery model (≥2 contexts to promote), item selector. |
| `src/games/` | One folder per activity: `learn/`, `secret/`, `wave/`, `sync/`, `draw/`, `stop/`, `kitchen/`. |
| `src/tv/` | TV runtime (authoritative host), activities, 3D stage (`three/`), DOM screens. |
| `src/phone/` | The controller: one component per controller mode. |

- **Realtime:** the TV is authoritative. The relay owns rooms, codes, **epochs** and tokens. Every message carries `protocolVersion, roomId, roomEpoch, messageId, sequence`. Inputs are de-duplicated by `messageId`, and phones retry until the TV acks them. A host reconnect bumps the epoch, and stale-epoch traffic is dropped.
- **Clock:** the TV runs a pausable game clock; phones keep an NTP-style offset to it and count down locally from each view.
- **Audio:** `scripts/audio/` pre-renders every line the TV can say (lesson words, café orders, Stop! letters) into `public/audio/` — see `scripts/audio/README.md`.
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
