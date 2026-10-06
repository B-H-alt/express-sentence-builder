# Expressly account architecture

## Goal

Add parent-owned learner accounts and cloud progress without making the child's communication board dependent on a network connection.

## Proposed stack

- React/Vite remains the client.
- Vercel remains the host and runs secret-bearing API functions.
- Supabase Auth authenticates the parent.
- Supabase Postgres stores learner settings, custom cards, and progress events.
- Supabase private Storage holds profile and custom-card images.
- Zustand/local storage remains the fast local cache and offline fallback.

## Trust boundaries

- The browser may contain only public configuration such as the Supabase URL and publishable key.
- Gemini, Replicate, Supabase service-role, and database secrets stay server-side.
- Grammar requests require a valid Supabase parent session and are limited per user.
- Database Row Level Security is the final authorization layer.
- A parent may access a row only when `auth.uid()` matches `owner_user_id`.
- A four-digit parent PIN may hide adult controls on a shared device, but it is not backend authentication.

## Sync strategy

- Settings are upserted with an `updated_at` timestamp.
- Completed sentences are append-only events.
- Custom cards use stable UUIDs.
- Existing local users are not forced to create an account.
- On first sign-in, the parent explicitly chooses whether to upload the current local learner.
- The board keeps working locally if cloud sync fails.

## Rollout gates

1. Move Gemini behind `/api/compose` and confirm no key appears in the client bundle.
2. Create a team-owned Supabase development project. Completed.
3. Apply and review the SQL migration in development. Completed and verified.
4. Add RLS tests using two unrelated parent accounts plus a signed-out client.
5. Add email OTP or magic-link authentication behind a feature flag.
6. Sync a single learner's settings, then custom cards, then progress.
7. Add private image upload and deletion.
8. Add account export and deletion.
9. Complete privacy and legal review before production accounts are enabled.

## Current status

- Server-side grammar endpoint: implemented locally, requires a verified parent session, not deployed.
- Database migration and private-storage policies: applied to the development project and verified.
- Supabase development project: connected locally and to Vercel Preview only.
- Parent passwordless sign-in UI: implemented locally.
- Cloud data sync: intentionally not started until two-account RLS testing is complete.
