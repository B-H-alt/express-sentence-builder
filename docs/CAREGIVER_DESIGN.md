# Caregiver overview refresh

Local review, October 17, 2026. Presentation only; no new permission, sync or account behavior.

## References

- Apple layout guidance: https://developer.apple.com/design/human-interface-guidelines/layout
- GOV.UK navigation guidance: https://design-system.service.gov.uk/patterns/navigate-a-service/

Use a clear hierarchy and organize repeated tasks rather than giving every destination an identical tile. These references guide the design, not a claim of validation with caregivers.

## Decisions

- Replace the seven-card grid with three task groups: Your board, Activity & devices, Account & support.
- Give Settings a stronger position, without adding a second shortcut to it.
- Show the actual local learner, saved vocabulary level and Calm mode. The summary is read-only, not another set of controls. It explicitly says This device, not a claim of cloud synchronization.
- Use one restrained blue accent, typography and spacing instead of illustrations or decorative icon tiles. Grouped rows have functional disclosure arrows.
- Stack sections on smaller screens. Preserve existing destination labels, dialogs, PIN protections, confirmations and board return actions.
- Leave the settings redesign and communication board unchanged. Existing activity detail screens are outside this refresh.

No deployment or native installation is included.

### Persistent return navigation

Caregiver subpages have an outlined, arrow-labeled Caregiver area button in a sticky, opaque header. It remains available while the page scrolls. Changing sections resets page scroll, and the activity header wraps on narrow screens. Settings/account/feedback dialogs retain their existing close and unsaved-change behavior.

Verification: typecheck and all 16 focused caregiver tests passed, including scroll-to-bottom and return checks on all four subpages at desktop/mobile sizes. Visually checked the mobile sticky header. An initial test used an incorrect banner-role locator; corrected it to target the page header and reran the entire focused set successfully.

## Verification

- Typecheck and production build passed; lint has no errors and seven existing fast-refresh warnings.
- All 144 launch tests passed, including the new overview grouping and live saved-level summary checks on desktop/mobile, plus existing PIN, account, remote-device and settings coverage.
- Reviewed desktop and 390px mobile screenshots locally. Existing emulated iPad communication flows passed; physical iPad review remains pending.

## Release checkpoint

October 17, 2026: final production build, typecheck and all 146 launch tests passed before committing the settings/caregiver release. Includes equal-sized Settings row, persistent return navigation and removal of the redundant caregiver Saved phrases Home button. No Together/social/game/learning experiment is included. Connected-device SQL remains unapplied to the live project; committing its source does not activate that service. Local native signing changes and screenshot artifacts are excluded.
