import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useAuth } from "./AuthContext";
import { getScopedItem, setScopedItem } from "@/lib/userScope";

export type ThemeMode = "dark" | "light" | "system";
export type AccentPreset = "cyan" | "violet" | "emerald" | "amber" | "rose";
export type BackgroundStyle = "mesh" | "orbs" | "particles" | "coderain" | "none";
export type MotionIntensity = "low" | "medium" | "high";
export type UiDensity = "normal" | "compact";
export type CornerRadius = "sharp" | "rounded" | "smooth";

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

export const CORNER_RADII: Record<CornerRadius, string> = {
  sharp: "6px",
  rounded: "12px",
  smooth: "18px",
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
  intensity: MotionIntensity;
  setIntensity: (intensity: MotionIntensity) => void;
  density: UiDensity;
  setDensity: (density: UiDensity) => void;
  glassEffects: boolean;
  setGlassEffects: (glass: boolean) => void;
  cornerRadius: CornerRadius;
  setCornerRadius: (radius: CornerRadius) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isThemeTransitioning: boolean;
  resetAppearanceToDefault: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

function applyThemeToDOM(isDarkTheme: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isDarkTheme) {
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", isDarkTheme ? "#0d1321" : "#f8fafc");
  }
}

const BG_STORAGE_KEY = "appearance.backgroundMotion";
const BG_FALLBACK_KEY = "pref_bg_style";
const INTENSITY_KEY = "appearance.intensity";
const ACCENT_STORAGE_KEY = "appearance.accent";
const REDUCED_STORAGE_KEY = "appearance.reducedEffects";
const DENSITY_KEY = "appearance.density";
const GLASS_KEY = "appearance.glass";
const RADIUS_KEY = "appearance.radius";

function getInitialBackgroundStyle(userId?: string | null): BackgroundStyle {
  if (typeof window === "undefined") return "orbs";
  try {
    const raw = localStorage.getItem(BG_STORAGE_KEY) || localStorage.getItem(BG_FALLBACK_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (["orbs", "mesh", "particles", "coderain", "none"].includes(parsed)) return parsed as BackgroundStyle;
      } catch {
        if (["orbs", "mesh", "particles", "coderain", "none"].includes(raw)) return raw as BackgroundStyle;
      }
    }
  } catch (e) {}

  // If user has OS prefers-reduced-motion, default to "none" on pristine state
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return "none";
    }
  } catch (e) {}

  return getScopedItem<BackgroundStyle>(userId, "pref_bg_style", "orbs");
}

function getInitialIntensity(): MotionIntensity {
  if (typeof window === "undefined") return "medium";
  try {
    const raw = localStorage.getItem(INTENSITY_KEY);
    if (raw === "low" || raw === "medium" || raw === "high") return raw;
  } catch (e) {}
  return "medium";
}

function getInitialAccent(userId?: string | null): AccentPreset {
  if (typeof window === "undefined") return "cyan";
  try {
    const raw = localStorage.getItem(ACCENT_STORAGE_KEY) || localStorage.getItem("pref_accent");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (["cyan", "violet", "emerald", "amber", "rose"].includes(parsed)) return parsed as AccentPreset;
      } catch {
        if (["cyan", "violet", "emerald", "amber", "rose"].includes(raw)) return raw as AccentPreset;
      }
    }
  } catch (e) {}
  return getScopedItem<AccentPreset>(userId, "pref_accent", "cyan");
}

function getInitialReducedEffects(userId?: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(REDUCED_STORAGE_KEY) || localStorage.getItem("pref_reduced_effects");
    if (raw !== null) {
      try {
        return JSON.parse(raw) === true;
      } catch {
        return raw === "true";
      }
    }
  } catch (e) {}
  const osReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return getScopedItem<boolean>(userId, "pref_reduced_effects", Boolean(osReduced));
}

function getInitialDensity(): UiDensity {
  if (typeof window === "undefined") return "normal";
  try {
    const raw = localStorage.getItem(DENSITY_KEY);
    if (raw === "compact" || raw === "normal") return raw;
  } catch (e) {}
  return "normal";
}

