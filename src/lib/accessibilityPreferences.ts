export interface AccessibilityPreferences {
  reduceMotion: boolean;
  plainBackgrounds: boolean;
  softerColors: boolean;
  strongerContrast: boolean;
}

export const defaultAccessibility: AccessibilityPreferences = {
  reduceMotion: false,
  plainBackgrounds: false,
  softerColors: false,
  strongerContrast: false,
};

export const normalizeAccessibility = (value: unknown): AccessibilityPreferences => {
  const preferences = value && typeof value === "object" ? value as Partial<AccessibilityPreferences> : {};
  return Object.fromEntries(Object.keys(defaultAccessibility).map((key) =>
    [key, preferences[key as keyof AccessibilityPreferences] === true],
  )) as unknown as AccessibilityPreferences;
};
