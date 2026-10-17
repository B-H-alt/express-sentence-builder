import { useEffect } from "react";
import { useCardStore } from "@/store/cardStore";
import { AccessibilityEffects } from "./AccessibilitySettings";

export const CommunicationPreferences = () => {
  const calm = useCardStore((state) => state.lowStimulationMode);
  const textSize = useCardStore((state) => state.textSize);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("low-stimulation", calm);
    root.classList.remove("text-size-small", "text-size-large");
    if (textSize !== "default") root.classList.add(`text-size-${textSize}`);
    return () => root.classList.remove("low-stimulation", "text-size-small", "text-size-large");
  }, [calm, textSize]);
  return <AccessibilityEffects />;
};
