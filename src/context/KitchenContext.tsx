import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { sampleInventory, sampleRecipes, sampleWishlist } from "../data/sampleData";
import type {
  InventoryDraft,
  InventoryItem,
  Recipe,
  RecipeDraft,
  WishlistDraft,
  WishlistItem,
} from "../data/types";
import { readCollection, storageKeys, writeCollection } from "../utils/storage";
import { todayISO } from "../utils/date";

interface KitchenContextValue {
  recipes: Recipe[];
  wishlist: WishlistItem[];
  inventory: InventoryItem[];
  addRecipe: (draft: RecipeDraft) => Recipe;
  updateRecipe: (id: string, draft: RecipeDraft) => void;
  deleteRecipe: (id: string) => void;
  markCooked: (id: string) => void;
  addWishlistItem: (draft: WishlistDraft) => WishlistItem;
  updateWishlistItem: (id: string, draft: WishlistDraft) => void;
  deleteWishlistItem: (id: string) => void;
  convertWishlistToRecipe: (id: string) => Recipe | undefined;
  addInventoryItem: (draft: InventoryDraft) => InventoryItem;
  updateInventoryItem: (id: string, draft: InventoryDraft) => void;
  deleteInventoryItem: (id: string) => void;
  resetDemoData: () => void;
}

const KitchenContext = createContext<KitchenContextValue | null>(null);

export function KitchenProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(() =>
    readCollection(storageKeys.recipes, sampleRecipes),
  );
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() =>
    readCollection(storageKeys.wishlist, sampleWishlist),
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    readCollection(storageKeys.inventory, sampleInventory),
  );

  useEffect(() => writeCollection(storageKeys.recipes, recipes), [recipes]);
  useEffect(() => writeCollection(storageKeys.wishlist, wishlist), [wishlist]);
  useEffect(() => writeCollection(storageKeys.inventory, inventory), [inventory]);

  const value = useMemo<KitchenContextValue>(
    () => ({
      recipes,
      wishlist,
      inventory,
      addRecipe(draft) {
        const now = todayISO();
        const recipe: Recipe = {
          ...draft,
          id: uuidv4(),
          cookedCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        setRecipes((items) => [recipe, ...items]);
        return recipe;
      },
      updateRecipe(id, draft) {
        setRecipes((items) =>
          items.map((item) =>
            item.id === id ? { ...item, ...draft, updatedAt: todayISO() } : item,
          ),
        );
      },
      deleteRecipe(id) {
        setRecipes((items) => items.filter((item) => item.id !== id));
      },
      markCooked(id) {
        setRecipes((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  cookedCount: item.cookedCount + 1,
                  lastCookedAt: todayISO(),
                  updatedAt: todayISO(),
                }
              : item,
          ),
        );
      },
      addWishlistItem(draft) {
        const now = todayISO();
        const item: WishlistItem = {
          ...draft,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        setWishlist((items) => [item, ...items]);
        return item;
      },
      updateWishlistItem(id, draft) {
        setWishlist((items) =>
          items.map((item) =>
            item.id === id ? { ...item, ...draft, updatedAt: todayISO() } : item,
          ),
        );
      },
      deleteWishlistItem(id) {
        setWishlist((items) => items.filter((item) => item.id !== id));
      },
      convertWishlistToRecipe(id) {
        const target = wishlist.find((item) => item.id === id);
        if (!target) return undefined;
        const noteLines = [target.notes, target.sourceUrl ? `来源：${target.sourceUrl}` : ""].filter(Boolean);
        const now = todayISO();
        const recipe: Recipe = {
          id: uuidv4(),
          name: target.name,
          image: target.image,
          tags: target.tags,
          ingredients: [{ name: "待补充" }],
          steps: ["待补充做法"],
          notes: noteLines.join("\n"),
          cookedCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        setRecipes((items) => [recipe, ...items]);
        return recipe;
      },
      addInventoryItem(draft) {
        const now = todayISO();
        const item: InventoryItem = {
          ...draft,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        setInventory((items) => [item, ...items]);
        return item;
      },
      updateInventoryItem(id, draft) {
        setInventory((items) =>
          items.map((item) =>
            item.id === id ? { ...item, ...draft, updatedAt: todayISO() } : item,
          ),
        );
      },
      deleteInventoryItem(id) {
        setInventory((items) => items.filter((item) => item.id !== id));
      },
      resetDemoData() {
        setRecipes(sampleRecipes);
        setWishlist(sampleWishlist);
        setInventory(sampleInventory);
      },
    }),
    [inventory, recipes, wishlist],
  );

  return <KitchenContext.Provider value={value}>{children}</KitchenContext.Provider>;
}

export function useKitchen() {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error("useKitchen must be used inside KitchenProvider");
  }
  return context;
}
