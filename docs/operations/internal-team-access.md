# Internal team access

Applied migration: `20261015050000_internal_team_access.sql` to project `xtvnwkeshlxagoelutug` on October 15, 2026. The public production bundle was checked and points to this project, whose dashboard display name is Expressly Development.

`choudhrydawud@gmail.com` is in the owner-managed `public.internal_team_emails` table. No account with that email existed when configured. The existing signup trigger now assigns `internal_team`, `internal`, `active` for listed emails, with no expiry. Normal signups retain their existing preview defaults.

This grants free product access, not Supabase administration or access to other users' data. Email verification and burst rate limits still apply. Internal access bypasses monthly feature quotas under the existing authorization function. It does not guarantee provider availability or bypass authentication.

Verified live: email listed, signup trigger enabled, trigger function references the allowlist, and authenticated users cannot insert themselves into the allowlist. Actual signup and verified-account use by Dawud remain to be tested.

Existing Bilal accounts were observed on preview/trial access, not internal_team, and were not modified in this change. Confirm desired founder emails before granting additional permanent team access.

Future payment integrations must preserve internal entitlements. Do not let subscription webhooks overwrite internal access. Owners should manage the allowlist through trusted database administration only; never through client metadata or a browser-side email check.

Removing an email from the list prevents future automatic grants but does not revoke an existing entitlement. Revocation must also update that account's entitlement deliberately.
