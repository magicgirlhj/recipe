import { CalendarClock, ChefHat, Clock3, Flame } from "lucide-react";
import type { Recipe } from "../data/types";
import { formatDate } from "../utils/date";
import { Tag } from "./Tag";

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

const difficultyLabel = {
  easy: "简单",
  medium: "适中",
  hard: "费工夫",
};

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <button className="k-card group overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-lg" onClick={onClick}>
      <div className="aspect-[4/3] bg-stone-100">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-kitchen-mint text-kitchen-sage">
            <ChefHat size={36} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-black">{recipe.name}</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 4).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-kitchen-muted">
          <span className="flex items-center gap-1.5">
            <Clock3 size={14} />
            {recipe.cookingTime ? `${recipe.cookingTime} 分钟` : "时间未填"}
          </span>
          <span className="flex items-center gap-1.5">
            <Flame size={14} />
            {recipe.difficulty ? difficultyLabel[recipe.difficulty] : "难度未填"}
          </span>
          <span className="flex items-center gap-1.5">
            <ChefHat size={14} />
            做过 {recipe.cookedCount} 次
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarClock size={14} />
            {formatDate(recipe.lastCookedAt)}
          </span>
        </div>
      </div>
    </button>
  );
}