function getInitialGlass(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(GLASS_KEY);
    if (raw !== null) return raw === "true";
  } catch (e) {}
  return true;
}

function getInitialRadius(): CornerRadius {
  if (typeof window === "undefined") return "rounded";
  try {
    const raw = localStorage.getItem(RADIUS_KEY);
    if (raw === "sharp" || raw === "rounded" || raw === "smooth") return raw;
  } catch (e) {}
  return "rounded";
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.userId;

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return getScopedItem<ThemeMode>(userId, "pref_theme", "dark");
  });

  const [accent, setAccentState] = useState<AccentPreset>(() => {
    return getInitialAccent(userId);
  });

  const [reducedEffects, setReducedEffectsState] = useState<boolean>(() => {
    return getInitialReducedEffects(userId);
  });

  const [backgroundStyle, setBackgroundStyleState] = useState<BackgroundStyle>(() => {
    return getInitialBackgroundStyle(userId);
  });

  const [intensity, setIntensityState] = useState<MotionIntensity>(() => {
    return getInitialIntensity();
  });

  const [density, setDensityState] = useState<UiDensity>(() => {
    return getInitialDensity();
  });

  const [glassEffects, setGlassEffectsState] = useState<boolean>(() => {
    return getInitialGlass();
  });

  const [cornerRadius, setCornerRadiusState] = useState<CornerRadius>(() => {
    return getInitialRadius();
  });

  // Read initial theme mode directly from DOM (which was already set by index.html anti-flash script)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
             !document.documentElement.classList.contains("light");
    }
    return true;
  });

  const [isThemeTransitioning, setIsThemeTransitioning] = useState<boolean>(false);
  const isTransitioningRef = useRef(false);

  // Sync settings when userId changes (e.g. login/logout)
  useEffect(() => {
    if (userId) {
      const savedTheme = getScopedItem<ThemeMode>(userId, "pref_theme", "dark");
      setThemeState(savedTheme);
      setAccentState(getInitialAccent(userId));
      setReducedEffectsState(getInitialReducedEffects(userId));
      setBackgroundStyleState(getInitialBackgroundStyle(userId));

      let nextIsDark = savedTheme === "dark";
      if (savedTheme === "system") {
        nextIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      applyThemeToDOM(nextIsDark);
      setIsDark(nextIsDark);
    }
  }, [userId]);

  // Synchronized Theme Switcher
  const executeThemeSwitch = (nextMode: ThemeMode) => {
    let nextIsDark = true;
    if (nextMode === "system") {
      nextIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      nextIsDark = nextMode === "dark";
    }

    const prefersReducedMotion =
      reducedEffects ||
      (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    // Persist choice to user scope and global storage
    try {
      setScopedItem(userId, "pref_theme", nextMode);
      localStorage.setItem("pref_theme", JSON.stringify(nextMode));
      localStorage.setItem("appearance.theme", nextMode);
    } catch (err) {
      console.warn("[AppearanceContext] Failed to save theme:", err);
    }

    // Instant switch if user prefers reduced motion
    if (prefersReducedMotion) {
      applyThemeToDOM(nextIsDark);
      setIsDark(nextIsDark);
      setThemeState(nextMode);
      return;
    }

    // Lock toggle during 400ms transition
    isTransitioningRef.current = true;
    setIsThemeTransitioning(true);

    const doc = document as any;
    if (typeof doc.startViewTransition === "function") {
      try {
        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            applyThemeToDOM(nextIsDark);
            setIsDark(nextIsDark);
            setThemeState(nextMode);
          });
        });

        transition.finished.finally(() => {
          isTransitioningRef.current = false;
          setIsThemeTransitioning(false);
        });
        return;
      } catch (err) {
        console.warn("[AppearanceContext] startViewTransition error, falling back:", err);
      }
    }

    // Fallback: temporary .theme-transition class for browsers without View Transitions
    const root = document.documentElement;
    root.classList.add("theme-transition");
    applyThemeToDOM(nextIsDark);
    setIsDark(nextIsDark);
    setThemeState(nextMode);

    setTimeout(() => {
      root.classList.remove("theme-transition");
      isTransitioningRef.current = false;
      setIsThemeTransitioning(false);
    }, 400);
  };

  const setTheme = (mode: ThemeMode) => {
    executeThemeSwitch(mode);
  };

  const toggleTheme = () => {
    if (isTransitioningRef.current) return;
    const nextMode = isDark ? "light" : "dark";
    executeThemeSwitch(nextMode);
  };

  // Listen to OS system color scheme changes when mode is "system"
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      executeThemeSwitch("system");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme, userId, reducedEffects]);

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

  // Apply Background Style Data Attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bg-motion", backgroundStyle);
  }, [backgroundStyle]);

  // Apply Intensity Data Attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bg-intensity", intensity);
  }, [intensity]);

  // Apply Reduced Motion Data Attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-reduced-effects", String(reducedEffects));
  }, [reducedEffects]);

  // Apply Density Data Attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", density);
  }, [density]);

  // Apply Glass Effects Data Attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-glass", String(glassEffects));
  }, [glassEffects]);

  // Apply Corner Radius CSS variable
  useEffect(() => {
    const root = document.documentElement;
    const rVal = CORNER_RADII[cornerRadius] || "12px";
    root.style.setProperty("--radius", rVal);
  }, [cornerRadius]);

  const setAccent = (newAccent: AccentPreset) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
      localStorage.setItem("pref_accent", JSON.stringify(newAccent));
      setScopedItem(userId, "pref_accent", newAccent);
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save accent:", e);
    }
  };

  const setReducedEffects = (reduced: boolean) => {
    setReducedEffectsState(reduced);
    try {
      localStorage.setItem(REDUCED_STORAGE_KEY, String(reduced));
      localStorage.setItem("pref_reduced_effects", JSON.stringify(reduced));
      setScopedItem(userId, "pref_reduced_effects", reduced);
      document.documentElement.setAttribute("data-reduced-effects", String(reduced));
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save reduced effects:", e);
    }
  };

  const setBackgroundStyle = (style: BackgroundStyle) => {
    setBackgroundStyleState(style);
    try {
      localStorage.setItem(BG_STORAGE_KEY, style);
      localStorage.setItem(BG_FALLBACK_KEY, JSON.stringify(style));
      setScopedItem(userId, "pref_bg_style", style);
      document.documentElement.setAttribute("data-bg-motion", style);
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save background style:", e);
    }
  };

  const setIntensity = (newIntensity: MotionIntensity) => {
    setIntensityState(newIntensity);
    try {
      localStorage.setItem(INTENSITY_KEY, newIntensity);
      document.documentElement.setAttribute("data-bg-intensity", newIntensity);
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save intensity:", e);
    }
  };

  const setDensity = (newDensity: UiDensity) => {
    setDensityState(newDensity);
    try {
      localStorage.setItem(DENSITY_KEY, newDensity);
      document.documentElement.setAttribute("data-density", newDensity);
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save density:", e);
    }
  };

  const setGlassEffects = (glass: boolean) => {
    setGlassEffectsState(glass);
    try {
      localStorage.setItem(GLASS_KEY, String(glass));
      document.documentElement.setAttribute("data-glass", String(glass));
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save glass effects:", e);
    }
  };

  const setCornerRadius = (radius: CornerRadius) => {
    setCornerRadiusState(radius);
    try {
      localStorage.setItem(RADIUS_KEY, radius);
      const rVal = CORNER_RADII[radius] || "12px";
      document.documentElement.style.setProperty("--radius", rVal);
    } catch (e) {
      console.warn("[AppearanceContext] Failed to save radius:", e);
    }
  };

  const resetAppearanceToDefault = () => {
    executeThemeSwitch("dark");
    setAccent("cyan");
    setBackgroundStyle("orbs");
    setIntensity("medium");
    setDensity("normal");
    setGlassEffects(true);
    setCornerRadius("rounded");
    setReducedEffects(false);
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
        intensity,
        setIntensity,
        density,
        setDensity,
        glassEffects,
        setGlassEffects,
        cornerRadius,
        setCornerRadius,
        isDark,
        toggleTheme,
        isThemeTransitioning,
        resetAppearanceToDefault,
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

export default AppearanceProvider;
