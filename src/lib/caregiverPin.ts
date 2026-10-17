export const PIN_STORAGE_KEY = "expressly-parent-pin-v1";
export type StoredPin = { salt: string; hash: string; version?: 1 | 2 };
export const readStoredPin = (): StoredPin | null => {
  try { const pin = JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || "null"); return pin?.salt && pin?.hash ? pin : null; }
  catch { return null; }
};
export const pinIsOptional = () => {
  try { return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || "null")?.disabled === true; }
  catch { return false; }
};
export const notifyPinChanged = () => window.dispatchEvent(new Event("expressly-pin-changed"));
export const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
export const hashPin = async (pin: string, salt: string, version: 1 | 2 = 2) => {
  if (version === 1) return bytesToBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${pin}`))));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  return bytesToBase64(new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Uint8Array.from(atob(salt), character => character.charCodeAt(0)), iterations: 210_000 }, key, 256)));
};
