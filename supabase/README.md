# Expressly cloud foundation

This folder contains the proposed database and access-control migration for parent accounts.

## Safety order

1. Create a separate Supabase development project owned by the Expressly team.
2. Enable email confirmation and choose email OTP or magic-link authentication.
3. Link the local repository to the development project with the Supabase CLI.
4. Apply the migration to development only.
5. Create two test parent accounts.
6. Verify that each account can access only its own learner, cards, events, and images.
7. Verify that signed-out requests cannot read or write any Expressly data.
8. Add automated RLS tests before creating the production project.

Do not put the Supabase service-role key in Vite variables or browser code. The browser may use only the project's publishable key, protected by Row Level Security.

## Data-minimization defaults

- Parent email lives in Supabase Auth.
- Learners use a display name or nickname, not a required legal name.
- No date of birth, diagnosis, address, school ID, or audio recording is stored.
- Images live in the private `expressly-private` bucket.
- Sentence history is limited to the data needed for the parent dashboard.
- Account deletion cascades through learner profiles, cards, and progress events.
