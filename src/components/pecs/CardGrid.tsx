import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Card } from "@/pages/PecsApp";

interface CardGridProps {
  selectedCategory: string;
  showPictures: boolean;
}

export const CardGrid = ({ selectedCategory, showPictures }: CardGridProps) => {
  const { cards, favorites, addToSentence, toggleFavorite, incrementUsage } = useCardStore();

  const filteredCards = cards.filter(card => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "favorites") return favorites.includes(card.id);
    return card.category === selectedCategory;
  });

  const handleCardClick = (card: Card) => {
    addToSentence(card);
    incrementUsage(card.id);
  };

  return (
    <div className="h-full overflow-y-auto p-4 bg-card rounded-3xl border border-border">
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredCards.map((card) => (
          <PecsCard
            key={card.id}
            card={card}
            showPicture={showPictures}
            onClick={() => handleCardClick(card)}
            onFavorite={() => toggleFavorite(card.id)}
            isFavorite={favorites.includes(card.id)}
          />
        ))}
      </div>
    </div>
  );
};
