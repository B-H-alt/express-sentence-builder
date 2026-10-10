# Expressly App Store Readiness

This is the working launch checklist for the iPhone and iPad version of Expressly.

## Foundation complete locally

- Native iOS project generated with Capacitor.
- Production web build copied into the iOS project.
- iPhone simulator build succeeds without code signing.
- Phone, tablet, desktop, orientation, and touch layouts are detected automatically.
- iPhone and iPad safe areas are supported.
- Native API calls route to the protected Expressly server endpoints.
- Native API access is limited to approved Capacitor origins.
- Account confirmation and password reset use the verified Expressly website.
- In-app account deletion is implemented with server-side user verification and a typed confirmation step.
- API provider secrets remain server-side.

## Next engineering gates

1. Test sign-up, sign-in, email confirmation, password reset, and sign-out in the native app.
2. Test grammar, ElevenLabs voice, and image generation with a confirmed test account.
3. Configure the server-only Supabase service-role key and verify account deletion using a disposable test account.
4. Add universal links so confirmation links can reopen the native app.
5. Add a branded app icon and launch screen.
6. Test supported iPhone and iPad sizes, portrait and landscape, VoiceOver, Dynamic Type, and reduced motion.
7. Add automated checks for authentication, account isolation, rate limits, and API authorization.
8. Run TestFlight with the founders and a small family or therapist testing group.

## Business and Apple gates

1. Confirm the legal owner of the Apple Developer account and bundle identifier.
2. Enroll the organization in the Apple Developer Program.
3. Publish the privacy policy and support contact pages.
4. Complete Apple's privacy disclosures from the verified data inventory.
5. Decide whether subscriptions launch with version one. Digital subscriptions must use Apple's approved purchase system in the iOS app.
6. Prepare the App Store description, screenshots, age rating, review notes, and test account.

## Current safety boundary

This work is isolated on `feature/ios-responsive-foundation`. Do not merge or deploy it until native authentication and protected-feature tests pass.
