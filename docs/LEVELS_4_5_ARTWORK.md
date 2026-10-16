# Levels 4 and 5: local expansion

Status: 48 generated assets individually reviewed and integrated locally. Not approved for publishing.

These are optional vocabulary collections, not clinical or developmental stages.
Levels 1–3 keep their existing cards and IDs. Each level includes all earlier levels.
Home remains the same quick-card view. New topics live in the category strip.

## Level 4: Explore (24 new cards)

- Animals: Dog, Cat, Bird, Pet fish, Rabbit, Horse, Cow, Duck.
- Nature: Tree, Leaf, Flower, Grass, Sun, Rain, Cloud, Rock.
- Sports: Soccer, Basketball, Baseball, Tennis racket, Bicycle, Helmet, Swimming goggles, Jump rope.

## Level 5: More interests (24 new cards)

- Animals: Turtle, Butterfly, Bee, Frog, Sheep, Pig, Squirrel, Dinosaur.
- Nature: Snow, Wind, Moon, Star, Rainbow, Mountain, Beach, Ocean.
- Sports: Football, Volleyball, Badminton, Skateboard, Baseball bat, Baseball glove, Cones, Whistle.

Football means American football; its image must show the oval laced ball.
Pet fish must show a live fish, never the existing cooked-food fish image.
Equipment labels are concrete rather than pretending equipment pictures depict an action.
Existing Ride bike and Go swimming cards remain unchanged.

## Artwork method and prompt set

Built-in imagegen, one generation per card. No paid project API credentials used.
Style reference: `src/assets/pecs/shared/l1-31.jpg` (existing train illustration).
Reference is style-only, not an edit target. No existing artwork is overwritten.

Shared prompt:

> Use case: scientific-educational. Asset type: one Expressly AAC communication card illustration. Input images: image 1 is a STYLE REFERENCE ONLY, not an edit target. Match its clean friendly children's cartoon drawing, bold smooth black outlines, softly shaded flat colors, rounded simple shapes. New subject, not the train. Square composition, centered complete recognizable subject filling about 80 percent, generous white margins, pure white opaque background. No text, letters, logos, border, watermark, sparkles, faces on objects, decorative scenery, or people. Must remain immediately recognizable as a small communication symbol. Subject: [individual subject in artwork manifest].

Final assets are separate 512 × 512 optimized JPEGs in `src/assets/pecs/shared/`, named by stable card ID. Together they add 2.21 MB. Generation paths, exact subject prompts, and individual visual reviews are recorded in `levels-4-5-artwork-manifest.json`. Original generated PNGs remain in the generation cache; the app uses only its own bundled JPEGs.

The first pig image lacked eyes and was regenerated. The bee needed two revisions: one to restore eyes and another to correct its leg count. The final top-view bee shows six legs and four wings. All other images passed individual visual review. These are simplified communication illustrations, not detailed scientific diagrams; recognition still deserves feedback from actual users.

## Integration

- Level totals: 65, 160, 196, 220, 244 (custom cards are additional).
- New cards have stable descriptive IDs, no existing IDs or artwork changed.
- Animals, Nature, and Sports appear when available, in the existing horizontally scrolling category strip. Home is unchanged.
- English and Spanish labels share text-free artwork. Boy/girl settings use the same new images because none depicts a person.
- Favorites, custom cards, saved phrases, and the selected level persist using the existing storage format. No database migration, subscription, production deployment, or iPad installation is part of this local preview.

## Review checklist

Every asset must be visually inspected for the correct subject, distinguishing anatomy or equipment, simple silhouette, matching outline/style, no embedded labels, no clipping, and legibility at card size. Regenerate failures; do not use unrelated placeholders. Automated checks also verify coverage, decoding, categories, translations, cumulative levels, persistence, and offline bundling.

## Verification results

- TypeScript check passed.
- Lint: zero errors; seven unchanged development fast-refresh warnings.
- Full browser suite: 72 passed, including desktop/mobile new-level checks and existing iPad portrait/landscape flows.
- All 48 new files decoded at 512 × 512, with unique URLs and Spanish translations.
- Production build passed; all three offline lifecycle checks passed. New Turtle artwork and sentence selection were explicitly checked offline.
- Final optimized artwork reviewed in two 24-card sheets and Animals/Nature/Sports screenshots at iPad landscape size. Review captures are under `artifacts/levels-4-5/` (local QA artifacts, not app source).
- This is browser-emulated iPad QA, not a physical-device test. No audio was played and no production data was changed.

To preview: open the local app, then Profile & settings → Display → Level 4 or Level 5. Slide the existing category strip to Animals, Nature, or Sports. No new navigation layer or extra Home content was added.
