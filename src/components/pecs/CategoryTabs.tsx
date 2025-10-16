import { Button } from "@/components/ui/button";
import { Heart, Home, Utensils, User, Smile, Star, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
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

export const CategoryTabs = ({ selectedCategory, onSelectCategory }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 pb-3 overflow-x-auto">
      {categories.map((category) => {
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
              isSelected && "shadow-md"
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
