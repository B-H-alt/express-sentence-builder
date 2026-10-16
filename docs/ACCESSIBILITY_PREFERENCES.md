# Optional accessibility display preferences

Local preview. No deployment or native iPad installation performed.

Settings → Accessibility contains four independent options, initially off:

| Option | Effect |
| --- | --- |
| Reduce motion | Removes transitions, animated effects and button/card scaling. Does not change vocabulary, card count or features. |
| Plain backgrounds | Uses solid surfaces, removes decorative glows, shadows and backdrop blur. Keeps keyboard focus indicators. |
| Softer colors | Uses off-white light surfaces, less intense dark text, and more subdued theme accents. Does not filter symbol images or control hardware brightness. |
| Stronger contrast | Darker light-mode text, brighter dark-mode text, stronger borders and explicit selection outlines. Uses a solid selected-category background and appropriate text color. |

The preview updates immediately with the app. Changes save automatically in the existing device/account-scoped learner store, and are included in account data exports. Missing, partial or malformed saved preferences are normalized to booleans. Existing learner data and storage version remain intact.

Reset affects only these four preferences, not the theme, profile, vocabulary level, cards, favorites, saved phrases, Calm mode or voice. Calm mode and the device's Reduce Motion setting can still reduce motion even when the separate Reduce motion switch is off. No preference turns these protections off. Stronger contrast takes precedence over softer text colors when combined; plain backgrounds take precedence over softened gradients.

Classes are applied only while the communication app is mounted and removed when leaving it. Public pages keep their existing appearance. No whole-screen filters, symbol recoloring, delayed taps, grayscale, audio or haptic changes were added.

## Verification

- Defaults off, switch labels/state, immediate effects, persistent preferences, reset scope and malformed saved data covered by browser tests.
- Ten theme appearances × sixteen preference combinations tested on desktop and mobile. Images keep their URLs and have no CSS filters; plain backgrounds remove the app's decorative background; reduced motion removes card transitions.
- Selected-category text checked at a minimum 4.5:1 contrast with Stronger contrast enabled across the combinations. This is a bounded check, not a claim that the entire app is WCAG certified.
- Device reduced motion, app-route cleanup, sentence selection and the existing Save level flow covered.
- Full browser suite and production/offline lifecycle checks run before handoff. Existing lint fast-refresh warnings are unrelated.
- Visual review captured in `artifacts/accessibility/` at iPad landscape and phone sizes. Browser emulation does not substitute for physical iPad testing.

## Reference and limits

Inspired by Apple's independent display/motion controls, not copied screen designs:

- https://support.apple.com/guide/ipad/change-display-colors-ipad674f91c0/ipados
- https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria
- https://developer.apple.com/help/app-store-connect/manage-app-accessibility/sufficient-contrast-evaluation-criteria

Sensory needs vary. These are optional comfort and readability tools, not a treatment or a guarantee that a particular appearance suits all autistic users. User feedback should guide further adjustments.
