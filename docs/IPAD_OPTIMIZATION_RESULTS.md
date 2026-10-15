# iPad improvements, October 14, 2026

## Changes ready for review

- Native header omits the website back arrow because the installed app starts on the communication board.
- Alternative-word menu clicks and keyboard events cannot activate the card underneath.
- Tablet minimum button height excludes switches so their tracks retain the intended shape.
- Theme tiles share an 88-pixel height; the first theme is labeled Blue.
- Volume uses a larger handle, a 44-pixel interaction area, and one-percent steps.
- Dialogs use the visual viewport height and position while the keyboard is open. Settings have a bounded scroll area, focused inputs are revealed, and feedback has a compact text area and sticky submit button.
- Search hides secondary header sections while the keyboard is open, leaving room for results.
- Selecting a card updates the sentence, usage, and recent cards in one store transaction.
- Main app, sentence builder, and settings subscriptions select their required state instead of subscribing to every change.
- Card images decode asynchronously and offscreen grid images load lazily; sentence images load eagerly.

## Measurements

Run `node scripts/check-card-selection-performance.mjs` from the repository root. It uses an isolated browser and does not sign in or call paid services.

For 30 card selections, the former pair of actions produced 60 store notifications and 60 local storage writes. The combined action produced 30 of each. Sentence contents, usage counts, and recent-card state matched. One laptop run measured 0.8 ms versus 0.3 ms for the store work alone. These tiny timings do not measure a full rendered interaction and do not establish an equivalent percentage improvement on an iPad.

The full suite passed 28 browser tests after the store and menu changes. A Release configuration device build succeeded without signing. A signed Release build still needs installation and hands-on comparison against the earlier Debug build.

## Remaining verification

## Touch rendering follow-up

- Grid cards now receive stable callbacks through a memoized wrapper. A card selection no longer rebuilds every untouched card in the category.
- Touch devices use an opaque fixed header without backdrop filtering, avoiding live blur of content scrolling behind the header.
- Touch card feedback changes colors instead of scaling the card and animating its shadow.
- Category swipes explicitly allow horizontal panning. The card area uses the page scroll instead of a redundant vertical scroller.
- Elements with button semantics, including the card tiles, use `touch-action: manipulation` to avoid double-tap gesture recognition delaying activation while preserving pinch zoom.

A production browser preview with tablet touch emulation and four-times CPU throttling completed ten card-add/clear cycles without errors or horizontal overflow. Recorded click event durations ranged from 16 to 80 ms (including clears and warm-up); these are Chromium diagnostics, not physical iPad measurements. The full 28-test suite passed after the rendering changes.

## Remaining physical verification

- Actual keyboard behavior on the physical iPad, especially feedback, PIN creation, rotation, and floating keyboards.
- Full tap-to-visible-sentence latency and scroll smoothness on the physical iPad.
- Protected network feature latency under realistic connection conditions.
- Final release signing and device installation. The unsigned build cannot be installed directly.

Personal signing-team changes in the Xcode project are local setup and are intentionally excluded from the product commit.
