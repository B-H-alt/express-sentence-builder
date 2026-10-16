# Settings drafts and leaving safely

Local changes, not published yet.

- Profile fields (name, photo, character, language) and vocabulary level are drafts until explicitly saved.
- X, Close, outside click and Escape check all settings drafts, including ones in another tab. Tabs themselves keep drafts intact.
- The warning offers Save changes, Leave without saving and Keep editing. Saving from this warning commits pending profile and level edits together. Discarding leaves persisted profile/level values unchanged; it does not undo auto-saved appearance or voice preferences.
- Save profile keeps its normal behavior, but checks for an unsaved level before closing. Save level applies only the level and does not close settings.
- An unfinished photo crop also triggers the warning. Save is disabled there until the user finishes or cancels the crop; this prevents saving an unintended photo region.
- Custom card creation/editing uses the same warning. Missing card labels or in-flight image generation must be resolved before saving from the warning. Closing the card editor does not close the underlying settings.
- Escape in the warning means Keep editing. Warning clicks must stop React portal propagation so they cannot accidentally close a parent overlay.
- Existing automatic-save settings do not produce warnings by themselves.

Tests cover desktop/mobile exit paths, saving across tabs, explicit discard, preserving drafts, crop protection and saving custom cards from the warning. No production data or paid API calls are used in these checks.
