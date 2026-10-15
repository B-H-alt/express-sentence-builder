import { CircleHelp, Hand, MessageCircle, MoreHorizontal, OctagonAlert, Volume2 } from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { appText, translateCardLabel } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/supabase";
import { getApiUrl } from "@/lib/runtimeUrls";
import { playAudioToEnd } from "@/utils/play-audio";

const quickMessages = [
  { text: "Yes", icon: MessageCircle },
  { text: "No", icon: Hand },
  { text: "I need help", icon: CircleHelp },
  { text: "Stop", icon: OctagonAlert },
  { text: "Bathroom", icon: MessageCircle },
  { text: "More", icon: MoreHorizontal },
  { text: "All done", icon: MessageCircle },
];

export const SpeakNowBar = ({ phrases }: { phrases?: string[] }) => {
  const { toast } = useToast();
  const speechRate = useCardStore((state) => state.speechRate);
  const speechVolume = useCardStore((state) => state.speechVolume);
  const recordQuickPhrase = useCardStore((state) => state.recordQuickPhrase);
  const language = useCardStore((state) => state.language);
  const copy = appText[language];
  const messages = phrases ? phrases.map((text) => ({ text, icon: Volume2 })) : quickMessages;
  const playback = useRef<HTMLAudioElement | null>(null);
  const pending = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const clips = useRef(new Map<string, Blob>());

  useEffect(() => () => {
    sequence.current += 1;
    pending.current?.abort();
    playback.current?.pause();
    window.speechSynthesis?.cancel();
  }, []);

  const speak = async (text: string) => {
    const current = ++sequence.current;
    pending.current?.abort();
    playback.current?.pause();
    window.speechSynthesis?.cancel();
    const controller = new AbortController();
    pending.current = controller;
    if (navigator.onLine) {
      try {
        const token = await getAccessToken();
        if (current !== sequence.current) return;
        if (token) {
          const key = `${language}:${text}`;
          let blob = clips.current.get(key);
          if (!blob) {
            const response = await fetch(getApiUrl("/api/speak"), {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ text }),
              signal: controller.signal,
            });
            if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/")) throw new Error("Enhanced voice unavailable");
            blob = await response.blob();
            if (current !== sequence.current) return;
            if (clips.current.size >= 14) clips.current.clear();
            clips.current.set(key, blob);
          }
          if (current !== sequence.current) return;
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          playback.current = audio;
          audio.volume = speechVolume;
          audio.playbackRate = speechRate;
          audio.preservesPitch = true;
          try { await playAudioToEnd(audio); }
          finally { URL.revokeObjectURL(url); }
          if (current === sequence.current) recordQuickPhrase(text);
          return;
        }
      } catch {
        if (current !== sequence.current || controller.signal.aborted) return;
        toast({ title: language === "es" ? "Usando la voz del dispositivo" : "Using device voice" });
      }
    }
    if (current !== sequence.current) return;
    const unavailable = () => toast({ title: language === "es" ? "Voz no disponible" : "Device voice unavailable", description: language === "es" ? "Puedes mostrar tu mensaje." : "You can still show your message." });
    if (!("speechSynthesis" in window)) { unavailable(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "es" ? "es-US" : "en-US";
    const voices = window.speechSynthesis.getVoices();
    const localVoice = voices.find((voice) => voice.localService && voice.lang.toLowerCase().startsWith(language));
    if (localVoice) utterance.voice = localVoice;
    if (!navigator.onLine && voices.length > 0 && !localVoice) { unavailable(); return; }
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    utterance.onend = () => { if (current === sequence.current) recordQuickPhrase(text); };
    utterance.onerror = () => { if (current === sequence.current) unavailable(); };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      className={phrases ? "" : "rounded-xl border border-border/80 bg-card px-2.5 py-1.5"}
      aria-label={phrases ? (language === "es" ? "Escuchar frases guardadas" : "Speak saved phrases") : copy.speakNow}
    >
      <div className="flex items-center gap-3">
        {!phrases && <div className="flex shrink-0 items-center gap-1.5 px-1 text-primary">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          <span id="speak-now-title" className="text-sm font-semibold text-foreground">
            {copy.speakNow}
          </span>
        </div>}
        <div className={phrases ? "grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" : "flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1"}>
          {messages.map(({ text, icon: Icon }) => {
            const spokenText = phrases ? text : translateCardLabel(text, language);
            return (
            <button
              key={text}
              type="button"
              onClick={() => speak(spokenText)}
              className={phrases ? "flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-border bg-background p-4 text-left font-semibold text-foreground [overflow-wrap:anywhere] hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"}
              aria-label={`${copy.speak} ${spokenText}`}
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {spokenText}
            </button>
          )})}
        </div>
      </div>
    </section>
  );
};
