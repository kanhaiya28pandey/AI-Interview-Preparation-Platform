/**
 * Helper utilities for user identification and localStorage key scoping.
 */

export function isDemoUser(user?: { userId?: string } | null): boolean {
  if (typeof window !== "undefined" && localStorage.getItem("ai_interview_prep_demo") === "true") {
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
      if (parsed.userId) return parsed.userId;
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
