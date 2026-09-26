import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
      <Sidebar isAdmin={true} isOpenMobile={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} title={getTitle()} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
