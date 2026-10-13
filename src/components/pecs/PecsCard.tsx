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
import { translateCardLabel } from "@/lib/language";

const genderSpecificBodyCards = new Set(["l1-50", "l2-54", "l2-56", "l2-58"]);

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
  const language = useCardStore((state) => state.language);
  const displayedLabel = translateCardLabel(card.text, language, characterGender);
  const existingImage = card.image || card.imageUrl;
  const genderImage =
    characterGender === "girl"
      ? girlCardImages[card.id]
      : boyCardImages[card.id];
  const displayedImage =
    genderSpecificBodyCards.has(card.id)
      ? genderImage || sharedCardImages[card.id] || existingImage
      : sharedCardImages[card.id] || genderImage || existingImage;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("card", JSON.stringify({ ...card, text: displayedLabel }));
  };

  const handleLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    if (onFavorite && !inSentence) {
      e.preventDefault();
      onFavorite();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onClick();
  };

  return (
    <div
      className={cn(
        "relative group aspect-square rounded-2xl cursor-pointer select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/45 focus-visible:ring-offset-2",
        "bg-card-base hover:bg-card-hover active:bg-card-selected",
        lowStimulationMode ? "border border-border" : "border-2 border-border hover:border-primary/50",
        lowStimulationMode
          ? "shadow-none"
          : "transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md",
        inSentence ? "w-[100px] h-[100px]" : "w-full"
      )}
      draggable={!inSentence}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Add ${displayedLabel} to sentence` : undefined}
      onDragStart={handleDragStart}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleLongPress}
    >
      {/* Remove button for sentence cards */}
      {inSentence && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${displayedLabel} from sentence`}
          className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted/80 text-muted-foreground shadow-sm z-20 hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Favorite star */}
      {!inSentence && onFavorite && !lowStimulationMode && (
        <button
          type="button"
          aria-label={isFavorite ? `Remove ${displayedLabel} from favorites` : `Add ${displayedLabel} to favorites`}
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
      {!inSentence && onEdit && !lowStimulationMode && (
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

      {!inSentence && !onEdit && !lowStimulationMode && variations.length > 1 && onSelectVariation && (
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
              alt={displayedLabel}
              className="max-w-full max-h-full object-contain rounded-lg"
              draggable={false}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
              {displayedLabel.charAt(0).toUpperCase()}
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
            {displayedLabel}
          </span>
        )}
      </div>
    </div>
  );
};
