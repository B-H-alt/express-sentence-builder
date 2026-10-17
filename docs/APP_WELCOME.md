# Native welcome screen

Native `/` and `/pecs-app` show a simple welcome screen until the user chooses Open Expressly or Sign in. The device-local `expressly-welcome-seen-v1` flag then skips it on future launches. It is separate from learner onboarding, account scopes and board backups. Existing learner data is not reset. Existing installations see it once after receiving this update.

Open Expressly continues into the existing board or quick learner setup. How to use Expressly shows three short instructions without opening or modifying the board. Sign in enters the existing parent account flow. Account links containing `account`, `code`, or authentication hash/error parameters bypass and dismiss the welcome gate, so email confirmation and password recovery are not interrupted.

The public website and its normal app link remain unchanged. `/welcome` is an explicit browser preview that can be revisited without changing the native welcome flag. The shared route-loading fallback uses the same logo and solid background, with no animation or artificial delay. The existing native launch storyboard is unchanged.

Storage failures do not trap users at the welcome screen. Remembering the welcome never writes learner profile data or authentication credentials. This is a one-time introduction, not a mandatory daily launch menu.

Tests: `tests/e2e/app-welcome.spec.ts` simulates Capacitor's custom iOS platform in isolated browser contexts. Covers first entrance, existing board preservation, reopen, guest setup, help, sign-in, and callback bypass. Browser simulation does not verify native app installation, device keyboard, or real email delivery.
