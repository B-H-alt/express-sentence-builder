import { Capacitor } from "@capacitor/core";

export const registerOffline = () => {
  if (!import.meta.env.PROD || Capacitor.isNativePlatform() || !("serviceWorker" in navigator)) return;
  const register = () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {
      // A failed cache install must not interfere with normal online communication.
      console.warn("Offline download did not finish. Connect and reopen Expressly to retry.");
    });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
};
