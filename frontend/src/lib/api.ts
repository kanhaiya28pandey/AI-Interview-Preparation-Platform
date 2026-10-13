import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
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

import { isMockMode } from "./dataMode";

export function isDemoSession(): boolean {
  return isMockMode();
}

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config && error.config.url ? error.config.url : "";
    const isAuthEndpoint = url.includes("/auth/");
    const isDemo = isDemoSession();
    const token = localStorage.getItem("ai_interview_prep_token");
    const hasToken = !!token;

    // Redirect to /login ONLY when:
    // - status is 401, AND
    // - request was NOT to an /auth/ endpoint, AND
    // - user is NOT in a demo session, AND
    // - there was a token (an expired or invalid token).
    if (status === 401 && !isAuthEndpoint && !isDemo && hasToken) {
      localStorage.removeItem("ai_interview_prep_token");
      localStorage.removeItem("ai_interview_prep_user");
      localStorage.removeItem("ai_interview_prep_demo");

      // If not on login/register/forgot page, redirect to login
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register") &&
        !window.location.pathname.startsWith("/forgot-password") &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login";
      }
    }

    // For network errors (no response), 403, 404, 5xx, or demo sessions,
    // do NOT log out or redirect. Reject the error so the page can show it.
    return Promise.reject(error);
  }
);

export default api;
