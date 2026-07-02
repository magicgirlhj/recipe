import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import {
  createSupabaseClient,
  getEmbeddedSupabaseConfig,
  getSupabaseConfigSource,
  hasSupabaseConfig,
  kitchenDataTable,
  loadSupabaseConfig,
  normalizeSupabaseConfig,
  saveSupabaseConfig,
  type CloudKitchenRow,
  type SupabaseConfig,
  type SupabaseConfigSource,
  type SupabaseUser,
} from "../lib/supabase";
import { readCollection, storageKeys, writeCollection } from "../utils/storage";
import { addDaysToDateString, todayISO } from "../utils/date";

export type CloudSyncTone = "local" | "pending" | "synced" | "error";

export interface CloudSyncStatus {
  tone: CloudSyncTone;
  text: string;
}

interface KitchenContextValue {
  recipes: Recipe[];
  wishlist: WishlistItem[];
  inventory: InventoryItem[];
  cloudConfig: SupabaseConfig;
  cloudConfigSource: SupabaseConfigSource;
  cloudConfigured: boolean;
  cloudUser: SupabaseUser | null;
  cloudReady: boolean;
  cloudStatus: CloudSyncStatus;
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
  adjustInventoryQuantity: (id: string, delta: number) => void;
  deleteInventoryItem: (id: string) => void;
  configureCloud: (config: SupabaseConfig) => boolean;
  clearCloudConfiguration: () => void;
  signUpCloud: (email: string, password: string) => Promise<void>;
  signInCloud: (email: string, password: string) => Promise<void>;
  signOutCloud: () => Promise<void>;
  uploadLocalData: () => Promise<void>;
  downloadCloudData: () => Promise<void>;
}

const KitchenContext = createContext<KitchenContextValue | null>(null);

