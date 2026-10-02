import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppearance } from "@/context/AppearanceContext";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/common/Logo";
import { RoleBadge } from "@/components/common/RoleBadge";
import { Sparkles, Command, Sun, Moon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, loginDemoStudent, isDemoMode } = useAuth();
  const { isDark, toggleTheme } = useAppearance();
  const navigate = useNavigate();

  const handleDemoStudent = () => {
    loginDemoStudent();
    navigate("/dashboard");
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-surface border-b border-border select-none shadow-sm">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3.5 max-w-7xl mx-auto w-full">
        <Logo size="md" />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command palette tip */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-text-muted bg-surface-raised border border-border px-2.5 py-1 rounded-lg">
            <Command className="w-3 h-3 text-cyan-400" />
            <span>Press</span>
            <kbd className="bg-ink px-1 rounded text-text-secondary">Ctrl</kbd>
            <span>+</span>
            <kbd className="bg-ink px-1 rounded text-text-secondary">K</kbd>
          </div>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-cyan-400"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
          </Button>

          {isDemoMode && (
            <span className="hidden sm:inline-flex text-[10px] font-mono bg-cyan-400/15 text-cyan-400 border border-cyan-400/40 px-2.5 py-1 rounded-full items-center gap-1">
              <Sparkles className="w-3 h-3" /> DEMO MODE
            </span>
          )}

          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <RoleBadge role={user?.role} size="sm" />
                <span className="text-xs font-mono text-text-secondary">
                  Hi, <strong className="text-cyan-400 font-semibold">{user?.name}</strong>
                </span>
              </div>
              {user?.role === "ADMIN" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(window.location.pathname.startsWith("/admin") ? "/dashboard" : "/admin")}
                  className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                >
                  {window.location.pathname.startsWith("/admin") ? "Switch to Student View" : "Switch to Admin View"}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard")}
              >
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="teal-cyan" size="sm" onClick={handleDemoStudent} className="hidden sm:inline-flex">
                <Sparkles className="w-3.5 h-3.5" /> Try Demo
              </Button>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
