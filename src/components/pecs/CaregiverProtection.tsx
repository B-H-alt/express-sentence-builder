import { createContext, useContext, useSyncExternalStore } from "react";
import { readStoredPin } from "@/lib/caregiverPin";

export const CaregiverProtectionContext = createContext(false);
export const useProtectedLearnerControls = () => useContext(CaregiverProtectionContext);
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify); window.addEventListener("expressly-pin-changed", notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener("expressly-pin-changed", notify); };
};
export const useCaregiverProtectionEnabled = () => useSyncExternalStore(subscribe, () => Boolean(readStoredPin()), () => false);
