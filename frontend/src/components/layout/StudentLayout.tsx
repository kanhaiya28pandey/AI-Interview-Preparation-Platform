import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useAppearance } from "@/context/AppearanceContext";
import { FloatingOrbs, ParticleField, GradientMesh, CodeRain } from "@/components/fx";
import { useAuth } from "@/context/AuthContext";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "sidebar_collapsed_student";

export const StudentLayout: React.FC = () => {
  const { isDemoMode, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status: verifStatus } = useVerificationStatus();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const isVerified = isAdmin() || isDemoMode || verifStatus === "Verified";

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // On every route change: scroll the content panel to top and focus it so
  // keyboard users (PageDown / Space / Home / End) can scroll immediately.
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0 });
      mainRef.current.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    const handleCustomToggle = () => {
      toggleCollapsed();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-sidebar", handleCustomToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-sidebar", handleCustomToggle);
    };
  }, []);

  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Student Dashboard";
      case "/practice": return "Practice Tracks";
      case "/coding": return "Coding Arena";
      case "/mock-interview": return "AI Mock Interview";
      case "/quiz": return "MCQ Quizzes";
      case "/articles": return "Articles & Guides";
      case "/leaderboard": return "Campus Leaderboard";
      case "/profile": return "My Profile";
      case "/settings": return "Settings";
      default: return "Dashboard";
    }
  };

  const { backgroundStyle } = useAppearance();

  return (
    /*
     * app-shell: overflow-hidden locks the document — the browser NEVER gets
     * a scrollbar on the window. Only .app-scroll (the <main>) scrolls.
     * h-dvh: fills the visual viewport on mobile (avoids toolbar overlap).
     */
    <div className="app-shell h-dvh bg-ink text-text-primary flex relative">
      {/* Decorative background FX — pointer-events-none, behind everything */}
      {backgroundStyle === "orbs" && <FloatingOrbs count={3} />}
      {backgroundStyle === "particles" && <ParticleField />}
      {backgroundStyle === "mesh" && <GradientMesh />}
      {backgroundStyle === "coderain" && <CodeRain />}

      {/* Sidebar */}
      <Sidebar
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
      />

      {/* Right column: fills remaining width, constrained to shell height */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Topbar: shrink-0 keeps it at its natural height, no sticky needed */}
        <Topbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          title={getTitle()}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapsed}
        />

        {/* Verification Status Banner for Unverified Students */}
        {!isVerified && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {verifStatus === "Pending Verification" ? (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="truncate">
                <strong className="font-semibold text-amber-300">Verification pending — features locked.</strong>{" "}
                <span className="hidden sm:inline">
                  {verifStatus === "Pending Verification"
                    ? "Your College ID submission is under review by campus administrators."
                    : "Please verify your student identity with your College ID to unlock all platform tools."}
                </span>
              </span>
            </div>
            {location.pathname !== "/verify-identity" && (
              <Link
                to="/verify-identity"
                className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-100 text-[11px] underline underline-offset-2 shrink-0"
              >
                {verifStatus === "Pending Verification" ? "Check Status" : "Verify Identity"} <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}

        {/*
         * THE ONLY scroll container in the logged-in shell.
         * flex-1 min-h-0: fills leftover height without overflowing flex parent.
         * app-scroll: overflow-y-auto + overscroll-contain + thin scrollbar.
         * tabIndex={-1} + outline-none: focus target for keyboard scrolling.
         */}
        <main
          ref={mainRef}
          tabIndex={-1}
          className="app-scroll flex-1 min-h-0 p-4 sm:p-8 relative z-10 outline-none"
        >
          <div className="max-w-7xl w-full mx-auto">
            <ErrorBoundary fallbackTitle="Student Section Error" fallbackMessage="An error occurred while loading this view.">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
