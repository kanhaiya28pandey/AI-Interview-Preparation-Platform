import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useAppearance } from "@/context/AppearanceContext";
import { FloatingOrbs, ParticleField, GradientMesh, CodeRain } from "@/components/fx";

const STORAGE_KEY = "sidebar_collapsed_admin";

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

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
      case "/admin": return "Admin Dashboard Overview";
      case "/admin/content": return "Content Manager Hub";
      case "/admin/users": return "User Management";
      case "/admin/coding-tests": return "Coding Tests Management";
      case "/admin/taxonomy": return "Domains & Topics Taxonomy";
      case "/admin/mock-interviews": return "Mock Interview Track Configs";
      case "/admin/articles": return "Articles CMS";
      case "/admin/reports": return "Analytics & Reports";
      case "/admin/settings": return "Platform Settings";
      default: return "Admin Portal";
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

      {/*
       * Sidebar: h-full fills the shell exactly — its background always
       * reaches the bottom edge of the viewport, at every page length.
       */}
      <Sidebar
        isAdmin={true}
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
            <ErrorBoundary fallbackTitle="Admin Section Error" fallbackMessage="An error occurred while rendering this admin view.">
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
