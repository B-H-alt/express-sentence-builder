// src/pages/PecsApp.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { SentenceBuilder } from "@/components/pecs/SentenceBuilder";
import { CardGrid } from "@/components/pecs/CardGrid";
import { CategoryTabs } from "@/components/pecs/CategoryTabs";
import { AppHeader } from "@/components/pecs/AppHeader";
import { useCardStore } from "@/store/cardStore";
import { SettingsPanel } from "@/components/pecs/SettingsPanel";
import Onboarding from "@/components/pecs/Onboarding";

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

  // Measure fixed header height so content starts exactly below it
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const [topBarH, setTopBarH] = useState(0);

  useLayoutEffect(() => {
    if (!topBarRef.current) return;

    const el = topBarRef.current;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setTopBarH(Math.ceil(rect.height));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col bg-[radial-gradient(160%_100%_at_50%_-10%,hsl(var(--background)/0.06)_0%,transparent_70%),radial-gradient(120%_80%_at_0%_100%,hsl(var(--accent)/0.10)_0%,transparent_70%),radial-gradient(120%_80%_at_100%_100%,hsl(var(--secondary)/0.10)_0%,transparent_70%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]">
      {/* FIXED STACK */}
      <div
        ref={topBarRef}
        className={[
          "fixed inset-x-0 top-0 z-50",
          "bg-[hsl(var(--background))]/92 backdrop-blur-md",
          "border-b border-border/60",
          "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.55)]",
        ].join(" ")}
      >
        {/* NAV (full width) */}
        <div className="w-full px-0">
          <AppHeader
            showWord={showWord}
            onTogglePictures={() => setShowWord(!showWord)}
            currentLevel={currentLevel}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>

        {/* Builder + Tabs (contained) */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-4">
          <div className="min-h-[140px] max-h-[400px]">
            <SentenceBuilder showWord={showWord} />
          </div>

          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            currentLevel={currentLevel}
          />
        </div>
      </div>

      {/* MAIN CONTENT (starts below fixed stack) */}
      <main className="flex-1 pb-8" style={{ paddingTop: topBarH }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mt-4">
            <CardGrid selectedCategory={selectedCategory} showWord={showWord} />
          </div>
        </div>
      </main>

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default PecsApp;
