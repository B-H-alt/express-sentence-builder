import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { selectVocabularyCards } from "@/lib/vocabularySelector";
import {
  Heart,
  Home,
  Utensils,
  User,
  Smile,
  Star,
  Grid3x3,
  Clock,
  PersonStanding,
  VenetianMask,
  CircleEllipsis,
  Search,
  X,
  MessageSquare,
  PawPrint,
  Leaf,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCardStore } from "@/store/cardStore";
import { appText, translateCategory } from "@/lib/language";

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  currentLevel: number;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

// Always-visible categories
const baseCategories = [
  { id: "home", label: "Home", icon: Home },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "phrases", label: "Saved phrases", icon: MessageSquare },
  { id: "people", label: "People", icon: User },
  { id: "body", label: "Body", icon: PersonStanding },
  { id: "feelings", label: "Feelings", icon: Smile },
  { id: "actions", label: "Actions", icon: Heart },
  { id: "responses", label: "Responses", icon: Star },
  { id: "activities", label: "Activities", icon: Heart },
  { id: "objects", label: "Objects", icon: Grid3x3 },
  { id: "places", label: "Places", icon: Home },
  { id: "social", label: "Social", icon: VenetianMask },
];

const additionalCategories = [
  { id: "food", label: "Food", icon: Utensils },
  { id: "descriptive", label: "Descriptive", icon: CircleEllipsis },
  { id: "time", label: "Time", icon: Clock },
  { id: "animals", label: "Animals", icon: PawPrint },
  { id: "nature", label: "Nature", icon: Leaf },
  { id: "sports", label: "Sports", icon: Trophy },
];

export const CategoryTabs = ({
  selectedCategory,
  onSelectCategory,
  currentLevel,
  searchQuery,
  onSearchQueryChange,
}: CategoryTabsProps) => {
  const lowStimulationMode = useCardStore((state) => state.lowStimulationMode);
  const hiddenCategories = useCardStore((state) => state.hiddenCategories);
  const language = useCardStore((state) => state.language);
  const cards = useCardStore(selectVocabularyCards);
  const copy = appText[language];
  const availableCategories = useMemo(() => new Set(cards.map(card => card.category)), [cards]);

  const categoriesToShow = [
    ...baseCategories,
    ...additionalCategories.filter((category) => availableCategories.has(category.id)),
    { id: "all", label: "All cards", icon: Grid3x3 },
  ].filter((category) =>
    ["home", "favorites", "phrases", "all"].includes(category.id) || !hiddenCategories.includes(category.id)
  );

  const renderCategory = (category: (typeof categoriesToShow)[number]) => {
    const Icon = category.icon;
    const isSelected = selectedCategory === category.id;

    return (
      <Button
        key={category.id}
        variant={isSelected ? "default" : "outline"}
        size="default"
        onClick={() => {
          onSearchQueryChange("");
          onSelectCategory(category.id);
        }}
        className={cn(
          "rounded-xl gap-2 whitespace-nowrap transition-all",
          isSelected &&
            (lowStimulationMode
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-gradient-accent text-white border-transparent hover:brightness-110"),
          !isSelected &&
            "bg-card text-foreground border border-border hover:bg-card/90 hover:text-foreground hover:border-accent"
        )}
      >
        <Icon className={category.id === "body" ? "h-7 w-7" : "h-5 w-5"} />
        {category.id === "phrases" ? (language === "es" ? "Frases guardadas" : category.label) : language === "es" ? translateCategory(category.id, language) : category.label}
      </Button>
    );
  };

  return (
    <div data-guide="find-words" className="flex flex-col gap-2 pb-1 md:flex-row md:items-center">
      <div className="relative shrink-0 md:w-52 lg:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={copy.search}
          aria-label={copy.search}
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear card search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="category-scroll flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
        {categoriesToShow.map(renderCategory)}
      </div>
    </div>
  );
};
