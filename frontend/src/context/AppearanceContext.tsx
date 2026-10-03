import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";

export type ThemeMode = "dark" | "light" | "system";
export type AccentPreset = "cyan" | "violet" | "emerald" | "amber" | "rose";
export type BackgroundStyle = "mesh" | "orbs" | "particles" | "coderain" | "none";

interface AccentConfig {
  name: string;
  accent: string;
  accentBright: string;
  accentGlow: string;
  primaryClass: string;
}

export const ACCENT_PRESETS: Record<AccentPreset, AccentConfig> = {
  cyan: {
    name: "Cyan & Teal",
    accent: "#14b8a6",
    accentBright: "#22d3ee",
    accentGlow: "rgba(34, 211, 238, 0.35)",
    primaryClass: "text-cyan-400 bg-cyan-500",
  },
  violet: {
    name: "Electric Violet",
    accent: "#8b5cf6",
    accentBright: "#a78bfa",
    accentGlow: "rgba(167, 139, 250, 0.35)",
    primaryClass: "text-violet-400 bg-violet-500",
  },
  emerald: {
    name: "Cyber Emerald",
    accent: "#10b981",
    accentBright: "#34d399",
    accentGlow: "rgba(52, 211, 153, 0.35)",
    primaryClass: "text-emerald-400 bg-emerald-500",
  },
  amber: {
    name: "Solar Amber",
    accent: "#f59e0b",
    accentBright: "#fbbf24",
    accentGlow: "rgba(251, 191, 36, 0.35)",
    primaryClass: "text-amber-400 bg-amber-500",
  },
  rose: {
    name: "Neon Rose",
    accent: "#f43f5e",
    accentBright: "#fb7185",
    accentGlow: "rgba(251, 113, 133, 0.35)",
    primaryClass: "text-rose-400 bg-rose-500",
  },
};

interface AppearanceContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  accent: AccentPreset;
  setAccent: (accent: AccentPreset) => void;
  reducedEffects: boolean;
  setReducedEffects: (reduced: boolean) => void;
  backgroundStyle: BackgroundStyle;
  setBackgroundStyle: (style: BackgroundStyle) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.userId;

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return getScopedItem<ThemeMode>(userId, "pref_theme", "dark");
  });

  const [accent, setAccentState] = useState<AccentPreset>(() => {
    return getScopedItem<AccentPreset>(userId, "pref_accent", "cyan");
  });

  const [reducedEffects, setReducedEffectsState] = useState<boolean>(() => {
    const osReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return getScopedItem<boolean>(userId, "pref_reduced_effects", osReduced);
  });

  const [backgroundStyle, setBackgroundStyleState] = useState<BackgroundStyle>(() => {
    return getScopedItem<BackgroundStyle>(userId, "pref_bg_style", "orbs");
  });

  const [isDark, setIsDark] = useState<boolean>(true);

  // Sync settings when userId changes (e.g. login/logout)
  useEffect(() => {
    if (userId) {
      setThemeState(getScopedItem<ThemeMode>(userId, "pref_theme", "dark"));
      setAccentState(getScopedItem<AccentPreset>(userId, "pref_accent", "cyan"));
      const osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReducedEffectsState(getScopedItem<boolean>(userId, "pref_reduced_effects", osReduced));
      setBackgroundStyleState(getScopedItem<BackgroundStyle>(userId, "pref_bg_style", "orbs"));
    }
  }, [userId]);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    let effectiveDark = true;

    if (theme === "system") {
      effectiveDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      effectiveDark = theme === "dark";
    }

    setIsDark(effectiveDark);
    if (effectiveDark) {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  // Apply Accent Colors
  useEffect(() => {
    const root = document.documentElement;
    const config = ACCENT_PRESETS[accent] || ACCENT_PRESETS.cyan;

    root.style.setProperty("--accent", config.accent);
    root.style.setProperty("--accent-bright", config.accentBright);
    root.style.setProperty("--accent-glow", config.accentGlow);
    root.style.setProperty("--gold", config.accentBright);
    root.style.setProperty("--gold-soft", config.accent);
  }, [accent]);

  // Apply Reduced Motion Data Attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-reduced-effects", String(reducedEffects));
  }, [reducedEffects]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    setScopedItem(userId, "pref_theme", mode);
  };

  const setAccent = (newAccent: AccentPreset) => {
    setAccentState(newAccent);
    setScopedItem(userId, "pref_accent", newAccent);
  };

  const setReducedEffects = (reduced: boolean) => {
    setReducedEffectsState(reduced);
    setScopedItem(userId, "pref_reduced_effects", reduced);
  };

  const setBackgroundStyle = (style: BackgroundStyle) => {
    setBackgroundStyleState(style);
    setScopedItem(userId, "pref_bg_style", style);
  };

  const toggleTheme = () => {
    const nextMode = isDark ? "light" : "dark";
    setTheme(nextMode);
  };

  return (
    <AppearanceContext.Provider
      value={{
        theme,
        setTheme,
        accent,
        setAccent,
        reducedEffects,
        setReducedEffects,
        backgroundStyle,
        setBackgroundStyle,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = (): AppearanceContextType => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
};
