import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft, LayoutDashboard, Compass, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GradientMesh, FloatingOrbs } from "@/components/fx";
import { useAuth } from "@/context/AuthContext";

export const NotFound: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const isInAdminArea = location.pathname.startsWith("/admin") || isAdmin();

  return (
    <div className="relative min-h-screen bg-transparent text-text-primary flex items-center justify-center p-6 overflow-hidden z-10">

      <div className="relative z-10 text-center max-w-lg p-8 sm:p-10 rounded-3xl bg-surface/80 border border-cyan-400/30 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto bg-cyan-400/15 border border-cyan-400/30 rounded-2xl text-cyan-400 flex items-center justify-center shadow-lg">
          <FileQuestion className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Error 404 · Destination Missing
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
            {isInAdminArea ? "Admin Resource Not Found" : "Lost in the Codebase?"}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
            {isInAdminArea
              ? "This administrative management panel or endpoint does not exist or has been relocated."
              : "The page or placement resource you are looking for does not exist, has been archived, or was moved."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isInAdminArea ? (
            <>
              <Link to="/admin">
                <Button variant="primary" size="sm" className="font-semibold shadow-md">
                  <LayoutDashboard className="w-4 h-4" /> Admin Overview
                </Button>
              </Link>
              <Link to="/admin/students">
                <Button variant="outline" size="sm" className="hover:border-cyan-400/50">
                  <Users className="w-4 h-4 text-cyan-400" /> Candidate Profiles
                </Button>
              </Link>
              <Link to="/admin/content">
                <Button variant="ghost" size="sm" className="hover:text-cyan-400">
                  <Shield className="w-4 h-4" /> Content Manager
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <Button variant="primary" size="sm" className="font-semibold shadow-md">
                  <Home className="w-4 h-4" /> Go to Homepage
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="hover:border-cyan-400/50">
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Dashboard
                </Button>
              </Link>
              <Link to="/practice">
                <Button variant="ghost" size="sm" className="hover:text-cyan-400">
                  <Compass className="w-4 h-4" /> Practice Tracks
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
