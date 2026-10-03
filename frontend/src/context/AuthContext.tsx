import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, AuthResponse, LoginCredentials, RegisterCredentials } from "@/services/authService";

export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  verificationStatus?: "Pending Verification" | "Verified" | "Rejected" | "Resubmission Required" | "Unverified";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (otp: string, newPassword: string, email?: string) => Promise<string>;
  loginDemoStudent: () => void;
  loginDemoAdmin: () => void;
  logout: () => void;
  hasRole: (requiredRole: string) => boolean;
  isAdmin: () => boolean;
  setVerificationStatus: (status: User["verificationStatus"]) => void;
}

import { isMockMode } from "@/lib/dataMode";
import { isObjectId, clearAllAppStorage } from "@/lib/appStorage";
import api from "@/lib/api";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    const validateAndInitSession = async () => {
      try {
        const storedToken = localStorage.getItem("ai_interview_prep_token");
        const storedUserRaw = localStorage.getItem("ai_interview_prep_user");
        const storedDemo = localStorage.getItem("ai_interview_prep_demo") === "true";

        if (!storedToken || !storedUserRaw) {
          setIsLoading(false);
          return;
        }

        let parsedUser: User | null = null;
        try {
          parsedUser = JSON.parse(storedUserRaw);
        } catch {
          parsedUser = null;
        }

        if (!isMockMode()) {
          // Real backend mode: check if token or user is from mock/demo mode
          const isDemoToken =
            storedToken.startsWith("demo-") ||
            storedToken.startsWith("mock-") ||
            storedDemo;
          const hasValidObjectId = isObjectId(parsedUser?.userId);

          if (isDemoToken || !hasValidObjectId || !parsedUser) {
            console.warn(
              "[AuthContext] Stale demo/mock session detected in backend mode. Purging local storage."
            );
            clearAllAppStorage();
            setToken(null);
            setUser(null);
            setIsDemoMode(false);
            setIsLoading(false);
            toast.info("Your saved session was from demo mode. Please sign in again.");
            if (
              window.location.pathname !== "/login" &&
              window.location.pathname !== "/register" &&
              window.location.pathname !== "/"
            ) {
              window.location.href = "/login";
            }
            return;
          }

          // Verify token against backend profile endpoint
          try {
            await api.get("/api/v1/profile");
            setToken(storedToken);
            setUser(parsedUser);
            setIsDemoMode(false);
          } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 404) {
              console.warn(
                `[AuthContext] Session returned ${status} from backend. Purging local app data.`
              );
              clearAllAppStorage();
              setToken(null);
              setUser(null);
              setIsDemoMode(false);
              toast.info("Your saved session was from demo mode. Please sign in again.");
              if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/register" &&
                window.location.pathname !== "/"
              ) {
                window.location.href = "/login";
              }
              return;
            }
            // If offline / momentary network issue, keep token so reload works
            setToken(storedToken);
            setUser(parsedUser);
            setIsDemoMode(false);
          }
        } else {
          // Mock mode
          setToken(storedToken);
          setUser(parsedUser);
          setIsDemoMode(storedDemo);
        }
      } catch (e) {
        console.error("Failed to parse stored auth user:", e);
        clearAllAppStorage();
        setToken(null);
        setUser(null);
        setIsDemoMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAndInitSession();
  }, []);

  const saveAuth = (authData: AuthResponse, isDemo = false) => {
    const { token: authToken, userId, name, email, role, verificationStatus } = authData;
    const isExplicitAdmin = role?.toUpperCase().includes("ADMIN");
    const resolvedStatus = isDemo || isExplicitAdmin
      ? "Verified"
      : (verificationStatus || "Unverified");

    const userData: User = {
      userId,
      name,
      email,
      role,
      verificationStatus: resolvedStatus,
    };
    
    setToken(authToken);
    setUser(userData);
    setIsDemoMode(isDemo);

    localStorage.setItem("ai_interview_prep_token", authToken);
    localStorage.setItem("ai_interview_prep_user", JSON.stringify(userData));
    localStorage.setItem("ai_interview_prep_demo", isDemo ? "true" : "false");
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await authService.login(credentials);
    saveAuth(res, false);
    return res;
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await authService.register(credentials);
    saveAuth({ ...res, verificationStatus: "Unverified" }, false);
    return res;
  };

  const loginDemoStudent = () => {
    const demoData: AuthResponse = {
      token: "demo-student-jwt-token-2026",
      userId: "demo-usr-student-01",
      name: "Kanhaiya Pandey",
      email: "kanhaiya.student@srmist.edu.in",
      role: "STUDENT",
      message: "Demo student session activated",
      verificationStatus: "Verified",
    };
    saveAuth(demoData, true);
  };

  const loginDemoAdmin = () => {
    const demoData: AuthResponse = {
      token: "demo-admin-jwt-token-2026",
      userId: "demo-usr-admin-01",
      name: "Ananya Sharma",
      email: "ananya.admin@aiinterviewprep.com",
      role: "ADMIN",
      message: "Demo admin session activated",
      verificationStatus: "Verified",
    };
    saveAuth(demoData, true);
  };

  const forgotPassword = async (email: string): Promise<string> => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (otp: string, newPassword: string, email?: string): Promise<string> => {
    return await authService.resetPassword(otp, newPassword, email);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem("ai_interview_prep_token");
    localStorage.removeItem("ai_interview_prep_user");
    localStorage.removeItem("ai_interview_prep_demo");
  };

  const hasRole = (requiredRole: string): boolean => {
    if (!user || !user.role) return false;
    const normalizedUserRole = user.role.toUpperCase().replace("ROLE_", "");
    const normalizedReqRole = requiredRole.toUpperCase().replace("ROLE_", "");

    if (normalizedReqRole === "ADMIN") {
      return normalizedUserRole === "ADMIN";
    }
    if (normalizedReqRole === "STUDENT" || normalizedReqRole === "USER") {
      return normalizedUserRole === "STUDENT" || normalizedUserRole === "USER" || normalizedUserRole === "ADMIN";
    }
    return normalizedUserRole === normalizedReqRole;
  };

  const isAdmin = (): boolean => {
    return hasRole("ADMIN");
  };

  const setVerificationStatus = (newStatus: User["verificationStatus"]) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: User = { ...prev, verificationStatus: newStatus };
      try {
        localStorage.setItem("ai_interview_prep_user", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update stored auth user verificationStatus:", e);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isDemoMode,
        login,
        register,
        forgotPassword,
        resetPassword,
        loginDemoStudent,
        loginDemoAdmin,
        logout,
        hasRole,
        isAdmin,
        setVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
