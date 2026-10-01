import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";
import { usePreviewMode } from "@/context/PreviewModeContext";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";

const STORAGE_KEY = "sidebar_collapsed_admin";

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isPreviewMode, togglePreviewMode } = usePreviewMode();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();

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
      case "/admin/users": return "User Management";
      case "/admin/coding-tests": return "Coding Tests Management";
      case "/admin/mock-interviews": return "Mock Interview Track Configs";
      case "/admin/articles": return "Articles CMS";
      case "/admin/reports": return "Analytics & Reports";
      case "/admin/settings": return "Platform Settings";
      default: return "Admin Portal";
    }
  };

  return (
    <div className="min-h-screen bg-ink text-text-primary flex">
      <Sidebar
        isAdmin={true}
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {isPreviewMode && (
          <div className="bg-cyan-500/20 border-b border-cyan-500/40 px-4 py-2 text-xs font-mono text-cyan-300 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Previewing as Regular User — Exit to return to admin mode</span>
            </div>
            <Button variant="outline" size="sm" onClick={togglePreviewMode} className="py-0.5 text-xs h-auto font-mono">
              Exit Preview Mode
            </Button>
          </div>
        )}
        <Topbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          title={getTitle()}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapsed}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

