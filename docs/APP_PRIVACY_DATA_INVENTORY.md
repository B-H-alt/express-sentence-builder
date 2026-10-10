# Expressly App Privacy Data Inventory

This is an engineering inventory for App Store privacy disclosures and the future privacy policy. It describes the current code, not planned features.

## Data currently handled

| Data | Why it is used | Current location | Shared with |
| --- | --- | --- | --- |
| Parent email and authentication records | Create and secure the parent account | Supabase Auth | Supabase |
| Learner name, profile image, gender preference, language, level, theme, and display preferences | Personalize the AAC interface | The user's device browser storage | Nobody unless cloud synchronization is added |
| Custom cards and uploaded card images | Personalize communication cards | The user's device browser storage | Replicate receives the written image prompt only when generation is requested |
| Selected card words | Create a grammatically corrected sentence | Expressly's protected server endpoint | Google Gemini only when grammar correction is requested |
| Sentence text | Produce enhanced speech | Expressly's protected server endpoint | ElevenLabs only when enhanced voice is requested |
| Card usage and completed-sentence history | Show the parent progress dashboard | The user's device browser storage | Nobody unless cloud synchronization is added |
| Feature usage counts and subscription entitlement | Enforce limits and account access | Supabase | Supabase |
| CAPTCHA token | Prevent automated account abuse | Supabase Auth | Cloudflare Turnstile and Supabase |

## Not present in the current code

- No advertising SDK.
- No cross-app tracking SDK.
- No analytics or behavioral telemetry SDK.
- No location collection.
- No contacts collection.
- No camera or microphone permission request.
- No sale of personal data.

## Important launch decisions

1. Decide whether learner profiles and progress will remain device-only or synchronize across devices.
2. Decide the minimum age and whether Expressly will enter Apple's Kids Category.
3. Confirm whether a learner's communication history is retained, for how long, and whether parents can disable it.
4. List all final processors and their retention terms before publishing the privacy policy.
5. Obtain legal review before representing this inventory as a final privacy policy.

## Deletion behavior

The in-app deletion flow is designed to remove the authenticated Supabase user, database records linked through cascading foreign keys, private storage objects, and that account's cached device data. It still requires a disposable-account test after the server-only service-role key is configured.
