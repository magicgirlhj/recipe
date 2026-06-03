export function readCollection<T>(key: string, fallback: T[]): T[] {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

export function writeCollection<T>(key: string, value: T[]) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    void key;
    void value;
  }
}

export const storageKeys = {
  recipes: "my-kitchen:recipes",
  wishlist: "my-kitchen:wishlist",
  inventory: "my-kitchen:inventory",
};
