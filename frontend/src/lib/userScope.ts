/**
 * User-scoped LocalStorage Key Helper
 * Ensures progress, roadmaps, and local state are cleanly isolated per student user.
 */

export function getUserScopedKey(userId: string | undefined | null, key: string): string {
  const safeId = userId && userId.trim() ? userId.trim().toLowerCase() : "guest_user";
  return `user_scope:${safeId}:${key}`;
}

export function getScopedItem<T>(userId: string | undefined | null, key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(getUserScopedKey(userId, key));
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Failed to read scoped localStorage key "${key}":`, err);
  }
  return defaultValue;
}

export function setScopedItem<T>(userId: string | undefined | null, key: string, value: T): void {
  try {
    localStorage.setItem(getUserScopedKey(userId, key), JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write scoped localStorage key "${key}":`, err);
  }
}

export function removeScopedItem(userId: string | undefined | null, key: string): void {
  try {
    localStorage.removeItem(getUserScopedKey(userId, key));
  } catch (err) {
    console.warn(`Failed to remove scoped localStorage key "${key}":`, err);
  }
}
