import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { selectVocabularyCards } from "@/lib/vocabularySelector";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { Card } from "@/pages/PecsApp";
import { AddCardModal } from "./AddCardModal";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryHome } from "./CategoryHome";
import { getCardVariations } from "@/lib/cardVariations";
import { appText, translateCardLabel, translateCategory } from "@/lib/language";
import { normalizeCardSearch, searchCardLabels } from "@/utils/card-search";

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
  time: "Time",
  animals: "Animals",
  nature: "Nature",
  sports: "Sports"
};

// Stable props keep untouched cards out of the render path when one card is tapped.
const GridCard = memo(({ card, showWord, isFavorite, displaySize, language, onSelect, onToggleFavorite, onEditCard, onVariation }: {
  card: Card; showWord: boolean; isFavorite: boolean;
  displaySize: "compact" | "medium" | "large"; language: "en" | "es";
  onSelect: (card: Card) => void; onToggleFavorite: (id: string) => void;
  onEditCard: (card: Card) => void; onVariation: (card: Card, label: string) => void;
}) => (
  <PecsCard card={card} showWord={showWord} isFavorite={isFavorite} displaySize={displaySize}
    onClick={() => onSelect(card)} onFavorite={() => onToggleFavorite(card.id)}
    onEdit={card.id.startsWith("custom-") ? () => onEditCard(card) : undefined}
    variations={getCardVariations(card.text, language)} onSelectVariation={(label) => onVariation(card, label)} />
));
GridCard.displayName = "GridCard";

export const CardGrid = ({ selectedCategory, showWord, onSelectCategory, searchQuery }: CardGridProps) => {
  const { favorites, selectCard, toggleFavorite, cardsPerPage, currentLevel, lowStimulationMode } = useCardStore(useShallow(state => ({
    favorites: state.favorites, selectCard: state.selectCard, toggleFavorite: state.toggleFavorite,
    cardsPerPage: state.cardsPerPage, currentLevel: state.currentLevel, lowStimulationMode: state.lowStimulationMode,
  })));
  const levelFilteredCards = useCardStore(selectVocabularyCards);
  const language = useCardStore((state) => state.language);
  const characterGender = useCardStore((state) => state.characterGender);
  const copy = appText[language];
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });

  const normalizedSearch = normalizeCardSearch(searchQuery);
  const search = useMemo(() => normalizedSearch ? searchCardLabels(levelFilteredCards, searchQuery, (card) =>
    [card.text, translateCardLabel(card.text, language, characterGender)]) : null, [normalizedSearch, searchQuery, levelFilteredCards, language, characterGender]);
  const filteredCards = useMemo(() => search ? search.cards : levelFilteredCards.filter(card => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "favorites") return favorites.includes(card.id);
    return card.category === selectedCategory;
  }), [search, levelFilteredCards, selectedCategory, favorites]);

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
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
  const cardDisplaySize =
    cardsPerPage === 4 ? "large" : cardsPerPage === 8 ? "medium" : "compact";

  const handleCardClick = useCallback((card: Card) => {
    const label = translateCardLabel(card.text, language, characterGender);
    selectCard({ ...card, text: label });
    const input = document.activeElement;
    if (input instanceof HTMLInputElement && input.type === "search") input.blur();
    setAnnouncement((current) => ({
      id: current.id + 1,
      text: language === "es" ? `Se agregó ${label} a la oración` : `Added ${label} to the sentence`,
    }));
  }, [language, characterGender, selectCard]);

  const handleVariationClick = useCallback((card: Card, label: string) => {
    selectCard({ ...card, text: label });
  }, [selectCard]);

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
      <div data-guide="card-area" className="relative h-full overflow-y-auto rounded-2xl border border-border bg-background p-3 shadow-soft sm:rounded-3xl sm:p-4">
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
    <div data-guide="card-area" className={`relative h-full overflow-hidden overflow-y-auto rounded-2xl border border-border p-3 sm:rounded-3xl sm:p-4 ${lowStimulationMode ? "bg-background shadow-none" : "bg-gradient-subtle shadow-soft"}`}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        <span key={announcement.id}>{announcement.text}</span>
      </div>
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
      {search?.similarSpelling && <p role="status" className="mb-4 text-sm text-muted-foreground">{language === "es" ? "Tarjetas con una escritura parecida." : "Cards with similar spelling."}</p>}
      {filteredCards.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 px-6 text-center">
          <h3 className="font-semibold text-foreground">{language === "es" ? "No hay tarjetas" : "No matching cards"}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{normalizedSearch
            ? language === "es" ? "Prueba una palabra más corta o borra la búsqueda para ver las tarjetas. La búsqueda usa tu nivel de vocabulario actual." : "Try a shorter word, or clear the search to browse cards. Search uses your current vocabulary level."
            : language === "es" ? "Elige otra categoría. Puedes añadir favoritos con la estrella de una tarjeta." : selectedCategory === "favorites" ? "Tap the star on a card to keep it here." : "Choose another category to find a card."}</p>
        </div>
      ) : selectedCategory === "all" && !normalizedSearch && cardsByCategory ? (
        <div className="space-y-6">
          {Object.entries(cardsByCategory).map(([category, cards]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground mb-3 px-1">
                {language === "es" ? translateCategory(category, language) : categoryLabels[category] || category}
              </h3>
              <div className={`grid ${gridColumns} ${lowStimulationMode ? "gap-4" : "gap-3"}`}>
                {cards.map((card) => (
                  <GridCard
                    key={card.id}
                    card={card}
                    showWord={showWord}
                    onSelect={handleCardClick}
                    onToggleFavorite={toggleFavorite}
                    onEditCard={setEditingCard}
                    isFavorite={favorites.includes(card.id)}
                    displaySize={cardDisplaySize}
                    language={language}
                    onVariation={handleVariationClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColumns} ${lowStimulationMode ? "gap-4" : "gap-3"}`}>
          {visibleCards.map((card) => (
            <GridCard
              key={card.id}
              card={card}
              showWord={showWord}
              onSelect={handleCardClick}
              onToggleFavorite={toggleFavorite}
              onEditCard={setEditingCard}
              isFavorite={favorites.includes(card.id)}
              displaySize={cardDisplaySize}
              language={language}
              onVariation={handleVariationClick}
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
