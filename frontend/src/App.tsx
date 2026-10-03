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
import {
  TopProgressBar,
  CursorGlow,
  QuickActions,
  AIHelperBubble,
  ScrollProgress,
  CoachMark,
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
                  {/* Cursor glow blob following pointer */}
                  <CursorGlow />
                  {/* Scroll progress bar + back-to-top (reads from .app-scroll) */}
                  <ScrollProgress />
                  {/* All routes */}
                  <AppRoutes />
                  {/* Guided tour coach marks (portal-rendered) */}
                  <CoachMark />
                  {/* Floating quick-action launcher */}
                  <QuickActions />
                  {/* AI helper inactivity bubble */}
                  <AIHelperBubble />
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
