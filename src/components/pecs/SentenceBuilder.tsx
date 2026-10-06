// src/components/SentenceBuilder.tsx
import { useEffect, useRef, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Button } from "@/components/ui/button";
import { Check, Loader2, MessageSquareText, Trash2, Volume2, Square, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { composeSentence } from "@/utils/compose-sentence";

interface SentenceBuilderProps {
  showWord: boolean;
}

const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const ELEVEN_VOICE =
  (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ?? "21m00Tcm4TlvDq8ikWAM";

export const SentenceBuilder = ({ showWord }: SentenceBuilderProps) => {
  const { sentence, removeFromSentence, clearSentence, completeSentence } = useCardStore();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composedText, setComposedText] = useState("");
  const [composedSource, setComposedSource] = useState("");
  const [showComposed, setShowComposed] = useState(false);

  const getSentenceText = () => sentence.map((card) => card.text).join(" ").trim();
  const getSentenceTokens = () => sentence.map((card) => card.text);

  useEffect(() => {
    setComposedText("");
    setComposedSource("");
    setShowComposed(false);
  }, [sentence]);

  const resolveSentence = async () => {
    const raw = getSentenceText();
    if (!raw) return "";
    if (composedSource === raw && composedText) return composedText;

    setIsComposing(true);
    try {
      const improved = await composeSentence({ tokens: getSentenceTokens() });
      const finalText = improved?.trim() || raw;
      setComposedText(finalText);
      setComposedSource(raw);
      return finalText;
    } catch (error) {
      console.error("Failed to compose sentence:", error);
      setComposedText(raw);
      setComposedSource(raw);
      return raw;
    } finally {
      setIsComposing(false);
    }
  };

  const playBlob = async (blob: Blob) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    try {
      await audioRef.current.play();
    } finally {
      audioRef.current.onended = () => URL.revokeObjectURL(url);
    }
  };

  const speakWithWebAPI = async (text: string) => {
    return new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) return resolve();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const speakWithElevenLabs = async (text: string) => {
    if (!ELEVEN_KEY || !ELEVEN_VOICE) throw new Error("Missing ElevenLabs config");
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}?optimize_streaming_latency=0`;
    const body = {
      text,
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`ElevenLabs error (${res.status}): ${msg || res.statusText}`);
    }
    const blob = await res.blob();
    await playBlob(blob);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSpeak = async () => {
    if (!getSentenceText()) return;

    setIsSpeaking(true);
    const spoken = await resolveSentence();
    if (!spoken) {
      setIsSpeaking(false);
      return;
    }

    // Show what will actually be spoken
    toast({ title: spoken });

    try {
      if (ELEVEN_KEY) {
        await speakWithElevenLabs(spoken);
      } else {
        await speakWithWebAPI(spoken);
      }
    } catch (err: unknown) {
      console.error(err);
      await speakWithWebAPI(spoken);
      toast({
        title: "Using browser voice",
        description: "Couldn’t use ElevenLabs. Fell back to Web Speech.",
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleShowSentence = async () => {
    const text = await resolveSentence();
    if (text) setShowComposed(true);
  };

  const handleComplete = () => {
    stopAudio();
    const completed = completeSentence();
    if (!completed) return;

    toast({
      title: "Sentence saved",
      description: "A fresh sentence is ready to build.",
    });
  };

  return (
    <div
      className="relative overflow-hidden min-h-full max-h-full bg-gradient-subtle rounded-3xl border-2 border-dashed border-primary/30 p-4 flex flex-col overflow-hidden"
      onDrop={(e) => {
        e.preventDefault();
        const cardData = e.dataTransfer.getData("card");
        if (cardData) {
          const card = JSON.parse(cardData);
          useCardStore.getState().addToSentence(card);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-lg font-semibold bg-gradient-accent bg-clip-text text-transparent">
          My Sentence
        </h2>
        <div className="flex flex-wrap justify-end gap-2">
          {sentence.length > 0 && (
            <>
              <Button size="sm" onClick={handleComplete} className="rounded-xl">
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShowSentence}
                className="rounded-xl"
                disabled={isComposing}
              >
                {isComposing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <MessageSquareText className="w-4 h-4 mr-1" />
                )}
                Show sentence
              </Button>
              {!isSpeaking ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSpeak}
                  className="rounded-xl"
                  disabled={isComposing}
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Speak
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={stopAudio} className="rounded-xl">
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  stopAudio();
                  clearSentence();
                }}
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>
      {showComposed && composedText && (
        <div
          className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-secondary/25 bg-secondary/5 px-4 py-3"
          aria-live="polite"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Sentence
            </p>
            <p className="mt-1 text-lg font-semibold leading-7">{composedText}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowComposed(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Hide corrected sentence"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-wrap items-start gap-3 overflow-y-auto pb-2">
        {sentence.length === 0 ? (
          <p className="text-muted-foreground text-center w-full py-8">
            Tap or drag cards here to build your sentence
          </p>
        ) : (
          sentence.map((c, i) => (
            <div key={`${c.id}-${i}`} className="flex-shrink-0">
              <PecsCard card={c} showWord={showWord} onRemove={() => removeFromSentence(i)} inSentence />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
