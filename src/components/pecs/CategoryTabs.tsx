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
  PersonStanding,
  VenetianMask,
  CircleEllipsis,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  currentLevel: number;
}

// Always-visible categories
const baseCategories = [
  { id: "all", label: "All", icon: Grid3x3 },
  { id: "favorites", label: "Favorites", icon: Star },
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

// Level-dependent categories
const levelCategories: Record<
  1 | 2 | 3,
  { id: string; label: string; icon: React.ComponentType<any> }[]
> = {
  1: [],

  2: [
    { id: "food", label: "Food", icon: Utensils },
    { id: "descriptive", label: "Descriptive", icon: CircleEllipsis },
  ],

  3: [
    { id: "food", label: "Food", icon: Utensils },
    { id: "descriptive", label: "Descriptive", icon: CircleEllipsis },
    { id: "time", label: "Time", icon: Clock },
  ],
};

export const CategoryTabs = ({
  selectedCategory,
  onSelectCategory,
  currentLevel,
}: CategoryTabsProps) => {
  // Clamp level to 1–3
  const levelKey = Math.max(1, Math.min(3, currentLevel)) as 1 | 2 | 3;

  const categoriesToShow = [
    ...baseCategories,
    ...levelCategories[levelKey],
  ];

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
              isSelected &&
                "bg-gradient-accent text-white border-transparent hover:brightness-110",
              !isSelected &&
                "bg-card text-foreground border border-border hover:bg-card/90 hover:text-foreground hover:border-accent"
            )}
          >
            <Icon
              className={
                category.id === "body" ? "w-7 h-7" : "w-5 h-5"
              }
            />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};
