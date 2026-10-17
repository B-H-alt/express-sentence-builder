const WELCOME_KEY = "expressly-welcome-seen-v1";

export const hasSeenAppWelcome = () => {
  try { return localStorage.getItem(WELCOME_KEY) === "true"; }
  catch { return true; } // Storage restrictions must not block communication.
};

export const rememberAppWelcome = () => {
  try { localStorage.setItem(WELCOME_KEY, "true"); }
  catch { /* Continue into the app even if the device cannot remember this. */ }
};

export const isAccountEntry = (search: string, hash: string) => {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  return query.has("account") || query.has("code") || query.has("error") || fragment.has("access_token") || fragment.has("error") || fragment.get("type") === "recovery";
};
