# Caregiver area

Stage one is local, same-device management. There is no remote control, cloud preference sync, or separate parent app yet.

## Entry and protection

- The board's avatar/gear button opens `/caregiver`. `/parent` remains an alias.
- First visit offers a 4–6 digit PIN or an explicit choice to continue without one.
- Existing Parent Mode PINs continue to work. Legacy salted SHA-256 hashes upgrade to PBKDF2 after successful unlock.
- With protection enabled, returning from the board requires unlocking again. Backgrounding or five minutes without interaction locks the page and closes its management dialogs.
- Turning off protection requires an unlocked session and explicit confirmation.
- A PIN is a convenience barrier against accidental changes, not an account password or protection from someone with developer tools or direct device-storage access.
- Losing/clearing browser data also loses the device PIN. No email-based PIN recovery is implemented. Do not suggest resetting the whole board to recover a PIN.

## Board behavior

Communication never requires a PIN. Cards, alternatives, sentence editing, search, speech, favorites browsing and saved-phrase playback remain available. With protection enabled, favorite stars, custom-card editing, display-mode switches and saved-phrase management are hidden. With protection off, independent users retain those controls.

The caregiver page groups settings (including profile, voice, accessibility and backups), card/favorite management, activity/category management, saved phrases, account and feedback. Card management uses a searchable list with explicit favorite and custom-card edit buttons, never adding words to the sentence. Existing explicit save/discard prompts remain. The current sentence survives route changes.

## Storage and account safety

PIN state uses the existing `expressly-parent-pin-v1` key so accountStorage retains account-scoped behavior. `{disabled:true}` records the explicit opt-out. Do not store PIN values or include PINs in board backups. Account confirmation/recovery links still open the existing account dialog; PIN protection does not replace authentication or server authorization.

## Verification

`tests/e2e/caregiver-area.spec.ts` covers protection, wrong PIN, both direct routes, background locking, disabling protection, and communication while locked. Existing settings tests now navigate through the caregiver area. Device Safari and physical iPad testing remain necessary before claiming native-device verification.

Local verification, October 16, 2026: full regression suite 128/128 passed; final expanded caregiver suite 12/12 passed, including legacy PIN upgrade. Typecheck and production build passed. Lint had zero errors and seven existing UI fast-refresh warnings. All three production offline-cache lifecycle checks passed. Landscape, phone-sized hub, and card-management screenshots were visually reviewed. No audible speech or paid generation tests were used. This stage has not been pushed or installed on the physical iPad.
