import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, requiredRole }) => {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!hasRole(requiredRole)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
