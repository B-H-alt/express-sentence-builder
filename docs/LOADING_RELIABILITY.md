# Loading reliability, October 18, 2026

Local changes on the non-Together release branch. Do not claim they are live until explicitly pushed and deployed.

## Findings

- Live apex redirects to www; sampled server responses were fast. The intermittent DNS/browser “site not responding” symptom was not reproduced and is not claimed resolved.
- Production offline manifest had 527 files; current bundled assets total approximately 80 MB. Previously even the marketing homepage registered a full offline installation with unrestricted addAll concurrency.
- A simulated failed landing-page chunk on the live site left a blank body. No route error recovery boundary existed.
- The deployed refresh welcome worked for a returning-profile fixture with no seen marker. It is intentionally absent for new users, dismissed announcements and the marketing homepage. No user storage was cleared to force it to reappear.

## Changes

- Start offline registration only on the communication board, including client-side navigation from the homepage. Native Capacitor remains excluded. Scheduling is deduplicated.
- Keep the complete offline vocabulary. Install with three low-priority workers, reusing unchanged content-hashed /assets responses from previous Expressly release caches. Never reuse an old index or unhashed public file. On any failure, finish in-flight workers then remove the incomplete new cache; preserve the old working release.
- Activation still waits for existing tabs. No skipWaiting, forced reload, learner data deletion or change to authenticated/API cache exclusions. Existing controlled tabs may need to be closed before a waiting worker activates.
- Once a complete shell cache exists, root and board navigation use a four-second network timeout, then the cached shell. HTTP 5xx also falls back. Without a prepared cache, no offline-ready claim is made.
- Route-render/module failures show an explicit Retry screen. Retry is user-initiated and reloads the page, without clearing saved board data. No automatic retry loops. Static HTML provides readable opening/retry content even if initial JavaScript fails before React mounts.
- Unlocked caregiver Account & support now has What’s new, reusing the release dialog. Manual replay does not reset automatic announcement eligibility.

## Verification

- Silent desktop/mobile tests for failed module recovery, preserved data, successful retry and repeated manual welcome replay.
- Built service-worker test covers: homepage does not register; SPA entry to board registers; full offline vocabulary and images; closed-tab reopening; hung requests and 503 fallback; cached-asset reuse with zero asset requests on unchanged update; waiting/activation; failed install preserves offline access. No audible speech or provider credits used.
- The first full offline installation still transfers the complete asset set. This is scheduling, reuse and recovery work, not an image-size reduction. Slow first-time board preparation remains possible; do not advertise instantaneous offline readiness.
- Typecheck, production build and all 162 browser tests passed. Lint: no errors, seven existing fast-refresh warnings. All four built offline lifecycle/recovery groups passed, including unchanged-asset reuse, stalled requests, server errors and failed updates. Mobile recovery screen visually reviewed.
- No domain, hosting, account, database or native signing configuration changed. No push. The intermittent reported domain/network timeout itself remains unreplicated.
