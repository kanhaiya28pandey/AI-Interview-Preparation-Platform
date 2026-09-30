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

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/register", credentials);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || "Registration failed. Please try again.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
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
