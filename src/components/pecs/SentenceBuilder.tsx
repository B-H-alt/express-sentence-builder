// src/components/SentenceBuilder.tsx
import { useEffect, useRef, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Loader2, Trash2, Volume2, Square, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { composeSentence, type SentenceTense } from "@/utils/compose-sentence";
import { getAccessToken } from "@/lib/supabase";
import { appText, translateCardLabel } from "@/lib/language";

interface SentenceBuilderProps {
  showWord: boolean;
  onOpenGuide: () => void;
}

export const SentenceBuilder = ({ showWord, onOpenGuide }: SentenceBuilderProps) => {
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
    language,
    characterGender,
  } = useCardStore();
  const copy = appText[language];
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composedText, setComposedText] = useState("");
  const [composedSource, setComposedSource] = useState("");
  const [showComposed, setShowComposed] = useState(false);
  const [usedOriginalWords, setUsedOriginalWords] = useState(false);
  const [compositionNotice, setCompositionNotice] = useState("");
  const [showStarters, setShowStarters] = useState(false);
  const [tense, setTense] = useState<SentenceTense>("present");

  const getSentenceText = () => sentence.map((card) => translateCardLabel(card.text, language, characterGender)).join(" ").trim();
  const getSentenceTokens = () => sentence.map((card) => translateCardLabel(card.text, language, characterGender));

  useEffect(() => {
    if (sentence.length === 0) return;
    setComposedText("");
    setComposedSource("");
    setShowComposed(false);
    setUsedOriginalWords(false);
    setCompositionNotice("");
  }, [sentence, tense, language]);

  const resolveSentence = async () => {
    const raw = getSentenceText();
    if (!raw) return "";
    const sourceKey = `${language}:${tense}:${raw}`;
    if (composedSource === sourceKey && composedText) return composedText;

    setIsComposing(true);
    try {
      const result = await composeSentence({ tokens: getSentenceTokens(), tense, language });
      const improved = result.sentence.trim();
      const finalText = improved || raw;
      setUsedOriginalWords(!improved);
      setCompositionNotice(
        result.issue === "sign_in_required"
          ? copy.grammarSignIn
          : result.issue === "email_not_confirmed"
            ? copy.grammarConfirmEmail
            : result.issue === "rate_limited"
              ? copy.grammarRateLimit
              : result.issue
                ? copy.grammarUnavailable
                : "",
      );
      setComposedText(finalText);
      setComposedSource(sourceKey);
      return finalText;
    } catch (error) {
      console.error("Failed to compose sentence:", error);
      setComposedText(raw);
      setComposedSource(sourceKey);
      setUsedOriginalWords(true);
      setCompositionNotice(copy.grammarUnavailable);
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
      utterance.lang = language === "es" ? "es-US" : "en-US";
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
    const translatedStarter = language === "es"
      ? label === "I want" ? "Yo quiero" : label === "I need" ? "Yo necesito" : "Yo me siento"
      : label;
    addToSentence({ ...source, text: translatedStarter });
    incrementUsage(source.id);
    setShowStarters(false);
  };

  const handleFinish = async () => {
    const text = await resolveSentence();
    if (!text) return;
    setShowComposed(true);
    if (!saveCurrentSentence()) return;

    toast({
      title: language === "es" ? "Frase guardada" : "Sentence saved",
      description: language === "es" ? "Puedes empezar una frase nueva." : "A fresh sentence is ready to build.",
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
      data-guide="sentence"
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-base font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.howToUse}</span>
            <span className="sm:hidden">{copy.howItWorks}</span>
          </button>
        </div>
        <div data-guide="sentence-actions" className="flex flex-wrap items-center justify-end gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="hidden sm:inline">{copy.tense}</span>
            <select
              aria-label="Sentence tense"
              value={tense}
              onChange={(event) => setTense(event.target.value as SentenceTense)}
              className="h-9 rounded-xl border border-border bg-background px-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="past">{copy.past}</option>
              <option value="present">{copy.present}</option>
              <option value="future">{copy.future}</option>
            </select>
          </label>
          {sentence.length > 0 && (
            <>
              <Button size="sm" onClick={handleFinish} className="rounded-xl" disabled={isComposing}>
                {isComposing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                <span className="hidden sm:inline">{copy.finish}</span>
                <span className="sm:hidden">{copy.finishShort}</span>
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
                  {copy.speak}
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={stopAudio} className="rounded-xl">
                  <Square className="w-4 h-4 mr-1" />
                  {copy.stop}
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
                  setCompositionNotice("");
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
              {usedOriginalWords ? copy.originalCards : copy.sentence}
            </p>
            <p className="mt-1 text-lg font-semibold leading-7">{composedText}</p>
            {usedOriginalWords && (
              <p className="mt-1 text-sm text-muted-foreground">
                {compositionNotice || copy.grammarUnavailable}
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
          <button
            type="button"
            onClick={() => setShowStarters((open) => !open)}
            className="inline-flex min-h-9 items-center rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={showStarters}
          >
            {copy.startSentence}
          </button>
          {showStarters && (["I want", "I need", "I feel"] as const).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => addStarter(label)}
              className="min-h-9 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {language === "es" ? (label === "I want" ? "Yo quiero" : label === "I need" ? "Yo necesito" : "Yo me siento") : label}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-wrap items-start gap-3 overflow-y-auto pb-2">
        {sentence.length === 0 ? (
          <p className="w-full py-2 text-center text-sm text-muted-foreground">
            {copy.sentenceHint}
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
