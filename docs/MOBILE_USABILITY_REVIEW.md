# Phone and caregiver usability review

Local-only changes, October 18, 2026. Do not push without approval. These changes do not include the separate Together experiment.

## Behavior

- Speak keeps the current sentence for replay. Finish/Done records it and starts a fresh sentence. Replaying an unchanged sentence does not add duplicate activity during the same board session.
- The primary sentence action is labeled “Speak sentence” (Spanish: “Leer frase”). Speak now remains the quick-phrase section heading, without the misleading heading speaker icon.
- Touching a search result preserves input focus until click commits the selection. Only then does the search blur. Selection still occurs on click, never pointer-down, so scrolling does not intentionally select cards. Real Safari keyboard transitions still need physical-device verification.
- The board has a labeled Caregiver entry; the website links directly to `/caregiver`. Existing PIN checks remain intact.
- Phone Settings exposes all five sections instead of requiring horizontal discovery. Tablet/desktop retains the sidebar. Changes requiring Save retain their existing unsaved-change protection.
- A short caregiver tour appears on first unlocked visit, can be skipped, and can be reopened using Quick tour. Its seen marker is local browser storage, not account synchronization. It distinguishes local Settings from linked-device controls.
- Device speech is shared across sentence, quick-phrase and manual test controls. Utterances remain referenced while active. Cancellation settles the pending promise, paused engines resume, and missing/error/unresponsive engines restore usable controls. Startup timeout: 8 seconds; completion timeout scales with message length. A timeout is not proof that the device lacks a voice.
- App volume zero produces an explicit muted message instead of silently reporting success. The app does not silently override a user's volume preference.
- Voice testing is opt-in and clearly labeled as audible. Tests use mocked playback, with no provider credits or audible output. Browser completion events cannot prove that a human actually heard sound.
- Enhanced voice downloads have a 12-second deadline covering response headers and the audio body. Audio playback has a startup watchdog and a duration-based completion watchdog. Browser/OS-specific routing still warrants real-device testing.
- Password sign-in from the caregiver area returns there instead of sending parents to the board. Existing email-link callback routing remains unchanged.

## Essential vocabulary audit

Checked the actual merged built-in inventory: 245 cards, 66 available at Level 1. Existing Level 1 includes Eat, Drink, Food, Water, Bathroom, Sleep, Tired, Help, I need help, Yes, No, Don't want, Stop, All done, Hot, Cold, Quiet, Loud, Feel and Stomach.

Missing dedicated built-in concepts: Hurt/Pain, Sick, Hungry, Thirsty and Break. These are an artwork/content follow-up, not implemented by relabeling unrelated pictures. Eat/Drink and Tired are not equivalent to those concepts. This is a practical product inventory check, not a clinical certification or proof of complete vocabulary coverage. Review priorities with users and their communication partners.

## Verification and remaining checks

Added regression coverage for first-tap search, manual voice testing, muted and unresponsive device speech, caregiver-tour persistence/replay, direct caregiver navigation and repeated sentence speech. Existing PIN, offline, settings-save and iPad portrait/landscape flows are also exercised.

Physical phone/iPad checks remain necessary for the native keyboard, installed voice, Bluetooth/speaker routing and touch scrolling. Browser emulation does not reproduce the iOS on-screen keyboard or verify audible output.

Results: the 186-check full suite passed before final narrow-header and caregiver sign-in refinements. Follow-up suites passed 20 layout/navigation/replay/iPad checks, four account-navigation checks, then 30 speech/recovery/account checks after the download-deadline refinement. TypeScript and production builds passed. All playback was mocked. No deployment or device installation was performed.