function cloudCollections(row: CloudKitchenRow) {
  return {
    recipes: Array.isArray(row.recipes) ? (row.recipes as Recipe[]) : [],
    wishlist: Array.isArray(row.wishlist) ? (row.wishlist as WishlistItem[]) : [],
    inventory: Array.isArray(row.inventory) ? (row.inventory as InventoryItem[]) : [],
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "发生了未知错误";
}

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
  const [cloudConfig, setCloudConfig] = useState(loadSupabaseConfig);
  const [cloudUser, setCloudUser] = useState<SupabaseUser | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>({
    tone: "local",
    text: "当前数据仅保存在这台设备。",
  });
  const cloudSaveTimerRef = useRef<number | undefined>(undefined);

  const cloudConnection = useMemo(
    () => createSupabaseClient(cloudConfig),
    [cloudConfig.publishableKey, cloudConfig.url],
  );
  const cloudClient = cloudConnection.client;
  const cloudConfigured = hasSupabaseConfig(cloudConfig);
  const cloudConfigSource = getSupabaseConfigSource(cloudConfig);

  useEffect(() => writeCollection(storageKeys.recipes, recipes), [recipes]);
  useEffect(() => writeCollection(storageKeys.wishlist, wishlist), [wishlist]);
  useEffect(() => writeCollection(storageKeys.inventory, inventory), [inventory]);

  useEffect(() => {
    if (!cloudConfigured || !cloudClient) {
      setCloudUser(null);
      setCloudReady(false);
      setCloudStatus({
        tone: cloudConnection.error ? "error" : "local",
        text: cloudConnection.error || "当前数据仅保存在这台设备。",
      });
      return undefined;
    }

    let active = true;
    setCloudReady(false);
    setCloudStatus({ tone: "pending", text: "正在连接 Supabase..." });

    cloudClient.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setCloudStatus({ tone: "error", text: `登录状态读取失败：${error.message}` });
        return;
      }

      const user = data?.session?.user ?? null;
      setCloudUser(user);
      setCloudStatus(
        user
          ? { tone: "pending", text: "正在读取云端厨房..." }
          : { tone: "local", text: "云同步已连接，请登录账号。" },
      );
    });

    const { data } = cloudClient.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const user = session?.user ?? null;
      setCloudUser(user);
      setCloudReady(false);
      setCloudStatus(
        user
          ? { tone: "pending", text: "正在读取云端厨房..." }
          : { tone: "local", text: "已退出账号，当前继续保存在本机。" },
      );
    });

    return () => {
      active = false;
      data.subscription?.unsubscribe();
    };
  }, [cloudClient, cloudConfigured, cloudConnection.error]);

  useEffect(() => {
    if (!cloudClient || !cloudUser) return undefined;

    const client = cloudClient;
    const user = cloudUser;
    let active = true;

    async function loadInitialCloudData() {
      setCloudReady(false);
      setCloudStatus({ tone: "pending", text: "正在读取云端厨房..." });

      try {
        const { data, error } = await client
          .from(kitchenDataTable)
          .select("user_id, recipes, wishlist, inventory, updated_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!active) return;
        if (error) throw new Error(error.message);

        if (data) {
          const collections = cloudCollections(data);
          setRecipes(collections.recipes);
          setWishlist(collections.wishlist);
          setInventory(collections.inventory);
          setCloudReady(true);
          setCloudStatus({
            tone: "synced",
            text: `已载入 ${user.email ?? "当前账号"} 的云端数据。`,
          });
          return;
        }

        const { error: uploadError } = await client.from(kitchenDataTable).upsert(
          {
            user_id: user.id,
            recipes,
            wishlist,
            inventory,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (!active) return;
        if (uploadError) throw new Error(uploadError.message);
        setCloudReady(true);
        setCloudStatus({
          tone: "synced",
          text: "云端为空，已上传这台设备里的数据。",
        });
      } catch (error) {
        if (!active) return;
        setCloudReady(false);
        setCloudStatus({ tone: "error", text: `云端读取失败：${errorMessage(error)}` });
      }
    }

    void loadInitialCloudData();

    return () => {
      active = false;
    };
  }, [cloudClient, cloudUser?.id]);

  useEffect(() => {
    if (!cloudClient || !cloudUser || !cloudReady) return undefined;

    window.clearTimeout(cloudSaveTimerRef.current);
    setCloudStatus({ tone: "pending", text: "正在保存到云端..." });

    cloudSaveTimerRef.current = window.setTimeout(async () => {
      try {
        const { error } = await cloudClient.from(kitchenDataTable).upsert(
          {
            user_id: cloudUser.id,
            recipes,
            wishlist,
            inventory,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (error) throw new Error(error.message);
        setCloudStatus({
          tone: "synced",
          text: `已同步到云端：${cloudUser.email ?? "当前账号"}`,
        });
      } catch (error) {
        setCloudStatus({ tone: "error", text: `云端保存失败：${errorMessage(error)}` });
      }
    }, 700);

    return () => window.clearTimeout(cloudSaveTimerRef.current);
  }, [cloudClient, cloudReady, cloudUser?.id, inventory, recipes, wishlist]);

  const value = useMemo<KitchenContextValue>(
    () => ({
      recipes,
      wishlist,
      inventory,
      cloudConfig,
      cloudConfigSource,
      cloudConfigured,
      cloudUser,
      cloudReady,
      cloudStatus,
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
        const expireDate =
          draft.shelfLifeDays !== undefined ? addDaysToDateString(now, draft.shelfLifeDays) : draft.expireDate;
        const item: InventoryItem = {
          ...draft,
          id: uuidv4(),
          quantity: draft.quantity ?? 1,
          category: undefined,
          expireDate,
          createdAt: now,
          updatedAt: now,
        };
        setInventory((items) => [item, ...items]);
        return item;
      },
      updateInventoryItem(id, draft) {
        setInventory((items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const expireDate =
              draft.shelfLifeDays !== undefined
                ? addDaysToDateString(item.createdAt, draft.shelfLifeDays)
                : draft.expireDate;

            return {
              ...item,
              ...draft,
              quantity: draft.quantity ?? 1,
              category: undefined,
              expireDate,
              updatedAt: todayISO(),
            };
          }),
        );
      },
      adjustInventoryQuantity(id, delta) {
        setInventory((items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const currentQuantity = item.quantity ?? 1;
            return {
              ...item,
              quantity: Math.max(0, currentQuantity + delta),
              updatedAt: todayISO(),
            };
          }),
        );
      },
      deleteInventoryItem(id) {
        setInventory((items) => items.filter((item) => item.id !== id));
      },
      configureCloud(config) {
        const normalized = normalizeSupabaseConfig(config);
        const connection = createSupabaseClient(normalized);

        setCloudConfig(saveSupabaseConfig(normalized));
        setCloudReady(false);
        setCloudStatus(
          connection.error
            ? { tone: "error", text: connection.error }
            : { tone: "pending", text: "正在连接 Supabase..." },
        );

        return !connection.error;
      },
      clearCloudConfiguration() {
        if (cloudClient) void cloudClient.auth.signOut();
        const embeddedConfig = getEmbeddedSupabaseConfig();
        const nextConfig = hasSupabaseConfig(embeddedConfig)
          ? saveSupabaseConfig(embeddedConfig)
          : saveSupabaseConfig({ url: "", publishableKey: "" });
        setCloudConfig(nextConfig);
        setCloudUser(null);
        setCloudReady(false);
        setCloudStatus(
          hasSupabaseConfig(embeddedConfig)
            ? { tone: "pending", text: "已恢复网站内置连接，请登录账号。" }
            : { tone: "local", text: "云同步配置已清除，数据继续保存在本机。" },
        );
      },
      async signUpCloud(email, password) {
        if (!cloudClient) {
          setCloudStatus({ tone: "error", text: "请先保存 Supabase 连接配置。" });
          return;
        }

        setCloudStatus({ tone: "pending", text: "正在创建账号..." });
        try {
          const { data, error } = await cloudClient.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
          });
          if (error) throw new Error(error.message);

          if (data?.session?.user) {
            setCloudUser(data.session.user);
            setCloudStatus({ tone: "pending", text: "账号已创建，正在准备云端厨房..." });
          } else {
            setCloudStatus({
              tone: "synced",
              text: "注册成功，请打开邮箱确认链接，然后回来登录。",
            });
          }
        } catch (error) {
          setCloudStatus({ tone: "error", text: `注册失败：${errorMessage(error)}` });
        }
      },
      async signInCloud(email, password) {
        if (!cloudClient) {
          setCloudStatus({ tone: "error", text: "请先保存 Supabase 连接配置。" });
          return;
        }

        setCloudStatus({ tone: "pending", text: "正在登录..." });
        try {
          const { data, error } = await cloudClient.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (error) throw new Error(error.message);
          if (data?.user) setCloudUser(data.user);
          setCloudStatus({ tone: "pending", text: "登录成功，正在读取云端厨房..." });
        } catch (error) {
          setCloudStatus({ tone: "error", text: `登录失败：${errorMessage(error)}` });
        }
      },
      async signOutCloud() {
        if (!cloudClient) return;
        const { error } = await cloudClient.auth.signOut();
        if (error) {
          setCloudStatus({ tone: "error", text: `退出失败：${error.message}` });
          return;
        }
        setCloudUser(null);
        setCloudReady(false);
        setCloudStatus({ tone: "local", text: "已退出账号，当前继续保存在本机。" });
      },
      async uploadLocalData() {
        if (!cloudClient || !cloudUser) {
          setCloudStatus({ tone: "error", text: "请先登录云同步账号。" });
          return;
        }

        setCloudStatus({ tone: "pending", text: "正在上传本机数据..." });
        try {
          const { error } = await cloudClient.from(kitchenDataTable).upsert(
            {
              user_id: cloudUser.id,
              recipes,
              wishlist,
              inventory,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) throw new Error(error.message);
          setCloudReady(true);
          setCloudStatus({ tone: "synced", text: "本机数据已上传并覆盖云端数据。" });
        } catch (error) {
          setCloudStatus({ tone: "error", text: `上传失败：${errorMessage(error)}` });
        }
      },
      async downloadCloudData() {
        if (!cloudClient || !cloudUser) {
          setCloudStatus({ tone: "error", text: "请先登录云同步账号。" });
          return;
        }

        setCloudReady(false);
        setCloudStatus({ tone: "pending", text: "正在下载云端数据..." });
        try {
          const { data, error } = await cloudClient
            .from(kitchenDataTable)
            .select("user_id, recipes, wishlist, inventory, updated_at")
            .eq("user_id", cloudUser.id)
            .maybeSingle();
          if (error) throw new Error(error.message);
          if (!data) throw new Error("云端还没有可下载的数据");

          const collections = cloudCollections(data);
          setRecipes(collections.recipes);
          setWishlist(collections.wishlist);
          setInventory(collections.inventory);
          setCloudReady(true);
          setCloudStatus({ tone: "synced", text: "已使用云端数据覆盖本机数据。" });
        } catch (error) {
          setCloudReady(true);
          setCloudStatus({ tone: "error", text: `下载失败：${errorMessage(error)}` });
        }
      },
    }),
    [
      cloudClient,
      cloudConfig,
      cloudConfigSource,
      cloudConfigured,
      cloudReady,
      cloudStatus,
      cloudUser,
      inventory,
      recipes,
      wishlist,
    ],
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
