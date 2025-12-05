import { Button } from "@/components/ui/button";
import {
  Heart,
  Home,
  Utensils,
  User,
  Smile,
  Star,
  Grid3x3,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  currentLevel: number; // <-- new prop
}

// Always-visible categories
const baseCategories = [
  { id: "all", label: "All", icon: Grid3x3 },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "people", label: "People", icon: User },
  { id: "feelings", label: "Feelings", icon: Smile },
  { id: "actions", label: "Actions", icon: Heart },
  { id: "responses", label: "Responses", icon: Star },
  { id: "activities", label: "Activities", icon: Heart },
  { id: "objects", label: "Objects", icon: Grid3x3 },
  { id: "places", label: "Places", icon: Home },
  { id: "social", label: "Social", icon: User },
];

// Level-dependent categories
const levelCategories: Record<
  1 | 2 | 3,
  { id: string; label: string; icon: React.ComponentType<any> }[]
> = {
  // Level 1: only Food
  1: [
    { id: "food", label: "Food", icon: Utensils }
  ],

  // Level 2: Food + Descriptive
  2: [
    { id: "food", label: "Food", icon: Utensils },
    { id: "descriptive", label: "Descriptive", icon: Smile },
  ],

  // Level 3: Food + Descriptive + Time
  3: [
    { id: "food", label: "Food", icon: Utensils },
    { id: "descriptive", label: "Descriptive", icon: Smile },
    { id: "time", label: "Time", icon: Clock },
  ],
};

export const CategoryTabs = ({
  selectedCategory,
  onSelectCategory,
  currentLevel,
}: CategoryTabsProps) => {
  // Clamp to 1–3 just in case
  const levelKey = (Math.max(1, Math.min(3, currentLevel)) as 1 | 2 | 3);

  const categoriesToShow = [...baseCategories, ...levelCategories[levelKey]];

  return (
    <div className="flex gap-2 pb-3 overflow-x-auto">
      {categoriesToShow.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="lg"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "rounded-2xl gap-2 whitespace-nowrap transition-all",

              // Selected state
              isSelected &&
                "bg-gradient-accent text-white border-transparent hover:brightness-110",

              // Unselected + hover state (keep text visible!)
              !isSelected &&
                "bg-card text-foreground border border-border hover:bg-card/90 hover:text-foreground hover:border-accent"
            )}
          >
            <Icon className="w-5 h-5" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};
