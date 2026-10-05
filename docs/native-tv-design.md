# Native TV visual design

The approved direction is playful family: warm cream, deep indigo text, cobalt focus, pastel chapter cards, rounded Nunito type, and Portuguese tiled streets and cafés. The UI is composed of native Android controls and Canvas artwork, with a compact top menu and a dedicated question layout. Text and controls remain real, selectable UI; screenshots and generated concept boards are never used as the interface.

Hadi and Anna appear in the welcome, café and conversation scenes. These new images use the existing photo-derived `hadi-wave.webp` and `ana-wave.webp` illustrations as references. The original waving poses and faces are reused; new close-up thinking and cheering poses preserve their likeness and stay crisp on TV. The repository's `ana` asset key is displayed as Anna, matching the owner's preferred name. Settings chooses the solo companion; together mode names Hadi and Anna's alternating turns. This is shared TV progress, not separate personal mastery.

The café trays compose individual food sprites from each answer's quantities, so two coffees really show two cups and a mixed order shows both types of item. Captions remain available for readability and accessibility. The practice activities have distinct scene or symbol artwork, explicit instructions, examples, player turns and deliberate Continue feedback. Playback controls indicate when speech is playing.

## Asset provenance and budget

- `public/art/native-tv/{home,cafe,conversation}.webp`: newly generated with OpenAI image generation using the original Hadi/Ana artwork as references. No unrelated replacement characters.
- `public/art/native-tv/{coffee,milk,bread,soup,icecream,cake,croissant,water}.webp`: newly generated isolated transparent food objects.
- Scene artwork is exported at a maximum of 1,100 pixels, food at 256 pixels and character close-ups at 720 pixels. The generated PNG originals remain outside the repository. The compressed new art and font total about 2.3 MB.
- Only 37 selected images are packaged. Bitmaps are decoded once on the catalogue worker with bounded dimensions, not in draw calls. There is no WebGL, continuous animation loop, network fetch or import of the entire old wardrobe/backdrop library.
- `public/art/native-tv/fonts/{nunito,nunito-bold}.ttf`: static Nunito weights 600 and 900 from Google Fonts, SIL OFL 1.1; licence bundled beside it and in the APK.

The Native Android TV workflow captures actual emulator screens, tests artwork decoding/transparency, companion selection and full session completion, and retains the previous remote, audio, scoring, Back and restoration checks. Device acceptance on the owner's Strong box is still required.

## Learning expansion

Six illustrated real-life topics contain 45 practical phrases with situations, usage tips, normal/slow replay, saved favourites and practice. Market, transport, home and pharmacy scenes preserve Hadi and Anna. The reply game draws from 37 explicit situations, including 29 new phrasebook situations with the intended English message so replies are unambiguous. Vocabulary teaching shows matching food sprites where available, and grammar, gender and contraction cards have additional coaching. The chapter picker uses scene thumbnails.

Revision returns correctly practised items after 1, 3, 7, 14 and 30 days; unresolved mistakes are ready immediately. Same-day retries do not increase the interval. This is scheduled recognition practice, not a claim of individual mastery or a clinical learning assessment. Existing progress migrates by making previously practised unscheduled items available for revision. See [the local audio audit](native-audio-audit.md) for generation, provenance and limitations.

## Picture worlds (2.3)

Four coherent sets introduce 16 illustrated nouns: café food, home objects, animals and transport. A world first presents four selectable pictures with Portuguese articles, English meanings and existing offline European Portuguese recordings. “Learn these four” teaches each word before a picture question; “Listen & match pictures” hides both the target text and English option captions. Four large picture choices use the same finite, deliberate session flow. Transcript help skips listening points, mistakes return once, and correct recognition is scheduled for revision. These are additional visual exercises for existing vocabulary, not 16 newly invented curriculum words.

The results show the set of pictures just practised and offer listening practice or another world. Each world's counter records correct practice, not fluency or pronunciation quality. Saying the words aloud is encouraged but not automatically scored. Saved sessions restore the exact card/options, including picture challenges.

Home includes a direct Picture worlds card with an illustrated cat, alongside phrases and revision. The main Continue button and Lessons menu retain the course path. Play uses six equally sized cards in two rows, each explaining the skill it teaches. Chapter cards have consistent heights, a chapter label and a short title; descriptions move to the chapter page. The new park and coastal journey scenes use the approved Hadi/Anna welcome scene as their character reference. Twelve isolated transparent object sprites are newly generated: cat, dog, bird, fish, book, chair, table, key, car, train, bus and bicycle. Scene illustrations are decorative; selectable vocabulary pictures provide the explicit learning targets.

All 14 new illustrations were generated with OpenAI image generation. Scene exports remain bounded to 1,100 pixels; object sprites are 256-pixel WebP with alpha. No additional network permission, runtime model, rendering loop or web dependency is introduced. Audio reuses already bundled noun recordings; no additional voice generation is needed for this expansion.

## Café learning journey (2.4)

The café starts with four selectable spoken nouns (coffee, milk, bread and cake), an order frame and a recorded quantity example. One guided coffee order teaches the controls. Three further orders introduce two bread rolls and combinations of the same four foods. Each food has native Add and Remove buttons; a live tray shows the selected objects and quantities. Serve checks exact quantities without depending on the order of additions. Empty serving is blocked, each quantity is bounded to three, and trays hold up to five items. No extra art or audio is generated for this pass.

Normal and slow playback remain available. Transcript help reveals the recorded sentence without ending the question. Assisted first answers return once for an independent retry, and guided/assisted correctness does not count as independent listening evidence. The recap shows independent first-try performance out of three, assistance separately, recorded phrases to replay, and a next action. Recognition is not used to claim speaking ability.

Half-built trays and assistance state survive relaunch. Pre-2.4 saved café matching sessions retain their original options in a compatibility mode; revision can still revisit all eight original café orders using tray matching. The new builder deliberately introduces only the four taught foods.

Home names the next chapter's learning goal and includes a direct café shortcut. During every session the six navigation tabs give way to the activity name and Pause. Teaching and feedback footers describe their actual controls. Existing Hadi/Anna likenesses, offline packaging and deliberate advancement are retained. Physical Strong-box acceptance remains outstanding.
