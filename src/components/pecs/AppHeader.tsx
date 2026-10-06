// src/components/pecs/AppHeader.tsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Image, Type, ArrowLeft, ChevronDown, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useCardStore, VocabularyLevel } from "@/store/cardStore";

interface AppHeaderProps {
  showWord: boolean;
  onTogglePictures: () => void;
  currentLevel: VocabularyLevel;
  onOpenSettings: () => void;
  onOpenParentDashboard: () => void;
}

export const AppHeader = ({
  showWord,
  onTogglePictures,
  currentLevel,
  onOpenSettings,
  onOpenParentDashboard,
}: AppHeaderProps) => {
  const userName = useCardStore((state) => state.userName?.trim() || "Me");
  const userImage = useCardStore((state) => state.userImage);

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

  const profileInitial = userName.charAt(0).toUpperCase();

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
            <span className="hidden sm:inline">{showWord ? "Words" : "Pictures Only"}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl px-2 pr-3 shadow-sm"
                aria-label={`Open ${userName}'s learner profile`}
              >
                <Avatar className="h-8 w-8 border border-border">
                  {userImage && <AvatarImage src={userImage} alt={`${userName}'s profile`} />}
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {profileInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                  {userName}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
              <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 font-normal">
                <Avatar className="h-10 w-10 border border-border">
                  {userImage && <AvatarImage src={userImage} alt="" />}
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {profileInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground">{userName}</span>
                  <span className="block text-xs text-muted-foreground">
                    Learner profile · Level {currentLevel}
                  </span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5" onSelect={onOpenSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Profile & settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg py-2.5"
                onSelect={onOpenParentDashboard}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Parent dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
