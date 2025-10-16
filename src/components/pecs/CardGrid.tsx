import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Card } from "@/pages/PecsApp";

interface CardGridProps {
  selectedCategory: string;
  showPictures: boolean;
}

const categoryLabels: Record<string, string> = {
  people: "People",
  feelings: "Feelings",
  actions: "Needs & Actions",
  activities: "Activities",
  objects: "Objects/Items",
  social: "Social",
  places: "Places",
  food: "Food",
};

export const CardGrid = ({ selectedCategory, showPictures }: CardGridProps) => {
  const { favorites, addToSentence, toggleFavorite, incrementUsage, getFilteredCards } = useCardStore();

  const levelFilteredCards = getFilteredCards();
  
  const filteredCards = levelFilteredCards.filter(card => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "favorites") return favorites.includes(card.id);
    return card.category === selectedCategory;
  });

  const handleCardClick = (card: Card) => {
    addToSentence(card);
    incrementUsage(card.id);
  };

  // Group cards by category when "all" is selected
  const cardsByCategory = selectedCategory === "all" 
    ? filteredCards.reduce((acc, card) => {
        const category = card.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(card);
        return acc;
      }, {} as Record<string, Card[]>)
    : null;

  return (
    <div className="h-full overflow-y-auto p-4 bg-card rounded-3xl border border-border">
      {selectedCategory === "all" && cardsByCategory ? (
        <div className="space-y-6">
          {Object.entries(cardsByCategory).map(([category, cards]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground mb-3 px-1">
                {categoryLabels[category] || category}
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {cards.map((card) => (
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
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};
