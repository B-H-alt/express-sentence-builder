# Expressly App Store Readiness

This is the working launch checklist for the iPhone and iPad version of Expressly.

## Foundation complete locally

- Native iOS project generated with Capacitor.
- Production web build copied into the iOS project.
- iPhone simulator build succeeds without code signing.
- Phone, tablet, desktop, orientation, and touch layouts are detected automatically.
- iPhone and iPad safe areas are supported.
- iPad portrait and landscape communication flows have dedicated automated coverage.
- Large iPads remain on the touch-first tablet layout after rotation.
- The installed app opens directly into the communication board instead of the marketing website.
- The native app icon and launch screen use Expressly branding.
- Repeatable, privacy-safe App Store screenshot capture is available for current iPhone and iPad sizes.
- Native API calls route to the protected Expressly server endpoints.
- Native API access is limited to approved Capacitor origins.
- Account confirmation and password reset use the verified Expressly website.
- In-app account deletion is implemented with server-side user verification and a typed confirmation step.
- API provider secrets remain server-side.
- A valid app privacy manifest is bundled with the iOS target and documents the account and protected-feature data handled by the app.
- `npm run mobile:app-store-audit` checks the bundle identity, version, device support, icon, launch screen, privacy manifest, and listing URLs before release work.

## Next engineering gates

Use [the real iPad release test](IPAD_RELEASE_TEST.md) to record device results. These checks remain unverified until completed on physical hardware.

1. Install Xcode 26 or later. Apple's current upload requirement does not accept a build produced by the installed Xcode 16.4.
2. Run `npm run mobile:release-check` and provide all browser-safe production values through the protected build environment.
3. Test sign-up, sign-in, email confirmation, password reset, and sign-out in the native app.
4. Test grammar, ElevenLabs voice, and image generation with a confirmed test account.
5. Configure the server-only Supabase service-role key and verify account deletion using a disposable test account.
6. Add universal links so confirmation links can reopen the native app.
7. Test supported iPhone and iPad sizes, portrait and landscape, VoiceOver, Dynamic Type, and reduced motion.
8. Add automated checks for authentication, account isolation, rate limits, and API authorization.
9. Run TestFlight with the founders and a small family or therapist testing group.

## Business and Apple gates

1. Confirm the legal owner of the Apple Developer account and bundle identifier.
2. Enroll the organization in the Apple Developer Program.
3. Publish the privacy policy and support contact pages.
4. Complete Apple's privacy disclosures from the verified data inventory.
5. Decide whether subscriptions launch with version one. Digital subscriptions must use Apple's approved purchase system in the iOS app.
6. Review the prepared App Store description and screenshots, then confirm the age rating and test account.

## Current safety boundary

Do not submit the first production build until native authentication, protected-feature testing, account deletion, and App Store privacy disclosures are verified end to end.
