# PT A1 Portuguese (European) – Interactive Course

A Next.js + TypeScript + Tailwind app for English speakers learning A1 European Portuguese. Includes lessons, flashcards, listening, typing, and a spaced repetition practice mode with XP and streaks.

## Run locally

```powershell
cd pt-a1-portuguese
npm install
npm run dev
```

Visit http://localhost:3000

## Features
- Modules and lessons with multiple exercise types
- Flashcards, MCQ, typing with accent keyboard, listening with TTS (PT-PT when available)
- XP, streaks, lesson completion tracking (local persistence)
- Quick Practice (SRS) with SM-2–style scheduler
- Stats dashboard

## Tech
- Next.js App Router, TypeScript
- TailwindCSS
- Zustand for state and persistence
- Web Speech API (TTS)

## Notes
- TTS uses the browser voices. For best results, install a European Portuguese voice on your OS.
- Data is stored locally in your browser. 