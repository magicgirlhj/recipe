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
  const ingredientSummary =
    recipe.ingredients
      .map((ingredient) => ingredient.name)
      .filter(Boolean)
      .slice(0, 5)
      .join(" / ") || "食材待补充";

  return (
    <button className="k-card group p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 4).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <h3 className="line-clamp-2 text-xl font-black leading-snug text-kitchen-ink">{recipe.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-kitchen-muted">{ingredientSummary}</p>
        </div>

        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-20 w-20 shrink-0 rounded-lg border border-stone-200 object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-kitchen-muted">
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <Clock3 size={14} />
          {recipe.cookingTime ? `${recipe.cookingTime} 分钟` : "时间未填"}
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <Flame size={14} />
          {recipe.cookingMethod || "方式未填"}
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <ChefHat size={14} />
          {recipe.difficulty ? difficultyLabel[recipe.difficulty] : "难度未填"}
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1.5">
          <CalendarClock size={14} />
          {recipe.cookedCount} 次 / {formatDate(recipe.lastCookedAt)}
        </span>
      </div>
    </button>
  );
}
