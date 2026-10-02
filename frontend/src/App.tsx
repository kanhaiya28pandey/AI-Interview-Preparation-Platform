import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PreviewModeProvider } from "@/context/PreviewModeContext";
import { AdminStoreProvider } from "@/context/AdminStoreContext";
import { AppearanceProvider } from "@/context/AppearanceContext";
import { TourProvider } from "@/context/TourContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "sonner";

import {
  TopProgressBar,
  CursorGlow,
  QuickActions,
  AIHelperBubble,
  ScrollProgress,
  CoachMark,
} from "@/components/fx";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppearanceProvider>
          <AdminStoreProvider>
            <TourProvider>
              <PreviewModeProvider>
                {/* Route-change progress bar (top, fixed) */}
                <TopProgressBar />

                {/* Cursor glow blob following pointer */}
                <CursorGlow />

                {/* Scroll progress bar + back-to-top */}
                <ScrollProgress />

                {/* All routes */}
                <AppRoutes />

                {/* Guided tour coach marks */}
                <CoachMark />

                {/* Floating quick-action launcher */}
                <QuickActions />

                {/* AI helper inactivity bubble */}
                <AIHelperBubble />

                <Toaster
                  position="top-right"
                  theme="dark"
                  richColors
                />
              </PreviewModeProvider>
            </TourProvider>
          </AdminStoreProvider>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;