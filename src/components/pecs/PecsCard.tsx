import { Card } from "@/pages/PecsApp";
import { ChevronDown, Pencil, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { boyCardImages } from "@/lib/boyCardImages";
import { girlCardImages } from "@/lib/girlCardImages";
import { sharedCardImages } from "@/lib/sharedCardImages";
import { useCardStore } from "@/store/cardStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PecsCardProps {
  card: Card;
  showWord: boolean;
  onClick?: () => void;
  onFavorite?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  isFavorite?: boolean;
  inSentence?: boolean;
  displaySize?: "compact" | "medium" | "large";
  variations?: string[];
  onSelectVariation?: (label: string) => void;
}

export const PecsCard = ({
  card,
  showWord,
  onClick,
  onFavorite,
  onEdit,
  onRemove,
  isFavorite,
  inSentence,
  displaySize = "compact",
  variations = [],
  onSelectVariation,
}: PecsCardProps) => {
  const characterGender = useCardStore((state) => state.characterGender);
  const lowStimulationMode = useCardStore((state) => state.lowStimulationMode);
  const existingImage = card.image || card.imageUrl;
  const genderImage =
    characterGender === "girl"
      ? girlCardImages[card.id]
      : boyCardImages[card.id];
  const displayedImage =
    sharedCardImages[card.id] || genderImage || existingImage;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("card", JSON.stringify(card));
  };

  const handleLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    if (onFavorite && !inSentence) {
      e.preventDefault();
      onFavorite();
    }
  };

  return (
    <div
      className={cn(
        "relative group aspect-square rounded-2xl border-2 cursor-pointer select-none",
        "bg-card-base hover:bg-card-hover active:bg-card-selected",
        "border-border hover:border-primary/50",
        lowStimulationMode
          ? "shadow-none"
          : "transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md",
        inSentence ? "w-[100px] h-[100px]" : "w-full"
      )}
      draggable={!inSentence}
      onDragStart={handleDragStart}
      onClick={onClick}
      onContextMenu={handleLongPress}
    >
      {/* Remove button for sentence cards */}
      {inSentence && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-muted/60 text-muted-foreground rounded-full flex items-center justify-center shadow-sm z-20 hover:bg-muted hover:scale-105 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Favorite star */}
      {!inSentence && onFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className={cn(
            "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10",
            isFavorite
              ? "bg-warning text-warning-foreground"
              : "bg-muted/80 text-muted-foreground hover:bg-muted"
          )}
        >
          <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      )}

      {/* Edit button for custom cards */}
      {!inSentence && onEdit && (
        <button
          type="button"
          aria-label={`Edit ${card.text}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center bg-muted/80 text-muted-foreground hover:bg-muted transition-all z-10"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {!inSentence && !onEdit && variations.length > 1 && onSelectVariation && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Choose another word for ${card.text}`}
              onClick={(event) => event.stopPropagation()}
              className="absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-muted/90 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-36 rounded-xl p-1.5">
            {variations.map((label) => (
              <DropdownMenuItem
                key={label}
                className="cursor-pointer rounded-lg"
                onSelect={() => onSelectVariation(label)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Card content */}
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-between",
          displaySize === "large" ? "p-4 md:p-5" : "p-3"
        )}
      >
        {/* Image area: fixed proportion so the label always has room */}
        <div
          className={cn(
            "w-full flex items-center justify-center",
            showWord ? "h-[68%] mb-1" : "h-full"
          )}
        >
          {displayedImage ? (
            <img
              src={displayedImage}
              alt={card.text}
              className="max-w-full max-h-full object-contain rounded-lg"
              draggable={false}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
              {card.text.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Label area: reserve vertical space for up to two lines */}
        {showWord && (
          <span
            className={cn(
              "font-semibold text-foreground text-center line-clamp-2 mt-1",
              displaySize === "large"
                ? "text-base md:text-lg min-h-[3rem]"
                : displaySize === "medium"
                  ? "text-sm md:text-base min-h-[2.75rem]"
                  : "text-sm min-h-[2.5rem]"
            )}
          >
            {card.text}
          </span>
        )}
      </div>
    </div>
  );
};
