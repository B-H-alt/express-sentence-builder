export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";

export const isCaptchaConfigured = Boolean(turnstileSiteKey);
