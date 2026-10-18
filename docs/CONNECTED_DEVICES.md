# Connected caregiver devices

Status: implemented locally and verified against the separate Security Test Supabase project. Do not claim production or physical-device readiness until the remaining checks below are complete. No live Expressly database changes have been made.

## First version

The communication device and caregiver phone must sign into the same verified account. In the PIN-protected caregiver area, open Connected devices. Generate a code on the communication device and enter it on the phone. Codes contain 128 bits of random data, expire after 10 minutes and are single-use. Only SHA-256 hashes are sent to the database. A code cannot connect a different account.

The phone can explicitly save Calm mode, vocabulary level 1–5 and volume 10–100%. Remote muting is deliberately unavailable. Preferences are applied atomically on the board, only when its current sentence is empty. Existing audio retains the volume captured when playback started. No sentence, card, image, PIN, account identity or history is included in remote payloads. This is settings control, not board/history syncing or multi-caregiver invitations.

## Authorization and storage

`20261017090000_caregiver_devices.sql` creates an owner-scoped device table and a security-definer RPC with an empty search path. Direct table privileges are revoked from anonymous/authenticated roles. Every RPC operation checks `auth.uid()` and the user's confirmed email, including polling and revocation. Device IDs alone confer no access. Device rows cascade when the auth account is deleted.

Registration is limited to five devices per account, with a 30-second creation interval. Updates use compare-and-swap revisions and a two-second minimum interval. Writes serialize per account. Validation accepts exactly the three supported settings. No secret/service-role credentials are added to the client.

The browser stores only its device ID, owner ID and last applied revision under `expressly-linked-device-v1`, outside board exports. Switching accounts cannot apply the old owner's settings. Unlinking removes the server row; a revoked receiver clears its local registration on the next successful server response. Connection errors retain the last working local preferences.

Receivers poll every 15 seconds only when registered, online and visible, with errors backing off to two minutes. Nothing is fetched by unregistered boards. Mobile OS background suspension is not bypassed. The controller says delivery is unconfirmed because no server-side applied-revision acknowledgment is implemented yet. A saved command is not proof that a sleeping/offline iPad received it. Changes made locally after a remote revision stay local until a newer remote save arrives.

## Deployment order

1. Apply the migration to an Expressly-owned development Supabase project, not production.
2. Use two verified test accounts. With account A on two devices, generate, claim, update and revoke a link. Confirm codes expire and cannot be reused.
3. Confirm account B and signed-out sessions cannot list, pair, poll, update or revoke A's device, even with its ID or code.
4. Test on physical iPad Safari/native Release and a phone: sentence in progress, speech playing, offline/reconnect, background/resume, account switch, local preference changes and revocation. Confirm no audible interruption and no sentence loss.
5. Review the schema and privacy notice, then authorize production migration/deployment. Never raise database grants to work around a failure.

## Local checks

- `npm run test:launch -- connected-devices --workers=2`: mocked auth/RPC, no real accounts, provider calls or audible playback.
- `scripts/test-caregiver-devices.mjs`: actual PostgreSQL engine tests using PGlite, with an isolated mock Auth schema and roles. This tests SQL privileges/ownership, not Supabase JWT verification or a physical network connection.
- To run without changing repository dependencies: create a temporary directory, install `@electric-sql/pglite` there with `npm install --prefix <directory> @electric-sql/pglite --no-audit --no-fund`, then run `node scripts/test-caregiver-devices.mjs <directory>/node_modules/@electric-sql/pglite/dist/index.js`.

Do not auto-apply this migration, remove the existing local caregiver PIN, or change team/account permissions as part of these tests.

Local verification, October 17, 2026: full browser regression suite 138/138 passed. After the final session-lookup/clipboard changes and expanded registration test, all 10 connected-device cases passed. Typecheck, build, isolated PostgreSQL authorization tests, and all three production offline lifecycle checks passed. Tablet and phone-sized setup layouts were visually reviewed. No provider credits, audible audio, production migration, push or physical-device installation was used. Live Supabase JWT behavior, real two-device delivery and physical iPad playback remain unverified.

## Security Test cloud verification, October 17, 2026

- Confirmed the public deployed app and normal `.env.local` use `xtvnwkeshlxagoelutug`. Despite its dashboard name, Expressly Development, it is currently the live app's project. Do not treat its name as proof that it is safe for experimental migrations.
- Applied this migration only to `qjifprgwikczmtxqmrgi`, named Expressly Security Test. Its default branch has Supabase's Production badge, but it is a different project from the live app. No billing, access, CAPTCHA or auth-provider settings were changed.
- Saved SQL migration record: `https://supabase.com/dashboard/project/qjifprgwikczmtxqmrgi/sql/6cc7fd9a-49d1-426c-8791-52a8f191173e`. Applied manually through the SQL editor; not added to Supabase CLI migration-history metadata. Do not reapply blindly.
- Saved read-only verification record: `https://supabase.com/dashboard/project/qjifprgwikczmtxqmrgi/sql/1cbe9c4b-9c5c-464b-9b85-c87a5de2b732`.
- Created two temporary, explicitly confirmed `example.com` users through the test project's admin UI, without sending mail. Actual Auth sign-in and JWT-backed RPC calls worked through two isolated browser origins (`127.0.0.1:8092` and `localhost:8092`). No auth or RPC mocking was used in this check.
- Account B could not claim account A's unconsumed pairing code and saw no device belonging to A. Account A then claimed that same code successfully. Reusing the consumed code failed.
- Sent Calm mode, Level 4 and volume 50%. The receiver kept its in-progress Dad sentence and Level 1. After deliberate sentence clearance, Level 4, the low-stimulation document class and the volume slider value `0.5` were verified in the receiving UI. No audio was played.
- Unlinking removed the controller's device and the receiver cleared its local registration on polling. Both disposable auth users were then permanently deleted. Final SQL confirmed zero auth users and zero device rows, RLS enabled, direct table access denied to anon/authenticated, and anonymous RPC execution denied. Only generated throwaway records were removed; no personal records existed in this test project.
- `.env.caregiver-test.local` is gitignored and contains only the test URL/public key plus an empty frontend CAPTCHA site key. The test project itself required no CAPTCHA change. Launch with `npm run dev -- --mode caregiver-test --host 127.0.0.1 --port 8092 --strictPort`. Normal development config and deployment variables remain unchanged. Never build the App Store app or production deployment in this mode.
- Remaining: physical phone/iPad and native Release background/resume, offline/reconnect, actual speech-continuity tests, and production approval. Real cloud browser checks do not prove physical iPad readiness.
