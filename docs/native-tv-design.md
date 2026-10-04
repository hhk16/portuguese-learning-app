# Native TV visual design

The approved direction is playful family: warm cream, deep indigo text, cobalt focus, pastel chapter cards, rounded Nunito type, and Portuguese tiled streets and cafés. The UI is composed of native Android controls and Canvas artwork, with a compact top menu and a dedicated question layout. Text and controls remain real, selectable UI; screenshots and generated concept boards are never used as the interface.

Hadi and Anna appear in the welcome, café and conversation scenes. These new images use the existing photo-derived `hadi-wave.webp` and `ana-wave.webp` illustrations as references. The original waving poses and faces are reused; new close-up thinking and cheering poses preserve their likeness and stay crisp on TV. The repository's `ana` asset key is displayed as Anna, matching the owner's preferred name. Settings chooses the solo companion; together mode names Hadi and Anna's alternating turns. This is shared TV progress, not separate personal mastery.

The café trays compose individual food sprites from each answer's quantities, so two coffees really show two cups and a mixed order shows both types of item. Captions remain available for readability and accessibility. The four games have distinct scene or symbol artwork, explicit instructions, examples, player turns and deliberate Continue feedback. Playback controls indicate when speech is playing.

## Asset provenance and budget

- `public/art/native-tv/{home,cafe,conversation}.webp`: newly generated with OpenAI image generation using the original Hadi/Ana artwork as references. No unrelated replacement characters.
- `public/art/native-tv/{coffee,milk,bread,soup,icecream,cake,croissant,water}.webp`: newly generated isolated transparent food objects.
- Scene artwork is exported at a maximum of 1,100 pixels, food at 256 pixels and character close-ups at 720 pixels. The generated PNG originals remain outside the repository. The compressed new art and font total about 1.1 MB.
- Only 19 selected images are packaged. Bitmaps are decoded once on the catalogue worker with bounded dimensions, not in draw calls. There is no WebGL, continuous animation loop, network fetch or import of the entire old wardrobe/backdrop library.
- `public/art/native-tv/fonts/{nunito,nunito-bold}.ttf`: static Nunito weights 600 and 900 from Google Fonts, SIL OFL 1.1; licence bundled beside it and in the APK.

The Native Android TV workflow captures actual emulator screens, tests artwork decoding/transparency, companion selection and full session completion, and retains the previous remote, audio, scoring, Back and restoration checks. Device acceptance on the owner's Strong box is still required.
