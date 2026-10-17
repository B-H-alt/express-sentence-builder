import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Image, Type, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useCardStore, type VocabularyLevel } from "@/store/cardStore";
import { useProtectedLearnerControls } from "./CaregiverProtection";

interface AppHeaderProps {
  showWord: boolean;
  onSetDisplayMode: (showWords: boolean) => void;
  currentLevel: VocabularyLevel;
  onOpenCaregiver: () => void;
}

export const AppHeader = ({ showWord, onSetDisplayMode, currentLevel, onOpenCaregiver }: AppHeaderProps) => {
  const name = useCardStore(state => state.userName?.trim() || "Me");
  const image = useCardStore(state => state.userImage);
  const language = useCardStore(state => state.language);
  const protectedControls = useProtectedLearnerControls();
  const levels = language === "es"
    ? ["Principiante", "Intermedio", "Avanzado", "Explorar", "Más intereses"]
    : ["Beginner", "Intermediate", "Advanced", "Explore", "More interests"];
  return <header className="app-safe-header relative overflow-hidden border-b border-border bg-gradient-subtle px-3 py-2.5 sm:px-6">
    <div className="container relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {!Capacitor.isNativePlatform() && <Link to="/" aria-label="Return to Expressly website"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button></Link>}
        <div><h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent sm:text-2xl">Expressly</h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{language === "es" ? "Nivel" : "Level"} {currentLevel} ({levels[currentLevel - 1]})</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!protectedControls && <div role="group" aria-label="Card display" className="flex items-center rounded-xl border border-border/80 bg-muted/70 p-1 shadow-sm">
          <button aria-pressed={!showWord} onClick={() => onSetDisplayMode(false)} className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold sm:px-3 ${!showWord ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Image className="h-4 w-4" /><span className="hidden min-[390px]:inline">{language === "es" ? "Imágenes" : "Pictures"}</span>
          </button>
          <button aria-pressed={showWord} onClick={() => onSetDisplayMode(true)} className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold sm:px-3 ${showWord ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Type className="h-4 w-4" /><span className="sm:hidden">+ {language === "es" ? "Palabras" : "Words"}</span><span className="hidden sm:inline">{language === "es" ? "Imágenes + palabras" : "Pictures + words"}</span>
          </button>
        </div>}
        <Button variant="outline" className="h-11 gap-2 rounded-xl px-2 pr-3 shadow-sm" aria-label="Open caregiver area" onClick={onOpenCaregiver}>
          <Avatar className="h-8 w-8 border border-border">{image && <AvatarImage src={image} alt="" />}<AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
          <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">{name}</span><Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  </header>;
};
