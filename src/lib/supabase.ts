export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export type SupabaseConfigSource = "embedded" | "manual" | "empty";

export interface SupabaseUser {
  id: string;
  email?: string;
}

export interface SupabaseSession {
  user: SupabaseUser;
}

export interface SupabaseError {
  message: string;
}

export interface CloudKitchenRow {
  user_id: string;
  recipes: unknown;
  wishlist: unknown;
  inventory: unknown;
  updated_at: string;
}

interface SupabaseResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

interface SupabaseQueryBuilder {
  select(columns: string): SupabaseQueryBuilder;
  eq(column: string, value: string): SupabaseQueryBuilder;
  maybeSingle(): Promise<SupabaseResult<CloudKitchenRow>>;
  upsert(
    values: Record<string, unknown>,
    options?: { onConflict?: string },
  ): Promise<SupabaseResult<unknown>>;
}

interface AuthStateSubscription {
  unsubscribe(): void;
}

export interface SupabaseClient {
  auth: {
    getSession(): Promise<SupabaseResult<{ session: SupabaseSession | null }>>;
    onAuthStateChange(
      callback: (event: string, session: SupabaseSession | null) => void,
    ): { data: { subscription?: AuthStateSubscription } };
    signUp(credentials: {
      email: string;
      password: string;
    }): Promise<SupabaseResult<{ user: SupabaseUser | null; session: SupabaseSession | null }>>;
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<SupabaseResult<{ user: SupabaseUser; session: SupabaseSession }>>;
    signOut(): Promise<SupabaseResult<null>>;
  };
  from(table: string): SupabaseQueryBuilder;
}

declare global {
  interface Window {
    supabase?: {
      createClient(
        url: string,
        publishableKey: string,
        options?: {
          auth?: {
            autoRefreshToken?: boolean;
            detectSessionInUrl?: boolean;
            persistSession?: boolean;
          };
        },
      ): SupabaseClient;
    };
    MY_KITCHEN_SUPABASE?: Partial<SupabaseConfig>;
  }
}

const configStorageKey = "my-kitchen:supabase-config";

export const kitchenDataTable = "kitchen_data";
const emptySupabaseConfig: SupabaseConfig = { url: "", publishableKey: "" };

export function normalizeSupabaseConfig(config?: Partial<SupabaseConfig> | null): SupabaseConfig {
  return {
    url: String(config?.url ?? "").trim(),
    publishableKey: String(config?.publishableKey ?? "").trim(),
  };
}

export function hasSupabaseConfig(config: SupabaseConfig) {
  return Boolean(config.url && config.publishableKey);
}

function readStoredSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(configStorageKey);
    return stored ? normalizeSupabaseConfig(JSON.parse(stored) as Partial<SupabaseConfig>) : emptySupabaseConfig;
  } catch {
    return emptySupabaseConfig;
  }
}

export function getEmbeddedSupabaseConfig(): SupabaseConfig {
  return normalizeSupabaseConfig(window.MY_KITCHEN_SUPABASE);
}

export function getSupabaseConfigSource(config?: SupabaseConfig): SupabaseConfigSource {
  const current = normalizeSupabaseConfig(config ?? loadSupabaseConfig());
  const embedded = getEmbeddedSupabaseConfig();
  if (
    hasSupabaseConfig(embedded) &&
    current.url === embedded.url &&
    current.publishableKey === embedded.publishableKey
  ) {
    return "embedded";
  }

  return hasSupabaseConfig(current) ? "manual" : "empty";
}

export function loadSupabaseConfig(): SupabaseConfig {
  const embedded = getEmbeddedSupabaseConfig();
  if (hasSupabaseConfig(embedded)) {
    saveSupabaseConfig(embedded);
    return embedded;
  }

  return readStoredSupabaseConfig();
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  const normalized = normalizeSupabaseConfig(config);

  try {
    if (hasSupabaseConfig(normalized)) {
      localStorage.setItem(configStorageKey, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(configStorageKey);
    }
  } catch {
    // localStorage may be unavailable in strict browser modes; cloud sync can still use embedded config.
  }

  return normalized;
}

export function createSupabaseClient(config: SupabaseConfig): {
  client: SupabaseClient | null;
  error: string;
} {
  if (!hasSupabaseConfig(config)) {
    return { client: null, error: "" };
  }

  if (!window.supabase?.createClient) {
    return { client: null, error: "Supabase SDK 加载失败，请检查网络后刷新页面。" };
  }

  try {
    const url = new URL(config.url);
    if (url.protocol !== "https:") {
      return { client: null, error: "Supabase Project URL 必须以 https:// 开头。" };
    }

    return {
      client: window.supabase.createClient(config.url, config.publishableKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      }),
      error: "",
    };
  } catch {
    return { client: null, error: "Supabase 配置格式不正确，请检查 Project URL 和 Publishable Key。" };
  }
}
