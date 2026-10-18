import { Capacitor } from "@capacitor/core";
let scheduled = false;

export const registerOffline = () => {
  if (!import.meta.env.PROD || Capacitor.isNativePlatform() || !("serviceWorker" in navigator)) return;
  if (!/^\/pecs-app\/?$/.test(window.location.pathname) || scheduled) return;
  scheduled = true;
  const register = () => {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {
      // A failed cache install must not interfere with normal online communication.
      console.warn("Offline download did not finish. Connect and reopen Expressly to retry.");
    });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
};
