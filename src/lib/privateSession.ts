let revision = 0;
const listeners = new Set<() => void>();
export const privateSessionRevision = () => revision;
export const onPrivateSessionChange = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export const clearPrivateSession = () => {
  revision++;
  for (const listener of listeners) listener();
};

// Also cover page exit and pages restored from the browser's back/forward cache.
if (typeof window !== "undefined") window.addEventListener("pagehide", clearPrivateSession);
