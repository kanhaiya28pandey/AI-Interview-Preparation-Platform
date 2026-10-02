import React from "react";
import { Card } from "@/components/ui/Card";
import { useAppearance, ACCENT_PRESETS, AccentPreset, ThemeMode, BackgroundStyle } from "@/context/AppearanceContext";
import { useTour } from "@/context/TourContext";
import { Sun, Moon, Monitor, Palette, Sparkles, Wand2, EyeOff, Layers, RotateCcw } from "lucide-react";

export const AppearanceSettingsCard: React.FC = () => {
  const tourCtx = (() => { try { return useTour(); } catch { return null; } })();

  const {
    theme,
    setTheme,
    accent,
    setAccent,
    reducedEffects,
    setReducedEffects,
    backgroundStyle,
    setBackgroundStyle,
  } = useAppearance();

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
    { id: "orbs", label: "Soft Orbs", desc: "Gentle drifting color blobs" },
    { id: "mesh", label: "Gradient Mesh", desc: "Subtle multi-color background glow" },
    { id: "particles", label: "Code Particles", desc: "Lightweight floating code symbols" },
    { id: "coderain", label: "Code Rain", desc: "Matrix-style code symbols drifting downward" },
    { id: "none", label: "Minimal (None)", desc: "Solid background without decorative layers" },
  ];

  return (
    <Card className="p-6 space-y-6 bg-surface border-border shadow-soft">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-lg font-medium text-text-primary flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent-bright" /> Visual Appearance & Effects
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Personalize your workspace palette, lighting, background motion, and accessibility effects.
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
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {accents.map((acc) => {
            const isSelected = accent === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccent(acc.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
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
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BACKGROUND AMBIENCE STYLE */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block font-mono flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent-bright" /> Background Motion Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bgStyles.map((b) => {
            const isSelected = backgroundStyle === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBackgroundStyle(b.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-surface-raised border-accent-bright text-text-primary shadow-sm"
                    : "bg-surface border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isSelected ? "text-accent-bright" : "text-text-primary"}`}>
                    {b.label}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-accent-bright" />}
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">{b.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. REDUCE MOTION & EFFECTS TOGGLE */}
      <div className="p-4 bg-surface-raised/70 border border-border rounded-xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <EyeOff className="w-4 h-4 text-text-muted" />
            <span>Reduce Effects & Motion</span>
          </div>
          <p className="text-[11px] text-text-muted">
            Disables 3D tilt, floating orbs, particle canvas, confetti bursts, and cursor glow for maximum performance or motion sensitivity.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={reducedEffects}
          onClick={() => setReducedEffects(!reducedEffects)}
          className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
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

      {/* 5. REPLAY GUIDED TOUR */}
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
            className="px-4 py-1.5 bg-accent text-ink rounded-lg text-xs font-semibold hover:bg-accent-bright transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Start Tour
          </button>
        </div>
      )}
    </Card>
  );
};

export default AppearanceSettingsCard;
