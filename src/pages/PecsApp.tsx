// src/pages/PecsApp.tsx
import { useState } from "react";
import { SentenceBuilder } from "@/components/pecs/SentenceBuilder";
import { CardGrid } from "@/components/pecs/CardGrid";
import { CategoryTabs } from "@/components/pecs/CategoryTabs";
import { AppHeader } from "@/components/pecs/AppHeader";
import { useCardStore } from "@/store/cardStore";
import { SettingsPanel } from "@/components/pecs/SettingsPanel";

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
  const [showSettings, setShowSettings] = useState(false);

  const { currentLevel } = useCardStore();

  return (
    <div className="relative min-h-screen flex flex-col bg-[radial-gradient(160%_100%_at_50%_-10%,hsl(var(--background)/0.06)_0%,transparent_70%),radial-gradient(120%_80%_at_0%_100%,hsl(var(--accent)/0.10)_0%,transparent_70%),radial-gradient(120%_80%_at_100%_100%,hsl(var(--secondary)/0.10)_0%,transparent_70%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
      {/* FIXED TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-50 bg-[hsl(var(--background))]/90 backdrop-blur">
        <div className="container mx-auto max-w-[1200px] px-4 py-3 flex flex-col gap-4">
          {/* Header */}
          <AppHeader
            showWord={showWord}
            onTogglePictures={() => setShowWord(!showWord)}
            currentLevel={currentLevel}
            onOpenSettings={() => setShowSettings(true)}
          />

          {/* Sentence Builder */}
          <div className="min-h-[140px] max-h-[400px]">
            <SentenceBuilder showWord={showWord} />
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            currentLevel={currentLevel}
          />
        </div>
      </div>

      {/* MAIN CONTENT — PAGE SCROLLS, CARDS START BELOW TOP BAR */}
      <main className="flex-1 pt-[360px] pb-8">
        {/* ↑ adjust 320px up/down until the first row of cards is fully visible */}
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="mt-4">
            <CardGrid selectedCategory={selectedCategory} showWord={showWord} />
          </div>
        </div>
      </main>

      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default PecsApp;
