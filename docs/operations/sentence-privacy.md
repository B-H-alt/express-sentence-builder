# Sentence privacy

This update implements the sentence-retention choices approved by the owner on October 21, 2026. Provider account settings require a separate review as described below.

## Device data

- Current sentence text, recent card order, corrected wording and detailed activity are page-session data. Refresh, page exit, sign-out and account changes discard these details.
- Completed activity persists only its identifier, date and word count, bounded to 500 records. Deliberately saved phrases, custom cards, learner settings and aggregate card-use counts remain on the device. This storage is not encrypted by Expressly.
- Startup migration removes sentence wording and card order from the active board snapshot, archived account snapshots and the interaction journal. Existing activity dates and counts remain. This cannot erase previously downloaded backups, browser-profile backups, another device, or copies already held by a provider.
- Exports omit current sentence text, recent card order and detailed history. Importing an older backup does not restore those fields.
- Sentence and quick-phrase audio streams are released after playback. There is no recording replay cache. Unsupported browsers temporarily buffer one clip for playback and release its URL afterward.
- The shared grammar-result cache is removed. The visible sentence's corrected text stays in component memory only for that page session. Account changes abort pending grammar and speech; a stale response must not restore wording.
- Private API responses have browser and CDN no-store headers. The offline worker excludes API and authenticated traffic. Provider exceptions are not logged verbatim by the grammar endpoint.

## Provider review remains open

The owner chose to keep cloud voice and grammar active during this review. Dawud manages the ElevenLabs and Google API accounts. On October 21, ElevenLabs opened a sign-in page and the current Google browser account was redirected to the AI Studio access-requirements page. No provider account setting, subscription, credential or billing configuration was changed or verified.

Before claiming provider retention protections:

1. Dawud must identify the exact ElevenLabs account and Google project supplying the production server keys. Never copy keys into chat, documentation or logs.
2. Review ElevenLabs training/data-use preferences and plan eligibility. [Zero Retention Mode](https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode) is available to eligible Enterprise customers and requires `enable_logging=false` on eligible API requests. Do not add that flag and claim success without eligibility and an end-to-end check; do not silently retry with logging enabled if a privacy-protected request fails. Review existing history separately; changing future retention does not establish deletion of past content.
3. Verify Google paid-service status, optional logging and dataset sharing for the production project. [Google's retention documentation](https://ai.google.dev/gemini-api/docs/zdr) says paid API requests can still be retained for abuse monitoring. Turning off optional logging is not a zero-retention guarantee. Guaranteed zero-retention requirements need a separately reviewed provider architecture.
4. Record only non-secret evidence, actual effective settings, their limits, and an appropriate synthetic-data check. Do not send learner communication as a test.

This work reduces application storage and logging. It is not a security certification or a claim that third parties never retain content.
