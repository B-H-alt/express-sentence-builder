// Device/browser-wide, deliberately independent of accounts and routine app versions.
export const RELEASE_WELCOME_KEY = "expressly-release-welcome-v1";
export const RELEASE_WELCOME_ID = "expressly-refresh-2026-10";
export const hasSeenReleaseWelcome = () => {
  for (const storage of ["localStorage", "sessionStorage"] as const) {
    try { if (window[storage].getItem(RELEASE_WELCOME_KEY) === RELEASE_WELCOME_ID) return true; } catch { /* Storage may be disabled. */ }
  }
  return false;
};
export const markReleaseWelcomeSeen = () => {
  for (const storage of ["localStorage", "sessionStorage"] as const) {
    try { window[storage].setItem(RELEASE_WELCOME_KEY, RELEASE_WELCOME_ID); } catch { /* Dismissal still works for this mount. */ }
  }
};
