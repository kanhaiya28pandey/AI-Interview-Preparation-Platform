import api from "@/lib/api";
import { isMockMode } from "@/lib/dataMode";
import { getApiErrorMessage } from "@/lib/apiError";

export interface AuthResponse {
  message?: string;
  token: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  verificationStatus?: "Pending Verification" | "Verified" | "Rejected" | "Resubmission Required" | "Unverified";
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
    if (isMockMode()) {
      const email = credentials.email.toLowerCase().trim();
      const isAdmin = email.includes("admin");

      return {
        token: isAdmin ? "mock-admin-jwt-token" : "mock-student-jwt-token",
        userId: isAdmin ? "demo-admin-01" : "demo-student-01",
        name: isAdmin ? "Ananya Sharma (Admin)" : "Kanhaiya Verma",
        email: credentials.email,
        role: isAdmin ? "ADMIN" : "STUDENT",
        verificationStatus: "Verified",
        message: "Signed in successfully (Mock Mode)",
      };
    }

    try {
      const response = await api.post<AuthResponse>("/api/auth/login", credentials);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, "login"));
    }
  },

  async register(credentials: RegisterCredentials | FormData): Promise<AuthResponse> {
    if (isMockMode()) {
      let name = "Sample Student";
      let email = "student@srmist.edu.in";
      if (!(credentials instanceof FormData)) {
        name = credentials.name;
        email = credentials.email;
      }
      return {
        token: "mock-student-jwt-token",
        userId: "demo-student-new",
        name,
        email,
        role: "STUDENT",
        verificationStatus: "Unverified",
        message: "Registration successful (Mock Mode)",
      };
    }

    const isFormData = typeof FormData !== "undefined" && credentials instanceof FormData;
    try {
      const response = await api.post<AuthResponse>("/api/auth/register", credentials, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, "register"));
    }
  },

  async checkEmail(email: string): Promise<boolean> {
    if (isMockMode()) {
      return false;
    }
    try {
      const response = await api.get<{ exists: boolean }>(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      return Boolean(response.data?.exists);
    } catch {
      return false;
    }
  },

  async forgotPassword(email: string): Promise<string> {
    if (isMockMode()) {
      return "A 6-digit OTP has been sent to your email address.";
    }
    try {
      const response = await api.post("/api/auth/forgot-password", { email: email.trim() });
      const data = response.data;
      if (typeof data === "string") return data;
      if (typeof data === "object" && data !== null && "message" in data) {
        return String((data as { message: unknown }).message);
      }
      return "A 6-digit OTP has been sent to your email address.";
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, "forgot-password"));
    }
  },

  async resetPassword(otp: string, newPassword: string, email?: string): Promise<string> {
    if (isMockMode()) {
      return "Password reset successful";
    }
    try {
      const response = await api.post("/api/auth/reset-password", {
        token: otp.trim(),
        otp: otp.trim(),
        newPassword,
        email: email ? email.trim() : undefined,
      });
      const data = response.data;
      if (typeof data === "string") return data;
      if (typeof data === "object" && data !== null && "message" in data) {
        return String((data as { message: unknown }).message);
      }
      return "Password reset successful";
    } catch (error: unknown) {
      throw new Error(getApiErrorMessage(error, "reset-password"));
    }
  },
};
