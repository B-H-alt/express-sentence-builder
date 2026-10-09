const ACTIVE_DATA_KEY = "pecs-storage";
const ACTIVE_PIN_KEY = "expressly-parent-pin-v1";
const ACTIVE_SCOPE_KEY = "expressly-active-account-scope-v1";
const SCOPED_PREFIX = "expressly-account-data-v1:";
const SCOPED_PIN_PREFIX = "expressly-account-pin-v1:";

const scopeFor = (userId: string | null) => userId ? `user:${userId}` : "guest";

export const switchAccountStorage = (userId: string | null) => {
  const nextScope = scopeFor(userId);
  const previousScope = window.localStorage.getItem(ACTIVE_SCOPE_KEY);

  if (!previousScope) {
    window.localStorage.setItem(ACTIVE_SCOPE_KEY, nextScope);
    return false;
  }
  if (previousScope === nextScope) return false;

  const activeData = window.localStorage.getItem(ACTIVE_DATA_KEY);
  if (activeData) {
    window.localStorage.setItem(`${SCOPED_PREFIX}${previousScope}`, activeData);
  } else {
    window.localStorage.removeItem(`${SCOPED_PREFIX}${previousScope}`);
  }

  const activePin = window.localStorage.getItem(ACTIVE_PIN_KEY);
  if (activePin) {
    window.localStorage.setItem(`${SCOPED_PIN_PREFIX}${previousScope}`, activePin);
  } else {
    window.localStorage.removeItem(`${SCOPED_PIN_PREFIX}${previousScope}`);
  }

  const nextData = window.localStorage.getItem(`${SCOPED_PREFIX}${nextScope}`);
  if (nextData) window.localStorage.setItem(ACTIVE_DATA_KEY, nextData);
  else window.localStorage.removeItem(ACTIVE_DATA_KEY);
  const nextPin = window.localStorage.getItem(`${SCOPED_PIN_PREFIX}${nextScope}`);
  if (nextPin) window.localStorage.setItem(ACTIVE_PIN_KEY, nextPin);
  else window.localStorage.removeItem(ACTIVE_PIN_KEY);
  window.localStorage.setItem(ACTIVE_SCOPE_KEY, nextScope);
  return true;
};
