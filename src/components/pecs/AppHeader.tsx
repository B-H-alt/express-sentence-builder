// src/components/pecs/AppHeader.tsx
import { Button } from "@/components/ui/button";
import { Settings, Image, Type, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { VocabularyLevel } from "@/store/cardStore";

interface AppHeaderProps {
  showWord: boolean;
  onTogglePictures: () => void;
  currentLevel: VocabularyLevel;
  onOpenSettings: () => void;
}

export const AppHeader = ({
  showWord,
  onTogglePictures,
  currentLevel,
  onOpenSettings,
}: AppHeaderProps) => {
  const getLevelLabel = (level: VocabularyLevel) => {
    switch (level) {
      case 1:
        return "Level 1 – Beginner";
      case 2:
        return "Level 2 – Intermediate";
      case 3:
        return "Level 3 – Advanced";
    }
  };

  return (
    <header className="relative overflow-hidden bg-gradient-subtle border-b border-border px-6 py-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(40%_60%_at_20%_0%,hsl(var(--accent)/0.22),transparent_60%),radial-gradient(40%_60%_at_80%_0%,hsl(var(--primary)/0.22),transparent_60%)] blur-2xl"
      ></div>
      <div className="container mx-auto flex items-center justify-between max-w-[1200px] relative">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Expressly PECS
            </h1>
            <p className="text-sm text-muted-foreground">
              {getLevelLabel(currentLevel)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showWord ? "default" : "outline"}
            size="lg"
            onClick={onTogglePictures}
            className="rounded-xl gap-2 data-[state=on]:shadow-glow"
          >
            {showWord ? <Type className="w-5 h-5" /> : <Image className="w-5 h-5" />}
            {showWord ? "Words" : "Pictures Only"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={onOpenSettings}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
