export function readCollection<T>(key: string, fallback: T[]): T[] {
  try {
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
  localStorage.setItem(key, JSON.stringify(value));
}

export const storageKeys = {
  recipes: "my-kitchen:recipes",
  wishlist: "my-kitchen:wishlist",
  inventory: "my-kitchen:inventory",
};
