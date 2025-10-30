import { Button } from "@/components/ui/button";
import { Settings, Image, Type, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VocabularyLevel } from "@/store/cardStore";

interface AppHeaderProps {
  showWord: boolean;
  onTogglePictures: () => void;
  currentLevel: VocabularyLevel;
  onLevelChange: (level: VocabularyLevel) => void;
}

export const AppHeader = ({ showWord, onTogglePictures, currentLevel, onLevelChange }: AppHeaderProps) => {
  const getLevelLabel = (level: VocabularyLevel) => {
    switch(level) {
      case 1: return "Level 1 – Beginner";
      case 2: return "Level 2 – Intermediate";
      case 3: return "Level 3 – Advanced";
    }
  };
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="container mx-auto flex items-center justify-between max-w-[1200px]">
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
            <p className="text-sm text-muted-foreground">{getLevelLabel(currentLevel)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showWord ? "default" : "outline"}
            size="lg"
            onClick={onTogglePictures}
            className="rounded-xl gap-2"
          >
            {showWord ? <Type className="w-5 h-5" /> : <Image className="w-5 h-5" />}
            {showWord ? "Words" : "Pictures Only"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onLevelChange(1)}>
                {currentLevel === 1 && "✓ "}Level 1 – Beginner (30 cards)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLevelChange(2)}>
                {currentLevel === 2 && "✓ "}Level 2 – Intermediate (75 cards)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLevelChange(3)}>
                {currentLevel === 3 && "✓ "}Level 3 – Advanced (150 cards)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
