import { Card } from "@/pages/PecsApp";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PecsCardProps {
  card: Card;
  showPicture: boolean;
  onClick?: () => void;
  onFavorite?: () => void;
  onRemove?: () => void;
  isFavorite?: boolean;
  inSentence?: boolean;
}

export const PecsCard = ({
  card,
  showPicture,
  onClick,
  onFavorite,
  onRemove,
  isFavorite,
  inSentence,
}: PecsCardProps) => {
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
        "relative group aspect-square rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none",
        "bg-card-base hover:bg-card-hover active:bg-card-selected",
        "border-border hover:border-primary/50 active:scale-95",
        "shadow-sm hover:shadow-md",
        inSentence ? "min-w-[100px]" : "w-full"
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

      {/* Card content */}
      <div className="w-full h-full flex flex-col items-center justify-center p-3">
        {showPicture && card.imageUrl ? (
          <div className="flex-1 w-full flex items-center justify-center mb-2">
            <img 
              src={card.imageUrl} 
              alt={card.text}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
              "bg-gradient-to-br from-primary/20 to-secondary/20"
            )}>
              {card.text.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <p className="text-sm font-semibold text-center text-foreground line-clamp-2 mt-1">
          {card.text}
        </p>
      </div>
    </div>
  );
};
