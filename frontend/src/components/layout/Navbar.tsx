import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppearance } from "@/context/AppearanceContext";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/common/Logo";
import { RoleBadge } from "@/components/common/RoleBadge";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { Sun, Moon, Search, ArrowLeft } from "lucide-react";

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme, isThemeTransitioning } = useAppearance();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border/80 select-none shadow-sm">
      {mobileSearchOpen ? (
        <div className="flex items-center px-4 sm:px-6 max-w-[1600px] mx-auto w-full py-3 gap-2 animate-in fade-in duration-150">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-text-secondary hover:text-cyan-400 shrink-0 cursor-pointer"
            aria-label="Back to page"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <GlobalSearch
            className="flex-1 min-w-0"
            autoFocus
            onClose={() => setMobileSearchOpen(false)}
          />
        </div>
      ) : (
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto w-full py-3.5 gap-4">
          {/* Brand Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* Global Clickable Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <GlobalSearch className="w-full" />
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Button */}
            <Button
              id="navbar-mobile-search-btn"
              variant="ghost"
              size="sm"
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2 text-text-secondary hover:text-teal-600 dark:hover:text-teal-300 shrink-0 cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-teal-600 dark:text-teal-300" />
            </Button>

          {/* Theme Toggle Button */}
          <Button
            id="navbar-theme-toggle-btn"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.currentTarget.blur();
              toggleTheme();
            }}
            disabled={isThemeTransitioning}
            className="p-2 text-text-secondary hover:text-cyan-400 group relative cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
                  isDark
                    ? "rotate-0 opacity-100 scale-100 text-amber-400"
                    : "-rotate-90 opacity-0 scale-50 pointer-events-none text-amber-400"
                }`}
              >
                <Sun className="w-4 h-4" />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
                  !isDark
                    ? "rotate-0 opacity-100 scale-100 text-cyan-500"
                    : "rotate-90 opacity-0 scale-50 pointer-events-none text-cyan-500"
                }`}
              >
                <Moon className="w-4 h-4" />
              </span>
            </div>
          </Button>

          {isAuthenticated ? (
            <>
              <div className="hidden lg:flex items-center gap-2">
                <RoleBadge role={user?.role} size="sm" />
                <span className="text-xs font-mono text-text-secondary">
                  Hi, <strong className="text-cyan-400 font-semibold">{user?.name}</strong>
                </span>
              </div>
              {user?.role === "ADMIN" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(
                      window.location.pathname.startsWith("/admin")
                        ? "/dashboard"
                        : "/admin"
                    )
                  }
                  className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                >
                  {window.location.pathname.startsWith("/admin")
                    ? "Student View"
                    : "Admin View"}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard")
                }
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden sm:inline-flex"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hover:text-cyan-400">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    )}
  </header>
  );
};

export default Navbar;
