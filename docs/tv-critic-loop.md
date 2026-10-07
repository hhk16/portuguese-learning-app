# Native TV critic refinement

The app is reviewed by a dedicated critic independently of the builder. Each round uses fixed weights: visual storytelling 20%, layout/art direction 15%, TV interaction/robustness 25%, instructions 15%, learning/progression 20%, engagement 5%. Exit at 8/10 or higher; at most three rounds. A blocking defect prevents a pass. Emulator evidence cannot establish physical Strong-box performance or pronunciation quality.

## Round 1 — 7.0/10, refine

The critic found clipped chapter subtitles, technical metadata used as English grammar meanings, inaccessible later phrase/listening sets, sparse global distractors that reintroduced untaught meanings, and 194 missing course recordings. It also recommended meaningful contextual art and simpler progress copy.

## Builder revision — 2.6.0

- Separate teaching meaning, natural speech and grammar context from legacy answer values. All conjugations have a contextual example and meaning; past ser/ter retain past translations, commands omit spoken subjects, and origin questions retain the place cue.
- Resolve speech through the curriculum's natural spoken text. Existing local recordings cover the missing cards; no additional synthesis is necessary. The complete export bundles 1,421 clips. Example sentences are labelled read-only; Listen plays the taught form.
- Chapter cards fit their contents; subtitle checks measure text inside the card, including chapters below the viewport.
- Phrase and listening sets have durable topic identity and offsets, next-expression actions and completion states. Balanced batches cover 6-, 7- and 8-item topics without singleton remainders. Current-set replay remains available.
- New recognition choices come directly from the taught meanings. A singleton/mixed course remainder introduces a related contrast before recall. A saved rule version preserves previous snapshots' choice order.
- Reuse contextual scenes for grammar examples and replace scheduling implementation details with a next-revision state.
- Extend the 15 existing emulator flows with grammar/audio inventory, chapter-child bounds and later-topic progression/resume checks. Verify recognition options across every course batch.

## Round 2 — 8.1/10, design threshold met

The same independent critic inspected 27 fresh emulator captures plus the revised source. The weighted score is 8.05, reported as 8.1/10. Category scores: visual storytelling 7.8, art/layout 8.2, native TV interaction 8.0, instructions 8.3, learning/progression 8.2, engagement 7.4. The threshold is met after two rounds; no third design round is required.

The critic confirmed complete chapter labels, meaningful grammar examples/meanings, origin cues, access to all later topic expressions, taught recognition choices and complete current-course speech. Additional source review led to clearing topic cursors on reset and focusing Next expressions in compact recap rows.

Remaining follow-ups are semantic art variety, more natural past-ser examples, optional speech for full examples and more taught café/conversation scenarios. None was judged a blocking design defect. The score does not certify pronunciation, measured learning outcomes or physical Strong-box performance.

Final verification is recorded with the delivered APK and captures after the clean rerun. The previous run passed 17/18; its single failure was an older fixture expecting a singleton saved phrase to begin a quiz after one Practice press. The deliberate two-expression contrast flow is now tested by completing both teaching steps and asserting the two-item set.


## Final verification and delivery

Final verification: [run37562075655](https://github.com/hhk16/portuguese-learning-app/actions/runs/37562075655) passed APK/test-APK build, lint, pure Java checks and **18/18 Android TV emulator flows**, with zero failures/skips and an empty crash buffer. The delivered APK is2.6.0/code8 from native source60c4696;69 captures accompany it. All1,421 bundled speech files match the decoded source audit, and all1,321 distinct included course cards have speech. Frame-time and physical Strong-box evidence remain unverified.

Installation limit: this is a debug review APK. Its certificate differs from the previously delivered2.5 APK, so Android cannot install it over that APK. Removing an installed copy would erase its local learning progress; preserve that progress before any reinstall. A stable release signing setup is still needed for seamless future updates.
