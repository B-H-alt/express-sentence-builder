import { Capacitor } from "@capacitor/core";

const configuredPublicOrigin = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim();
const publicOrigin = (configuredPublicOrigin || "https://www.expressly.us").replace(/\/$/, "");

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return Capacitor.isNativePlatform()
    ? `${publicOrigin}${normalizedPath}`
    : normalizedPath;
};

export const getAccountRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return `${publicOrigin}/pecs-app?account=sign-in`;
  }
  return `${window.location.origin}/pecs-app?account=sign-in`;
};
