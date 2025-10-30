import { useRef, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Button } from "@/components/ui/button";
import { Trash2, Volume2, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface SentenceBuilderProps {
  showWord: boolean;
}
const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const ELEVEN_VOICE = (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel default
export const SentenceBuilder = ({ showWord }: SentenceBuilderProps) => {
  const { sentence, removeFromSentence, clearSentence } = useCardStore();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const getSentenceText = () => sentence.map((card) => card.text).join(" ").trim();
  const playBlob = async (blob: Blob) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    try {
      await audioRef.current.play();
    } finally {
      // Revoke after playback starts to avoid cutting off the stream
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
    // You can tweak stability/clarity via voice_settings
    const body = {
      text,
      model_id: "eleven_turbo_v2", // fast + good; change if you prefer
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
    const blob = await res.blob(); // audio/mpeg
    await playBlob(blob);
  };
  const stopAudio = () => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Stop Web Speech API if speaking
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };
  const handleSpeak = async () => {
    const text = getSentenceText();
    if (!text) return;
    setIsSpeaking(true);
    toast({ title: "Sentence", description: text });
    try {
      if (ELEVEN_KEY) {
        await speakWithElevenLabs(text);
      } else {
        await speakWithWebAPI(text);
      }
    } catch (err: any) {
      // Graceful fallback to Web Speech API on failure
      console.error(err);
      await speakWithWebAPI(text);
      toast({
        title: "Using browser voice",
        description: "Couldn’t use ElevenLabs. Fell back to Web Speech.",
      });
    } finally {
      setIsSpeaking(false);
    }
  };
  return (
    <div
      className="min-h-full max-h-full bg-sentence-zone rounded-3xl border-2 border-dashed border-primary/30 p-4 flex flex-col overflow-hidden"
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-foreground">My Sentence</h2>
        <div className="flex gap-2">
          {sentence.length > 0 && (
            <>
              {!isSpeaking ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSpeak}
                  className="rounded-xl"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Speak
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={stopAudio}
                  className="rounded-xl"
                >
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
      <div className="flex-1 flex flex-wrap items-start gap-3 overflow-y-auto pb-2">
        {sentence.length === 0 ? (
          <p className="text-muted-foreground text-center w-full py-8">
            Tap or drag cards here to build your sentence
          </p>
        ) : (
          sentence.map((card, index) => (
            <div key={`${card.id}-${index}`} className="flex-shrink-0">
              <PecsCard
                card={card}
                showWord={showWord}
                onRemove={() => removeFromSentence(index)}
                inSentence
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};