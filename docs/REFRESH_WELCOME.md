# Refresh welcome, onboarding palettes and settings scale

Separate from Together. Based on production checkpoint 5eb50ad; no experimental route or Together code in this branch. Local review only until explicitly approved for push.

- Returning users get a short refresh welcome on the board. It waits until the introductory guide and sign-in dialog are closed, and the current sentence is empty. It never clears a sentence or changes preferences. Brand-new learners are marked current when they complete onboarding, so they do not receive a redundant update announcement on a later visit.
- Explore, Not now, X, Escape and outside dismissal all mark this release announcement seen. Identifier `expressly-refresh-2026-10`, key `expressly-release-welcome-v1`, device/browser-wide localStorage with sessionStorage fallback. Routine builds do not change this ID. Cleared storage, a different device or unavailable storage can cause repeat display. No account database or email is involved.
- English/Spanish copy. No claim that the installed app has automatically updated, no Together promotion, autoplay, provider requests or animation beyond existing dialog behavior.
- Rose and Lavender join Blue, Warm and Sage in onboarding, with consistent tile sizing. Theme is saved through the existing preference path.
- Settings keeps its sidebar, sections and save protections. Maximum width 1152px, height bounded by 920px/94dvh and the visual viewport. Scoped 16px primary text and 14px secondary text replace 14px/11–12px; no browser zoom or switch geometry scaling. Long content scrolls, footer remains separate.

Verification: typecheck, production build and all 158 browser tests passed, including desktop/mobile welcome persistence, onboarding themes, scaled settings, existing caregiver safeguards and emulated iPad flows. Lint has no errors and seven existing fast-refresh warnings. Desktop/mobile screenshots reviewed. Testing caught and corrected a redundant update announcement after new-user onboarding; saved-phrase test fixtures now mark the announcement seen explicitly. No physical iPad validation, push, database change or native signing change is included.
