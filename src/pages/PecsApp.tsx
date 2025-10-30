import { useState } from "react";
import { SentenceBuilder } from "@/components/pecs/SentenceBuilder";
import { CardGrid } from "@/components/pecs/CardGrid";
import { CategoryTabs } from "@/components/pecs/CategoryTabs";
import { AppHeader } from "@/components/pecs/AppHeader";
import { useCardStore } from "@/store/cardStore";

export interface Card {
  id: string;
  text: string;
  category: string;
  imageUrl?: string;
  image?: string;
  usage: number;
  level?: number;
}

const PecsApp = () => {
  const [showWord, setShowWord] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { sentence, favorites, currentLevel, setLevel } = useCardStore();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[radial-gradient(160%_100%_at_50%_-10%,hsl(var(--background)/0.06)_0%,transparent_70%),radial-gradient(120%_80%_at_0%_100%,hsl(var(--accent)/0.10)_0%,transparent_70%),radial-gradient(120%_80%_at_100%_100%,hsl(var(--secondary)/0.10)_0%,transparent_70%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
      <AppHeader 
        showWord={showWord} 
        onTogglePictures={() => setShowWord(!showWord)}
        currentLevel={currentLevel}
        onLevelChange={setLevel}
      />
      
      <div className="flex-1 container mx-auto p-4 flex flex-col gap-4 max-w-[1200px]">
        {/* Sentence Builder - Top Dynamic Zone */}
        <div className="min-h-[140px] max-h-[400px]">
          <SentenceBuilder showWord={showWord} />
        </div>

        {/* Card Selection Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <CategoryTabs 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <CardGrid 
              selectedCategory={selectedCategory}
              showWord={showWord}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PecsApp;
