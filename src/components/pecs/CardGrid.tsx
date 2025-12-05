import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Card } from "@/pages/PecsApp";

interface CardGridProps {
  selectedCategory: string;
  showWord: boolean;
}

const categoryLabels: Record<string, string> = {
  people: "People",
  feelings: "Feelings",
  actions: "Needs & Actions",
  responses: "Responses",
  activities: "Activities",
  objects: "Objects/Items",
  places: "Places",
  social: "Social",
  food: "Food",
  descriptive: "Descriptions",
  time: "Time"
};

export const CardGrid = ({ selectedCategory, showWord }: CardGridProps) => {
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
    <div className="relative overflow-hidden h-full overflow-y-auto p-4 bg-gradient-subtle rounded-3xl border border-border shadow-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 right-[-20%] top-[-20%] h-[60%] w-[60%]
                  bg-[radial-gradient(60%_60%_at_50%_50%,hsl(var(--accent)/0.18),transparent_70%)]
                  blur-3xl"
      ></div>
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
                    showWord={showWord}
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
              showWord={showWord}
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
