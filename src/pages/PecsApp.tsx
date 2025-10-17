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
  const [showPictures, setShowPictures] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { sentence, favorites, currentLevel, setLevel } = useCardStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader 
        showPictures={showPictures} 
        onTogglePictures={() => setShowPictures(!showPictures)}
        currentLevel={currentLevel}
        onLevelChange={setLevel}
      />
      
      <div className="flex-1 container mx-auto p-4 flex flex-col gap-4 max-w-[1200px]">
        {/* Sentence Builder - Top Dynamic Zone */}
        <div className="min-h-[140px] max-h-[400px]">
          <SentenceBuilder showPictures={showPictures} />
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
              showPictures={showPictures}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PecsApp;
