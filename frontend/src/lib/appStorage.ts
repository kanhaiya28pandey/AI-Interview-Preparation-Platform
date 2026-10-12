/**
 * Application storage helpers and validation utilities.
 */

export const isObjectId = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
};

export const clearAllAppStorage = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("ai_interview_prep_") ||
          k.startsWith("admin_") ||
          k.startsWith("data_migration_") ||
          k === "token" ||
          k === "user" ||
          k === "debug_mode")
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    console.info("[appStorage] Cleared all local application storage keys:", keysToRemove);
  } catch (e) {
    console.error("[appStorage] Failed to clear local app storage:", e);
  }
};
