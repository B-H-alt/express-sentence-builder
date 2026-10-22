import { onPrivateSessionChange } from "@/lib/privateSession";
import { CircleHelp, Hand, MessageCircle, MoreHorizontal, OctagonAlert, Volume2 } from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { appText, translateCardLabel } from "@/lib/language";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/supabase";
import { getApiUrl } from "@/lib/runtimeUrls";
import { PartialSpeechError, playSpeechResponse } from "@/utils/stream-speech";
import { speakDeviceText, stopDeviceSpeech } from "@/utils/device-speech";

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

  useEffect(() => () => {
    sequence.current += 1;
    pending.current?.abort();
    playback.current?.pause();
    stopDeviceSpeech();
  }, []);

  useEffect(() => onPrivateSessionChange(() => {
    sequence.current++;
    pending.current?.abort();
    playback.current?.pause();
    playback.current?.removeAttribute?.("src");
    stopDeviceSpeech();
  }), []);

  const speak = async (text: string) => {
    const current = ++sequence.current;
    pending.current?.abort();
    playback.current?.pause();
    stopDeviceSpeech();
    const controller = new AbortController();
    pending.current = controller;
    if (speechVolume <= 0) {
      toast({ title: language === "es" ? "Volumen silenciado" : "Expressly volume is muted", description: language === "es" ? "Sube el volumen en Ajustes." : "Raise it in Settings, Cards & voice." });
      return;
    }
    if (navigator.onLine) {
      try {
        const token = await getAccessToken();
        if (current !== sequence.current) return;
        if (token) {
          const timer = setTimeout(() => controller.abort(new DOMException("Voice request timed out.", "TimeoutError")), 12_000);
          try {
            const response = await fetch(getApiUrl("/api/speak"), {
              method: "POST", cache: "no-store",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ text }), signal: controller.signal,
            });
            if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/")) throw new Error("Enhanced voice unavailable");
            if (current !== sequence.current) return;
            const audio = new Audio();
            playback.current = audio;
            audio.volume = speechVolume;
            audio.playbackRate = speechRate;
            audio.preservesPitch = true;
            await playSpeechResponse(response, audio, controller.signal, () => clearTimeout(timer));
          } finally { clearTimeout(timer); }
          if (current === sequence.current) recordQuickPhrase(text);
          return;
        }
      } catch (error) {
        if (current !== sequence.current || (controller.signal.aborted && controller.signal.reason?.name !== "TimeoutError")) return;
        if (error instanceof PartialSpeechError) {
          toast({ title: language === "es" ? "No se pudo hablar" : "Speech couldn't play", description: error.message });
          return;
        }
        toast({ title: language === "es" ? "Usando la voz del dispositivo" : "Using device voice" });
      }
    }
    if (current !== sequence.current) return;
    try {
      await speakDeviceText(text, language, speechRate, speechVolume);
      if (current === sequence.current) recordQuickPhrase(text);
    } catch (error) {
      if (current !== sequence.current || (error instanceof DOMException && error.name === "AbortError")) return;
      toast({ title: language === "es" ? "Voz no disponible" : "Device voice unavailable", description: language === "es" ? "Revisa el volumen y la salida de audio." : error instanceof Error ? error.message : "Check your volume and sound output." });
    }
  };

  return (
    <section
      className={phrases ? "" : "rounded-xl border border-border/80 bg-card px-2.5 py-1.5"}
      aria-label={phrases ? (language === "es" ? "Escuchar frases guardadas" : "Speak saved phrases") : copy.speakNow}
    >
      <div className="flex items-center gap-3">
        {!phrases && <div className="flex shrink-0 items-center gap-1.5 px-1 text-primary">
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
