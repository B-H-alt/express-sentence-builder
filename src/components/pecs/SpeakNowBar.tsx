import { CircleHelp, Hand, MessageCircle, MoreHorizontal, OctagonAlert, Volume2 } from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { appText, translateCardLabel } from "@/lib/language";

const quickMessages = [
  { text: "Yes", icon: MessageCircle },
  { text: "No", icon: Hand },
  { text: "I need help", icon: CircleHelp },
  { text: "Stop", icon: OctagonAlert },
  { text: "Bathroom", icon: MessageCircle },
  { text: "More", icon: MoreHorizontal },
  { text: "All done", icon: MessageCircle },
];

export const SpeakNowBar = () => {
  const speechRate = useCardStore((state) => state.speechRate);
  const speechVolume = useCardStore((state) => state.speechVolume);
  const recordQuickPhrase = useCardStore((state) => state.recordQuickPhrase);
  const language = useCardStore((state) => state.language);
  const copy = appText[language];

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "es" ? "es-US" : "en-US";
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    window.speechSynthesis.speak(utterance);
    recordQuickPhrase(text);
  };

  return (
    <section
      className="rounded-xl border border-border/80 bg-card px-2.5 py-1.5"
      aria-labelledby="speak-now-title"
    >
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5 px-1 text-primary">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          <span id="speak-now-title" className="text-sm font-semibold text-foreground">
            {copy.speakNow}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
          {quickMessages.map(({ text, icon: Icon }) => {
            const spokenText = translateCardLabel(text, language);
            return (
            <button
              key={text}
              type="button"
              onClick={() => speak(spokenText)}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${copy.speak} ${spokenText}`}
            >
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              {spokenText}
            </button>
          )})}
        </div>
      </div>
    </section>
  );
};
