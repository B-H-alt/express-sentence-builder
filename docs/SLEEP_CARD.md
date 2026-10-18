# Sleep card

Added locally as `core-sleep`, a Level 1 action available cumulatively in all levels. Spanish label: Dormir. Existing card IDs are unchanged. Character-specific artwork follows the selected boy or girl preference.

Verification: TypeScript check, production build, and all six focused desktop/mobile Sleep and vocabulary-level tests passed. Existing profiles receive the card through the built-in vocabulary merge. No production push or iPad installation was performed.

## Artwork provenance

Generated using built-in image generation, not an API fallback. References: `src/assets/pecs/boy/l1-7.jpg`, `src/assets/pecs/girl/l1-7.jpg`, and `src/assets/pecs/shared/l1-37.jpg`. Reviewed both outputs for character consistency and a clear sleeping pose distinct from Tired. Mechanically resized to 512px JPEG, quality 88, for the app.

Assets:
- `src/assets/pecs/boy/core-sleep.jpg`
- `src/assets/pecs/girl/core-sleep.jpg`

## Final prompts

### Boy

Use case: illustration-story. Generate ONE square AAC communication card for the verb SLEEP. Reference image 1 is the exact boy character identity and drawing style; reference image 2 is the bed and palette style. Draw this SAME brown-haired boy asleep lying on his side in a simple bed, head resting on a white pillow, eyes gently fully closed, mouth relaxed and CLOSED, teal pajama top visible above a blue blanket. Match the references exactly in thick rounded black outlines, brown hair shape, peach skin, rosy circular cheeks, soft minimal shading and clean white background. Make sleep unambiguous, NOT yawning, NOT merely tired, NOT an empty bed. Center a simple side-view scene fully inside the square with white margins, readable as a small card. No text, letters, Z symbols, border, moon, stars, extra objects or other people. Preserve the established character design and face proportions.

### Girl

Use case: illustration-story. Generate ONE square AAC communication card for the verb SLEEP. Reference image 1 is the exact girl character identity and drawing style; reference image 2 is the bed and palette style. Draw this SAME brown-haired girl with her TWO ponytails and pink hair ties asleep lying on her side in a simple bed, head resting on a white pillow, eyes gently fully CLOSED, mouth relaxed and CLOSED, pink pajama top visible above a blue blanket. Match references exactly in thick rounded black outlines, brown hair shape, peach skin, rosy circular cheeks, soft minimal shading and clean white background. Make sleep unambiguous, NOT yawning, NOT merely tired, NOT an empty bed. Center a simple side-view scene fully inside the square with white margins, readable as a small card. No text, letters, Z symbols, border, moon, stars, extra objects or other people. Preserve established character design and face proportions.
