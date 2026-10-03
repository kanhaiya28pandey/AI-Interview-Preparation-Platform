import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TiltCard } from "@/components/fx";
import { HERO_ROLES } from "@/constants/heroRoles";
import { ROLE_PREVIEWS } from "@/constants/heroPreview";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { cn } from "@/lib/utils";

interface HeroShowcaseProps {
  roleIndex: number;
  sessionSeconds: number;
  onDemoAdmin: () => void;
}

const TECH_BADGES = [
  {
    name: "⚛ React 19",
    className: "bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-cyan-500/30",
  },
  {
    name: "☕ Spring Boot 4",
    className: "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/30",
  },
  {
    name: "✨ Gemini AI",
    className: "bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-purple-300 border-purple-500/30",
  },
  {
    name: "🐍 Python & AI",
    className: "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-500/30",
  },
];

const formatClock = (sec: number) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export const HeroShowcase: React.FC<HeroShowcaseProps> = memo(
  ({ roleIndex, sessionSeconds, onDemoAdmin }) => {
    const reducedMotion = useReducedEffects();
    const currentRole = HERO_ROLES[roleIndex] || HERO_ROLES[0];
    const preview = ROLE_PREVIEWS[currentRole.id] || ROLE_PREVIEWS.frontend;

    return (
      <div className="w-full flex flex-col items-center select-none pt-4 pb-6 sm:pb-8">
        {/* Main interactive terminal card composition */}
        <div className="relative w-full max-w-lg lg:max-w-none mx-auto min-h-[440px] sm:min-h-[480px] flex items-center justify-center pt-6">
          {/* Soft dynamic ambient radial background glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-700 blur-3xl opacity-30"
            style={{
              background: `radial-gradient(circle at 55% 45%, ${currentRole.glowColor} 0%, transparent 68%)`,
            }}
            aria-hidden="true"
          />

          {/* Central TiltCard: Main Mock Session Terminal Card */}
          <div className="w-full relative z-10">
            <TiltCard intensity={reducedMotion ? 0 : 6} className="shadow-2xl">
              <Card
                className="p-0 overflow-hidden bg-surface/95 backdrop-blur-md border shadow-soft relative group transition-colors duration-500"
                style={{
                  borderColor: `${currentRole.accentColor}50`,
                  boxShadow: `0 12px 36px -8px ${currentRole.glowColor}`,
                }}
              >
                {/* Terminal Window Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse-live" />
                    <span className="font-mono text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Mock Session #104
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                      Live Feedback
                    </span>
                    <span className="font-mono text-xs text-text-muted">{formatClock(sessionSeconds)}</span>
                  </div>
                </div>

                {/* Terminal Body */}
                <div className="p-4 sm:p-5 h-[290px] sm:h-[310px] overflow-y-auto font-mono text-xs space-y-3 bg-surface divider-fade">
                  {/* AI Evaluator Prompt */}
                  <div className="p-3 bg-surface-raised border border-border rounded-lg space-y-1">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1.5 text-[11px]">
                      <Cpu className="w-3 h-3" /> AI Evaluator:
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentRole.id}
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reducedMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="text-text-primary leading-relaxed text-[11px] sm:text-xs"
                      >
                        "{preview.sampleQuestion}"
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Candidate Answer Box */}
                  <div className="p-3 bg-ink border border-cyan-400/30 rounded-lg space-y-1">
                    <span className="text-live font-semibold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Candidate Response:
                    </span>
                    <p className="text-text-primary leading-relaxed text-[11px] sm:text-xs">
                      "Breaks execution units into async fibers. Prioritizes urgent user input and defers non-blocking reconciliations seamlessly..."
                    </p>
                  </div>

                  {/* Instant Scorecard */}
                  <div className="p-3 bg-surface-raised border border-live/30 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-live font-semibold flex items-center gap-1 text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5" /> Instant Scorecard: {preview.avgScore}/100
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">Top 6% percentile</span>
                    </div>
                    <p className="text-text-muted text-[11px] leading-relaxed">
                      ✓ Clear trade-off analysis and runtime complexity articulated. <br />
                      💡 Tip: Mention requestIdleCallback / scheduling hooks.
                    </p>
                  </div>
                </div>

                {/* Terminal Footer (Full visible status line with clean breathing room) */}
                <div className="px-4 py-3 bg-surface-raised border-t border-border flex justify-between items-center text-xs font-mono text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-live" />
                    Status: <strong className="text-live font-medium">Evaluator Active</strong>
                  </span>
                  <button
                    type="button"
                    onClick={onDemoAdmin}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
                  >
                    Try Admin View →
                  </button>
                </div>
              </Card>
            </TiltCard>
          </div>

          {/* Floating Card B: Readiness Circular Progress Ring (Top Right Corner - Visible on sm and up) */}
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
            transition={reducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="hidden sm:flex absolute -top-5 -right-2 sm:-top-6 sm:-right-2 z-20 items-center gap-3 p-2.5 px-3 rounded-xl bg-surface-raised/95 border border-cyan-400/40 backdrop-blur-md shadow-xl text-text-primary"
            aria-hidden="true"
          >
            {/* SVG Animated Circular Progress Ring */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="stroke-border/70"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <motion.circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="stroke-cyan-400"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={113}
                  initial={{ strokeDashoffset: 113 }}
                  animate={{ strokeDashoffset: 113 * (1 - 0.92) }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-cyan-400">92%</span>
            </div>

            <div className="pr-1 text-left">
              <span className="text-[9px] font-mono text-text-muted block uppercase tracking-wider">
                Readiness Score
              </span>
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Placement Ready
              </span>
            </div>
          </motion.div>
        </div>

        {/* Shared Aligned Cards Row for Card C & Card D */}
        <div className="hidden sm:flex relative z-20 mt-6 sm:mt-8 flex-col md:flex-row items-stretch md:items-start justify-end md:justify-between gap-6 md:gap-8 px-2 sm:px-4 w-full max-w-lg lg:max-w-none mb-12 sm:mb-16">
          {/* Floating Card C: Streak + Leaderboard (Visible on md and up) */}
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
            transition={reducedMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex flex-col gap-2 p-4 rounded-xl bg-surface-raised/95 border border-border backdrop-blur-md shadow-2xl text-text-primary w-full md:w-[calc(50%-16px)] max-w-[260px]"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>12 Day Streak</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                Top 1%
              </span>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between text-text-primary">
                <span className="truncate">🥇 Aarav S.</span>
                <span className="text-live font-semibold">98%</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span className="truncate">🥈 Priya N.</span>
                <span className="text-cyan-400 font-semibold">96%</span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span className="truncate">🥉 Vikram R.</span>
                <span className="text-text-muted">94%</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Card D: Dynamic Role-Aware Skill Tags Card (Visible on sm and up) */}
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
            transition={reducedMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col gap-2 p-4 rounded-xl bg-surface-raised/95 border backdrop-blur-md shadow-xl text-text-primary w-full md:w-[calc(50%-16px)] max-w-[260px] transition-colors duration-500"
            style={{
              borderColor: `${currentRole.accentColor}50`,
              boxShadow: `0 8px 24px -6px ${currentRole.glowColor}`,
            }}
            aria-hidden="true"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRole.id}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="space-y-2 text-left"
              >
                <div className="flex items-center gap-1.5">
                  {React.createElement(currentRole.icon, {
                    className: "w-3.5 h-3.5 shrink-0",
                    style: { color: currentRole.accentColor },
                  })}
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: currentRole.accentColor }}
                  >
                    {currentRole.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {preview.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-secondary whitespace-nowrap"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Tech Stack Chip Row placed neatly below the cards in normal document flow with clear clearance */}
        <div className="w-full flex flex-col items-center justify-center gap-2 z-10 relative">
          <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
            Built with
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {TECH_BADGES.map((badge, idx) => (
              <motion.div
                key={badge.name}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? undefined : { duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold border backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-opacity-60 cursor-default",
                  badge.className
                )}
              >
                {badge.name}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

HeroShowcase.displayName = "HeroShowcase";
