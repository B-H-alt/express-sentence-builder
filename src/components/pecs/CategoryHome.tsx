import { Star } from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";
import { getCardVariations } from "@/lib/cardVariations";
import { appText, translateCardLabel } from "@/lib/language";

interface CategoryHomeProps {
  showWord: boolean;
  onSelectCategory: (category: string) => void;
}

export const CategoryHome = ({ showWord, onSelectCategory }: CategoryHomeProps) => {
  const {
    favorites,
    recentCardIds,
    getFilteredCards,
    addToSentence,
    incrementUsage,
    toggleFavorite,
  } = useCardStore();
  const language = useCardStore((state) => state.language);
  const characterGender = useCardStore((state) => state.characterGender);
  const copy = appText[language];

  const availableCards = getFilteredCards();
  const cardsById = new Map(availableCards.map((card) => [card.id, card]));

  const favoriteCards = favorites
    .map((id) => cardsById.get(id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const recentCards = recentCardIds
    .map((id) => cardsById.get(id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const personalQuickCards = [...favoriteCards, ...recentCards]
    .filter((card, index, cards) => cards.findIndex((item) => item.id === card.id) === index)
    .slice(0, 8);
  const handleCardClick = (card: (typeof availableCards)[number]) => {
    addToSentence({ ...card, text: translateCardLabel(card.text, language, characterGender) });
    incrementUsage(card.id);
  };
  const handleVariationClick = (card: (typeof availableCards)[number], label: string) => {
    addToSentence({ ...card, text: label });
    incrementUsage(card.id);
  };

  return (
    <div>
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{language === "es" ? "Tus tarjetas rápidas" : "Your quick cards"}</h2>
              <p className="text-sm text-muted-foreground">{language === "es" ? "Favoritos y tarjetas usadas recientemente." : "Favorites and cards you used recently."}</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory("favorites")}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Star className="h-4 w-4" />
              {copy.favorites}
            </button>
          </div>
          {personalQuickCards.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {personalQuickCards.map((card) => (
              <PecsCard
                key={card.id}
                card={card}
                showWord={showWord}
                onClick={() => handleCardClick(card)}
                onFavorite={() => toggleFavorite(card.id)}
                isFavorite={favorites.includes(card.id)}
                variations={getCardVariations(card.text, language)}
                onSelectVariation={(label) => handleVariationClick(card, label)}
              />
            ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
              {language === "es" ? "Marca una tarjeta como favorita o úsala una vez para verla aquí." : "Favorite a card or use it once and it will appear here."}
            </p>
          )}
      </section>
    </div>
  );
};
