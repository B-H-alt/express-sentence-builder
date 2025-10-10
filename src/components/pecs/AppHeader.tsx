import { Button } from "@/components/ui/button";
import { Settings, Image, Type, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface AppHeaderProps {
  showPictures: boolean;
  onTogglePictures: () => void;
}

export const AppHeader = ({ showPictures, onTogglePictures }: AppHeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="container mx-auto flex items-center justify-between max-w-[1200px]">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Expressly PECS
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showPictures ? "default" : "outline"}
            size="lg"
            onClick={onTogglePictures}
            className="rounded-xl gap-2"
          >
            {showPictures ? <Image className="w-5 h-5" /> : <Type className="w-5 h-5" />}
            {showPictures ? "Pictures" : "Words"}
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-xl">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
