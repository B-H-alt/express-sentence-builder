import { useEffect, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Card } from "@/pages/PecsApp";
import { AddCardModal } from "./AddCardModal";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryHome } from "./CategoryHome";
import { getCardVariations } from "@/lib/cardVariations";
import { appText, translateCardLabel, translateCategory } from "@/lib/language";

interface CardGridProps {
  selectedCategory: string;
  showWord: boolean;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
}

const categoryLabels: Record<string, string> = {
  people: "People",
  body: "Body",
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

export const CardGrid = ({ selectedCategory, showWord, onSelectCategory, searchQuery }: CardGridProps) => {
  const { favorites, addToSentence, toggleFavorite, incrementUsage, getFilteredCards, cardsPerPage, currentLevel, lowStimulationMode } = useCardStore();
  const language = useCardStore((state) => state.language);
  const characterGender = useCardStore((state) => state.characterGender);
  const copy = appText[language];
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [page, setPage] = useState(1);

  const levelFilteredCards = getFilteredCards();
  
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const filteredCards = levelFilteredCards.filter(card => {
    if (normalizedSearch) {
      return [card.text, translateCardLabel(card.text, language, characterGender), ...getCardVariations(card.text, language)]
        .some((label) => label.toLocaleLowerCase().includes(normalizedSearch));
    }
    if (selectedCategory === "all") return true;
    if (selectedCategory === "favorites") return favorites.includes(card.id);
    return card.category === selectedCategory;
  });

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, cardsPerPage, currentLevel, normalizedSearch]);

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
    addToSentence({ ...card, text: translateCardLabel(card.text, language, characterGender) });
    incrementUsage(card.id);
  };

  const handleVariationClick = (card: Card, label: string) => {
    addToSentence({ ...card, text: label });
    incrementUsage(card.id);
  };

  const selectedCategoryLabel =
    normalizedSearch
      ? language === "es" ? `Resultados para “${searchQuery.trim()}”` : `Results for “${searchQuery.trim()}”`
      : selectedCategory === "favorites"
      ? copy.favorites
      : selectedCategory === "all"
        ? translateCategory("all", language)
        : language === "es" ? translateCategory(selectedCategory, language) : categoryLabels[selectedCategory] || selectedCategory;

  if (selectedCategory === "home" && !normalizedSearch) {
    return (
      <div data-guide="card-area" className="relative h-full overflow-y-auto rounded-3xl border border-border bg-background p-4 shadow-soft">
        <CategoryHome showWord={showWord} onSelectCategory={onSelectCategory} />
      </div>
    );
  }

  // Group cards by category when "all" is selected
  const cardsByCategory = selectedCategory === "all" && !normalizedSearch
    ? visibleCards.reduce((acc, card) => {
        const category = card.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(card);
        return acc;
      }, {} as Record<string, Card[]>)
    : null;

  return (
    <div data-guide="card-area" className={`relative overflow-hidden h-full overflow-y-auto p-4 rounded-3xl border border-border ${lowStimulationMode ? "bg-background shadow-none" : "bg-gradient-subtle shadow-soft"}`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute -z-10 right-[-20%] top-[-20%] h-[60%] w-[60%]
                  bg-[radial-gradient(60%_60%_at_50%_50%,hsl(var(--accent)/0.18),transparent_70%)]
                  blur-3xl ${lowStimulationMode ? "hidden" : ""}`}
      ></div>
      <div className="relative z-10 mb-4 flex items-center gap-3 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => onSelectCategory("home")}
          aria-label={language === "es" ? "Volver al inicio" : "Back to Home"}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.home}
        </button>
        <h2 className="truncate text-lg font-semibold text-foreground">{selectedCategoryLabel}</h2>
      </div>
      {filteredCards.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 px-6 text-center">
          <h3 className="font-semibold text-foreground">{language === "es" ? "No hay tarjetas" : "No matching cards"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{language === "es" ? "Prueba otra palabra o elige una categoría." : "Try another word or choose a category."}</p>
        </div>
      ) : selectedCategory === "all" && !normalizedSearch && cardsByCategory ? (
        <div className="space-y-6">
          {Object.entries(cardsByCategory).map(([category, cards]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground mb-3 px-1">
                {language === "es" ? translateCategory(category, language) : categoryLabels[category] || category}
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
                    variations={getCardVariations(card.text, language)}
                    onSelectVariation={(label) => handleVariationClick(card, label)}
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
              variations={getCardVariations(card.text, language)}
              onSelectVariation={(label) => handleVariationClick(card, label)}
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
