import {
  Activity,
  Clock,
  Grid3X3,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  PersonStanding,
  Shapes,
  Smile,
  Sparkles,
  Star,
  User,
  Utensils,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { PecsCard } from "./PecsCard";

interface CategoryHomeProps {
  showWord: boolean;
  onSelectCategory: (category: string) => void;
}

const categoryDetails = [
  { id: "people", label: "People", hint: "Who", icon: User },
  { id: "feelings", label: "Feelings", hint: "How I feel", icon: Smile },
  { id: "actions", label: "Actions", hint: "What I need", icon: Heart },
  { id: "responses", label: "Responses", hint: "Yes, no, maybe", icon: MessageCircle },
  { id: "activities", label: "Activities", hint: "Things to do", icon: Activity },
  { id: "objects", label: "Objects", hint: "Things around me", icon: Shapes },
  { id: "places", label: "Places", hint: "Where", icon: MapPin },
  { id: "social", label: "Social", hint: "Talk with others", icon: Sparkles },
  { id: "body", label: "Body", hint: "Body parts", icon: PersonStanding },
  { id: "food", label: "Food", hint: "Food and drinks", icon: Utensils },
  { id: "descriptive", label: "Describing", hint: "What it is like", icon: Grid3X3 },
  { id: "time", label: "Time", hint: "When", icon: Clock },
];

export const CategoryHome = ({ showWord, onSelectCategory }: CategoryHomeProps) => {
  const {
    favorites,
    recentCardIds,
    getFilteredCards,
    addToSentence,
    incrementUsage,
    toggleFavorite,
    lowStimulationMode,
  } = useCardStore();

  const availableCards = getFilteredCards();
  const availableCategories = new Set(availableCards.map((card) => card.category));
  const cardsById = new Map(availableCards.map((card) => [card.id, card]));

  const favoriteCards = favorites
    .map((id) => cardsById.get(id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const recentCards = recentCardIds
    .map((id) => cardsById.get(id))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const quickCards = [...favoriteCards, ...recentCards]
    .filter((card, index, cards) => cards.findIndex((item) => item.id === card.id) === index)
    .slice(0, 8);

  const handleCardClick = (card: (typeof availableCards)[number]) => {
    addToSentence(card);
    incrementUsage(card.id);
  };

  return (
    <div className="space-y-6">
      <section
        className={`rounded-3xl border p-5 sm:p-6 ${
          lowStimulationMode
            ? "border-border bg-card"
            : "border-primary/15 bg-gradient-to-br from-primary/5 via-background to-secondary/10"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Start here</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">What do you want to say?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a group to find the right card.</p>
          </div>
          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
            <Home className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categoryDetails
            .filter((category) => availableCategories.has(category.id))
            .map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className="group flex min-h-28 flex-col items-start justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-foreground">{category.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{category.hint}</span>
                  </span>
                </button>
              );
            })}
        </div>
      </section>

      {quickCards.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Your quick cards</h2>
              <p className="text-sm text-muted-foreground">Favorites and cards you used recently.</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory("favorites")}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Star className="h-4 w-4" />
              Favorites
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {quickCards.map((card) => (
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
        </section>
      )}
    </div>
  );
};
