export type RecipeDifficulty = "easy" | "medium" | "hard";

export type InventoryLocation = "fridge" | "freezer" | "pantry";

export type RecommendationMode = "balanced" | "fridge" | "wishlist" | "random";

export interface Ingredient {
  name: string;
  amount?: string;
}

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  cookingTime?: number;
  difficulty?: RecipeDifficulty;
  notes?: string;
  cookedCount: number;
  lastCookedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDraft {
  name: string;
  image?: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  cookingTime?: number;
  difficulty?: RecipeDifficulty;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  image?: string;
  sourceUrl?: string;
  notes?: string;
  cravingLevel: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistDraft {
  name: string;
  image?: string;
  sourceUrl?: string;
  notes?: string;
  cravingLevel: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  location: InventoryLocation;
  expireDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDraft {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  location: InventoryLocation;
  expireDate?: string;
  notes?: string;
}

export interface PublicRecipe {
  id: string;
  name: string;
  tags: string[];
  ingredients: Ingredient[];
  cookingTime?: number;
  difficulty?: RecipeDifficulty;
}

export type RecommendationSource = "recipe" | "wishlist" | "public";

export interface RecommendationItem {
  id: string;
  sourceId: string;
  source: RecommendationSource;
  name: string;
  score: number;
  reason: string;
  tags: string[];
  matchedIngredients: string[];
  image?: string;
}
