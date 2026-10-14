# Real iPad release test

Use this guide on the installed iOS app before inviting families through TestFlight. Browser and simulator results do not count as a real device pass.

## Record the test

- Tester:
- Date:
- iPad model and iPadOS version:
- App version and build number:
- Commit:
- Result: Not tested / Passed / Failed

Use a disposable parent account and fictional learner. Do not delete a real family's account or record passwords, tokens, or private learner information here. One successful request per protected feature is enough; do not test rate limits by generating repeated paid requests.

## Install

1. Install a supported Xcode version and connect the iPad to the Mac.
2. Unlock the iPad and approve Trust This Computer if asked.
3. Run `npm run mobile:app-store-audit`, `npm run mobile:release-check`, then `npm run mobile:sync`.
4. Run `npm run mobile:open`. In Xcode, select the App target, choose the authorized development team under Signing & Capabilities, and select the connected iPad.
5. Press Run. Complete any device pairing or Developer Mode steps that Xcode requests on the iPad.

Development installation and TestFlight distribution are separate. A successful local installation does not confirm App Store submission readiness.

## Communication and layout

- [ ] First launch opens the communication app and onboarding can be completed or skipped where offered.
- [ ] Tap cards, build a sentence, remove one card, and clear the sentence.
- [ ] Search, swipe categories, favorites, and custom cards work using touch.
- [ ] Finish a sentence and confirm the parent progress record appears once.
- [ ] Rotate both ways. Cards and sentence controls remain reachable without horizontal page overflow.
- [ ] Open the keyboard in search and settings. Fields and close buttons remain reachable.
- [ ] Change card size, text size, language, theme, light/dark, and calm mode. Close and reopen the app to confirm preferences persist.
- [ ] Background the app, return, then force close and reopen it. Confirm the expected saved learner state remains.
- [ ] Test iPad Split View if supported; record any cramped or inaccessible controls.

## Accounts and protected features

- [ ] A signed-out user receives a clear account message when requesting a protected feature.
- [ ] Sign up with the disposable account, receive the confirmation email, confirm it, and sign in inside the app.
- [ ] Sign out and back in with the password.
- [ ] Request a password reset, follow the email, change the password, and sign in again.
- [ ] Request one grammar correction and check that its meaning matches the selected cards.
- [ ] Play one enhanced voice response and check audible output with the device volume enabled.
- [ ] Generate one custom image and save the resulting card.
- [ ] Sign out and confirm protected requests cannot use the previous session.
- [ ] Delete the disposable account through the app. Confirm sign-in fails afterward and that the intended account data is removed. Verify the server result separately; disappearing from the screen alone is insufficient.

## Accessibility and connection loss

- [ ] With VoiceOver enabled, navigate cards, sentence controls, settings, and account forms. Labels and focus order make sense, and dialogs release focus when closed.
- [ ] With Reduce Motion enabled, controls remain usable without required animations.
- [ ] Increase the system text size and Expressly text size. Record where the system setting is not honored or controls become clipped.
- [ ] Disable Wi-Fi after loading the app. Existing cards remain available and unavailable online features show a clear message without erasing the sentence.
- [ ] Re-enable Wi-Fi and confirm protected features recover.
- [ ] Check speech without Wi-Fi separately. Record whether an installed device voice is available; do not assume enhanced online speech works offline.

## Report a failure

Record the exact steps, expected result, actual result, device orientation, and screenshot with private information removed. Mark the release blocked for crashes, lost communication data, inaccessible essential controls, account access failures, or incorrect deletion. Fix the issue and repeat that scenario on the same build intended for TestFlight.
