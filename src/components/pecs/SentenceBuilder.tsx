import { onPrivateSessionChange, privateSessionRevision } from "@/lib/privateSession";
// src/components/SentenceBuilder.tsx
import { memo, useEffect, useRef, useState } from "react";
import type { Card } from "@/pages/PecsApp";
import { useShallow } from "zustand/react/shallow";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Loader2, Trash2, Volume2, Square, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { composeSentence, type SentenceTense } from "@/utils/compose-sentence";
import { getAccessToken } from "@/lib/supabase";
import { getApiUrl } from "@/lib/runtimeUrls";
import { appText, translateCardLabel } from "@/lib/language";
import { speakDeviceText, stopDeviceSpeech } from "@/utils/device-speech";
import { PartialSpeechError, playSpeechResponse } from "@/utils/stream-speech";

interface SentenceBuilderProps {
  showWord: boolean;
  onOpenGuide: () => void;
}

const SentenceCard = memo(({ card, index, showWord, onRemove }: { card: Card; index: number; showWord: boolean; onRemove: (index: number) => void }) => (
  <div className="flex-shrink-0">
    <PecsCard card={card} showWord={showWord} onRemove={() => onRemove(index)} inSentence />
  </div>
));
SentenceCard.displayName = "SentenceCard";

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
    selectCard,
    language,
    characterGender,
  } = useCardStore(useShallow((state) => ({
    sentence: state.sentence, removeFromSentence: state.removeFromSentence,
    clearSentence: state.clearSentence, completeSentence: state.completeSentence,
    speechRate: state.speechRate, speechVolume: state.speechVolume,
    lowStimulationMode: state.lowStimulationMode, cards: state.cards,
    addToSentence: state.addToSentence, selectCard: state.selectCard,
    language: state.language, characterGender: state.characterGender,
  })));
  const copy = appText[language];
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRequest = useRef<AbortController | null>(null);
  const speechSequence = useRef(0);
  const recordedSentence = useRef<Card[] | null>(null);
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

    const sessionRevision = privateSessionRevision();
    setIsComposing(true);
    try {
      const result = await composeSentence({ tokens: getSentenceTokens(), tense, language });
      if (sessionRevision !== privateSessionRevision()) return "";
      const improved = result.sentence.trim();
      const finalText = improved || raw;
      setUsedOriginalWords(!improved);
      setCompositionNotice(
        result.issue === "offline"
          ? result.source === "offline_rules"
            ? "You're offline. Basic grammar applied on this device."
            : language === "es" ? "Sin conexión. Se muestran tus palabras originales." : "You're offline. Showing your original words."
          : result.issue === "sign_in_required"
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
      if (sessionRevision !== privateSessionRevision()) return "";
      console.error("Failed to compose sentence");
      setComposedText(raw);
      setComposedSource(sourceKey);
      setUsedOriginalWords(true);
      setCompositionNotice(copy.grammarUnavailable);
      return raw;
    } finally {
      setIsComposing(false);
    }
  };

  const speakWithWebAPI = (text: string) => speakDeviceText(text, language, speechRate, speechVolume);

  const speakWithElevenLabs = async (text: string, sequence: number) => {
    const accessToken = await getAccessToken();
    if (speechSequence.current !== sequence) throw new DOMException("Playback stopped.", "AbortError");
    if (!accessToken) throw new Error("Sign in required for enhanced voice");
    const controller = new AbortController();
    speechRequest.current = controller;
    const timer = setTimeout(() => controller.abort(new DOMException("Voice request timed out.", "TimeoutError")), 12_000);
    try {
      const res = await fetch(getApiUrl("/api/speak"), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Enhanced voice unavailable (${res.status}).`);
      if (!res.headers.get("content-type")?.startsWith("audio/")) throw new Error("Enhanced voice endpoint did not return audio.");
      if (speechSequence.current !== sequence) throw new DOMException("Playback stopped.", "AbortError");
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.playbackRate = speechRate;
      audioRef.current.preservesPitch = true;
      audioRef.current.volume = speechVolume;
      await playSpeechResponse(res, audioRef.current, controller.signal, () => clearTimeout(timer));
    } finally { clearTimeout(timer); }
    if (speechSequence.current !== sequence) throw new DOMException("Playback stopped.", "AbortError");
  };

  const stopAudio = () => {
    speechSequence.current += 1;
    speechRequest.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopDeviceSpeech();
    setIsSpeaking(false);
  };

  useEffect(() => () => {
    speechSequence.current += 1;
    speechRequest.current?.abort();
    audioRef.current?.pause();
    stopDeviceSpeech();
  }, []);

  useEffect(() => onPrivateSessionChange(() => {
    speechSequence.current++;
    speechRequest.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute?.("src");
    }
    stopDeviceSpeech();
    recordedSentence.current = null;
    setComposedText("");
    setComposedSource("");
    setShowComposed(false);
    setIsSpeaking(false);
    setIsComposing(false);
  }), []);

  const speakText = async (spoken: string, sequence: number) => {
    setIsSpeaking(true);
    try {
      if (speechVolume <= 0) throw new Error("Expressly volume is muted. Raise it in Cards & voice.");
      if (!navigator.onLine) {
        await speakWithWebAPI(spoken);
      } else {
        try {
          await speakWithElevenLabs(spoken, sequence);
        } catch (error) {
          if (speechSequence.current !== sequence) return false;
          if (error instanceof PartialSpeechError) throw error;
          await speakWithWebAPI(spoken);
          toast({ title: "Using device voice" });
        }
      }
      return speechSequence.current === sequence;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return false;
      toast({
        title: language === "es" ? "No se pudo hablar" : "Speech couldn't play",
        description: language === "es" ? "Revisa el volumen y la salida de audio. Tus tarjetas siguen aquí." : error instanceof Error ? error.message : "Check your volume and sound output. Your cards are still here.",
      });
      return false;
    } finally {
      if (speechSequence.current === sequence) setIsSpeaking(false);
    }
  };

  const saveCurrentSentence = () => {
    stopAudio();
    if (recordedSentence.current === useCardStore.getState().sentence) {
      clearSentence();
      return true;
    }
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
    selectCard({ ...source, text: translatedStarter });
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
    const sequence = ++speechSequence.current;
    const sourceSentence = useCardStore.getState().sentence;
    const spoken = await resolveSentence();
    if (!spoken || speechSequence.current !== sequence) return;
    setShowComposed(true);
    const played = await speakText(spoken, sequence);
    if (played && useCardStore.getState().sentence === sourceSentence && recordedSentence.current !== sourceSentence) {
      completeSentence({ keepSentence: true });
      recordedSentence.current = sourceSentence;
    }
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
          {sentence.length > 0 && <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
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
          </label>}
          {sentence.length > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={handleFinish} className="rounded-xl" disabled={isComposing}>
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
                  variant="default"
                  onClick={handleSpeak}
                  className="rounded-xl"
                  disabled={isComposing}
                >
                  {isComposing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-1" />
                  )}
                  {language === "es" ? "Leer frase" : "Speak sentence"}
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
            {(usedOriginalWords || compositionNotice) && (
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
            <SentenceCard key={`${c.id}-${i}`} card={c} index={i} showWord={showWord} onRemove={removeFromSentence} />
          ))
        )}
      </div>
    </div>
  );
};
