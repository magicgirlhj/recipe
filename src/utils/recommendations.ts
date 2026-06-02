import type {
  Ingredient,
  InventoryItem,
  PublicRecipe,
  Recipe,
  RecommendationItem,
  RecommendationMode,
  WishlistItem,
} from "../data/types";
import { publicRecipes } from "../data/sampleData";
import { daysSince } from "./date";

const normalize = (value: string) => value.trim().toLowerCase();

const ingredientNames = (ingredients: Ingredient[]) => ingredients.map((item) => normalize(item.name));

function matchedInventory(ingredients: Ingredient[], inventory: InventoryItem[]) {
  const candidates = ingredientNames(ingredients);
  const stock = inventory.map((item) => normalize(item.name)).filter(Boolean);

  return candidates
    .filter((ingredient) =>
      stock.some((stockName) => ingredient.includes(stockName) || stockName.includes(ingredient)),
    )
    .filter((value, index, array) => array.indexOf(value) === index);
}

function staleBonus(recipe: Recipe) {
  if (!recipe.lastCookedAt) return 10;
  const days = daysSince(recipe.lastCookedAt) ?? 0;
  if (days > 60) return 18;
  if (days > 30) return 12;
  if (days > 14) return 8;
  return 0;
}

function randomBonus(mode: RecommendationMode) {
  return Math.random() * (mode === "random" ? 25 : 15);
}

function recipeCandidate(recipe: Recipe, inventory: InventoryItem[], mode: RecommendationMode): RecommendationItem {
  const matches = matchedInventory(recipe.ingredients, inventory);
  const matchWeight = mode === "fridge" ? 16 : 8;
  let score = 60 + matches.length * matchWeight + staleBonus(recipe) + randomBonus(mode);

  if (mode === "wishlist") score -= 8;
  if (mode === "random") score += Math.random() * 12;

  const reasons = ["我的菜谱基础分高"];
  if (matches.length) reasons.push(`冰箱有 ${matches.join("、")}`);
  if (!recipe.lastCookedAt) reasons.push("还没记录做过");
  else if ((daysSince(recipe.lastCookedAt) ?? 0) > 14) reasons.push("很久没做了");

  return {
    id: `recipe-${recipe.id}`,
    sourceId: recipe.id,
    source: "recipe",
    name: recipe.name,
    score: Math.round(score),
    reason: reasons.join("，"),
    tags: recipe.tags,
    matchedIngredients: matches,
    image: recipe.image,
  };
}

function wishlistCandidate(item: WishlistItem, mode: RecommendationMode): RecommendationItem {
  let score = 45 + item.cravingLevel * 6 + randomBonus(mode);
  if (mode === "wishlist") score += 25;
  if (mode === "fridge") score -= 6;

  return {
    id: `wishlist-${item.id}`,
    sourceId: item.id,
    source: "wishlist",
    name: item.name,
    score: Math.round(score),
    reason: `想吃指数 ${item.cravingLevel}/5，适合从清单里挑一个试试`,
    tags: item.tags,
    matchedIngredients: [],
    image: item.image,
  };
}

function publicCandidate(
  recipe: PublicRecipe,
  inventory: InventoryItem[],
  mode: RecommendationMode,
): RecommendationItem {
  const matches = matchedInventory(recipe.ingredients, inventory);
  let score = 25 + matches.length * (mode === "fridge" ? 16 : 8) + randomBonus(mode);
  if (mode === "random") score += 16;
  if (mode === "wishlist") score -= 8;

  const reason = matches.length
    ? `公共菜谱补充，冰箱匹配 ${matches.join("、")}`
    : mode === "random"
      ? "随机探索补充菜谱"
      : "用户数据较少时的公共菜谱补充";

  return {
    id: `public-${recipe.id}`,
    sourceId: recipe.id,
    source: "public",
    name: recipe.name,
    score: Math.round(score),
    reason,
    tags: recipe.tags,
    matchedIngredients: matches,
  };
}

export function generateRecommendations(
  mode: RecommendationMode,
  recipes: Recipe[],
  wishlist: WishlistItem[],
  inventory: InventoryItem[],
  limit = 5,
): RecommendationItem[] {
  const recipeItems = recipes.map((recipe) => recipeCandidate(recipe, inventory, mode));
  const wishlistItems = wishlist.map((item) => wishlistCandidate(item, mode));
  const userDataCount = recipes.length + wishlist.length;
  const allowPublic =
    userDataCount < 8 || mode === "random" || (mode === "fridge" && recipeItems.length < limit);

  const publicItems = allowPublic
    ? publicRecipes.map((recipe) => publicCandidate(recipe, inventory, mode))
    : [];

  let candidates: RecommendationItem[] = [];
  if (mode === "wishlist") {
    candidates = [...wishlistItems, ...recipeItems, ...publicItems];
  } else if (mode === "fridge") {
    candidates = [...recipeItems, ...publicItems, ...wishlistItems].sort((a, b) => {
      const matchDiff = b.matchedIngredients.length - a.matchedIngredients.length;
      return matchDiff || b.score - a.score;
    });
    return uniqueByName(candidates).slice(0, limit);
  } else {
    candidates = [...recipeItems, ...wishlistItems, ...publicItems];
  }

  return uniqueByName(candidates)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function uniqueByName(items: RecommendationItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalize(item.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
