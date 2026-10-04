# Native Party Português for Android TV

This is an Android application written in Java using native Android Views. It has no WebView, Capacitor, browser runtime, WebGL, network permission, remote website, or mandatory phone controller. The existing web party app is a separate surface.

The TV app bundles the original course's **78 lessons**, covering Units 0–8 and the review blocks, with European Portuguese speech. Course content is generated from `src/curriculum/` rather than maintained in a second curriculum. Only speech referenced by the native course and activities is packaged.

## Build

Install JDK 17+, Android SDK platform 35 and Gradle 8.11.1. Node 24 strips the curriculum's TypeScript types; no npm install is required for the Android app.

```sh
cd android-tv
gradle :app:assembleDebug :app:lintDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The `Native Android TV` GitHub Actions workflow builds a sideloadable APK, runs native TV emulator interaction checks and captures screenshots. Download the `native-portugues-tv-<commit>` artifact from the workflow run. This workflow never publishes or overwrites the existing `tv-latest` release.

The package ID remains `pt.partyportugues.tv`. Debug builds use the build machine's debug signing key. Android will reject an in-place update if the older APK was signed with a different key; uninstall that old build before installing this review APK. Old web progress is stored separately and is not imported into native progress.

## Interaction design

The compact top menu has Home, Lessons, Play, Phrases, Progress and Settings. The playful family design uses cream, indigo, cobalt focus outlines, pastel cards and bundled Nunito type. New Portuguese street/café scenes preserve Hadi and Anna's original character likenesses; original waves and new close-up character poses appear in teaching, player turns, feedback and results. Settings chooses the solo companion. Real focusable Android controls handle directional navigation and scroll the focused item into view.

Café answer trays show the actual items and quantities using eight transparent food sprites. Each game has its own scene or symbol, short numbered instructions and an example. Artwork is decoded once away from the UI thread at bounded sizes. Only 23 selected images are packaged; there is no continuous render loop or loading of the old backdrop/wardrobe library. See [the visual design notes](../docs/native-tv-design.md) for asset provenance and budgets.

All games begin with a goal, instructions, controls, solo/together selection and an explanation of how turns advance. Together mode shares one remote and names the current player; it keeps a household score and progress rather than claiming to measure individual mastery.

| Activity | Goal and interaction |
| --- | --- |
| Choose the reply | Read a specific everyday situation; choose the appropriate Portuguese reply. |
| At the café | Replay a customer's recorded order; select a tray with the correct items **and quantities**. |
| Listen & find | Replay a bundled Portuguese clip; choose its meaning or discriminate a minimal pair. |
| Complete the sentence | Read the gap and tense/meaning hint; choose the correct word; see the corrected sentence. |
| Review mistakes | Revisit previously missed items, removing them from the review list after a correct answer. |

Lessons teach before questioning. A session contains at most eight items. Errors return once; there are no timers, forced transitions, lives, penalty sounds, word association guesses, drawing controls, bets or simultaneous phone inputs. Feedback waits for Continue. Listening's Show transcript fallback does not earn listening points. A held OK button cannot answer the same question twice.

Back opens Pause during a session, follows the hierarchy in menus, and requires an explicit Exit choice from Home. Losing foreground focus stops speech, saves the current state and clears the keep-awake flag. Relaunch offers Resume; Activity recreation restores the current screen and answer order. There is no automatic navigation to device TTS or Android settings.

## Phrases and revision

Phrases contains six illustrated topics and 45 useful utterances with situations, tips, replay, slower replay, saved favourites and practice. The reply game has 37 concrete situations. Scheduled revision uses 1, 3, 7, 14 and 30 day intervals; same-day repetitions do not advance the schedule. Old correctly practised items become available for revision without resetting progress.

50 clips were generated and checked locally with free Qwen3-TTS models. Older human recordings are retained; the rest of the existing course has not been blindly revoiced. See [the speech audit](../docs/native-audio-audit.md) for evidence, provenance and the limits of automatic checks.

## Verification and release limits

Pure-Java checks cover finite retries, explicit advance, repeated inputs, transcript scoring, deterministic restoration and two-player restart. Instrumentation checks exercise real D-pad events, instruction screens, named player turns, Back, offline packaging, relaunch restoration, native-game review, artwork decoding/transparency, companion selection and a complete lesson session. Screenshots of home, all four games, character turns, settings, progress and results are captured from the Android TV emulator.

The app still needs an acceptance pass on the reported Android box: 720p/1080p/4K at its configured display scaling, sustained navigation, a complete lesson and each game, Home/resume, sleep/wake and repeated Back. A successful emulator build does not establish the cause of a crash on that physical box. Use `adb logcat -b crash` if exits recur.

The old games remain in the browser app for compatibility. The native TV menu removes Pares Secretos, Na Mesma Onda, Em Sintonia, Desenha, Stop, Cozinha Caótica, Batata Quente and Grande Final, replacing their interaction model with the activities above. Phone pairing and a personal progress profile for each player are outside this native version.
