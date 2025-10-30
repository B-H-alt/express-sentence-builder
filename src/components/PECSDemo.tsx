// PECSDemo.tsx (no Supabase; uses Zustand card store + /api/compose-sentence)
import { useMemo, useRef, useState } from "react";
import { Card as UiCard, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCardStore } from "@/store/cardStore";
import type { Card as PecsCardType } from "@/pages/PecsApp";

// --- Optional ElevenLabs (falls back to Web Speech if not configured)
const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const ELEVEN_VOICE =
  (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ??
  "21m00Tcm4TlvDq8ikWAM";

// --- Local demo visual set (you can keep/trim as you like)
import iWantImg from "@/assets/pecs/want.jpg";
import iSeeImg from "@/assets/pecs/see.jpg";
import iFeelImg from "@/assets/pecs/feel.jpg";
import iHearImg from "@/assets/pecs/hear.jpg";
import playImg from "@/assets/pecs/play.jpg";
import toEatImg from "@/assets/pecs/eat.jpg";
import waterImg from "@/assets/pecs/water.jpg";
import friendImg from "@/assets/pecs/friend.jpg";
import momImg from "@/assets/pecs/mom.jpg";
import dadImg from "@/assets/pecs/dad.jpg";
import homeImg from "@/assets/pecs/home.jpg";
import happyImg from "@/assets/pecs/happy.jpg";
import sadImg from "@/assets/pecs/sad.jpg";
import tiredImg from "@/assets/pecs/tired.jpg";
import angryImg from "@/assets/pecs/angry.jpg";
import yesImg from "@/assets/pecs/yes.jpg";
import noImg from "@/assets/pecs/no.jpg";
import maybeImg from "@/assets/pecs/maybe.jpg";
import dontKnowImg from "@/assets/pecs/i-dont-know.jpg";
import stopImg from "@/assets/pecs/stop.jpg";

// Minimal demo catalog (names drive the sentence tokens)
const pecsData = {
  actions: [
    { name: "I", image: iWantImg },
    { name: "want", image: iWantImg },
    { name: "see", image: iSeeImg },
    { name: "feel", image: iFeelImg },
    { name: "hear", image: iHearImg },
  ],
  activities: [
    { name: "play", image: playImg },
    { name: "eat", image: toEatImg },
    { name: "water", image: waterImg },
  ],
  people: [
    { name: "friend", image: friendImg },
    { name: "mom", image: momImg },
    { name: "dad", image: dadImg },
    { name: "home", image: homeImg },
  ],
  feelings: [
    { name: "happy", image: happyImg },
    { name: "sad", image: sadImg },
    { name: "tired", image: tiredImg },
    { name: "angry", image: angryImg },
  ],
  responses: [
    { name: "yes", image: yesImg },
    { name: "no", image: noImg },
    { name: "maybe", image: maybeImg },
    { name: "I don't know", image: dontKnowImg },
    { name: "stop", image: stopImg },
  ],
};

// Helper: make a temporary Card object compatible with your store
const makeDemoCard = (name: string, image: string): PecsCardType =>
  ({
    id: `demo-${name.toLowerCase().replace(/\s+/g, "-")}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    text: name,
    category: "demo",
    usage: 0,
    level: 1,
    image,
  } as unknown as PecsCardType);

const PECSDemo = () => {
  const { toast } = useToast();

  // Zustand store: use it for the actual sentence
  const { sentence, addToSentence, clearSentence } = useCardStore();

  // Local UI helpers
  const [selected, setSelected] = useState<string[]>([]);
  const [aiSentence, setAiSentence] = useState("");
  const [isConstructing, setIsConstructing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Derived tokens from the store sentence
  const tokens = useMemo(() => sentence.map((c) => c.text), [sentence]);
  const rawText = useMemo(() => tokens.join(" ").trim(), [tokens]);

  // ---- Compose on demand (no auto-call on click) ----
  const composeFromTokens = async (toks: string[]) => {
    if (toks.length === 0) return "";
    try {
      setIsConstructing(true);
      const res = await fetch("/api/compose-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: toks }),
      });
      if (!res.ok) throw new Error(`compose-sentence ${res.status}`);
      const data: { sentence?: string; confidence?: number } = await res.json();
      return (data?.sentence || toks.join(" ")).trim();
    } finally {
      setIsConstructing(false);
    }
  };

  // ---- Speech helpers ----
  const speakWithWebAPI = async (text: string) =>
    new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });

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

  const speakWithElevenLabs = async (text: string) => {
    if (!ELEVEN_KEY || !ELEVEN_VOICE) throw new Error("Missing ElevenLabs env");
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
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
    await playBlob(await res.blob());
  };

  const speakSentence = async () => {
    if (tokens.length === 0) return;

    setIsSpeaking(true);

    // Try to improve with AI first; fall back to raw
    let textToSpeak = rawText;
    try {
      const composed = await composeFromTokens(tokens);
      textToSpeak = (composed || rawText).trim();
      setAiSentence(textToSpeak);
    } catch (e) {
      console.error("compose-sentence error", e);
      setAiSentence(rawText);
      toast({
        title: "Using original words",
        description: "Couldn’t compose a natural sentence right now.",
      });
    }

    toast({ title: "Sentence", description: textToSpeak });

    try {
      if (ELEVEN_KEY) {
        await speakWithElevenLabs(textToSpeak);
      } else {
        await speakWithWebAPI(textToSpeak);
      }
    } catch (e) {
      console.error("speak error", e);
      await speakWithWebAPI(textToSpeak);
      toast({
        title: "Using browser voice",
        description: "Couldn’t use ElevenLabs. Fell back to Web Speech.",
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  // ---- UI handlers ----
  const handleCardClick = (name: string, image: string) => {
    const card = makeDemoCard(name, image);
    addToSentence(card);
    setSelected((prev) => [...prev, name]);
  };

  const clearAll = () => {
    clearSentence();
    setSelected([]);
    setAiSentence("");
  };

  // Small reusable visual card
  const PECSCard = ({ name, image }: { name: string; image: string }) => (
    <UiCard
      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${
        selected.includes(name) ? "border-primary" : "border-gray-200"
      }`}
      onClick={() => handleCardClick(name, image)}
    >
      <CardContent className="p-4 text-center">
        <img src={image} alt={name} className="w-16 h-16 mx-auto mb-2 object-cover rounded-lg" />
        <p className="text-sm font-medium text-foreground">{name}</p>
      </CardContent>
    </UiCard>
  );

  return (
    <section id="demo" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Try Our PECS System
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Click on the picture cards below to build sentences and communicate!
            This interactive demo uses our on-page card store with AI sentence composition.
          </p>
        </div>

        {/* Sentence Display */}
        {(rawText || isConstructing || aiSentence) && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 max-w-3xl mx-auto border border-gray-200">
            <h3 className="text-sm font-medium mb-2 text-center text-muted-foreground">Sentence</h3>
            <div className="bg-primary-light rounded-lg p-3">
              <p className="text-lg text-center font-medium text-foreground">
                {isConstructing
                  ? <span className="text-muted-foreground italic">Constructing...</span>
                  : (aiSentence || rawText)}
              </p>
            </div>
          </div>
        )}

        {/* Sentence Builder (from Zustand) */}
        <div className="bg-white rounded-2xl shadow-medium p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">Your Selected Words</h3>
          <div className="min-h-[100px] bg-primary-light rounded-lg p-4 mb-4 flex flex-wrap gap-2 items-center justify-center">
            {tokens.length === 0 ? (
              <p className="text-muted-foreground italic">
                Click picture cards to build a sentence...
              </p>
            ) : (
              tokens.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                >
                  {word}
                </span>
              ))
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={speakSentence} disabled={tokens.length === 0 || isSpeaking}>
              {isSpeaking ? "🔊 Speaking..." : "🔊 Speak Sentence"}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear
            </Button>
          </div>
        </div>

        {/* PECS Categories */}
        <div className="space-y-12">
          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-primary">Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
              {pecsData.actions.map((c, i) => (
                <PECSCard key={`a-${i}`} name={c.name} image={c.image} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-secondary">Activities</h3>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {pecsData.activities.map((c, i) => (
                <PECSCard key={`act-${i}`} name={c.name} image={c.image} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-accent">People & Places</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {pecsData.people.map((c, i) => (
                <PECSCard key={`p-${i}`} name={c.name} image={c.image} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-primary">Feelings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {pecsData.feelings.map((c, i) => (
                <PECSCard key={`f-${i}`} name={c.name} image={c.image} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-secondary">Responses</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
              {pecsData.responses.map((c, i) => (
                <PECSCard key={`r-${i}`} name={c.name} image={c.image} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* audio element holder */}
      <audio ref={audioRef} hidden />
    </section>
  );
};

export default PECSDemo;
