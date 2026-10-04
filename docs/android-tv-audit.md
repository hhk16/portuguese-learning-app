# Android TV audit and redesign

Inspected branch: `ccr-0f0e31c4-decr5f`, commit `1737c880e32794765c65e1ddc65b9169bb51abee` (the open Party Português PR). The default `master` branch is the older Next.js course and does not contain the tested TV build.

## Findings

- `android-tv/capacitor.config.json` sets `server.url` to a hosted Railway `/tv` page. The APK contains a WebView wrapper, not an offline native learning surface. Startup and availability depend on the site and web runtime.
- `src/tv/three/Stage.tsx` continuously renders an animated WebGL scene and loads every backdrop plus multiple character/pet textures. This introduces avoidable rendering and texture work into TV menus and learning activities. It is a plausible source of lag, not a measured crash diagnosis.
- `src/tv/runtime.ts` runs activity ticks every 20 ms, independently of rendering, with no Activity lifecycle integration. The wrapper does not save a native session or own audio/keep-awake behavior when Android backgrounds it.
- `src/tv/TvApp.tsx` listens for browser key events but the Android package has no native Back implementation. Browser event prevention is not sufficient evidence that Android Activity Back is consumed.
- Games are primarily two-phone activities. Free-text associations, dial targets, drawing, category races, rush orders and character/bet/host overlays add interaction rules that are separate from understanding Portuguese.
- The APK workflow regenerates a Capacitor project and publishes a debug release. Changing only CSS would preserve these structural problems.

## Resulting implementation

Replace the entire Android entrypoint with a native offline course and four concrete games. Keep the original curriculum provenance and licensed speech. Use actual Android focus, predictable menu hierarchy, clear rules before every game, explicit shared-remote turns, no forced timing, readable answer feedback, finite retries and durable session snapshots. Remove the heavy web stage from the APK.

No physical-device crash trace was available during inspection. The report of unexpectedly returning to Android remains a device acceptance criterion; it cannot honestly be marked reproduced or fixed solely from code inspection.
