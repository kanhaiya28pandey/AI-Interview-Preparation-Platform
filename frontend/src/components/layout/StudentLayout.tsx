import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";

export const StudentLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-ink text-text-primary flex">
      {/* Sidebar */}
      <Sidebar isOpenMobile={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
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
