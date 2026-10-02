export function isDemoUser(user?: { userId?: string } | null): boolean {
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("ai_interview_prep_demo") === "true"
  ) {
    return true;
  }

  if (user?.userId && user.userId.startsWith("demo-usr-")) {
    return true;
  }

  return false;
}

export function getActiveUserId(): string {
  if (typeof window === "undefined") return "anon";

  try {
    const raw = localStorage.getItem("ai_interview_prep_user");

    if (raw) {
      const parsed = JSON.parse(raw);

      if (parsed.userId) {
        return parsed.userId;
      }
    }
  } catch {
    // fallback
  }

  return "anon";
}

export function scopedKey(baseKey: string, userId?: string): string {
  const uid = userId || getActiveUserId();
  return `${baseKey}:${uid}`;
}

export function getUserScopedKey(
  userId: string | undefined | null,
  key: string
): string {
  const safeId =
    userId && userId.trim() ? userId.trim().toLowerCase() : "guest_user";

  return `user_scope:${safeId}:${key}`;
}

export function getScopedItem<T>(
  userId: string | undefined | null,
  key: string,
  defaultValue: T
): T {
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

export function setScopedItem<T>(
  userId: string | undefined | null,
  key: string,
  value: T
): void {
  try {
    localStorage.setItem(
      getUserScopedKey(userId, key),
      JSON.stringify(value)
    );
  } catch (err) {
    console.warn(`Failed to write scoped localStorage key "${key}":`, err);
  }
}

export function removeScopedItem(
  userId: string | undefined | null,
  key: string
): void {
  try {
    localStorage.removeItem(getUserScopedKey(userId, key));
  } catch (err) {
    console.warn(`Failed to remove scoped localStorage key "${key}":`, err);
  }
}