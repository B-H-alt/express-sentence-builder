# Offline website reopening

The production website registers `/sw.js` after page load. Development mode does not register it. Native Capacitor builds use bundled files and skip registration.

## What works

After one successful online download, `/pecs-app` can reopen or reload without a network connection. The build generates a versioned list of app code, styles, bundled card images, and public branding files. All listed files must download before that version activates.

Previously implemented offline grammar and device speech remain unchanged. Gemini grammar, ElevenLabs, new generated images, sign-in, and cloud synchronization still require internet. Device speech requires a locally available voice. User-created image availability depends on how it is stored; this cache only guarantees bundled assets after successful installation.

## Safety and updates

- Only explicitly listed same-origin static GET requests are cached. API routes, authorization-bearing requests, cross-origin requests, and query-string asset requests are excluded.
- No account responses, API results, or authentication tokens enter this service-worker cache. Existing app persistence is separate.
- Updates download into a separate cache. They wait for existing controlled tabs to close, with no forced refresh. Activation removes obsolete Expressly static caches only.
- The worker is served with revalidation headers. The version includes worker source, generated assets, and listed public files.
- Browsers can evict offline storage, particularly under device storage pressure or private browsing. Offline access is not an absolute guarantee. First installation requires internet and enough storage for the bundled assets.

## Verification

Run `npm run test:offline`. It builds production assets and runs an isolated Chromium test with no sound or paid services. It checks offline reload, closing and reopening the app tab, loaded card imagery, card selection, API cache exclusion, waiting updates, old-cache cleanup, and offline reload after updating.

Also run `npm run test:launch` for existing interactions. Physical iPad Safari and installed-iPad validation remain necessary; Chromium tests do not replace those checks.

The GitHub Launch tests workflow now runs the production offline check after the interaction suite. Failed-update coverage verifies that an unavailable required asset cannot replace the current working offline release.

Local verification on October 15, 2026: production build and offline lifecycle tests passed, including a deliberately failed update. The 48-scenario interaction suite initially exposed test setup/timing failures; after correcting the signup screen readiness wait and device-speech mocks, the affected eight desktop/mobile checks passed on rerun. The remaining 40 scenarios, including iPad portrait and landscape flows, passed in the broader run. Lint had no errors and seven pre-existing component-export warnings. Audio playback was mocked, with no audible output or paid-provider requests in the voice interaction checks.

The app TypeScript check also passed after removing an obsolete demo audio reference and explicitly typing persisted state as partial state. `npm run typecheck` is now a required CI step. The final production rebuild and all three offline lifecycle checks passed again after these corrections.

To inspect readiness manually, use browser developer tools: Service Workers should show an activated worker, and Cache Storage should contain the current `expressly-static-*` cache. Visit `/pecs-app` before turning off the network.
