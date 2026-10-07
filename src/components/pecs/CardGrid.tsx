import { useEffect, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Card } from "@/pages/PecsApp";
import { AddCardModal } from "./AddCardModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryHome } from "./CategoryHome";

interface CardGridProps {
  selectedCategory: string;
  showWord: boolean;
  onSelectCategory: (category: string) => void;
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

export const CardGrid = ({ selectedCategory, showWord, onSelectCategory }: CardGridProps) => {
  const { favorites, addToSentence, toggleFavorite, incrementUsage, getFilteredCards, cardsPerPage, currentLevel, lowStimulationMode } = useCardStore();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [page, setPage] = useState(1);

  const levelFilteredCards = getFilteredCards();
  
  const filteredCards = levelFilteredCards.filter(card => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "favorites") return favorites.includes(card.id);
    return card.category === selectedCategory;
  });

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, cardsPerPage, currentLevel]);

  const pageSize = cardsPerPage === "all" ? Math.max(filteredCards.length, 1) : cardsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleCards = cardsPerPage === "all"
    ? filteredCards
    : filteredCards.slice(pageStart, pageStart + pageSize);

  const gridColumns =
    cardsPerPage === 4
      ? "grid-cols-2 md:grid-cols-4"
      : cardsPerPage === 8
        ? "grid-cols-2 sm:grid-cols-4"
        : cardsPerPage === 12
          ? "grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
          : "grid-cols-4 md:grid-cols-6 lg:grid-cols-8";
  const cardDisplaySize =
    cardsPerPage === 4 ? "large" : cardsPerPage === 8 ? "medium" : "compact";

  const handleCardClick = (card: Card) => {
    addToSentence(card);
    incrementUsage(card.id);
  };

  if (selectedCategory === "home") {
    return (
      <div className="relative h-full overflow-y-auto rounded-3xl border border-border bg-background p-4 shadow-soft">
        <CategoryHome showWord={showWord} onSelectCategory={onSelectCategory} />
      </div>
    );
  }

  // Group cards by category when "all" is selected
  const cardsByCategory = selectedCategory === "all" 
    ? visibleCards.reduce((acc, card) => {
        const category = card.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(card);
        return acc;
      }, {} as Record<string, Card[]>)
    : null;

  return (
    <div className={`relative overflow-hidden h-full overflow-y-auto p-4 rounded-3xl border border-border ${lowStimulationMode ? "bg-background shadow-none" : "bg-gradient-subtle shadow-soft"}`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute -z-10 right-[-20%] top-[-20%] h-[60%] w-[60%]
                  bg-[radial-gradient(60%_60%_at_50%_50%,hsl(var(--accent)/0.18),transparent_70%)]
                  blur-3xl ${lowStimulationMode ? "hidden" : ""}`}
      ></div>
      {selectedCategory === "all" && cardsByCategory ? (
        <div className="space-y-6">
          {Object.entries(cardsByCategory).map(([category, cards]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground mb-3 px-1">
                {categoryLabels[category] || category}
              </h3>
              <div className={`grid ${gridColumns} gap-3`}>
                {cards.map((card) => (
                  <PecsCard
                    key={card.id}
                    card={card}
                    showWord={showWord}
                    onClick={() => handleCardClick(card)}
                    onFavorite={() => toggleFavorite(card.id)}
                    onEdit={card.id.startsWith("custom-") ? () => setEditingCard(card) : undefined}
                    isFavorite={favorites.includes(card.id)}
                    displaySize={cardDisplaySize}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColumns} gap-3`}>
          {visibleCards.map((card) => (
            <PecsCard
              key={card.id}
              card={card}
              showWord={showWord}
              onClick={() => handleCardClick(card)}
              onFavorite={() => toggleFavorite(card.id)}
              onEdit={card.id.startsWith("custom-") ? () => setEditingCard(card) : undefined}
              isFavorite={favorites.includes(card.id)}
              displaySize={cardDisplaySize}
            />
          ))}
        </div>
      )}
      {cardsPerPage !== "all" && filteredCards.length > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing {pageStart + 1} to {Math.min(pageStart + pageSize, filteredCards.length)} of {filteredCards.length} cards
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="min-w-16 text-center text-xs text-muted-foreground">
              {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <AddCardModal
        open={Boolean(editingCard)}
        card={editingCard}
        onClose={() => setEditingCard(null)}
      />
    </div>
  );
};
