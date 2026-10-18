# Settings layout refresh

Local review version, October 17, 2026. This changes the caregiver settings panel, not the AAC board or its vocabulary/artwork.

## References

- Apple System Settings: https://support.apple.com/en-eg/guide/mac-help/mh15217/mac
- GOV.UK tabs guidance: https://design-system.service.gov.uk/components/tabs/
- Nielsen Norman Group, progressive disclosure: https://www.nngroup.com/articles/progressive-disclosure/

These are interface references, not evidence that this particular layout has been validated with Expressly families.

## Decisions

- Desktop/tablet: a plain-text sidebar stays visible while the selected panel scrolls independently. Mobile: the same categories form a horizontally scrollable navigation strip. No decorative category icons or colored icon tiles.
- Profile, Vocabulary, Display, Cards & voice, Accessibility. Vocabulary has its own section instead of burying a saved level change among auto-saving appearance switches.
- One readable content column, consistent headings and spacing. Remove the double-column appearance layout and extra outer container around display controls. Actual palette swatches remain because they preview a real choice, not decoration.
- Keep Backup collapsed by default. Preserve photo cropping, all existing controls, immediate preferences and explicit profile/level saves. Existing unsaved-change protection is unchanged.
- Keep the close/save footer outside the content scroller. The visual-viewport bounds still constrain the panel when a mobile keyboard opens.
- Keyboard tabs use roving focus, orientation-appropriate arrow keys, Home/End and an associated tabpanel. Selecting a section resets its content scroll and brings its category into view.

No production deployment, database change or native installation is part of this visual refresh.

## Verification

October 18 refinement: Save profile now stays in Settings, shows a checkmark with Saved, and resets that confirmation when the profile is edited again. Pending vocabulary edits remain unsaved and are still guarded on explicit close. Save changes from an exit confirmation retains its explicit save-and-exit behavior. The PIN field no longer has a letter-spaced placeholder; the associated format hint below remains. Typecheck and all 12 focused profile/crop/PIN/unsaved-change tests passed. Local only until push approval.

- Typecheck and production build passed. Lint: zero errors, seven existing fast-refresh warnings.
- Full launch regression suite: 142 passed, including desktop, mobile and emulated iPad portrait/landscape flows. Runs were executed alone to avoid shared report-directory collisions.
- Added settings navigation, keyboard, viewport and footer visibility coverage. Updated level tests to use the new Vocabulary section.
- Visually reviewed local desktop and mobile screenshots. Physical iPad review remains pending; emulation is not a substitute for device testing.
