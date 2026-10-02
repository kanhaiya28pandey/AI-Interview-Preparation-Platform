import React, { createContext, useContext, useState } from "react";

interface PreviewModeContextType {
  isPreviewMode: boolean;
  togglePreviewMode: () => void;
  setPreviewMode: (val: boolean) => void;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

export const PreviewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const togglePreviewMode = () => setIsPreviewMode((prev) => !prev);

  return (
    <PreviewModeContext.Provider value={{ isPreviewMode, togglePreviewMode, setPreviewMode: setIsPreviewMode }}>
      {children}
    </PreviewModeContext.Provider>
  );
};

export const usePreviewMode = () => {
  const context = useContext(PreviewModeContext);
  if (!context) {
    return { isPreviewMode: false, togglePreviewMode: () => {}, setPreviewMode: () => {} };
  }
  return context;
};
