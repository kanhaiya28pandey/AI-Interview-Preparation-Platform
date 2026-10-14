import axios from "axios";
import { isMockMode } from "./dataMode";

export function isDemoSession(): boolean {
  return isMockMode();
}

/**
 * In development, if VITE_API_BASE_URL (or VITE_API_URL) is not explicitly configured,
 * default to "" (relative) so requests hit the Vite proxy (`/api`) and avoid CORS entirely.
 * In production or when explicitly set, use the configured URL.
 */
const configuredApiUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).trim();

export const API_BASE_URL =
  import.meta.env.DEV && !configuredApiUrl ? "" : configuredApiUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ai_interview_prep_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized for real user sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config && error.config.url ? error.config.url : "";
    const isAuthEndpoint = url.includes("/auth/");
    const token = localStorage.getItem("ai_interview_prep_token");

    // Redirect to /login ONLY when:
    // - status is 401, AND
    // - request was NOT to an /auth/ endpoint, AND
    // - there was an existing token that has now expired.
    if (status === 401 && !isAuthEndpoint && token) {
      localStorage.removeItem("ai_interview_prep_token");
      localStorage.removeItem("ai_interview_prep_user");

      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register") &&
        !window.location.pathname.startsWith("/forgot-password") &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Health check helper for development / status diagnostics.
 * Uses a short timeout (2.5s) so the UI never hangs.
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await api.get("/api/health", { timeout: 2500 });
    return { ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      // If we received an HTTP response (even 404, 401, or 403), the server is UP and reachable!
      if (err.response) {
        return { ok: true, status: err.response.status };
      }
      return { ok: false, error: err.message || "Network Error" };
    }
    return { ok: false, error: "Network Error" };
  }
}

export default api;
