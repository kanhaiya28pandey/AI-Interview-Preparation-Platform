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

  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      const data = response.data;
      if (typeof data === "string") return data;
      return data.token || data.message || "Reset token generated successfully";
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || "Could not process password reset.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const response = await api.post("/api/auth/reset-password", { token, newPassword });
      const data = response.data;
      if (typeof data === "string") return data;
      return data.message || "Password reset successful";
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data || "Failed to reset password.";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  },
};
