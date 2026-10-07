// src/components/SentenceBuilder.tsx
import { useEffect, useRef, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Trash2, Volume2, Square, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { composeSentence } from "@/utils/compose-sentence";
import { getAccessToken } from "@/lib/supabase";

interface SentenceBuilderProps {
  showWord: boolean;
}

export const SentenceBuilder = ({ showWord }: SentenceBuilderProps) => {
  const {
    sentence,
    removeFromSentence,
    clearSentence,
    completeSentence,
    speechRate,
    speechVolume,
    lowStimulationMode,
    cards,
    addToSentence,
    incrementUsage,
  } = useCardStore();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composedText, setComposedText] = useState("");
  const [composedSource, setComposedSource] = useState("");
  const [showComposed, setShowComposed] = useState(false);
  const [usedOriginalWords, setUsedOriginalWords] = useState(false);

  const getSentenceText = () => sentence.map((card) => card.text).join(" ").trim();
  const getSentenceTokens = () => sentence.map((card) => card.text);

  useEffect(() => {
    if (sentence.length === 0) return;
    setComposedText("");
    setComposedSource("");
    setShowComposed(false);
    setUsedOriginalWords(false);
  }, [sentence]);

  const resolveSentence = async () => {
    const raw = getSentenceText();
    if (!raw) return "";
    if (composedSource === raw && composedText) return composedText;

    setIsComposing(true);
    try {
      const improved = await composeSentence({ tokens: getSentenceTokens() });
      const finalText = improved?.trim() || raw;
      setUsedOriginalWords(!improved?.trim());
      setComposedText(finalText);
      setComposedSource(raw);
      return finalText;
    } catch (error) {
      console.error("Failed to compose sentence:", error);
      setComposedText(raw);
      setComposedSource(raw);
      setUsedOriginalWords(true);
      return raw;
    } finally {
      setIsComposing(false);
    }
  };

  const playBlob = async (blob: Blob) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    audioRef.current.playbackRate = speechRate;
    audioRef.current.preservesPitch = true;
    audioRef.current.volume = speechVolume;
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
      utterance.rate = speechRate;
      utterance.volume = speechVolume;
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const speakWithElevenLabs = async (text: string) => {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Sign in required for enhanced voice");
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
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

  const speakText = async (spoken: string) => {
    setIsSpeaking(true);
    try {
      await speakWithElevenLabs(spoken);
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

  const saveCurrentSentence = () => {
    stopAudio();
    const completed = completeSentence();
    return Boolean(completed);
  };

  const addStarter = (label: "I want" | "I need" | "I feel") => {
    const sourceLabel = label === "I want" ? "Want" : label === "I need" ? "Need" : "Feel";
    const source = cards.find((card) => card.text === sourceLabel);
    if (!source) return;
    addToSentence({ ...source, text: label });
    incrementUsage(source.id);
  };

  const handleFinish = async () => {
    const text = await resolveSentence();
    if (!text) return;
    setShowComposed(true);
    if (!saveCurrentSentence()) return;

    toast({
      title: "Sentence saved",
      description: "A fresh sentence is ready to build.",
    });
  };

  const handleSpeak = async () => {
    const spoken = await resolveSentence();
    if (!spoken) return;
    setShowComposed(true);
    if (!saveCurrentSentence()) return;
    await speakText(spoken);
  };

  return (
    <div
      className={`relative flex max-h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 p-3 ${
        lowStimulationMode
          ? "bg-card border-border"
          : "bg-gradient-subtle border-dashed border-primary/30"
      }`}
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
      <div className="mb-1 flex items-start justify-between gap-3">
        <h2 className={`text-lg font-semibold ${lowStimulationMode ? "text-foreground" : "bg-gradient-accent bg-clip-text text-transparent"}`}>
          My Sentence
        </h2>
        <div className="flex flex-wrap justify-end gap-2">
          {sentence.length > 0 && (
            <>
              <Button size="sm" onClick={handleFinish} className="rounded-xl" disabled={isComposing}>
                {isComposing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                <span className="hidden sm:inline">Finish sentence</span>
                <span className="sm:hidden">Finish</span>
              </Button>
              {!isSpeaking ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSpeak}
                  className="rounded-xl"
                  disabled={isComposing}
                >
                  {isComposing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-1" />
                  )}
                  Speak
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={stopAudio} className="rounded-xl">
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  stopAudio();
                  clearSentence();
                  setComposedText("");
                  setComposedSource("");
                  setShowComposed(false);
                  setUsedOriginalWords(false);
                }}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                aria-label="Clear sentence"
                title="Clear sentence"
              >
                <Trash2 className="w-4 h-4" />
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
              {usedOriginalWords ? "Original cards" : "Sentence"}
            </p>
            <p className="mt-1 text-lg font-semibold leading-7">{composedText}</p>
            {usedOriginalWords && (
              <p className="mt-1 text-sm text-muted-foreground">
                Grammar correction is temporarily unavailable for this combination.
              </p>
            )}
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
      {sentence.length === 0 && (
        <div className="mb-1.5 flex flex-wrap items-center gap-2" aria-label="Sentence starters">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Start with
          </span>
          {(["I want", "I need", "I feel"] as const).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => addStarter(label)}
              className="min-h-9 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-wrap items-start gap-3 overflow-y-auto pb-2">
        {sentence.length === 0 ? (
          <p className="w-full py-2 text-center text-sm text-muted-foreground">
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
