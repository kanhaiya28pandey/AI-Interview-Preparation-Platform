import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AdminStoreProvider } from "@/context/AdminStoreContext";
import { AppearanceProvider } from "@/context/AppearanceContext";
import { TourProvider } from "@/context/TourContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "sonner";
import { ErrorBoundary, setupGlobalErrorListeners } from "@/components/common/ErrorBoundary";
import { AICopilot } from "@/components/common/AICopilot";
import {
  TopProgressBar,
  CursorGlow,
  QuickActions,
  ScrollProgress,
  CoachMark,
  AppBackground,
} from "@/components/fx";

export const App: React.FC = () => {
  useEffect(() => {
    const cleanup = setupGlobalErrorListeners();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary fallbackTitle="Application Error" fallbackMessage="A critical error occurred in the application.">
        <AuthProvider>
          <NotificationProvider>
            <AppearanceProvider>
              <AdminStoreProvider>
                <TourProvider>
                  {/* Route-change progress bar (top, fixed) */}
                  <TopProgressBar />
                  {/* Global ambient background layer (reactive to theme and settings) */}
                  <AppBackground />
                  {/* Cursor glow blob following pointer */}
                  <CursorGlow />
                  {/* Scroll progress bar + back-to-top (reads from .app-scroll) */}
                  <ScrollProgress />
                  {/* All routes */}
                  <AppRoutes />
                  {/* Guided tour coach marks (portal-rendered) */}
                  <CoachMark />
                  {/* Single Working AI Copilot assistant */}
                  <AICopilot />
                  <Toaster position="top-right" theme="dark" richColors />
                </TourProvider>
              </AdminStoreProvider>
            </AppearanceProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
