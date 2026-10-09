import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface AppGuideDialogProps {
  open: boolean;
  sentenceLength: number;
  onOpenChange: (open: boolean) => void;
}

interface GuideStep {
  target: string;
  title: string;
  text: string;
  action?: "choose-card";
}

const guideSteps: GuideStep[] = [
  {
    target: "[data-guide='find-words']",
    title: "Find a word",
    text: "Choose a category or use search.",
  },
  {
    target: "[data-guide='card-area']",
    title: "Choose a card",
    text: "Tap any card to add it.",
    action: "choose-card",
  },
  {
    target: "[data-guide='sentence']",
    title: "Build the sentence",
    text: "Your cards appear here.",
  },
  {
    target: "[data-guide='sentence-actions']",
    title: "Share the message",
    text: "Finish it or read it aloud.",
  },
];

const padding = 8;

export const AppGuideDialog = ({ open, sentenceLength, onOpenChange }: AppGuideDialogProps) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const startingSentenceLength = useRef(sentenceLength);
  const wasOpen = useRef(false);
  const current = guideSteps[step];

  useEffect(() => {
    if (open && !wasOpen.current) {
      setStep(0);
      startingSentenceLength.current = sentenceLength;
    }
    wasOpen.current = open;
  }, [open, sentenceLength]);

  useEffect(() => {
    if (!open || current.action !== "choose-card") return;
    if (sentenceLength > startingSentenceLength.current) setStep(2);
  }, [current.action, open, sentenceLength]);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const target = document.querySelector<HTMLElement>(current.target);
      setTargetRect(target?.getBoundingClientRect() ?? null);
    };
    document.querySelector<HTMLElement>(current.target)?.scrollIntoView({ behavior: "smooth", block: "center" });
    update();
    const frame = requestAnimationFrame(update);
    const timer = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current.target, open]);

  if (!open) return null;

  const next = () => {
    if (step === guideSteps.length - 1) onOpenChange(false);
    else setStep((value) => value + 1);
  };

  const spotlight = targetRect ? {
    left: Math.max(8, targetRect.left - padding),
    top: Math.max(8, targetRect.top - padding),
    width: Math.min(window.innerWidth - 16, targetRect.width + padding * 2),
    height: Math.min(window.innerHeight - 16, targetRect.height + padding * 2),
  } : null;
  const placeBelow = spotlight && spotlight.top + spotlight.height < window.innerHeight * 0.58;
  const panelStyle = spotlight ? {
    left: Math.min(Math.max(16, spotlight.left), window.innerWidth - 336),
    top: placeBelow
      ? Math.min(spotlight.top + spotlight.height + 14, window.innerHeight - 190)
      : Math.max(16, spotlight.top - 176),
  } : undefined;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="How to use Expressly">
      {spotlight ? (
        <>
          <div className="pointer-events-auto fixed inset-x-0 top-0 bg-slate-950/35" style={{ height: spotlight.top }} />
          <div className="pointer-events-auto fixed bottom-0 inset-x-0 bg-slate-950/35" style={{ top: spotlight.top + spotlight.height }} />
          <div className="pointer-events-auto fixed left-0 bg-slate-950/35" style={{ top: spotlight.top, width: spotlight.left, height: spotlight.height }} />
          <div className="pointer-events-auto fixed right-0 bg-slate-950/35" style={{ top: spotlight.top, left: spotlight.left + spotlight.width, height: spotlight.height }} />
          <div
            className={`${step === 2 ? "pointer-events-auto" : "pointer-events-none"} fixed rounded-2xl border-2 border-primary bg-transparent shadow-[0_0_0_4px_hsl(var(--background)/0.95)] transition-all duration-300`}
            style={spotlight}
          />
        </>
      ) : <div className="fixed inset-0 bg-slate-950/35" />}

      <div className="pointer-events-auto fixed w-[min(320px,calc(100vw-32px))] rounded-2xl border border-border bg-background p-4 text-foreground shadow-xl" style={panelStyle ?? { left: 16, bottom: 16 }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">{step + 1} of {guideSteps.length}</span>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Skip
          </button>
        </div>
        <h2 className="text-lg font-semibold">{current.title}</h2>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{current.text}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {guideSteps.map((item, index) => (
              <span key={item.title} className={`h-1.5 rounded-full transition-all duration-300 ${index === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
            ))}
          </div>
          <Button size="sm" variant={current.action === "choose-card" ? "outline" : "default"} className="rounded-xl px-4" onClick={next}>
            {step === guideSteps.length - 1 ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};
