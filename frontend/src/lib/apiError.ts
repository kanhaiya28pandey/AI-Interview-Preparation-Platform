import axios from "axios";

/**
 * Returns the effective API base URL.
 * - In local dev when VITE_API_BASE_URL is empty, Vite proxies /api to http://localhost:8080 (or VITE_PROXY_TARGET).
 * - When configured via VITE_API_URL or VITE_API_BASE_URL, returns the configured URL.
 */
export function getEffectiveApiBaseUrl(): string {
  const configured = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
  ).trim();

  if (configured) {
    return configured;
  }

  return "http://localhost:8080";
}

/**
 * Safely extracts a human-readable message string from any server error payload.
 * Prevents "[object Object]" or raw HTML error pages from leaking into the UI.
 */
export function extractServerMessage(data: unknown): string | null {
  if (!data) return null;

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed.length === 0) return null;
    // Discard raw HTML error responses (e.g. 404/502 default proxy/server HTML pages)
    if (
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html") ||
      trimmed.startsWith("<HTML") ||
      trimmed.startsWith("<head")
    ) {
      return null;
    }
    // Discard accidental literal "[object Object]"
    if (trimmed === "[object Object]") {
      return null;
    }
    return trimmed;
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // Common standard fields: message, error, detail, title
    if (typeof obj.message === "string" && obj.message.trim().length > 0) {
      const msg = obj.message.trim();
      if (msg !== "[object Object]") return msg;
    }
    if (typeof obj.error === "string" && obj.error.trim().length > 0) {
      const err = obj.error.trim();
      if (err !== "[object Object]") return err;
    }
    if (typeof obj.detail === "string" && obj.detail.trim().length > 0) {
      const det = obj.detail.trim();
      if (det !== "[object Object]") return det;
    }
    if (typeof obj.title === "string" && obj.title.trim().length > 0) {
      const title = obj.title.trim();
      if (title !== "[object Object]") return title;
    }

    // Handle field error maps e.g. { fieldErrors: { email: "Invalid format" } }
    const fieldErrors = (obj.fieldErrors || obj.errors) as Record<string, unknown> | undefined;
    if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
      const entries = Object.entries(fieldErrors)
        .map(([field, val]) => (typeof val === "string" ? `${field}: ${val}` : field))
        .filter(Boolean);
      if (entries.length > 0) {
        return entries.join(", ");
      }
    }
  }

  return null;
}

export type ApiErrorContext = "login" | "register" | "forgot-password" | "reset-password" | string;

/**
 * Maps any error (Axios, Network, Server, or generic Error) to clear, actionable user messages.
 * Uses strict type guards, guarantees no "[object Object]", and does not log credentials.
 */
export function getApiErrorMessage(error: unknown, context: ApiErrorContext = "general"): string {
  const effectiveUrl = getEffectiveApiBaseUrl();

  if (axios.isAxiosError(error)) {
    // Case 1: No response received (Network error, CORS block, timeout, backend down)
    if (
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message?.toLowerCase().includes("network error") ||
      error.message?.toLowerCase().includes("timeout") ||
      error.message?.toLowerCase().includes("failed to fetch")
    ) {
      let msg = `Cannot reach the server at ${effectiveUrl}. Please make sure the backend is running.`;
      if (import.meta.env.DEV) {
        msg += " If running on a different port than 3000, requests may be blocked by CORS.";
      }
      return msg;
    }

    const status = error.response.status;
    const serverMsg = extractServerMessage(error.response.data);

    // Case 2: Status-specific mappings
    switch (status) {
      case 400:
        return serverMsg || "Invalid request. Please check your inputs.";

      case 401:
        if (context === "login") {
          return serverMsg || "Incorrect email or password.";
        }
        return serverMsg || "Unauthorized. Please sign in again.";

      case 403:
        return serverMsg || "Access denied. Your account does not have permission.";

      case 404:
        if (context === "login") {
          return serverMsg || "Login service not found. The backend URL may be wrong.";
        }
        if (context === "register") {
          return serverMsg || "Registration service not found. The backend URL may be wrong.";
        }
        return serverMsg || "The requested resource was not found.";

      case 409:
        return serverMsg || "An account with this email or roll number already exists.";

      case 413:
        return "Uploaded file is too large. Maximum allowed file size is 10MB.";

      case 422:
        return serverMsg || "Validation failed. Please verify your entries.";

      case 429:
        return "Too many attempts. Please wait a moment and try again.";

      default:
        if (status >= 500 && status < 600) {
          return serverMsg || `Server error (${status}). Please try again later or contact support.`;
        }
        return serverMsg || "Operation failed. Please try again.";
    }
  }

  // Generic JavaScript errors
  if (error instanceof Error) {
    const raw = error.message?.trim();
    if (raw && raw !== "[object Object]") {
      // Check if the error message itself describes a network failure
      const lower = raw.toLowerCase();
      if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("connection")) {
        let msg = `Cannot reach the server at ${effectiveUrl}. Please make sure the backend is running.`;
        if (import.meta.env.DEV) {
          msg += " If running on a different port than 3000, requests may be blocked by CORS.";
        }
        return msg;
      }
      return raw;
    }
  }

  if (typeof error === "string" && error.trim().length > 0 && error.trim() !== "[object Object]") {
    return error.trim();
  }

  return "Operation failed. Please try again.";
}
