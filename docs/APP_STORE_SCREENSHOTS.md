# Expressly App Store Screenshots

Run the following command from the project folder:

```bash
npm run screenshots:app-store
```

The command starts a temporary local server and creates clean screenshots in:

```text
artifacts/app-store-screenshots/
```

It captures four screens for each required device family:

1. The communication home screen
2. Starting a message with a person card
3. A short message ready to speak (not a fabricated AI result)
4. The display personalization settings

## Current output sizes

* iPhone 6.9 inch: 1320 x 2868 pixels
* iPad 13 inch: 2064 x 2752 pixels

These match sizes accepted by App Store Connect as of October 2026. Recheck Apple's screenshot specifications before the final upload because requirements can change.

## Safety notes

* The screenshots use a fictional learner named Alex.
* No real account, email address, learner history, or API key is used.
* Third party CAPTCHA requests are blocked during capture.
* Generated screenshots are local review artifacts and are not committed to Git.
* These are browser-rendered previews. Compare them with the native release before App Store upload. They do not demonstrate actual device playback, keyboard behavior, or authentication.
* Use the four filenames beginning `01-communication-home`, `02-build-a-message`, `03-message-ready-to-speak`, and `04-personalize-expressly`. Older `03-complete-a-message.png` captures may remain in the output folder and are not part of the refreshed set.
