import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Button } from "@/components/ui/button";
import { Trash2, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SentenceBuilderProps {
  showPictures: boolean;
}

export const SentenceBuilder = ({ showPictures }: SentenceBuilderProps) => {
  const { sentence, removeFromSentence, clearSentence } = useCardStore();
  const { toast } = useToast();

  const handleSpeak = () => {
    const text = sentence.map(card => card.text).join(" ");
    if (text) {
      // Use Web Speech API if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
      toast({
        title: "Sentence",
        description: text,
      });
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
              <Button
                size="sm"
                variant="outline"
                onClick={handleSpeak}
                className="rounded-xl"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Speak
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSentence}
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
                showPicture={showPictures}
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
