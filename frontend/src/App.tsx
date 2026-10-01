import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PreviewModeProvider } from "@/context/PreviewModeContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "sonner";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PreviewModeProvider>
          <AppRoutes />
          <Toaster position="top-right" theme="dark" richColors />
        </PreviewModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
