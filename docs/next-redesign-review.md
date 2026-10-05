# Next redesign: experience review

Reviewed the native Java implementation and actual emulator screenshots used in the video walkthrough. These findings concern the current native TV app. Recommendations below are not implemented changes. Performance and speech quality still require observation on the Strong box and human listening respectively.

## 1. Make the learning path clear

Home leads with a generic headline and a Portuguese lesson title. A beginner cannot easily tell what they will learn, how the course relates to Picture worlds and Phrases, or why they should choose one path over another. Chapter cards similarly show Portuguese titles without the available English subtitle.

Replace the generic headline with a concrete goal, such as “Today: greet someone in Portuguese”. Show one recommended action, the learner's current chapter and a short English outcome. Resume should name the actual unfinished activity. Keep optional practice visible below the main recommendation.

## 2. Make activities behave differently

The café has useful visual trays, and picture matching has actual objects. Several other activities remain the same four-answer quiz with a different title and illustration. “Choose the reply” often explicitly translates an English sentence rather than staging a conversation. Review is presented as another game even though it is a learning service.

Prioritize three strong interactions:

- Café: hear an order, add objects and quantities to one tray using arrows and OK, then serve. Start with one item before introducing quantities and mixed orders. Keep tray matching as an easier practice mode.
- Conversation: hear a short line, choose a reply in context, then see and hear the exchange continue. Use hand-authored branches that reuse bundled recordings. Teach unfamiliar replies before testing them.
- Picture worlds: introduce a coherent set, match a picture from audio, then revisit the words after intervening questions. Use pictures as the learning target, with Hadi and Anna providing brief guidance.

Move revision to the daily recommendation and Progress. Fold fill-the-gap exercises into the relevant course lessons unless they offer an interaction worth its own activity.

## 3. Improve the teaching sequence

In learn mode, each teaching card is immediately followed by its own recognition question. That checks a very recent answer, and most activities otherwise start directly at questions. Conversation and café decks shuffle without a beginner introduction tied to the items selected.

Use a short sequence: encounter two or three connected expressions, practise with help, then recall them after another item. Preserve a bounded session and deliberate advancement. Show an example before the first unfamiliar game mechanic. Never require a learner to guess language that has not been introduced.

Help should be useful coaching. The current transcript action ends the question and marks it missed. Offer “Show a hint” and “Show the answer” as distinct actions, track assisted answers separately from independent recall, and retain a later unassisted retry. Explain this in simple language rather than emphasizing lost points.

## 4. Make outcomes useful

Results emphasize the first-try fraction and generic encouragement, including the same “A lovely start” text after a low score. The learner does not get a browsable recap of the actual expressions that worked or need practice.

Show two or three expressions from the session with replay, and a short distinction between independent recall, assisted practice and items needing another try. Recommend one next action based on those outcomes: revisit the difficult expressions or continue to the next set. Do not infer speaking ability from a multiple-choice score.

## 5. Improve visual hierarchy and TV interaction

The rounded family style and Hadi/Anna assets provide a coherent base. Heavy type dominates nearly every level, scene thumbnails repeatedly crop the same faces, and full navigation remains above each question. Some teaching screens label the step “QUESTION” and keep “OK Answer” in the footer even before an answer can be chosen.

Keep the approved characters and style. Give learning content the strongest emphasis, reduce decorative scene size where it competes with the task, and use distinct thumbnails that communicate the activity. Separate lesson teaching, listening, choosing and feedback states visibly. Give each state accurate remote guidance.

During an activity, simplify the header to the activity, phase, progress and Pause. Make the current focus visually distinct from the selected menu tab. Preserve the selected menu item and scroll position when returning from a child screen. Verify focus paths and content fit at the box's actual resolution and display scaling.

## 6. Make speech part of the lesson

The app has offline playback, replay and a global slower preference, but teaching and feedback mainly offer one Listen button. A media shortcut exists and the screen has a playing state. Technical audio checks already exist; they do not establish naturalness or pronunciation quality.

Provide consistent normal/slow controls where language is introduced. Build optional listen–repeat–compare practice without claiming microphone assessment. Have a European Portuguese listener review a representative sample before deciding which clips need replacement; preserve clips that are clear and natural. Verify volume consistency and intelligibility through the Strong box and television speakers.

## First implementation slice

Implement and demonstrate one complete café learning journey before propagating another full visual redesign: clear Home recommendation → introduce the relevant words → guided tray building → independent order → useful recap and next action. Validate it using only a TV remote, capture the actual flow, and use that evidence to judge clarity and enjoyment.

This review did not change application behavior or generate new speech/assets. Physical-device stability remains unverified.
