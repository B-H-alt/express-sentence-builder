# Interaction performance

## What changed

- `boardPersistence.ts` keeps the compatible `pecs-storage` board snapshot and adds a small `pecs-interactions-v1` journal. Taps, sentence edits and usage changes save synchronously to the journal without serializing unchanged photos. Profile, photo, vocabulary, favorites, settings, phrase and completed-activity changes still save a complete snapshot immediately. There is no debounce window in which the latest tap waits to be saved.
- The first write after hydration may consolidate normalized/default preference fields into a full snapshot; subsequent usage-only updates use the small journal. This is intentional conservative migration behavior.
- Journal sentences store IDs and selected labels for built-in and custom cards, not copied image data. Hydration resolves images from the snapshot and current built-in vocabulary. Standalone legacy sentence cards retain their full data rather than being dropped. Custom usage and recent IDs are restored too.
- Journals are bound to the active account scope and snapshot revision. Invalid or mismatched journals are ignored. Legacy snapshots get a deterministic revision fingerprint on read. Writing a new snapshot gives it a new revision before removing the journal, so interrupted cleanup cannot replay older taps onto a replacement board.
- Account switches fold the journal into the snapshot before archiving. Active account deletion clears it. Restore folds it in before taking its rollback snapshot. Backups still export the live complete board rather than just the underlying snapshot.
- Vocabulary selectors preserve UI references on usage-only changes. The grid subscribes only to fields it needs and memoizes search/filter results. Category navigation no longer rerenders for usage changes. Ordinary taps no longer rerender the entire PecsApp page; the tutorial still subscribes to sentence length while open.
- Card CSS transitions explicitly name visual properties rather than using `transition-all`. Existing touch blur removal, native horizontal scrolling, async image decoding and lazy loading remain in place. No card positions, visible artwork or navigation behavior changed.
- Existing sentence tiles are memoized, so appending a word does not rebuild all the tiles already in the sentence.

## Measurement

Run `node scripts/benchmark-interactions.mjs http://127.0.0.1:8089` against Vite. It uses an isolated browser context and a synthetic 1 MB photo string, not a real learner profile. It compares the old full-snapshot persistence method with the journal over 30 synchronous card selections using the same current store code.

Initial laptop Chromium sample: 30,064,191 characters written / 58.2 ms with full snapshots, versus 15,795 characters / 0.5 ms with the journal. These are synthetic persistence/store measurements, not end-to-end frame times, native iPad timings, or a guaranteed overall speed multiplier. Timing varies; the byte reduction is the reproducible acceptance criterion.

Tests in `interaction-performance.spec.ts` cover bounded write volume, stable vocabulary references, vocabulary edits invalidating those references, immediate reopen with custom photos and alternatives, account switching/deletion, and stale/malformed journals. Existing backups, accessibility, tutorial, touch and offline tests remain regression requirements. Physical iPad release-build scrolling and touch latency still require device verification.

## Storage compatibility

Do not copy only `pecs-storage` as a backup or switch account scopes directly. Use the public data export or call `flushBoardInteractions()` before archiving the canonical snapshot. This preserves recent interactions. The app's account switch, restore, and deletion paths already handle this. Older app builds cannot replay the new journal; avoid running different app versions concurrently against the same browser data. Independent tabs still use last-writer-wins local storage, as before; this is not cross-device sync.
