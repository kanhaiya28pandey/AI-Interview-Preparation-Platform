/**
 * Data Mode Helper
 * Single source of truth for mock vs backend mode across the entire application.
 *
 * Rules:
 * - Returns `true` (mock mode) ONLY IF:
 *   1. User is in an active demo session (userId starts with "demo-" or localStorage "ai_interview_prep_demo" === "true")
 *   2. OR import.meta.env.VITE_USE_MOCKS === "true"
 * - Real sessions with an unset or false env use the real backend API (returns `false`).
 */

export function isMockMode(): boolean {
  if (typeof window !== "undefined") {
    // 1. Explicit demo session flag in storage
    if (localStorage.getItem("ai_interview_prep_demo") === "true") {
      return true;
    }

    // 2. Demo user account in active auth user object
    try {
      const userStr = localStorage.getItem("ai_interview_prep_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u && typeof u.userId === "string" && u.userId.startsWith("demo-")) {
          return true;
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }

  // 3. Forced mock mode via Vite environment variable
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    return true;
  }

  return false;
}

export function getDataMode(): "demo" | "backend" {
  return isMockMode() ? "demo" : "backend";
}

export function getDataModeLabel(): string {
  return isMockMode() ? "Data: Local demo" : "Data: Backend";
}

// Log once at startup with the current mode
if (typeof window !== "undefined") {
  const mode = isMockMode() ? "Local demo (Mock Mode)" : "Backend API (Real Database)";
  console.info(`[Platform Data Mode] Running in ${mode}`);
}
