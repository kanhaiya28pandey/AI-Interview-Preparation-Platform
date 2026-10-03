import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";

export const VerifiedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const { status, isLoading: isVerificationLoading } = useVerificationStatus();

  // Frontend gating is for UX only. The backend must also reject API calls from unverified users.
  if (isAuthLoading || isVerificationLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
          <span className="font-mono text-xs text-text-muted">Checking student verification status...</span>
        </div>
      </div>
    );
  }

  if (status !== "Verified") {
    return <Navigate to="/verify-identity" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
