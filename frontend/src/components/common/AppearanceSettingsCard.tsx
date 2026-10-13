import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  useAppearance,
  AccentPreset,
  ThemeMode,
  BackgroundStyle,
  MotionIntensity,
  UiDensity,
  CornerRadius,
  CORNER_RADII,
} from "@/context/AppearanceContext";
import { useTour } from "@/context/TourContext";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Sparkles,
  EyeOff,
  Layers,
  RotateCcw,
  Check,
  Info,
  Sliders,
  Maximize2,
  Minimize2,
  Box,
} from "lucide-react";
import { toast } from "sonner";

export const AppearanceSettingsCard: React.FC = () => {
  const tourCtx = (() => {
    try {
      return useTour();
    } catch {
      return null;
    }
  })();

  const {
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
    resetAppearanceToDefault,
  } = useAppearance();

  const [osReducedMotion, setOsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      setOsReducedMotion(mql.matches);
      const handler = (e: MediaQueryListEvent) => setOsReducedMotion(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, []);

  const themes: { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "dark", label: "Dark Space", icon: Moon },
    { id: "light", label: "Clean Light", icon: Sun },
    { id: "system", label: "System Sync", icon: Monitor },
  ];

  const accents: { id: AccentPreset; name: string; colorHex: string }[] = [
    { id: "cyan", name: "Cyan Teal", colorHex: "#22d3ee" },
    { id: "violet", name: "Electric Violet", colorHex: "#a78bfa" },
    { id: "emerald", name: "Cyber Emerald", colorHex: "#34d399" },
    { id: "amber", name: "Solar Amber", colorHex: "#fbbf24" },
    { id: "rose", name: "Neon Rose", colorHex: "#fb7185" },
  ];

  const bgStyles: { id: BackgroundStyle; label: string; desc: string }[] = [
    { id: "orbs", label: "Soft Orbs", desc: "Large drifting colorful blurred blobs" },
    { id: "mesh", label: "Gradient Mesh", desc: "Vibrant multi-color radial gradient glow" },
    { id: "particles", label: "Code Particles", desc: "Lightweight floating code symbols and glyphs" },
    { id: "coderain", label: "Code Rain", desc: "Matrix-style code characters falling on canvas" },
    { id: "none", label: "Minimal (None)", desc: "Solid theme background without decorative layers" },
  ];

  const intensities: { id: MotionIntensity; label: string; desc: string }[] = [
    { id: "low", label: "Subtle (Low)", desc: "65% opacity, fewer particles" },
    { id: "medium", label: "Balanced (Medium)", desc: "Standard 100% vibrant motion" },
    { id: "high", label: "Vivid (High)", desc: "145% opacity, dense particles" },
  ];

  const cornerRadii: { id: CornerRadius; label: string }[] = [
    { id: "sharp", label: "Sharp (6px)" },
    { id: "rounded", label: "Rounded (12px)" },
    { id: "smooth", label: "Smooth (18px)" },
  ];

  // Keyboard navigation for radio groups
  const handleBgKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % bgStyles.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + bgStyles.length) % bgStyles.length;
    } else {
      return;
    }
    const nextStyle = bgStyles[nextIndex];
    setBackgroundStyle(nextStyle.id);
    toast.success("Background updated: " + nextStyle.label, { id: "bg-toast", duration: 1800 });
    const nextEl = document.getElementById(`bg-style-${nextStyle.id}`);
    if (nextEl) nextEl.focus();
  };

  const handleSelectBackground = (item: (typeof bgStyles)[number]) => {
    setBackgroundStyle(item.id);
    toast.success("Background updated: " + item.label, { id: "bg-toast", duration: 1800 });
  };

  const handleSelectIntensity = (item: (typeof intensities)[number]) => {
    setIntensity(item.id);
    toast.success("Motion intensity: " + item.label, { id: "intensity-toast", duration: 1800 });
  };

  const handleSelectTheme = (t: (typeof themes)[number]) => {
    setTheme(t.id);
    toast.success("Theme mode updated: " + t.label, { id: "theme-toast", duration: 1800 });
  };

  const handleSelectAccent = (acc: (typeof accents)[number]) => {
    setAccent(acc.id);
    toast.success("Accent color updated: " + acc.name, { id: "accent-toast", duration: 1800 });
  };

  const handleToggleGlass = () => {
    const next = !glassEffects;
    setGlassEffects(next);
    toast.success(next ? "Frosted glass cards enabled" : "Solid opaque cards enabled", {
      id: "glass-toast",
      duration: 1800,
    });
  };

  const handleToggleDensity = () => {
    const next: UiDensity = density === "compact" ? "normal" : "compact";
    setDensity(next);
    toast.success(next === "compact" ? "Compact workspace density enabled" : "Standard workspace density enabled", {
      id: "density-toast",
      duration: 1800,
    });
  };

  const handleSelectRadius = (r: (typeof cornerRadii)[number]) => {
    setCornerRadius(r.id);
    toast.success("Corner radius updated: " + r.label, { id: "radius-toast", duration: 1800 });
  };

  const handleToggleReducedEffects = () => {
    const next = !reducedEffects;
    setReducedEffects(next);
    toast.success(next ? "Visual effects & motion reduced" : "Full visual effects enabled", {
      id: "reduced-toast",
      duration: 1800,
    });
  };

  const handleResetToDefault = () => {
    resetAppearanceToDefault();
    toast.success("Appearance reset to default settings", { id: "reset-toast", duration: 2000 });
  };

  return (
    <Card className="p-6 space-y-6 bg-surface border-border shadow-soft">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent-bright" /> Visual Appearance & Effects
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Personalize your workspace palette, lighting, background motion, fusion glass, and accessibility effects.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-surface-raised border border-border text-text-muted rounded-full">
          Instant Sync
        </span>
      </div>

      {/* 1. THEME MODE */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block font-mono">
          Theme Mode
        </label>
        <div
          role="radiogroup"
          aria-label="Theme Mode"
          className="grid grid-cols-3 gap-3"
        >
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                id={`theme-mode-${t.id}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                type="button"
                onClick={() => handleSelectTheme(t)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "bg-surface-raised border-accent-bright text-accent-bright shadow-[0_0_15px_var(--accent-glow)] font-semibold"
                    : "bg-surface border-border text-text-muted hover:border-border-strong hover:text-text-primary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACCENT COLOR PALETTE */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block font-mono">
          Accent Preset
        </label>
        <div
          role="radiogroup"
          aria-label="Accent Preset"
          className="grid grid-cols-2 sm:grid-cols-5 gap-2.5"
        >
          {accents.map((acc) => {
            const isSelected = accent === acc.id;
            return (
              <button
                key={acc.id}
                id={`accent-preset-${acc.id}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                type="button"
                onClick={() => handleSelectAccent(acc)}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "bg-surface-raised border-accent-bright text-text-primary shadow-sm"
                    : "bg-surface border-border text-text-secondary hover:border-border-strong"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm transition-transform"
                  style={{
                    backgroundColor: acc.colorHex,
                    transform: isSelected ? "scale(1.2)" : "scale(1)",
                  }}
                />
                <span className="text-xs font-medium truncate">{acc.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-accent-bright ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BACKGROUND AMBIENCE STYLE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent-bright" /> Background Motion Style
          </label>
          <span className="text-[10px] text-text-muted font-mono">Live Preview</span>
        </div>

        {osReducedMotion && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Operating system reduced motion is active. Motion is minimized by default, but you can choose another style manually.</span>
          </div>
        )}

        <div
          role="radiogroup"
          aria-label="Background Motion Style"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {bgStyles.map((b, idx) => {
            const isSelected = backgroundStyle === b.id;
            return (
              <button
                key={b.id}
                id={`bg-style-${b.id}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                type="button"
                onKeyDown={(e) => handleBgKeyDown(e, idx)}
                onClick={() => handleSelectBackground(b)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "bg-surface-raised border-accent-bright text-text-primary shadow-[0_0_15px_var(--accent-glow)] ring-1 ring-accent-bright/40"
                    : "bg-surface border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? "text-accent-bright font-bold" : "text-text-primary"
                    }`}
                  >
                    {b.label}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-bright">
                      <Sparkles className="w-3.5 h-3.5 text-accent-bright" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">{b.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BACKGROUND MOTION INTENSITY */}
      <div className="space-y-2 p-4 bg-surface-raised/40 border border-border rounded-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-accent-bright" /> Motion Intensity
          </label>
          <span className="text-[10px] text-text-muted font-mono capitalize">{intensity} Mode</span>
        </div>
        <p className="text-[11px] text-text-muted">
          Adjust the visual opacity and particle density of background effects live.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {intensities.map((item) => {
            const isSelected = intensity === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectIntensity(item)}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "bg-surface-raised border-accent-bright text-accent-bright font-semibold shadow-sm"
                    : "bg-surface border-border text-text-muted hover:border-border-strong hover:text-text-primary"
                }`}
              >
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-[10px] text-text-muted mt-0.5 hidden sm:block">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. FUSION EFFECTS & UI DENSITY */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block font-mono">
          Fusion Effects & Layout Density
        </label>

        {/* 5a. Glassmorphism Toggle */}
        <div className="p-3.5 bg-surface-raised/50 border border-border rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <Box className="w-4 h-4 text-text-muted" />
              <span>Frosted Glass Morphism</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Applies backdrop blur and semi-transparent glass layering to dashboard cards.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={glassEffects}
            onClick={handleToggleGlass}
            className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              glassEffects ? "bg-accent-bright" : "bg-surface border border-border"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-ink transition-transform shadow-md ${
                glassEffects ? "translate-x-5.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* 5b. Workspace Density Toggle */}
        <div className="p-3.5 bg-surface-raised/50 border border-border rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              {density === "compact" ? <Minimize2 className="w-4 h-4 text-accent-bright" /> : <Maximize2 className="w-4 h-4 text-text-muted" />}
              <span>Compact Workspace Density</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Reduces padding and card spacing for higher data density on large displays.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={density === "compact"}
            onClick={handleToggleDensity}
            className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              density === "compact" ? "bg-accent-bright" : "bg-surface border border-border"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-ink transition-transform shadow-md ${
                density === "compact" ? "translate-x-5.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* 5c. Corner Radius Selector */}
        <div className="p-3.5 bg-surface-raised/50 border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">Corner Radius Geometry</span>
            <span className="text-[10px] text-text-muted font-mono">{CORNER_RADII[cornerRadius]}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {cornerRadii.map((r) => {
              const isSelected = cornerRadius === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectRadius(r)}
                  className={`py-2 px-3 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-raised border-accent-bright text-accent-bright font-semibold shadow-sm"
                      : "bg-surface border-border text-text-muted hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. REDUCE MOTION & EFFECTS TOGGLE */}
      <div className="p-4 bg-surface-raised/70 border border-border rounded-xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <EyeOff className="w-4 h-4 text-text-muted" />
            <span>Reduce Effects & Heavy Motion</span>
          </div>
          <p className="text-[11px] text-text-muted">
            Disables 3D tilt, confetti bursts, cursor glow, and heavy animations for maximum performance or motion sensitivity.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={reducedEffects}
          onClick={handleToggleReducedEffects}
          className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            reducedEffects ? "bg-accent-bright" : "bg-surface border border-border"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-ink transition-transform shadow-md ${
              reducedEffects ? "translate-x-5.5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 7. REPLAY GUIDED TOUR */}
      {tourCtx && (
        <div className="p-4 bg-surface-raised/70 border border-border rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <RotateCcw className="w-4 h-4 text-text-muted" />
              <span>Replay Guided Tour</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Walk through the key features again with the guided product tour.
            </p>
          </div>
          <button
            type="button"
            onClick={() => tourCtx.startTour()}
            className="px-4 py-1.5 bg-accent text-ink rounded-lg text-xs font-semibold hover:bg-accent-bright transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          >
            Start Tour
          </button>
        </div>
      )}

      {/* 8. RESET TO DEFAULTS */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-text-primary block">Reset Appearance Settings</span>
          <span className="text-[11px] text-text-muted block">
            Restore Dark Space, Cyan Teal accent, Soft Orbs background, medium intensity, and standard styling.
          </span>
        </div>
        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-3.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Defaults
        </button>
      </div>
    </Card>
  );
};

export default AppearanceSettingsCard;
