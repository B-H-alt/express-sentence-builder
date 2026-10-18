// Device/browser-wide, deliberately independent of accounts and routine app versions.
export const RELEASE_WELCOME_KEY = "expressly-release-welcome-v1";
export const RELEASE_WELCOME_ID = "expressly-refresh-2026-10";
const caregiverKey = "expressly-caregiver-release-welcome-v1";
export type ReleaseAudience = "app" | "caregiver";
export const hasSeenReleaseWelcome = (audience: ReleaseAudience = "app") => {
  for (const storage of ["localStorage", "sessionStorage"] as const) {
    try { if (window[storage].getItem(audience === "app" ? RELEASE_WELCOME_KEY : caregiverKey) === RELEASE_WELCOME_ID) return true; } catch { /* Storage may be disabled. */ }
  }
  return false;
};
export const markReleaseWelcomeSeen = (audience: ReleaseAudience = "app") => {
  for (const storage of ["localStorage", "sessionStorage"] as const) {
    try { window[storage].setItem(audience === "app" ? RELEASE_WELCOME_KEY : caregiverKey, RELEASE_WELCOME_ID); } catch { /* Dismissal still works for this mount. */ }
  }
};
