# Board backups

Settings > Profile > Backup downloads and restores the existing version-one JSON export format. Parent account > Download my data uses the same serializer, with optional account identity metadata. Restoring ignores identity metadata and never signs in, changes permissions, or restores a Parent Mode PIN.

Included: profile and embedded photo, character, language, vocabulary level, card amount, words/pictures, Calm mode, accessibility preferences, text size, speech settings, theme, category visibility, favorites, recent cards, custom cards and embedded images, saved phrases, current sentence, activity history, and built-in card usage counts. Theme and usage fields are optional for older exports. Remote HTTPS images stay links, not offline copies. This is a manual backup, not cloud sync.

Only the active device/account board is replaced. Account-scoped storage and credentials are not imported. The UI captures the active account scope at file selection and checks it again before applying. Unsaved settings disable backup actions. Selection is non-mutating, followed by a preview and an explicit replacement confirmation. A download of the current board is required first; users still need to keep the downloaded file safely. JSON backups contain personal information and are not encrypted.

Validation uses an explicit Zod allowlist with version, shape, size (5 MB), numeric ranges, collection limits, unique custom IDs and no collisions with built-in cards. Images accept raster base64 data or credential-free HTTPS URLs only. Unknown file properties are discarded; functions, auth fields and arbitrary store properties cannot be imported. Current app assets resolve built-in IDs rather than importing old bundle URLs. Unknown favorite/recent/sentence IDs are omitted.

Restore validates again and preflights the persisted payload in localStorage before mutating live state. Storage write failures roll back prior values and leave the live board intact. After a successful restore, Settings closes and the imported theme is applied. Built-in usage counts now persist across reopen using a compact ID/count map, rather than duplicating built-in artwork in localStorage.

Tests: `npm run test:launch -- tests/e2e/board-backup.spec.ts --workers=2`. Covers desktop/mobile round trips, reopen, embedded images, unchanged PIN, older exports, malformed/unsafe files, built-in ID collisions, quota failure, preview/cancel, and safety download. Real iPad Files download/upload still needs device verification.
