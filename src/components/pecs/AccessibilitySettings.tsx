import { useEffect } from "react";
import { useCardStore } from "@/store/cardStore";
import { Button } from "@/components/ui/button";
import type { AccessibilityPreferences } from "@/lib/accessibilityPreferences";

const options: { key: keyof AccessibilityPreferences; label: string; description: string }[] = [
  { key: "reduceMotion", label: "Reduce motion", description: "No animated transitions or card shrinking." },
  { key: "plainBackgrounds", label: "Plain backgrounds", description: "No gradients, glows or blur." },
  { key: "softerColors", label: "Softer colors", description: "Muted interface colors. Pictures stay unchanged." },
  { key: "strongerContrast", label: "Stronger contrast", description: "Clearer text and outlines." },
];

// Scoped to the communication app, including its portal-like settings overlays.
// Leaving the app removes these classes, so marketing/legal pages stay unchanged.
export const AccessibilityEffects = () => {
  const preferences = useCardStore((state) => state.accessibility);
  useEffect(() => {
    const root = document.documentElement;
    for (const { key } of options) root.classList.toggle(`accessibility-${key}`, preferences[key]);
    return () => { for (const { key } of options) root.classList.remove(`accessibility-${key}`); };
  }, [preferences]);
  return null;
};

export const AccessibilitySettings = () => {
  const preferences = useCardStore((state) => state.accessibility);
  const setAccessibility = useCardStore((state) => state.setAccessibility);
  const resetAccessibility = useCardStore((state) => state.resetAccessibility);
  const calmMode = useCardStore((state) => state.lowStimulationMode);
  return (
    <section className="space-y-5" aria-labelledby="accessibility-title">
      <div>
        <h3 id="accessibility-title" className="text-base font-semibold">Display comfort</h3>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4" aria-label="Appearance preview">
        <p className="text-sm font-medium">Appearance preview</p>
        <p className="mt-1 text-xs text-muted-foreground">Live example, not a button.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-xl border-2 border-border bg-background px-4 py-3 font-medium">Example card</span>
          <span className="rounded-xl bg-gradient-accent px-4 py-3 font-medium text-white">Selected example</span>
        </div>
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
        {options.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-4">
            <div>
              <h4 id={`accessibility-${key}-label`} className="text-sm font-medium">{label}</h4>
              <p id={`accessibility-${key}-description`} className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
            <button type="button" role="switch" aria-checked={preferences[key]}
              aria-labelledby={`accessibility-${key}-label`} aria-describedby={`accessibility-${key}-description`}
              onClick={() => setAccessibility(key, !preferences[key])}
              className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${preferences[key] ? "border-primary bg-primary" : "border-border bg-muted"}`}>
              <span aria-hidden="true" className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${preferences[key] ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{calmMode
        ? "Calm mode also reduces motion."
        : "Device motion preferences still apply."}</p>
      <Button type="button" variant="outline" disabled={!Object.values(preferences).some(Boolean)} onClick={resetAccessibility}>Reset accessibility settings</Button>
      <p className="text-xs text-muted-foreground">Only these four options reset.</p>
    </section>
  );
};
