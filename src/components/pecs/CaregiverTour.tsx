import { useState } from "react";
import { Button } from "@/components/ui/button";

const key = "expressly-caregiver-tour-v1";
export const caregiverTourSeen = () => {
  try { return localStorage.getItem(key) === "seen"; } catch { return false; }
};
const steps = [
  { title: "Set up this device", text: "In Settings, choose vocabulary, appearance and voice for this device." },
  { title: "Make the board familiar", text: "Manage cards and save phrases your learner uses often." },
  { title: "Adjust a linked iPad", text: "Open Connected devices to pair it. Phone Settings change this phone, not the iPad." },
];

export const CaregiverTour = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const close = () => {
    try { localStorage.setItem(key, "seen"); } catch { /* The tour remains skippable without storage. */ }
    onClose();
  };
  return <section aria-label="Caregiver quick tour" className="mb-7 rounded-2xl border border-primary/20 bg-background p-5">
    <div aria-live="polite" aria-atomic="true">
      <p className="text-xs font-medium text-muted-foreground">Quick tour · {step + 1} of {steps.length}</p>
      <h2 className="mt-2 text-lg font-semibold">{steps[step].title}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{steps[step].text}</p>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <Button onClick={() => step === steps.length - 1 ? close() : setStep(step + 1)}>{step === steps.length - 1 ? "Done" : "Next"}</Button>
      {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Previous</Button>}
      <Button variant="ghost" onClick={close}>Skip tour</Button>
    </div>
  </section>;
};
