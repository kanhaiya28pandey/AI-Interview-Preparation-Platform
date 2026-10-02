import api from "@/lib/api";

export interface AuthResponse {
  message?: string;
  token: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || "Login failed. Please check your credentials.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  },

  async register(credentials: RegisterCredentials | FormData): Promise<AuthResponse> {
    const isFormData = typeof FormData !== "undefined" && credentials instanceof FormData;
    try {
      if (import.meta.env.DEV) {
        console.log("[DEV LOG] Initiating register API request to:", `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/auth/register`);
        if (!isFormData) {
          console.log("[DEV LOG] Payload:", { ...(credentials as RegisterCredentials), password: "[REDACTED]" });
        }
      }

      const response = await api.post<AuthResponse>("/api/auth/register", credentials, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("[DEV LOG] Registration API Error:", error);
      }

      // Network / Server Unreachable Error
      if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
        throw new Error("Cannot reach the server. Please make sure the backend is running.");
      }

      const status = error.response?.status;
      const data = error.response?.data;

      // Status Code specific messages
      if (status === 409) {
        const msg = typeof data === "string" ? data : data?.message || "An account with this email or roll number already exists.";
        throw new Error(msg);
      }
      if (status === 413) {
        throw new Error("Uploaded file is too large. Maximum allowed file size is 10MB.");
      }
      if (status === 422 || status === 400) {
        if (data?.fieldErrors || data?.errors) {
          const fieldMsgs = Object.entries(data.fieldErrors || data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          throw new Error(`Validation Error: ${fieldMsgs}`);
        }
        const msg = typeof data === "string" ? data : data?.message || "Invalid registration details. Please verify your entries.";
        throw new Error(msg);
      }
      if (status === 500) {
        throw new Error("Server error (500). Please try again later or contact support.");
      }

      const msg = typeof data === "string" ? data : data?.message || "Registration failed. Please try again.";
      throw new Error(msg);
    }
  },

  async checkEmail(email: string): Promise<boolean> {
    try {
      const response = await api.get<{ exists: boolean }>(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      return Boolean(response.data?.exists);
    } catch {
      return false;
    }
  },

  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await api.post("/api/auth/forgot-password", { email: email.trim() });
      const data = response.data;
      if (typeof data === "string") return data;
      return data.message || "A 6-digit OTP has been sent to your email address.";
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || "Could not process password reset. Please verify your email.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  },

  async resetPassword(otp: string, newPassword: string, email?: string): Promise<string> {
    try {
      const response = await api.post("/api/auth/reset-password", {
        token: otp.trim(),
        otp: otp.trim(),
        newPassword,
        email: email ? email.trim() : undefined,
      });
      const data = response.data;
      if (typeof data === "string") return data;
      return data.message || "Password reset successful";
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || "Failed to reset password. Please check your OTP.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  },
};
